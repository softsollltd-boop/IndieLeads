import { Injectable, Logger } from '@nestjs/common';
import { EmailProviderAdapter, ProviderHealth } from './provider.adapter';
import * as nodemailer from 'nodemailer';
import * as imaps from 'imap-simple';
import { simpleParser } from 'mailparser';

@Injectable()
export class SmtpAdapter implements EmailProviderAdapter {
  private readonly logger = new Logger(SmtpAdapter.name);

  async validateCredentials(credentials: any): Promise<boolean> {
    try {
      const auth: any = credentials.accessToken ? {
        type: 'OAuth2',
        user: credentials.smtpUser,
        accessToken: credentials.accessToken,
      } : {
        user: credentials.smtpUser,
        pass: credentials.smtpPass,
      };

      const transporter = nodemailer.createTransport({
        host: credentials.smtpHost || (credentials.accessToken ? 'smtp.gmail.com' : undefined),
        port: credentials.smtpPort || 465,
        secure: credentials.smtpPort === 465 || !credentials.smtpPort,
        auth,
        tls: { rejectUnauthorized: false }
      });
      await transporter.verify();
      return true;
    } catch (err) {
      this.logger.error(`Protocol check failed for ${credentials.smtpUser}: ${err.message}`);
      return false;
    }
  }

  async sendEmail(credentials: any, payload: any): Promise<{ messageId: string }> {
    const auth: any = credentials.accessToken ? {
      type: 'OAuth2',
      user: credentials.smtpUser,
      accessToken: credentials.accessToken,
    } : {
      user: credentials.smtpUser,
      pass: credentials.smtpPass,
    };

    const transporter = nodemailer.createTransport({
      host: credentials.smtpHost || (credentials.accessToken ? 'smtp.gmail.com' : undefined),
      port: credentials.smtpPort || 465,
      secure: credentials.smtpPort === 465 || !credentials.smtpPort,
      auth,
    });

    try {
      const info = await transporter.sendMail({
        from: `"${payload.fromName || 'IndieLeads User'}" <${credentials.smtpUser}>`,
        to: payload.to,
        subject: payload.subject,
        html: payload.body,
        headers: {
          'X-IndieLeads-Log-ID': payload.logId, // CRITICAL: This is used for reply tracking
          'Message-ID': `<${payload.logId || Math.random().toString(36).substring(7)}@indieleads.ai>`,
          'List-Unsubscribe': `<${process.env.FRONTEND_URL}/#/unsub/${payload.leadId}>`,
          ...(payload.inReplyTo ? { 'In-Reply-To': payload.inReplyTo } : {}),
          ...(payload.references ? { 'References': payload.references } : {}),
        }
      });
      return { messageId: info.messageId };
    } catch (err) {
      this.logger.error(`SMTP Dispatch Error: ${err.message}`);
      throw new Error('PROVIDER_REJECTED');
    }
  }

  /**
   * Fetches replies from the IMAP server.
   * Logic: Look for messages SINCE lastCheck that contain our custom header.
   */
  async fetchReplies(credentials: any, lastCheck: Date): Promise<any[]> {
    this.logger.log(`Scanning IMAP stream for ${credentials.imapUser || credentials.smtpUser} since ${lastCheck.toISOString()}`);

    const config: any = {
      imap: {
        user: credentials.imapUser || credentials.smtpUser,
        host: credentials.imapHost || (credentials.accessToken ? 'imap.gmail.com' : undefined),
        port: credentials.imapPort || 993,
        tls: true,
        authTimeout: 10000,
        tlsOptions: { rejectUnauthorized: false }
      }
    };

    if (credentials.accessToken) {
      config.imap.xoauth2 = credentials.accessToken;
    } else {
      config.imap.password = credentials.imapPass || credentials.smtpPass;
    }

    let connection;
    try {
      connection = await imaps.connect(config);
      await connection.openBox('INBOX');

      // Search for messages since lastCheck. 
      // Note: IMAP search only supports Date (day resolution) for 'SINCE'.
      // We'll filter precisely in JS afterwards if needed.
      const searchCriteria = [['SINCE', lastCheck]];
      const fetchOptions = {
        bodies: ['HEADER', 'TEXT'],
        struct: true
      };

      const messages = await connection.search(searchCriteria, fetchOptions);
      const replies = [];

      for (const item of messages) {
        const allHeaderPart = item.parts.find(part => part.which === 'HEADER');
        const id = item.attributes.uid;
        const idHeader = allHeaderPart.body['message-id'];

        // Optimization: Use simple-parser for robust body/header extraction
        const fullMessage = item.parts.map(p => p.body).join('\n');
        const parsed = await simpleParser(fullMessage);

        const indieleadsLogId = parsed.headers.get('x-indieleads-log-id') ||
          parsed.headers.get('references')?.toString().match(/<([^@]+)@indieleads\.ai>/)?.[1];

        if (indieleadsLogId) {
          replies.push({
            messageId: parsed.messageId || idHeader?.[0] || id.toString(),
            from: parsed.from?.value[0]?.address,
            subject: parsed.subject,
            body: parsed.text || parsed.html,
            headers: {
              'x-indieleads-log-id': indieleadsLogId
            },
            receivedAt: parsed.date || item.attributes.date
          });
        }
      }

      await connection.end();
      return replies;

    } catch (err) {
      this.logger.error(`IMAP Sync Failure for ${config.imap.user}: ${err.message}`);
      if (connection) await connection.end();
      return [];
    }
  }

  async healthCheck(credentials: any): Promise<ProviderHealth> {
    const isValid = await this.validateCredentials(credentials);
    return {
      status: isValid ? 'active' : 'disconnected',
      score: isValid ? 100 : 0
    };
  }
}

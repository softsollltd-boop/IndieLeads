import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class TransactionalEmailService {
    private readonly logger = new Logger(TransactionalEmailService.name);

    constructor(private readonly configService: ConfigService) { }

    async sendVerificationEmail(email: string, token: string) {
        const frontendUrl = this.configService.get('FRONTEND_URL') || 'https://app.skyreach.ai';
        const verifyUrl = `${frontendUrl}/#/verify-email?token=${token}`;

        this.logger.log(`
      --------------------------------------------------
      [TRANSACTIONAL EMAIL] Verify your email
      To: ${email}
      URL: ${verifyUrl}
      --------------------------------------------------
    `);
    }

    async sendPasswordResetEmail(email: string, token: string) {
        const frontendUrl = this.configService.get('FRONTEND_URL') || 'https://app.skyreach.ai';
        const resetUrl = `${frontendUrl}/#/reset-password?token=${token}`;

        this.logger.log(`
      --------------------------------------------------
      [TRANSACTIONAL EMAIL] Password Reset Request
      To: ${email}
      URL: ${resetUrl}
      --------------------------------------------------
    `);
    }
}

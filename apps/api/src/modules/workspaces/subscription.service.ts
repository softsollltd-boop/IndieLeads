
import { Injectable, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export enum PlanTier {
  FREE = 'free',
  GROWTH = 'growth',
  ENTERPRISE = 'enterprise'
}

@Injectable()
export class SubscriptionService {
  private readonly PLAN_LIMITS = {
    [PlanTier.FREE]: { inboxes: 1, leads: 100, sequences: 1 },
    [PlanTier.GROWTH]: { inboxes: 10, leads: 10000, sequences: 10 },
    [PlanTier.ENTERPRISE]: { inboxes: 100, leads: 1000000, sequences: 100 }
  };

  constructor(private readonly prisma: PrismaService) { }

  async getWorkspacePlan(workspaceId: string) {
    const workspace = await (this.prisma as any).workspace.findUnique({
      where: { id: workspaceId },
      select: { planTier: true, subscriptionStatus: true }
    });
    return workspace?.planTier || PlanTier.FREE;
  }

  async checkLimit(workspaceId: string, resource: 'inboxes' | 'leads' | 'sequences') {
    const tier = await this.getWorkspacePlan(workspaceId) as PlanTier;
    const limit = this.PLAN_LIMITS[tier][resource];

    let currentCount = 0;
    if (resource === 'inboxes') {
      currentCount = await (this.prisma as any).inbox.count({ where: { workspaceId } });
    } else if (resource === 'leads') {
      currentCount = await (this.prisma as any).lead.count({ where: { workspaceId } });
    }

    if (currentCount >= limit) {
      throw new ForbiddenException(`Resource limit reached for ${resource} on ${tier} plan.`);
    }
    return true;
  }

  async createCheckoutSession(workspaceId: string, tier: PlanTier) {
    // Integration point for Stripe Checkout
    return { url: `https://checkout.stripe.com/pay/indieleads_${workspaceId}_${tier}` };
  }
}

import { Injectable, Inject, NotFoundException, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { eq } from 'drizzle-orm';
import Stripe from 'stripe';
import { DRIZZLE, type DrizzleDB } from '@database/drizzle.module';
import { workspaces, plans } from '@database/schema';

@Injectable()
export class BillingService {
  private readonly logger = new Logger(BillingService.name);
  private readonly stripe: Stripe;

  constructor(
    @Inject(DRIZZLE) private readonly db: DrizzleDB,
    private readonly configService: ConfigService,
  ) {
    this.stripe = new Stripe(this.configService.getOrThrow('stripe.secretKey'), {
      apiVersion: '2024-12-18.acacia',
    });
  }

  async getSubscription(workspaceId: string) {
    const workspace = await this.db.query.workspaces.findFirst({
      where: eq(workspaces.id, workspaceId),
    });
    if (!workspace) throw new NotFoundException('Workspace not found');

    return {
      plan: workspace.plan,
      status: workspace.subscriptionStatus,
      trialEndsAt: workspace.trialEndsAt,
    };
  }

  async createCheckout(workspaceId: string, planId: string) {
    const workspace = await this.db.query.workspaces.findFirst({ where: eq(workspaces.id, workspaceId) });
    if (!workspace) throw new NotFoundException('Workspace not found');

    const plan = await this.db.query.plans.findFirst({ where: eq(plans.id, planId) });
    if (!plan) throw new NotFoundException('Plan not found');

    let customerId = workspace.stripeCustomerId;
    if (!customerId) {
      const customer = await this.stripe.customers.create({
        metadata: { workspaceId, ownerId: workspace.ownerId },
      });
      customerId = customer.id;
      await this.db.update(workspaces).set({ stripeCustomerId: customerId }).where(eq(workspaces.id, workspaceId));
    }

    const session = await this.stripe.checkout.sessions.create({
      customer: customerId,
      mode: 'subscription',
      line_items: [{ price: plan.stripePriceIdMonthly, quantity: 1 }],
      success_url: `${this.configService.get('APP_URL')}/billing?success=true`,
      cancel_url: `${this.configService.get('APP_URL')}/billing?canceled=true`,
      metadata: { workspaceId, planId },
    });

    return { url: session.url };
  }

  async createPortal(workspaceId: string) {
    const workspace = await this.db.query.workspaces.findFirst({ where: eq(workspaces.id, workspaceId) });
    if (!workspace?.stripeCustomerId) throw new NotFoundException('No billing account');

    const session = await this.stripe.billingPortal.sessions.create({
      customer: workspace.stripeCustomerId,
      return_url: `${this.configService.get('APP_URL')}/billing`,
    });

    return { url: session.url };
  }

  async handleWebhookEvent(rawBody: Buffer, signature: string) {
    const event = this.stripe.webhooks.constructEvent(
      rawBody,
      signature,
      this.configService.getOrThrow('stripe.webhookSecret'),
    );

    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        const wsId = session.metadata?.workspaceId;
        const planId = session.metadata?.planId;
        if (wsId && planId) {
          await this.db.update(workspaces).set({
            plan: planId,
            subscriptionStatus: 'active',
            stripeSubscriptionId: session.subscription as string,
          }).where(eq(workspaces.id, wsId));
          this.logger.log(`Workspace ${wsId} upgraded to ${planId}`);
        }
        break;
      }
      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription;
        const ws = await this.db.query.workspaces.findFirst({
          where: eq(workspaces.stripeSubscriptionId, subscription.id),
        });
        if (ws) {
          await this.db.update(workspaces).set({
            subscriptionStatus: subscription.status as string,
          }).where(eq(workspaces.id, ws.id));
        }
        break;
      }
      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        const ws = await this.db.query.workspaces.findFirst({
          where: eq(workspaces.stripeSubscriptionId, subscription.id),
        });
        if (ws) {
          await this.db.update(workspaces).set({
            subscriptionStatus: 'canceled',
            plan: 'starter',
          }).where(eq(workspaces.id, ws.id));
        }
        break;
      }
    }
  }
}

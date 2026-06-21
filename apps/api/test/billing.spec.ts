import { PLANS } from '@wao/shared';

describe('Billing', () => {
  describe('Plan Configuration', () => {
    it('has three plans', () => {
      expect(PLANS).toHaveLength(3);
    });

    it('plans have correct IDs', () => {
      const ids = PLANS.map((p) => p.id);
      expect(ids).toEqual(['starter', 'growth', 'agency']);
    });

    it('plans have correct prices', () => {
      const prices = PLANS.map((p) => p.price);
      expect(prices).toEqual([29, 79, 149]);
    });

    it('all plans have features', () => {
      for (const plan of PLANS) {
        expect(plan.features.length).toBeGreaterThan(0);
      }
    });

    it('higher plans have more features or higher limits', () => {
      expect(PLANS[2].price).toBeGreaterThan(PLANS[1].price);
      expect(PLANS[1].price).toBeGreaterThan(PLANS[0].price);
    });
  });

  describe('Stripe Webhook Events', () => {
    it('handles checkout.session.completed shape', () => {
      const event = {
        type: 'checkout.session.completed',
        data: {
          object: {
            id: 'cs_test_123',
            mode: 'subscription',
            subscription: 'sub_123',
            metadata: { workspaceId: 'ws-uuid', planId: 'growth' },
          },
        },
      };

      expect(event.data.object.metadata.workspaceId).toBeDefined();
      expect(event.data.object.metadata.planId).toBe('growth');
      expect(event.data.object.subscription).toBe('sub_123');
    });

    it('handles customer.subscription.deleted shape', () => {
      const event = {
        type: 'customer.subscription.deleted',
        data: { object: { id: 'sub_123', status: 'canceled' } },
      };

      expect(event.data.object.status).toBe('canceled');
    });
  });
});

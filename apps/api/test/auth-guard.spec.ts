import { ROLE_HIERARCHY } from '@wao/shared';

describe('Auth & RBAC', () => {
  describe('Role Hierarchy', () => {
    it('owner has highest level', () => {
      expect(ROLE_HIERARCHY.owner).toBeGreaterThan(ROLE_HIERARCHY.admin);
    });

    it('admin outranks editor', () => {
      expect(ROLE_HIERARCHY.admin).toBeGreaterThan(ROLE_HIERARCHY.editor);
    });

    it('editor outranks viewer', () => {
      expect(ROLE_HIERARCHY.editor).toBeGreaterThan(ROLE_HIERARCHY.viewer);
    });

    it('viewer has lowest level', () => {
      const values = Object.values(ROLE_HIERARCHY);
      expect(Math.min(...values)).toBe(ROLE_HIERARCHY.viewer);
    });
  });

  describe('Role-based access', () => {
    function hasAccess(userRole: keyof typeof ROLE_HIERARCHY, requiredRole: keyof typeof ROLE_HIERARCHY): boolean {
      return ROLE_HIERARCHY[userRole] >= ROLE_HIERARCHY[requiredRole];
    }

    it('owner can access admin routes', () => {
      expect(hasAccess('owner', 'admin')).toBe(true);
    });

    it('editor cannot access admin routes', () => {
      expect(hasAccess('editor', 'admin')).toBe(false);
    });

    it('viewer cannot access editor routes', () => {
      expect(hasAccess('viewer', 'editor')).toBe(false);
    });

    it('admin can access editor routes', () => {
      expect(hasAccess('admin', 'editor')).toBe(true);
    });
  });
});

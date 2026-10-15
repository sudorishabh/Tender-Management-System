/**
 * Database role type (as stored in DB)
 */
export type DbRole = "vendor" | "admin" | "super_admin";

/**
 * UI route role type (for URL routing)
 */
export type UiRole = "vendor" | "admin" | "super";

/**
 * Map database role to UI role for routing
 * super_admin → super (for UI routes like /super/invite)
 */
export function mapDbRoleToUi(dbRole: DbRole): UiRole {
  if (dbRole === "super_admin") return "super";
  return dbRole;
}

/**
 * Map UI role to database role
 * super → super_admin (for backend queries)
 */
export function mapUiRoleToDb(uiRole: UiRole): DbRole {
  if (uiRole === "super") return "super_admin";
  return uiRole as DbRole;
}

/**
 * Get default dashboard path for a role
 */
export function getRoleDashboard(role: DbRole): string {
  switch (role) {
    case "vendor":
      return "/vendor";
    case "admin":
      return "/admin";
    case "super_admin":
      // /super has no page — the super admin landing route is /super/invite
      return "/super/invite";
    default:
      return "/";
  }
}

/**
 * Check if user has permission to access a route based on role
 * @param userRole - The user's database role
 * @param routePath - The route path to check (e.g., "/admin/create")
 * @returns true if user can access the route
 */
export function hasRoutePermission(
  userRole: DbRole,
  routePath: string
): boolean {
  // Admins and super_admins can access admin routes
  if (routePath.startsWith("/admin")) {
    return userRole === "admin" || userRole === "super_admin";
  }

  // Only vendors can access vendor routes
  if (routePath.startsWith("/vendor")) {
    return userRole === "vendor";
  }

  // Only super_admin can access super routes
  if (routePath.startsWith("/super")) {
    return userRole === "super_admin";
  }

  return false;
}

/**
 * Error the credentials provider reports when sign-in attempts are rate
 * limited, so the sign-in form can tell it apart from a wrong password
 */
export const SIGN_IN_RATE_LIMITED_ERROR = "TooManySignInAttempts";

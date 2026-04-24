import { Role } from '@prisma/client';

/**
 * Generates a Prisma 'where' filter for Leads based on the user's role and scope.
 */
export function getLeadScopeFilter(user: any) {
  if (user.role === Role.SUPER_ADMIN) {
    return {};
  }
  if (user.role === Role.TEAM_LEAD) {
    // Team Lead sees all leads assigned to anyone in their team
    return { assignedTo: { teamId: user.teamId } };
  }
  // BDE only sees leads assigned to them
  return { assignedToId: user.id };
}

/**
 * Generates a Prisma 'where' filter for Tasks based on the user's role and scope.
 */
export function getTaskScopeFilter(user: any) {
  if (user.role === Role.SUPER_ADMIN) {
    return {};
  }
  if (user.role === Role.TEAM_LEAD) {
    return { assignedTo: { teamId: user.teamId } };
  }
  return { assignedToId: user.id };
}

/**
 * Generates a Prisma 'where' filter for Clients based on the user's role and scope.
 */
export function getClientScopeFilter(user: any) {
  if (user.role === Role.SUPER_ADMIN) {
    return {};
  }
  if (user.role === Role.TEAM_LEAD) {
    return { accountManager: { teamId: user.teamId } };
  }
  return { accountManagerId: user.id };
}

/**
 * Generates a Prisma 'where' filter for Invoices based on the user's role and scope.
 */
export function getInvoiceScopeFilter(user: any) {
  if (user.role === Role.SUPER_ADMIN) {
    return {};
  }
  if (user.role === Role.TEAM_LEAD) {
    return { client: { accountManager: { teamId: user.teamId } } };
  }
  return { client: { accountManagerId: user.id } };
}

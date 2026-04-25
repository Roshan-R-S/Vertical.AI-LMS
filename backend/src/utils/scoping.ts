import { Role } from '@prisma/client';

/**
 * Generates a Prisma 'where' filter for Leads based on the user's role and scope.
 */
export function getLeadScopeFilter(user: any) {
  const baseFilter = { deletedAt: null };
  if (user.role === Role.SUPER_ADMIN) {
    return baseFilter;
  }
  if (user.role === Role.TEAM_LEAD) {
    return { ...baseFilter, assignedTo: { teamId: user.teamId } };
  }
  return { ...baseFilter, assignedToId: user.id };
}

/**
 * Generates a Prisma 'where' filter for Tasks based on the user's role and scope.
 */
export function getTaskScopeFilter(user: any) {
  const baseFilter = { deletedAt: null };
  if (user.role === Role.SUPER_ADMIN) {
    return baseFilter;
  }
  if (user.role === Role.TEAM_LEAD) {
    return { ...baseFilter, assignedTo: { teamId: user.teamId } };
  }
  return { ...baseFilter, assignedToId: user.id };
}

/**
 * Generates a Prisma 'where' filter for Clients based on the user's role and scope.
 */
export function getClientScopeFilter(user: any) {
  const baseFilter = { deletedAt: null };
  if (user.role === Role.SUPER_ADMIN) {
    return baseFilter;
  }
  if (user.role === Role.TEAM_LEAD) {
    return { ...baseFilter, accountManager: { teamId: user.teamId } };
  }
  return { ...baseFilter, accountManagerId: user.id };
}

/**
 * Generates a Prisma 'where' filter for Invoices based on the user's role and scope.
 */
export function getInvoiceScopeFilter(user: any) {
  const baseFilter = { deletedAt: null, client: { deletedAt: null } };
  if (user.role === Role.SUPER_ADMIN) {
    return baseFilter;
  }
  if (user.role === Role.TEAM_LEAD) {
    return { ...baseFilter, client: { ...baseFilter.client, accountManager: { teamId: user.teamId } } };
  }
  return { ...baseFilter, client: { ...baseFilter.client, accountManagerId: user.id } };
}

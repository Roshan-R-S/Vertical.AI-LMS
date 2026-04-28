import { Role } from '@prisma/client';

export function getLeadScopeFilter(user: any) {
  const baseFilter = { deletedAt: null };
  if (user.role === Role.SUPER_ADMIN) return baseFilter;
  if (user.role === Role.TEAM_LEAD) {
    // TL sees only BDE leads in their team, not CP leads
    return { ...baseFilter, assignedTo: { teamId: user.teamId, role: Role.BDE } };
  }
  if (user.role === Role.BDE) {
    // BDE sees only their own leads, and only if assigned to a BDE (not CP)
    return { ...baseFilter, assignedToId: user.id, assignedTo: { role: Role.BDE } };
  }
  if (user.role === Role.CHANNEL_PARTNER) {
    // CP sees only their own leads
    return { ...baseFilter, assignedToId: user.id };
  }
  return { ...baseFilter, assignedToId: user.id };
}

export function getTaskScopeFilter(user: any) {
  const baseFilter = { deletedAt: null };
  if (user.role === Role.SUPER_ADMIN) return baseFilter;
  if (user.role === Role.TEAM_LEAD) {
    return { ...baseFilter, assignedTo: { teamId: user.teamId } };
  }
  return { ...baseFilter, assignedToId: user.id };
}

export function getClientScopeFilter(user: any) {
  const baseFilter = { deletedAt: null };
  if (user.role === Role.SUPER_ADMIN) return baseFilter;
  if (user.role === Role.TEAM_LEAD) {
    // TL sees BDE clients in their team AND CP clients
    return {
      ...baseFilter,
      OR: [
        { accountManager: { teamId: user.teamId } },
        { accountManager: { role: Role.CHANNEL_PARTNER } },
      ],
    };
  }
  return { ...baseFilter, accountManagerId: user.id };
}

export function getInvoiceScopeFilter(user: any) {
  const baseFilter = { deletedAt: null, client: { deletedAt: null } };
  if (user.role === Role.SUPER_ADMIN) return baseFilter;
  if (user.role === Role.TEAM_LEAD) {
    return { ...baseFilter, client: { ...baseFilter.client, accountManager: { teamId: user.teamId } } };
  }
  return { ...baseFilter, client: { ...baseFilter.client, accountManagerId: user.id } };
}

import { Role } from '@prisma/client';

export function roleToDisplay(role: Role): string {
  switch (role) {
    case 'SUPER_ADMIN':      return 'Super Admin';
    case 'TEAM_LEAD':        return 'Team Lead';
    case 'BDE':              return 'BDE';
    case 'CHANNEL_PARTNER':  return 'Channel Partner';
    default:                 return role;
  }
}

export function displayToRole(display: string): Role {
  switch (display) {
    case 'Super Admin':     return 'SUPER_ADMIN';
    case 'Team Lead':       return 'TEAM_LEAD';
    case 'BDE':             return 'BDE';
    case 'Channel Partner': return 'CHANNEL_PARTNER';
    default:                return 'BDE';
  }
}

export function formatUser(u: any) {
  return {
    id:          u.id,
    name:        u.name,
    email:       u.email,
    role:        roleToDisplay(u.role),
    avatar:      u.avatar ?? u.name.split(' ').map((n: string) => n[0]).join('').toUpperCase(),
    phone:       u.phone,
    companyName: u.companyName ?? null,
    team:        u.team?.name ?? null,
    teamId:      u.teamId,
    status:      u.isActive ? 'active' : 'inactive',
    isPending:   u.isPending ?? false,
    lastLogin:   u.lastLoginAt ? new Date(u.lastLoginAt).toLocaleString('en-IN') : '—',
    createdAt:   u.createdAt?.toISOString().split('T')[0],
  };
}

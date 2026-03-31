import bcrypt from 'bcryptjs';
import { prisma } from '../../prisma';

export const getAllUsers = async () => {
  return prisma.user.findMany({
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      isActive: true,
      canBulkUpload: true,
      teamId: true,
      avatar: true,
      createdAt: true,
      _count: {
        select: { leads: true },
      },
    },
    orderBy: { createdAt: 'desc' },
  });
};

export const getUserById = async (id: string) => {
  const user = await prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      isActive: true,
      canBulkUpload: true,
      teamId: true,
      avatar: true,
      createdAt: true,
      _count: {
        select: { leads: true },
      },
    },
  });
  if (!user) throw new Error('User not found');
  return user;
};

export const createUser = async (data: {
  name: string;
  email: string;
  password: string;
  role: any;
  teamId?: string;
  avatar?: string;
}) => {
  const existing = await prisma.user.findUnique({ where: { email: data.email } });
  if (existing) throw new Error('Email already exists');

  const passwordHash = await bcrypt.hash(data.password, 10);

  return prisma.user.create({
    data: {
      name: data.name,
      email: data.email,
      passwordHash,
      role: data.role,
      teamId: data.teamId,
      avatar: data.avatar,
      isActive: true,
      canBulkUpload: data.role !== 'BDE', // Grant access by default to non-BDEs
    },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      isActive: true,
      canBulkUpload: true,
      createdAt: true,
    },
  });
};

export const updateUser = async (id: string, data: any) => {
  const user = await prisma.user.findUnique({ where: { id } });
  if (!user) throw new Error('User not found');

  return prisma.user.update({
    where: { id },
    data,
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      isActive: true,
      canBulkUpload: true,
      teamId: true,
      avatar: true,
      updatedAt: true,
    },
  });
};

export const deleteUser = async (id: string) => {
  const user = await prisma.user.findUnique({ where: { id } });
  if (!user) throw new Error('User not found');
  return prisma.user.delete({ where: { id } });
};

export const toggleUserActive = async (id: string) => {
  const user = await prisma.user.findUnique({ where: { id } });
  if (!user) throw new Error('User not found');

  return prisma.user.update({
    where: { id },
    data: { isActive: !user.isActive },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      isActive: true,
      canBulkUpload: true,
    },
  });
};
import { Request, Response } from 'express';
import { createUserSchema, updateUserSchema } from './users.schema';
import * as UsersService from './users.service';
import { ApiResponse } from '../../utils/apiResponse';
import { asyncHandler } from '../../utils/asyncHandler';

export const getAllUsers = asyncHandler(async (req: Request, res: Response) => {
  const users = await UsersService.getAllUsers();
  res.status(200).json(new ApiResponse(200, users, "Users fetched successfully"));
});

export const getUserById = asyncHandler(async (req: Request, res: Response) => {
  const user = await UsersService.getUserById(req.params['id'] as string);
  res.status(200).json(new ApiResponse(200, user, "User fetched successfully"));
});

export const createUser = asyncHandler(async (req: Request, res: Response) => {
  const data = createUserSchema.parse(req.body);
  const user = await UsersService.createUser(data);
  res.status(201).json(new ApiResponse(201, user, "User created successfully"));
});

export const updateUser = asyncHandler(async (req: Request, res: Response) => {
  const data = updateUserSchema.parse(req.body);
  const user = await UsersService.updateUser(req.params['id'] as string, data);
  res.status(200).json(new ApiResponse(200, user, "User updated successfully"));
});

export const deleteUser = asyncHandler(async (req: Request, res: Response) => {
  await UsersService.deleteUser(req.params['id'] as string);
  res.status(200).json(new ApiResponse(200, null, "User deleted successfully"));
});

export const toggleUserActive = asyncHandler(async (req: Request, res: Response) => {
  const user = await UsersService.toggleUserActive(req.params['id'] as string);
  res.status(200).json(new ApiResponse(200, user, "User status toggled successfully"));
});
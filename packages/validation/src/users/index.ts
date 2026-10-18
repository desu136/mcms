import { z } from 'zod';

export const staffProfileSchema = z.object({
  employeeNumber: z.string().max(50).optional(),
  jobTitle: z.string().max(100).optional(),
  department: z.string().max(100).optional(),
  phoneNumber: z.string().max(30).optional(),
  licenseNumber: z.string().max(50).optional(),
});

export const createUserSchema = z.object({
  email: z.string().email('Invalid email address').toLowerCase(),
  password: z.string().min(8, 'Password must be at least 8 characters').max(128),
  displayName: z.string().min(1, 'Display name is required').max(100),
  roleIds: z.array(z.string().uuid()).min(1, 'At least one role must be assigned'),
  staffProfile: staffProfileSchema.optional(),
});

export const updateUserSchema = z.object({
  displayName: z.string().min(1).max(100).optional(),
  isActive: z.boolean().optional(),
  roleIds: z.array(z.string().uuid()).optional(),
  staffProfile: staffProfileSchema.optional(),
});

export type StaffProfileInput = z.infer<typeof staffProfileSchema>;
export type CreateUserInput = z.infer<typeof createUserSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;

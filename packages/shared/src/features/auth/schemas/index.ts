import { z } from 'zod';

/** Roles a visitor may self-select at sign-up (admins are provisioned separately). */
export const signupRoleSchema = z.enum(['student', 'owner']);

export const registerSchema = z
  .object({
    fullName: z.string().min(2, 'Please enter your full name'),
    email: z.string().email('Enter a valid email'),
    password: z.string().min(8, 'Password must be at least 8 characters'),
    confirmPassword: z.string(),
    role: signupRoleSchema,
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

export const loginSchema = z.object({
  email: z.string().email('Enter a valid email'),
  password: z.string().min(1, 'Enter your password'),
});

export const forgotPasswordSchema = z.object({
  email: z.string().email('Enter a valid email'),
});

export const resetPasswordSchema = z
  .object({
    password: z.string().min(8, 'Password must be at least 8 characters'),
    confirmPassword: z.string(),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

/** Profile edit — fields a user can change about themselves. */
export const profileSchema = z.object({
  full_name: z.string().min(2, 'Please enter your full name').nullable().optional(),
  phone: z.string().min(7, 'Enter a valid phone number').nullable().optional(),
  gender: z.enum(['male', 'female', 'other']).nullable().optional(),
  institution: z.string().nullable().optional(),
  avatar_url: z.string().url().nullable().optional(),
});

/** Owner verification submission (documents are uploaded first; URLs passed here). */
export const ownerVerificationSchema = z.object({
  business_name: z.string().min(2, 'Enter your business / hostel name'),
  cnic: z.string().min(10, 'Enter your CNIC / national ID number'),
  city: z.string().min(2, 'Enter your city'),
  address: z.string().min(5, 'Enter your address'),
  // Stored as private storage paths (owner-documents/<uid>/...), not public URLs.
  cnic_front_url: z.string().min(1, 'Upload the front of your CNIC'),
  cnic_back_url: z.string().min(1, 'Upload the back of your CNIC'),
  ownership_proof_url: z.string().min(1, 'Upload your ownership / authority proof'),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
export type ProfileInput = z.infer<typeof profileSchema>;
export type OwnerVerificationInput = z.infer<typeof ownerVerificationSchema>;

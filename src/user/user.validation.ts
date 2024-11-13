import { z, ZodType } from 'zod';

export class UserValidation {
  static readonly SAVE: ZodType = z.object({
    fullName: z.string().min(1).max(100),
    email: z.string().email().min(1).max(50),
    password: z.string().min(1).max(100),
  });
}

import { z } from 'zod';

export class AuthenticationValidation {
  static readonly SIGN_IN = z.object({
    email: z.string(),
    password: z.string(),
  });

  static readonly RESET_PASSWORD = z
    .object({
      password: z.string(),
      confirmPassword: z.string(),
    })
    .superRefine(({ password, confirmPassword }, ctx) => {
      if (confirmPassword !== password) {
        ctx.addIssue({
          code: 'custom',
          message: 'The passwords did not match',
          path: ['confirmPassword'],
        });
      }
    });
}

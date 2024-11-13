import { z } from 'zod';

export class AuthenticationValidation {
  static readonly SIGN_IN = z.object({
    email: z.string(),
    password: z.string(),
  });
}

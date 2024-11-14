import { z, ZodType } from 'zod';

export class LoanValidation {
  static readonly SAVE: ZodType = z.object({
    bookId: z.coerce.number().gte(1),
    loanDate: z
      .string()
      .refine((val) => !isNaN(Date.parse(val)), {
        message: 'Invalid Date Format',
      })
      .transform((val) => new Date(val)),
  });
  static readonly UPDATE: ZodType = z.object({
    bookId: z.coerce.number().gte(1),
    returnDate: z
      .string()
      .refine((val) => !isNaN(Date.parse(val)), {
        message: 'Invalid Date Format',
      })
      .transform((val) => new Date(val)),
  });
}

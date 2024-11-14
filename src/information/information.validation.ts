import { z, ZodType } from 'zod';

export class InformationValidation {
  static readonly SAVE: ZodType = z.object({
    identificationNumber: z.string().min(1),
    telephone: z.string().min(1),
    faculty: z.string().min(1),
    studyProgram: z.string().min(1),
  });
}

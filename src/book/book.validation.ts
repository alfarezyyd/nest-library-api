import { z, ZodType } from 'zod';

export class BookValidation {
  static readonly SAVE: ZodType = z.object({
    categoryId: z.number().min(1),
    title: z.string().min(1),
    author: z.string().min(1),
    publisher: z.string().min(1),
    publicationYear: z.string().length(4),
    pagesAmount: z.number().min(1),
    description: z.string(),
  });
}

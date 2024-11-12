import { Injectable } from '@nestjs/common';
import { CreateBookDto } from './dto/create-book.dto';
import { UpdateBookDto } from './dto/update-book.dto';
import PrismaService from '../common/prisma.service';
import ValidationService from '../common/validation.service';
import { BookValidation } from './book.validation';

@Injectable()
export class BookService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly validationService: ValidationService,
  ) {}

  async create(createBookDto: CreateBookDto): Promise<boolean> {
    const validatedCreateBookDto = this.validationService.validate(
      BookValidation.SAVE,
      createBookDto,
    );
    await this.prismaService.book.create({
      data: validatedCreateBookDto,
    });
    return true;
  }

  async findAll() {
    return this.prismaService.book.findMany({
      include: {
        category: true,
      },
    });
  }

  async findOne(id: number) {
    return this.prismaService.book.findFirstOrThrow({
      where: { id },
      include: {
        category: true,
      },
    });
  }

  async update(id: number, updateBookDto: UpdateBookDto) {
    const validatedUpdateBookDto = this.validationService.validate(
      BookValidation.SAVE,
      updateBookDto,
    );
    await this.prismaService.book.update({
      where: { id },
      data: validatedUpdateBookDto,
    });
    return true;
  }

  async remove(id: number) {
    await this.prismaService.book.delete({
      where: { id },
    });
    return true;
  }
}

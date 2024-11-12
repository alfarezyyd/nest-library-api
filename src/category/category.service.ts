import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import PrismaService from '../common/prisma.service';
import ValidationService from '../common/validation.service';
import { CategoryValidation } from './category.validation';

@Injectable()
export class CategoryService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly validationService: ValidationService,
  ) {}

  async create(createCategoryDto: CreateCategoryDto): Promise<boolean> {
    const validatedCategoryValidationDto = this.validationService.validate(
      CategoryValidation.SAVE,
      createCategoryDto,
    );
    return this.prismaService.$transaction(async (prismaTransaction) => {
      await prismaTransaction.category.create({
        data: validatedCategoryValidationDto,
      });
      return true;
    });
  }

  async findAll() {
    return this.prismaService.category.findMany({});
  }

  async findOne(id: number): Promise<any> {
    return this.prismaService.category
      .findFirst({
        where: {
          id,
        },
        include: {
          Book: true,
        },
      })
      .catch(() => {
        throw new NotFoundException('Category not found');
      });
  }

  async update(
    id: number,
    updateCategoryDto: UpdateCategoryDto,
  ): Promise<boolean> {
    const validatedUpdateCategoryDto = this.validationService.validate(
      CategoryValidation.SAVE,
      updateCategoryDto,
    );
    return this.prismaService.$transaction(async (prismaTransaction) => {
      await prismaTransaction.category
        .findFirstOrThrow({
          where: {
            id,
          },
        })
        .catch(() => {
          throw new NotFoundException('Category not found');
        });
      await prismaTransaction.category.update({
        where: {
          id,
        },
        data: validatedUpdateCategoryDto,
      });
      return true;
    });
  }

  async remove(id: number) {
    await this.prismaService.category.delete({
      where: {
        id,
      },
    });
    return true;
  }
}

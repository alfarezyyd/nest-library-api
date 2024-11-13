import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateBookDto } from './dto/create-book.dto';
import { UpdateBookDto } from './dto/update-book.dto';
import PrismaService from '../common/prisma.service';
import ValidationService from '../common/validation.service';
import { BookValidation } from './book.validation';
import { CommonHelper } from '../helper/common.helper';
import { ConfigService } from '@nestjs/config';
import * as fs from 'node:fs';
import { Book } from '@prisma/client';

@Injectable()
export class BookService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly validationService: ValidationService,
    private readonly configService: ConfigService,
  ) {}

  async create(
    uploadedFile: Express.Multer.File,
    createBookDto: CreateBookDto,
  ): Promise<boolean> {
    const validatedCreateBookDto = this.validationService.validate(
      BookValidation.SAVE,
      createBookDto,
    );
    const generatedFilePath = await CommonHelper.handleSaveFile(
      this.configService,
      uploadedFile,
      'books-resources',
    );
    await this.prismaService.book.create({
      data: {
        ...validatedCreateBookDto,
        imagePath: generatedFilePath,
      },
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

  async update(
    id: number,
    updateBookDto: UpdateBookDto,
    uploadedFile: Express.Multer.File,
  ) {
    const validatedUpdateBookDto = this.validationService.validate(
      BookValidation.SAVE,
      updateBookDto,
    );
    const bookPrisma: Book = await this.prismaService.book
      .findFirstOrThrow({
        where: { id },
      })
      .catch(() => {
        throw new NotFoundException('Book not found');
      });
    const isImageSame = await CommonHelper.compareImagesFromUpload(
      `${this.configService.get<string>('MULTER_DEST')}/books-resources/${bookPrisma.imagePath}`,
      uploadedFile,
    );
    let imagePath = bookPrisma.imagePath;
    if (!isImageSame) {
      fs.unlinkSync(
        `${this.configService.get<string>('MULTER_DEST')}/books-resources/${bookPrisma.imagePath}`,
      );
      imagePath = await CommonHelper.handleSaveFile(
        this.configService,
        uploadedFile,
        'books-resources',
      );
    }
    await this.prismaService.book.update({
      where: { id },
      data: {
        ...validatedUpdateBookDto,
        imagePath,
      },
    });
    return true;
  }

  async remove(id: number) {
    const bookPrisma: Book = await this.prismaService.book
      .findFirstOrThrow({
        where: {
          id,
        },
      })
      .catch(() => {
        throw new NotFoundException('Book not found');
      });
    fs.unlinkSync(
      `${this.configService.get<string>('MULTER_DEST')}/books-resources/${bookPrisma.imagePath}`,
    );
    await this.prismaService.book.delete({
      where: { id },
    });
    return true;
  }
}

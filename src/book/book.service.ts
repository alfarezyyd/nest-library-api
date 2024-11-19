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
import * as QRCode from 'qrcode';
import { v4 as uuid } from 'uuid';
import { CloudStorageService } from '../common/cloud-storage.service';

@Injectable()
export class BookService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly validationService: ValidationService,
    private readonly configService: ConfigService,
    private readonly cloudStorage: CloudStorageService,
  ) {}

  async create(
    uploadedFile: Express.Multer.File,
    createBookDto: CreateBookDto,
  ): Promise<boolean> {
    const validatedCreateBookDto = this.validationService.validate(
      BookValidation.SAVE,
      createBookDto,
    );
    const cloudStorage = await this.cloudStorage.loadCloudStorageInstance(); // Simpan file gambar buku
    const generatedFilePath = await CommonHelper.handleSaveFile(
      this.configService,
      uploadedFile,
      'books-resources',
      cloudStorage,
    );

    const bookPrisma: Book = await this.prismaService.book.create({
      data: {
        ...validatedCreateBookDto,
        imagePath: generatedFilePath,
      },
    });

    // Generate QR code URL
    console.log(bookPrisma.id);
    const generatedBase64QrCode = await QRCode.toDataURL(`${bookPrisma.id}`);
    // Ambil ekstensi dari Data URL (setelah 'data:image/')
    const imageExtension = generatedBase64QrCode.match(
      /data:image\/(.*?);base64,/,
    );
    if (!imageExtension) {
      throw new Error('Failed to detect image format');
    }
    const fileExtension = imageExtension[1]; // ekstensi gambar seperti 'png', 'jpeg', dll

    const base64Data = generatedBase64QrCode.replace(
      /^data:image\/png;base64,/,
      '',
    );

    const generatedQrCodeFileName = `${uuid()}-${bookPrisma.id}.${fileExtension}`; // Tambahkan ekstensi

    // Pastikan direktori sudah ada
    const qrCodeDirectory = `${this.configService.get<string>('MULTER_DEST')}/qr-code/`;
    if (!fs.existsSync(qrCodeDirectory)) {
      fs.mkdirSync(qrCodeDirectory, { recursive: true }); // Buat folder jika belum ada
    }

    // Simpan QR code sebagai file
    await fs.promises.writeFile(
      `${qrCodeDirectory}${generatedQrCodeFileName}`,
      base64Data,
      'base64',
    );

    // Upload file lokal ke cloud storage
    await cloudStorage
      .bucket(this.configService.get<string>('BUCKET_NAME'))
      .upload(`${qrCodeDirectory}/${generatedQrCodeFileName}`, {
        destination: `qr-code/${generatedQrCodeFileName}`, // Tentukan path tujuan di cloud
        gzip: true, // Opsi jika ingin mengkompres file
        metadata: {
          cacheControl: 'public, max-age=31536000', // Tentukan metadata file jika perlu
        },
      });

    // Simpan path ke QR code ke database
    await this.prismaService.book.update({
      where: { id: bookPrisma.id },
      data: {
        qrCodePath: generatedQrCodeFileName,
      },
    });

    return true;
  }

  async findAll() {
    return this.prismaService.book.findMany({
      include: {
        category: true,
      },
      orderBy: {
        createdAt: 'desc',
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
    const cloudStorage = await this.cloudStorage.loadCloudStorageInstance();

    const cloudImageBuffer = await this.cloudStorage.downloadFromCloudStorage(
      `profile/${bookPrisma.imagePath}`,
    );

    const isImageSame = await CommonHelper.compareImagesFromUpload(
      this.configService.get<string>('NODE_ENV') === 'PRODUCTION'
        ? cloudImageBuffer
        : `${this.configService.get<string>('MULTER_DEST')}/books-resources/${bookPrisma.imagePath}`,
      uploadedFile,
    );
    let imagePath = bookPrisma.imagePath;
    if (!isImageSame) {
      if (this.configService.get<string>('NODE_ENV') === 'PRODUCTION') {
        await cloudStorage
          .bucket(this.configService.get<string>('BUCKET_NAME'))
          .file(`profile/${bookPrisma.imagePath}`)
          .delete();
      } else {
        fs.unlinkSync(
          `${this.configService.get<string>('MULTER_DEST')}/books-resources/${bookPrisma.imagePath}`,
        );
      }
      imagePath = await CommonHelper.handleSaveFile(
        this.configService,
        uploadedFile,
        'books-resources',
        cloudStorage,
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
    const cloudStorage = await this.cloudStorage.loadCloudStorageInstance();
    if (this.configService.get<string>('NODE_ENV') === 'PRODUCTION') {
      await cloudStorage
        .bucket(this.configService.get<string>('BUCKET_NAME'))
        .file(`profile/${bookPrisma.imagePath}`)
        .delete();
    } else {
      fs.unlinkSync(
        `${this.configService.get<string>('MULTER_DEST')}/books-resources/${bookPrisma.imagePath}`,
      );
    }

    await this.prismaService.book.delete({
      where: { id },
    });
    return true;
  }

  async findAllByCategoryId(id: number) {
    return this.prismaService.book.findMany({
      where: {
        categoryId: id,
      },
    });
  }

  async searchBookByQuery(search: string) {
    return this.prismaService.book.findMany({
      where: {
        OR: [
          {
            title: {
              startsWith: search,
            },
          },
          {
            title: {
              endsWith: search,
            },
          },
          {
            author: {
              startsWith: search,
            },
          },
          {
            author: {
              endsWith: search,
            },
          },
          {
            publisher: {
              startsWith: search,
            },
          },
          {
            publisher: {
              endsWith: search,
            },
          },
          {
            publicationYear: {
              startsWith: search,
            },
          },
          {
            publicationYear: {
              endsWith: search,
            },
          },
        ],
      },
      include: {
        category: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }
}

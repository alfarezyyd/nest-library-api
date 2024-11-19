import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateInformationDto } from './dto/create-information.dto';
import { UpdateInformationDto } from './dto/update-information.dto';
import { ConfigService } from '@nestjs/config';
import ValidationService from '../common/validation.service';
import { InformationValidation } from './information.validation';
import PrismaService from '../common/prisma.service';
import { User, UserInformation } from '@prisma/client';
import { CommonHelper } from '../helper/common.helper';
import * as fs from 'node:fs';
import { CloudStorageService } from '../common/cloud-storage.service';

@Injectable()
export class InformationService {
  constructor(
    private readonly configService: ConfigService,
    private readonly validationService: ValidationService,
    private readonly prismaService: PrismaService,
    private readonly cloudStorage: CloudStorageService,
  ) {}

  async create(
    currentUser: User,
    createInformationDto: CreateInformationDto,
    uploadedFile: Express.Multer.File,
  ): Promise<boolean> {
    const validatedCreateInformationDto = this.validationService.validate(
      InformationValidation.SAVE,
      createInformationDto,
    );
    if (uploadedFile) {
      const cloudStorage = await this.cloudStorage.loadCloudStorageInstance();
      validatedCreateInformationDto.profilePath =
        await CommonHelper.handleSaveFile(
          this.configService,
          uploadedFile,
          'information-resources',
          cloudStorage,
        );
    }
    await this.prismaService.userInformation.create({
      data: {
        ...validatedCreateInformationDto,
        userId: currentUser.id,
      },
    });
    return true;
  }

  findAll() {
    return `This action returns all information`;
  }

  async findOne(currentUser: User): Promise<UserInformation> {
    return this.prismaService.userInformation.findFirst({
      where: {
        userId: currentUser.id,
      },
    });
  }

  update(
    id: number,
    updateInformationDto: UpdateInformationDto,
    uploadedFile: Express.Multer.File,
    currentUser: User,
  ): Promise<boolean> {
    const validatedUpdateInformation = this.validationService.validate(
      InformationValidation.SAVE,
      updateInformationDto,
    );
    return this.prismaService.$transaction(async (prismaTransaction) => {
      const userInformation = await prismaTransaction.userInformation
        .findFirstOrThrow({
          where: {
            id,
            userId: currentUser.id,
          },
        })
        .catch(() => {
          throw new NotFoundException('User information not found');
        });
      let profilePath = userInformation.profilePath;
      if (uploadedFile) {
        let isImageSame = false;
        if (profilePath !== null) {
          isImageSame = await CommonHelper.compareImagesFromUpload(
            `${this.configService.get<string>('MULTER_DEST')}/information-resources/${userInformation.profilePath}`,
            uploadedFile,
          );
        }
        const cloudStorage = await this.cloudStorage.loadCloudStorageInstance();

        if (!isImageSame) {
          if (userInformation.profilePath !== null) {
            if (this.configService.get<string>('NODE_ENV') === 'PRODUCTION') {
              await cloudStorage
                .bucket(this.configService.get<string>('BUCKET_NAME'))
                .file(`profile/${userInformation.profilePath}`)
                .delete();
            } else {
              fs.unlinkSync(
                `${this.configService.get<string>('MULTER_DEST')}/information-resources/${userInformation.profilePath}`,
              );
            }
          }
          profilePath = await CommonHelper.handleSaveFile(
            this.configService,
            uploadedFile,
            'information-resources',
            cloudStorage,
          );
        }
      }
      validatedUpdateInformation['profilePath'] = profilePath;
      await prismaTransaction.userInformation.update({
        where: {
          id,
          userId: currentUser.id,
        },
        data: {
          ...validatedUpdateInformation,
        },
      });
      return true;
    });
  }

  remove(id: number) {
    return ``;
  }
}

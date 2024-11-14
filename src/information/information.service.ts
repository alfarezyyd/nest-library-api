import { Injectable } from '@nestjs/common';
import { CreateInformationDto } from './dto/create-information.dto';
import { UpdateInformationDto } from './dto/update-information.dto';
import { ConfigService } from '@nestjs/config';
import ValidationService from '../common/validation.service';
import { InformationValidation } from './information.validation';
import PrismaService from '../common/prisma.service';
import { User, UserInformation } from '@prisma/client';
import { CommonHelper } from '../helper/common.helper';

@Injectable()
export class InformationService {
  constructor(
    private readonly configService: ConfigService,
    private readonly validationService: ValidationService,
    private readonly prismaService: PrismaService,
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
    const generatedFileName = CommonHelper.handleSaveFile(
      this.configService,
      uploadedFile,
      'information-resources',
    );
    await this.prismaService.userInformation.create({
      data: {
        ...validatedCreateInformationDto,
        user: currentUser,
        profilePath: generatedFileName,
      },
    });
    return true;
  }

  findAll() {
    return `This action returns all information`;
  }

  async findOne(currentUser: User): Promise<UserInformation> {
    return this.prismaService.userInformation.findFirstOrThrow({
      where: {
        id: currentUser.id,
      },
    });
  }

  update(id: number, updateInformationDto: UpdateInformationDto) {
    return `This action updates a #${id} information`;
  }

  remove(id: number) {
    return `This action removes a #${id} information`;
  }
}

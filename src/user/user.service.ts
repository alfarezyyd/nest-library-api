import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import PrismaService from '../common/prisma.service';
import ValidationService from '../common/validation.service';
import { UserValidation } from './user.validation';
import * as bcrypt from 'bcryptjs';
import { User } from '@prisma/client';

@Injectable()
export class UserService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly validationService: ValidationService,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    const validatedCreateUserDto = this.validationService.validate(
      UserValidation.SAVE,
      createUserDto,
    );

    const generatedSalt = bcrypt.genSaltSync(10);
    const generatedHashPassword = bcrypt.hashSync(
      validatedCreateUserDto.password,
      generatedSalt,
    );
    return this.prismaService.$transaction(async (prismaTransaction) => {
      return prismaTransaction.user.create({
        data: {
          ...validatedCreateUserDto,
          password: generatedHashPassword,
        },
      });
    });
  }

  async findAllActivityByUser(currentUser: User) {
    return this.prismaService.loan.findMany({
      where: {
        userId: currentUser.id,
      },
      include: {
        book: true,
      },
    });
  }

  async findOne(email: string) {
    return this.prismaService.user
      .findFirstOrThrow({
        where: { email },
      })
      .catch(() => {
        throw new NotFoundException('User not found');
      });
  }

  update(id: number, updateUserDto: UpdateUserDto) {
    return `This action updates a #${id} user`;
  }

  remove(id: number) {
    return `This action removes a #${id} user`;
  }
}

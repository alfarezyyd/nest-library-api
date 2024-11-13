import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateLoanDto } from './dto/create-loan.dto';
import { ConfigService } from '@nestjs/config';
import PrismaService from '../common/prisma.service';
import ValidationService from '../common/validation.service';
import { LoanValidation } from './loan.validation';
import { Loan, LoanStatus, User } from '@prisma/client';
import { UpdateLoanDto } from './dto/update-loan.dto';

@Injectable()
export class LoanService {
  constructor(
    private readonly configService: ConfigService,
    private readonly prismaService: PrismaService,
    private readonly validationService: ValidationService,
  ) {}

  async create(
    currentUser: User,
    createLoanDto: CreateLoanDto,
  ): Promise<boolean> {
    const validatedCreateLoanDto = this.validationService.validate(
      LoanValidation.SAVE,
      createLoanDto,
    );
    return this.prismaService.$transaction(async (prismaTransaction) => {
      await prismaTransaction.user
        .findFirstOrThrow({
          where: { id: currentUser.id },
        })
        .catch(() => {
          throw new NotFoundException('User not found');
        });
      await prismaTransaction.loan.create({
        data: {
          ...validatedCreateLoanDto,
          userId: currentUser.id,
        },
      });
      return true;
    });
  }

  findAll() {
    return `This action returns all loan`;
  }

  findOne(id: number) {
    return `This action returns a #${id} loan`;
  }

  handleReturn(
    userPrisma: User,
    id: number,
    updateLoanDto: UpdateLoanDto,
  ): Promise<boolean> {
    const validatedUpdateLoanDto = this.validationService.validate(
      LoanValidation.UPDATE,
      updateLoanDto,
    );
    return this.prismaService.$transaction(async (prismaTransaction) => {
      const loanPrisma: Loan = await prismaTransaction.loan
        .findFirstOrThrow({
          where: {
            id: id,
            userId: userPrisma.id,
            bookId: updateLoanDto.bookId,
          },
        })
        .catch(() => {
          throw new NotFoundException('Loan not found');
        });
      const totalLoanDays = Math.ceil(
        (validatedUpdateLoanDto.returnDate.getTime() -
          loanPrisma.loanDate.getTime()) /
          (1000 * 60 * 60 * 24),
      );
      let totalAmercement = 0;
      if (totalLoanDays > 7) {
        totalAmercement = (totalLoanDays - 7) * 10000;
      }
      await prismaTransaction.loan.update({
        where: {
          id: id,
          bookId: updateLoanDto.bookId,
          userId: userPrisma.id,
        },
        data: {
          returnDate: validatedUpdateLoanDto.returnDate,
          loanStatus: LoanStatus.RETURNED,
          updatedAt: new Date(),
          amercement: totalAmercement,
        },
      });
      return true;
    });
  }

  remove(id: number) {
    return `This action removes a #${id} loan`;
  }
}

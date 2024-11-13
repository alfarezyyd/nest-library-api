import { Injectable } from '@nestjs/common';
import { UpdateNotificationDto } from './dto/update-notification.dto';
import { Loan, LoanStatus, User } from '@prisma/client';
import PrismaService from '../common/prisma.service';

@Injectable()
export class NotificationService {
  constructor(private readonly prismaService: PrismaService) {}

  handleTriggerNotification(currentUser: User) {
    this.prismaService.loan.findMany({
      where: {
        userId: currentUser.id,
        loanStatus: LoanStatus.BORROWED,
        OR: [
          {
            returnDate: {
              lte: new Date(new Date().getTime() - 7 * 24 * 60 * 60 * 1000),
            }, // lewat 7 hari
          },
          {
            returnDate: {
              gte: new Date(new Date().getTime() + 24 * 60 * 60 * 1000),
              lte: new Date(new Date().getTime() + 3 * 24 * 60 * 60 * 1000),
            }, // 1-3 hari sebelum 7 hari
          },
        ],
      },
    });
  }

  findAll() {
    return `This action returns all notification`;
  }

  findOne(id: number) {
    return `This action returns a #${id} notification`;
  }

  update(id: number, updateNotificationDto: UpdateNotificationDto) {
    return `This action updates a #${id} notification`;
  }

  remove(id: number) {
    return `This action removes a #${id} notification`;
  }
}

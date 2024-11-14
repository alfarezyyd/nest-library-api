import { Injectable } from '@nestjs/common';
import { UpdateNotificationDto } from './dto/update-notification.dto';
import { LoanStatus, User } from '@prisma/client';
import PrismaService from '../common/prisma.service';

@Injectable()
export class NotificationService {
  constructor(private readonly prismaService: PrismaService) {}

  async handleTriggerNotification(currentUser: User) {
    const loansPrisma = await this.prismaService.loan.findMany({
      where: {
        userId: currentUser.id,
        loanStatus: LoanStatus.BORROWED,
        OR: [
          {
            loanDate: {
              lte: new Date(new Date().getTime() - 7 * 24 * 60 * 60 * 1000),
            }, // lewat 7 hari
          },
          {
            loanDate: {
              gte: new Date(new Date().getTime() + 24 * 60 * 60 * 1000),
              lte: new Date(new Date().getTime() + 3 * 24 * 60 * 60 * 1000),
            }, // 1-3 hari sebelum 7 hari
          },
        ],
      },
      include: {
        book: true,
      },
    });
    const allLoanIds = new Set(
      (
        await this.prismaService.userNotification.findMany({
          where: {
            userId: currentUser.id,
          },
          select: {
            loanId: true,
          },
        })
      ).map((item) => item.loanId),
    );
    const filteredLoans = loansPrisma.filter(
      (loan) => !allLoanIds.has(loan.id),
    );
    const notificationPayload = [];
    for (const loanPrisma of filteredLoans) {
      notificationPayload.push({
        userId: currentUser.id,
        headerMessage: `Mohon Kembalikan Buku`,
        message: `Tolong kembalikan buku ${loanPrisma.book.title}, jika Anda melewati jatuh tempo maka denda akan dikenakan`,
        loanId: loanPrisma.id,
      });
    }
    await this.prismaService.userNotification.createMany({
      data: notificationPayload,
    });
    return true;
  }

  async findAllByUserId(currentUser: User) {
    return this.prismaService.userNotification.findMany({
      where: {
        userId: currentUser.id,
      },
    });
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

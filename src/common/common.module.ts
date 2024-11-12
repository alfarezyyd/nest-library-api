import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import PrismaService from './prisma.service';
import ValidationService from './validation.service';
import { WinstonModule } from 'nest-winston';
import winston from 'winston';

@Module({
  imports: [
    ConfigModule.forRoot(),
    WinstonModule.forRoot({
      level: 'debug',
      format: winston.format.combine(winston.format.json()),
      transports: [
        new winston.transports.Console({
          format: winston.format.combine(
            winston.format.timestamp(),
            winston.format.colorize(),
            winston.format.simple(),
          ),
        }),
      ],
    }),
  ],
  providers: [PrismaService, ValidationService],
  exports: [PrismaService, ValidationService],
})
export class CommonModule {}

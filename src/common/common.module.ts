import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import PrismaService from './prisma.service';
import ValidationService from './validation.service';
import { WinstonModule } from 'nest-winston';
import * as winston from 'winston';
import { MulterModule } from '@nestjs/platform-express';
import { MulterService } from './multer.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    MulterModule.registerAsync({
      useClass: MulterService,
    }),
    WinstonModule.forRoot({
      level: 'debug',
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json(),
      ),
      transports: [
        new winston.transports.Console({
          format: winston.format.combine(
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

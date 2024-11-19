import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';

import PrismaService from './prisma.service';
import ValidationService from './validation.service';
import { WinstonModule } from 'nest-winston';
import * as winston from 'winston';
import { MulterModule } from '@nestjs/platform-express';
import { MulterService } from './multer.service';
import { HttpModule } from '@nestjs/axios';
import { AxiosService } from './axios.service';
import { MailerService } from './mailer.service';
import { CloudStorageService } from './cloud-storage.service';

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
    HttpModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useClass: AxiosService,
    }),
  ],
  providers: [
    PrismaService,
    ValidationService,
    MailerService,
    CloudStorageService,
  ],
  exports: [
    PrismaService,
    ValidationService,
    HttpModule,
    MailerService,
    CloudStorageService,
  ],
})
export class CommonModule {}

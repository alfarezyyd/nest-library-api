import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import PrismaService from './prisma.service';
import ValidationService from './validation.service';

@Module({
  imports: [ConfigModule.forRoot()],
  providers: [PrismaService, ValidationService],
  exports: [PrismaService, ValidationService],
})
export class CommonModule {}

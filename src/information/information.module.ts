import { Module } from '@nestjs/common';
import { InformationService } from './information.service';
import { InformationController } from './information.controller';
import { CommonModule } from '../common/common.module';

@Module({
  imports: [CommonModule],
  controllers: [InformationController],
  providers: [InformationService],
})
export class InformationModule {}

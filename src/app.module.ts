import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { BookModule } from './book/book.module';
import { CategoryModule } from './category/category.module';

@Module({
  imports: [BookModule, CategoryModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

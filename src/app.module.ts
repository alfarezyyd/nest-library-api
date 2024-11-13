import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { BookModule } from './book/book.module';
import { CategoryModule } from './category/category.module';
import { AuthenticationModule } from './authentication/authentication.module';
import { UserModule } from './user/user.module';
import { LoanModule } from './loan/loan.module';
import { NotificationModule } from './notification/notification.module';

@Module({
  imports: [
    BookModule,
    CategoryModule,
    AuthenticationModule,
    UserModule,
    LoanModule,
    NotificationModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

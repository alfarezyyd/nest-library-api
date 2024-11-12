import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import ValidationExceptionFilter from './exception/ValidationExceptionFilter';
import PrismaExceptionFilter from './exception/PrismaExceptionFilter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  // Exception Filter
  app.useGlobalFilters(new PrismaExceptionFilter());
  app.useGlobalFilters(new ValidationExceptionFilter());

  BigInt.prototype['toJSON'] = function () {
    return this.toString();
  };
  await app.listen(3000);
}

bootstrap();

import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import ValidationExceptionFilter from './exception/ValidationExceptionFilter';
import PrismaExceptionFilter from './exception/PrismaExceptionFilter';
import { HttpExceptionFilter } from './exception/HttpExceptionFilter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  // Exception Filter
  app.useGlobalFilters(new PrismaExceptionFilter());
  app.useGlobalFilters(new ValidationExceptionFilter());
  app.useGlobalFilters(new HttpExceptionFilter());

  BigInt.prototype['toJSON'] = function () {
    return this.toString();
  };

  app.enableCors();
  await app.listen(3001);
}

bootstrap();

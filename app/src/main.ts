import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger } from '@nestjs/common';
import * as cookieParser from 'cookie-parser';
import {config} from "./config/mongoose";

console.log(config);
async function bootstrap() {
  const logger = new Logger('bootstrap');
  const app = await NestFactory.create(AppModule);
  app.use(cookieParser());
  const port = 3000;
  await app.listen(port);

  logger.log(`Application listening on port: ${port}`);
}
bootstrap();

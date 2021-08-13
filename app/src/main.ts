import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger } from '@nestjs/common';
import * as cookieParser from 'cookie-parser';
import {config} from "./config/mongoose";
import * as helmet from 'helmet';
import * as csurf from 'csurf';
console.log(config);
async function bootstrap() {
  const logger = new Logger('bootstrap');
  const app = await NestFactory.create(AppModule, { cors: true });
  app.use(cookieParser());
  // app.use(csurf());
  app.use(helmet());
  const port = 3000;
  await app.listen(port);

  logger.log(`Application listening on port: ${port}`);
}
bootstrap();

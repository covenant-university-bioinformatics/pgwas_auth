import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger } from '@nestjs/common';
import * as cookieParser from 'cookie-parser';
import * as helmet from 'helmet';
import * as mongoSanitize from 'express-mongo-sanitize';
import * as xss from "xss-clean";
import * as rateLimit from "express-rate-limit";
import * as hpp from "hpp";

async function bootstrap() {
  const logger = new Logger('bootstrap');
  const app = await NestFactory.create(AppModule, { cors: true });
  app.use(cookieParser());
  app.use(mongoSanitize());
  app.use(xss());
  const limiter = rateLimit({
    windowMs: 10*60*1000, //10 mins
    max: 100
  })
  app.use(limiter);
  app.use(hpp());
  app.use(helmet());
  const port = 3000;
  await app.listen(port);

  logger.log(`Application listening on port: ${port}`);
}
bootstrap();

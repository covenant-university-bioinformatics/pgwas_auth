import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from './auth/auth.module';
import { config } from './config/mongoose';
import { NatsModule } from './nats/nats.module';

@Module({
  //default mongoDB connection to DB
  imports: [
    AuthModule,
    NatsModule,
    MongooseModule.forRoot(
      `mongodb://${config.user}:${config.password}@${config.podName}-0.${config.host}:27017,${config.podName}-1.${config.host}:27017,${config.podName}-2.${config.host}:27017/?authSource=admin&replicaSet=rs0`,
      {
        dbName: config.dbName,
        useNewUrlParser: true,
        useCreateIndex: true,
        useFindAndModify: false,
        useUnifiedTopology: true,
      },
    ),
  ],
  controllers: [],
  providers: [],
  exports: [],
})
export class AppModule {}

import { Module, OnModuleInit } from '@nestjs/common';
import { AuthService } from './services/auth.service';
import { MongooseModule } from '@nestjs/mongoose';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AuthController } from './controllers/auth.controller';
import { JwtStrategy } from './jwt.strategy';
import { User, UserSchema } from './models/user.model';
import { UsersController } from './controllers/users.controller';
import { NatsModule } from '../nats/nats.module';

@Module({
  imports: [
    PassportModule.register({
      defaultStrategy: 'jwt',
    }),
    JwtModule.register({
      secret: process.env.JWT_KEY,
      signOptions: {
        expiresIn: 3600,
      },
    }),
    // Allow the injection of model in service
    MongooseModule.forFeature([
      {
        name: User.name,
        schema: UserSchema,
      },
    ]),
    NatsModule,
  ],
  controllers: [AuthController, UsersController],
  providers: [AuthService, JwtStrategy],
  exports: [JwtStrategy, PassportModule, AuthService],
})
export class AuthModule implements OnModuleInit {
  onModuleInit() {
    console.log(`The Auth module has been initialized`);
  }
}

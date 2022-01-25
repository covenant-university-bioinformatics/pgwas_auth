import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';

export type UserDocument = User & Document;

export enum UserRoles {
  ADMIN = 'admin',
  SCIENTIST = 'scientist',
}

@Schema({
  toJSON: {
    transform(doc, ret) {
      ret.id = ret._id;
      delete ret._id;
      delete ret.__v;
    },
  },
  timestamps: true,
  versionKey: 'version',
})
export class User {
  @Prop({
    type: String,
    required: [true, 'Please add a username'],
    unique: true,
    trim: true,
    minlength: [5, 'username must not be less than 5'],
    maxlength: [20, 'username must not be more than 20'],
  })
  username: string;

  @Prop({
    type: String,
    required: [true, 'Please add a password'],
    minlength: 6,
    select: false,
  })
  password: string;

  @Prop({
    type: String,
    required: [true, 'Please add an email'],
    unique: true,
  })
  email: string;

  @Prop({
    type: String,
    enum: [UserRoles.SCIENTIST, UserRoles.ADMIN],
    default: UserRoles.SCIENTIST,
  })
  role: UserRoles;

  @Prop()
  emailConfirmed: boolean;

  @Prop({ type: String, select: false })
  emailConfirmedToken: string;

  @Prop({  select: false })
  emailConfirmedTokenExpire: Date;

  @Prop({ type: String, select: false })
  resetPasswordToken: string;

  @Prop({  select: false })
  resetPasswordTokenExpire: Date;

  @Prop({  select: false })
  salt: string;

  version: string;

  //  custom logic for individual users to run for each user
  async validatePassword(password: string): Promise<boolean> {
    const hash = await bcrypt.hash(password, this.salt);
    console.log(this);
    console.log(hash);
    return hash === this.password;
  }

  // async generateEmailToken(password: string) {}

  generateResetPasswordToken(): string {
    return '';
  }

  generateEmailToken(): string {
    return '';
  }

  //  generate and hash email confirm tokens
}

export const UserSchema = SchemaFactory.createForClass(User);

// UserSchema.pre('save', async function (next) {

//   next();
// });

UserSchema.pre('save', async function (next) {
  const user = this as Document<User> & User;

  //if not modified then do not continue with this function
  if (!user.isModified('password')) {
    next();
  }

  //generate salt
  user.salt = await bcrypt.genSalt(10);

  //hash password
  user.password = await bcrypt.hash(user.password, user.salt);
  next();
});

//methods
UserSchema.methods.validatePassword = async function (password: string) {
  const user = this as Document<User> & User;
  const hash = await bcrypt.hash(password, user.salt);
  return hash === user.password;
};

// UserSchema.methods.generateEmailToken = async function () {
//   const user = this as Document<User> & User;
//
//
// };

//Generate and hash password token
UserSchema.methods.generateResetPasswordToken = function () {
  const user = this as Document<User> & User;

  //Generate token
  const token = crypto.randomBytes(20).toString('hex');

  //  Hash token and set to resetPasswordToken field
  user.resetPasswordToken = crypto
    .createHash('sha256')
    .update(token) //token
    .digest('hex');

  //  Set expire
  user.resetPasswordTokenExpire = new Date(Date.now() + 172800000); //Two days or 48H

  return token;
};

UserSchema.methods.generateEmailToken = function () {
  const user = this as Document<User> & User;

  //  generate token
  const token = crypto.randomBytes(20).toString('hex');

  //  Hash token and set to emailConfirmToken field
  user.emailConfirmedToken = crypto
    .createHash('sha256')
    .update(token)
    .digest('hex');

  //  Set expire
  user.emailConfirmedTokenExpire = new Date(Date.now() + 172800000); //Two days or 48H
  user.emailConfirmed = false;

  return token;
};

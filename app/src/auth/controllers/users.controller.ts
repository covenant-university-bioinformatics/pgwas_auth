import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  ValidationPipe,
  ForbiddenException,
  Res,
} from '@nestjs/common';
import { AuthService } from '../services/auth.service';
import { UpdateUserDto } from '../dto/update-user.dto';
import { AuthGuard } from '@nestjs/passport';
import { User, UserDocument, UserRoles } from '../models/user.model';
import { Roles } from '../decorators/roles.decorator';
import { GetUser } from '../decorators/get-user.decorator';
import { Response } from 'express';

@UseGuards(AuthGuard())
@Controller('api/users')
export class UsersController {
  constructor(private readonly authService: AuthService) {}

  @Get()
  @Roles(UserRoles.ADMIN)
  findAll() {
    return this.authService.findAll();
  }

  @Get('/currentuser')
  currentUser(@GetUser() user) {
    return user;
  }

  @Get(':id')
  @Roles(UserRoles.ADMIN)
  findOne(@Param('id') id: string) {
    return this.authService.findOne(id);
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body(ValidationPipe) updateUserDto: UpdateUserDto,
    @GetUser() user: UserDocument,
    @Res() res: Response,
  ) {
    if (String(user._id) !== id) {
      throw new ForbiddenException("Can't update another user");
    }
    const result = await this.authService.update(id, updateUserDto);

    if (result.accessToken) {
      //cookie options
      const options: { expires: Date; httpOnly: boolean; secure?: boolean } = {
        expires: new Date(Date.now() + 3600000), //1hr
        httpOnly: true,
      };

      if (process.env.NODE_ENV === 'production') {
        options.secure = true;
      }

      res
        .status(200)
        .cookie('accessToken', result.accessToken, options)
        .json({ accessToken: result.accessToken });
    } else {
      res.status(200).json({ success: true });
    }
  }

  // @Roles(UserRoles.ADMIN)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.authService.remove(id);
  }
}

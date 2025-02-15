import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUserDto } from 'src/users/dto/create-user.dto';
import { SignInDto } from './dto/sign-in.dto';
import { AuthGuard } from './guards/auth.guard';
import { UserCustomDecorator } from 'src/users/decorators/user.customDecorator';
import { UpdateUserDto } from 'src/users/dto/update-user.dto';
import { RolesGuard } from './guards/roles.guard';
import { Role, Roles } from './decorators/roles.customdecorator';
import { Types } from 'mongoose';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('sign-up')
  async signUp(@Body() createUserDto: CreateUserDto) {
    console.log(createUserDto, "createUserDto")
    try {
      return await this.authService.signUp(createUserDto);
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  @Post('sign-in')
  signIn(@Body() signInDto: SignInDto) {
    return this.authService.signIn(signInDto);
  }

  @Get('users')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  getAllUsers() {
    return this.authService.getAllUsers();
  }

  @Get('current-user')
  @UseGuards(AuthGuard)
  getCurrentUser(@Req() req) {
    return this.authService.getCurrentUser(req);
  }

  @Delete('delete/:id')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  async remove(@Param('id') id: string) {
    const objectId = new Types.ObjectId(id);
    return this.authService.remove(objectId);
  }

  @Patch()
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.USER)
  update(
    @UserCustomDecorator() userId: string,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    return this.authService.update(userId, updateUserDto);
  }
}

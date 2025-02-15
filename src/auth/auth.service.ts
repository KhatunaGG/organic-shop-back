import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import { CreateUserDto } from 'src/users/dto/create-user.dto';
import { UsersService } from 'src/users/users.service';
import * as bcrypt from 'bcrypt';
import { SignInDto } from './dto/sign-in.dto';
import { JwtService } from '@nestjs/jwt';
import { UpdateUserDto } from 'src/users/dto/update-user.dto';
import { Role } from './decorators/roles.customdecorator';
import { PurchasesService } from 'src/purchases/purchases.service';
import { Types } from 'mongoose';

@Injectable()
export class AuthService {
  constructor(
    private userService: UsersService,
    private jwtService: JwtService,
    // private purchaseService: PurchasesService,
  ) {}

  getAllUsers() {
    return this.userService.findAll();
  }

  async signUp(createUserDto: CreateUserDto) {
    try {
      const { name, email, password, role } = createUserDto;
      console.log(createUserDto, 'createUserDto');

      if (role === Role.ADMIN) {
        throw new UnauthorizedException(
          'Only admins can assign the ADMIN role',
        );
      }
      const existingUser = await this.userService.findOneByEmail({ email });
      if (existingUser) {
        throw new BadRequestException('User already exists');
      }

      console.log(email, 'email');
      console.log(existingUser, 'existingUser');

      const hashedPassword = await bcrypt.hash(password, 10);
      const userRole = role ? role : Role.USER;

      await this.userService.create({
        email,
        name,
        password: hashedPassword,
        role: userRole,
      });
      return { success: true, message: 'User registered successfully' };
    } catch (error) {
      console.log(error);
      if (error instanceof BadRequestException) {
        throw error;
      } else {
        throw new InternalServerErrorException('Internal server error');
      }
    }
  }

  async signIn(signInDto: SignInDto) {
    const { email, password } = signInDto;
    const existingUser = await this.userService.findByEmailAndPassword({
      email,
    });

    if (!existingUser) {
      throw new BadRequestException('Invalid credentials');
    }
    const isPasswordEqual = await bcrypt.compare(
      password,
      existingUser.password,
    );
    if (!isPasswordEqual) {
      throw new BadRequestException('Invalid credentials');
    }
    const payload = {
      sub: existingUser._id,
      role: existingUser.role,
    };
    return {
      accessToken: await this.jwtService.signAsync(payload),
    };
  }

  async getCurrentUser(req) {
    try {
      const id = req.userId;
      const existingUser = await this.userService.findById(id);
      return existingUser;
    } catch (error) {
      console.log(error);
    }
  }

  async remove(id: Types.ObjectId) {
    try {
      const deletedUser = await this.userService.findById(id);
      if (!deletedUser) {
        throw new BadRequestException('User not found');
      }
      await this.userService.remove(id);

      return {
        success: true,
        message: "User and User's purchases deleted successfully",
      };
      return 'hi';
    } catch (error) {
      console.log(error);
      throw new BadRequestException(
        'Failed to delete user and their purchases.',
      );
    }
  }

  async update(userId: string, updateUserDto: UpdateUserDto) {
    try {
      return this.userService.update(userId, updateUserDto);
    } catch (error) {
      console.log(error);
    }
  }
}

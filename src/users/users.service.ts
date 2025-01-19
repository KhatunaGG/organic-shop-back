import {
  BadRequestException,
  forwardRef,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User } from './schema/user.schema';
import { Model, Types } from 'mongoose';
import { CreateUserDto } from './dto/create-user.dto';
import { PurchasesService } from 'src/purchases/purchases.service';
// import { Certificate } from 'crypto';
// import { Role } from 'src/auth/decorators/roles.customdecorator';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    @Inject(forwardRef(() => PurchasesService))
    private purchasesService: PurchasesService,
  ) {}

  findAll() {
    return this.userModel.find();
  }

  create(createUserDto: CreateUserDto) {
    return this.userModel.create(createUserDto);
  }

  findById(id: Types.ObjectId) {
    return this.userModel.findById(id);
  }

  findOneByEmail(query) {
    return this.userModel.findOne(query);
  }

  findByEmailAndPassword(query) {
    return this.userModel.findOne(query).select('+password');
  }

  async remove(id: Types.ObjectId) {
    try {
      const deletedUser = await this.userModel.findByIdAndDelete(id);
      if (!deletedUser) {
        throw new BadRequestException('User not found');
      }
      await this.purchasesService.deleteManyPurchases(deletedUser.id);

      return {
        success: true,
        message: 'User and their purchases have been deleted successfully.',
      };
    } catch (error) {
      console.log(error);
      throw new BadRequestException(
        'Failed to delete user and their purchases.',
      );
    }
  }

  update(userId: string, updateUserDto: UpdateUserDto) {
    return this.userModel.findByIdAndUpdate(userId, updateUserDto);
  }

  async updateUsersPurchases(userCustomId: string, updatedPurchase) {
    try {
      const existingUser = await this.userModel.findById(userCustomId);
      if (!existingUser) {
        throw new UnauthorizedException('User not found.');
      }

      const purchaseIndex = existingUser.purchases.findIndex(
        (purchase) => purchase.toString() === updatedPurchase._id.toString(),
      );
      if (purchaseIndex === -1) {
        throw new BadRequestException(
          "Purchase not found in user's purchases.",
        );
      }
      existingUser.purchases[purchaseIndex] = updatedPurchase;
      const updatedUser = await this.userModel.findByIdAndUpdate(
        userCustomId,
        { purchases: existingUser.purchases },
        { new: true },
      );
      return updatedUser;
    } catch (error) {
      console.log(error);
      throw new BadRequestException('Failed to update purchase in user.');
    }
  }

  async addNewPurchase(id: string, newPurchase) {
    try {
      if (!id) {
        throw new UnauthorizedException('User ID is required.');
      }
      const user = await this.userModel.findById(id);
      if (!user) {
        throw new UnauthorizedException('User not found.');
      }
      user.purchases.push(newPurchase);
      const updatedUsersPurchases = await this.userModel.findByIdAndUpdate(
        user.id,
        user,
        { new: true },
      );
      return updatedUsersPurchases;
    } catch (error) {
      console.log(error);
      throw new BadRequestException('Failed to add purchase to user.');
    }
  }


  async removeUsersPurchase(deletedPurchaseId: string, userCustomId: string) {
    try {
      if (!deletedPurchaseId) {
        throw new BadRequestException('Purchase ID is required.');
      }
      const existingUser = await this.userModel.findById(userCustomId);
      if (!existingUser) {
        throw new BadRequestException('User not found.');
      }
      const purchaseIndex = existingUser.purchases.findIndex(
        (purchase) => purchase.toString() === deletedPurchaseId.toString(),
      );

      if (purchaseIndex === -1) {
        throw new BadRequestException(
          "Purchase not found in user's purchases.",
        );
      }
      existingUser.purchases.splice(purchaseIndex, 1);
      await existingUser.save();
      return existingUser;
    } catch (error) {
      console.log('Error removing purchase from user:', error);
      throw new BadRequestException('Failed to delete purchase of user.');
    }
  }
}

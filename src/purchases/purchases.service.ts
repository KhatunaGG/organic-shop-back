import {
  BadRequestException,
  forwardRef,
  Inject,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { CreatePurchaseDto } from './dto/create-purchase.dto';
import { UpdatePurchaseDto } from './dto/update-purchase.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Purchase } from './schema/purchase.schema';
import { Model, Types } from 'mongoose';
import { UsersService } from 'src/users/users.service';

@Injectable()
export class PurchasesService {
  constructor(
    @InjectModel(Purchase.name) private purchaseModel: Model<Purchase>,
    @Inject(forwardRef(() => UsersService))
    private userService: UsersService,
  ) {}

  async create(createPurchaseDto: CreatePurchaseDto, id: string) {
    try {
      const user = await this.userService.findById(new Types.ObjectId(id));
      if (!user) {
        throw new UnauthorizedException('User not found.');
      }
      const newPurchase = await this.purchaseModel.create({
        ...createPurchaseDto,
        userId: id,
      });
      const updatedUsersPurchase = await this.userService.addNewPurchase(
        id,
        newPurchase,
      );

      return newPurchase;
    } catch (error) {
      console.log(error);
      throw new BadRequestException('Error creating purchase.');
    }
  }

  async findAll(userId?: string): Promise<Purchase[]> {
    try {
      if (userId) {
        const purchases = await this.purchaseModel.find({ userId });
        if (purchases.length === 0) {
          throw new NotFoundException('No purchases found for this user.');
        }
        return purchases;
      } else {
        return this.purchaseModel.find();
      }
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  async findOne(id: string) {
    return this.purchaseModel.findById(id);
  }

  async update(
    id: string,
    updatePurchaseDto: UpdatePurchaseDto,
    userCustomId: string,
  ) {
    try {
      const existingPurchase = await this.purchaseModel.findById(id);
      if (!existingPurchase) {
        throw new BadRequestException('Purchase Id not found');
      }
      const updatedPurchase = await this.purchaseModel.findByIdAndUpdate(
        id,
        updatePurchaseDto,
        { new: true },
      );
      const updatedUsersPurchase = await this.userService.updateUsersPurchases(
        userCustomId,
        updatedPurchase,
      );
      return updatedPurchase;
    } catch (error) {
      console.log(error);
      throw new BadRequestException('Error updating purchase.');
    }
  }

  async remove(id: Types.ObjectId) {
    try {
      const existingPurchase = await this.purchaseModel.findById(id);
      if (!existingPurchase) {
        throw new BadRequestException('Purchase not found');
      }
      const existingPurchaseUserId = existingPurchase.userId;
      const deletedPurchase =
        await this.purchaseModel.findByIdAndDelete(existingPurchase);
      const deletedUsersPurchase = await this.userService.removeUsersPurchase(
        deletedPurchase.id,
        existingPurchaseUserId.toString(),
      );
      return {
        success: true,
        message: 'Purchase have been deleted successfully.',
      };
    } catch (error) {
      console.log(error);
    }
  }

  async deleteManyPurchases(deletedUserId: string) {
    try {
      const deletedPurchases = await this.purchaseModel.deleteMany({
        userId: deletedUserId,
      });
      if (deletedPurchases.deletedCount === 0) {
        throw new BadRequestException('No purchases found to delete.');
      }

      return {
        success: true,
        message: 'User and their purchases have been deleted successfully.',
      };
    } catch (error) {
      console.log(error);
      throw new BadRequestException('Failed to delete purchases for the user.');
    }
  }
}

import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Req,
} from '@nestjs/common';
import { PurchasesService } from './purchases.service';
import { CreatePurchaseDto } from './dto/create-purchase.dto';
import { UpdatePurchaseDto } from './dto/update-purchase.dto';
import { UserCustomDecorator } from 'src/users/decorators/user.customDecorator';
import { AuthGuard } from 'src/auth/guards/auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Role, Roles } from 'src/auth/decorators/roles.customdecorator';
import { Types } from 'mongoose';

@Controller('purchases')
export class PurchasesController {
  constructor(private readonly purchasesService: PurchasesService) {}

  @Post()
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(Role.USER)
  create(
    @Body() createPurchaseDto: CreatePurchaseDto,
    @UserCustomDecorator() id: string,
  ) {
    return this.purchasesService.create(createPurchaseDto, id);
  }

  @Get()
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.USER)
  async findAll(@Req() req) {
    return this.purchasesService.findAll(req.query.userId);
  }

  @Get(':id')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.USER)
  async findOne(@Param('id') id: string) {
    return this.purchasesService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(Role.USER)
  update(
    @Param('id') id: string,
    @Body() updatePurchaseDto: UpdatePurchaseDto,
    @UserCustomDecorator() userCustomId: string,
  ) {
    console.log(updatePurchaseDto, 'updatePurchaseDto');
    return this.purchasesService.update(id, updatePurchaseDto, userCustomId);
  }

  @Delete(':id')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.USER)
  remove(@Param('id') id: string) {
    const userObjectId = new Types.ObjectId(id);
    return this.purchasesService.remove(userObjectId);
  }
}

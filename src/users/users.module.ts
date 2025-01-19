import { forwardRef, Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserScheme } from './schema/user.schema';
import { PurchasesModule } from 'src/purchases/purchases.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: User.name, schema: UserScheme }]),
    forwardRef(() => PurchasesModule),
  ],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}

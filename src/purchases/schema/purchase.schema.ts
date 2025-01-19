import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose from 'mongoose';

@Schema({ _id: false })
export class Billing {
  @Prop()
  name: string;

  @Prop()
  lastName: string;

  @Prop({ required: false })
  company?: string | null;

  @Prop()
  street: string;

  @Prop({ required: false })
  state?: string | null;

  @Prop()
  postCode: string;

  @Prop({ required: false, type: String, default: null })
  country?: string | null;

  @Prop()
  email: string;

  @Prop()
  phone: string;
}

@Schema()
export class Rating {
  @Prop()
  rate: number;

  @Prop()
  count: number;
}

@Schema({ _id: false })
export class OrderItem {
  @Prop()
  title: string;

  @Prop()
  price: number;

  @Prop()
  description: string;

  @Prop()
  category: string;

  @Prop()
  image: string;

  @Prop()
  rating: Rating;

  @Prop()
  sale: number;
}

@Schema({ timestamps: true })
export class Purchase {
  @Prop({ typ: { Billing } })
  billingInformation: Billing;

  @Prop({ type: String })
  paymentMethod: string;

  @Prop({ type: [OrderItem] })
  orders: OrderItem[];

  @Prop()
  orderTotalPrice: number;

  @Prop()
  shipping: number;

  @Prop()
  forPayment: number;
  
  @Prop()
  orderId: string;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User' })
  userId: mongoose.Schema.Types.ObjectId;
}

export const PurchaseSchema = SchemaFactory.createForClass(Purchase);

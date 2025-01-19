import {
  IsOptional,
  IsString,
  IsEmail,
  IsPhoneNumber,
  IsNotEmpty,
  IsNumber,
  IsObject,
  IsArray,
} from 'class-validator';

export class BillingDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsString()
  lastName: string;

  @IsOptional()
  @IsString()
  company?: string;

  @IsNotEmpty()
  @IsString()
  street: string;

  @IsOptional()
  @IsString()
  state?: string;

  @IsNotEmpty()
  @IsString()
  postCode: string;

  @IsOptional()
  @IsString()
  country?: string | null;

  @IsNotEmpty()
  @IsEmail()
  email: string;

  @IsNotEmpty()
  @IsPhoneNumber(null)
  phone: string;
}

export class RatingDto {
  @IsNumber()
  rate: number;

  @IsNumber()
  count: number;
}

export class OrderItemDto {
  @IsString()
  _id: string;

  @IsString()
  title: string;

  @IsNumber()
  price: number;

  @IsString()
  description: string;

  @IsString()
  category: string;

  @IsString()
  image: string;

  @IsObject()
  rating: RatingDto;

  @IsNumber()
  sale: number;
}

export class CreatePurchaseDto {
  @IsObject()
  @IsNotEmpty()
  billingInformation: BillingDto;

  @IsString()
  @IsNotEmpty()
  paymentMethod: string;

  @IsArray()
  @IsNotEmpty()
  orders: OrderItemDto[];

  @IsNotEmpty()
  @IsNumber()
  orderTotalPrice: number;

  @IsNotEmpty()
  @IsNumber()
  shipping: number;

  @IsNotEmpty()
  @IsNumber()
  forPayment: number

  @IsNotEmpty()
  @IsString()
  orderId: string
}

import { IsNotEmpty, IsNumber, IsObject, IsString } from 'class-validator';

export class RatingDto {
  @IsNotEmpty()
  @IsNumber()
  rate: number;

  @IsNotEmpty()
  @IsNumber()
  count: number;
}

export class CreateProductDto {
  @IsNotEmpty()
  @IsString()
  title: string;

  @IsNotEmpty()
  price: number;

  @IsNotEmpty()
  @IsString()
  description: string;

  @IsNotEmpty()
  category: string;

  @IsNotEmpty()
  image: string;

  @IsNotEmpty()
  @IsObject()
  rating: RatingDto;

  sale: number;
}

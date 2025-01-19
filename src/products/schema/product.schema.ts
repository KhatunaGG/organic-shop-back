import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

@Schema({ _id: false })
export class Rating {
  @Prop()
  rate: number;

  @Prop()
  count: number;
}

export const RatingSchema = SchemaFactory.createForClass(Rating);

@Schema()
export class Product {
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

  @Prop({ type: RatingSchema })
  rating: Rating;

  @Prop()
  sale: number;
}

export const ProductSchema = SchemaFactory.createForClass(Product);

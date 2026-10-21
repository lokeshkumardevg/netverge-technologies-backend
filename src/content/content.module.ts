import { Body, Controller, Get, Module, Param, Put, UseGuards } from '@nestjs/common';
import { InjectModel, MongooseModule, Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

/** One document per page/section: home, about, leadership, contact, settings ... */
@Schema({ timestamps: true })
export class Content {
  @Prop({ required: true, unique: true }) key: string;
  @Prop({ type: Object, default: {} }) data: Record<string, any>;
}
export const ContentSchema = SchemaFactory.createForClass(Content);

@Controller('content')
export class ContentController {
  constructor(@InjectModel(Content.name) private model: Model<Content>) {}

  @Get(':key')
  async get(@Param('key') key: string) {
    const doc = await this.model.findOne({ key }).lean();
    return doc?.data ?? {};
  }

  @UseGuards(JwtAuthGuard) @Put(':key')
  async save(@Param('key') key: string, @Body() data: Record<string, any>) {
    const doc = await this.model.findOneAndUpdate({ key }, { key, data }, { upsert: true, new: true });
    return doc.data;
  }
}

@Module({
  imports: [MongooseModule.forFeature([{ name: Content.name, schema: ContentSchema }])],
  controllers: [ContentController],
  exports: [MongooseModule],
})
export class ContentModule {}

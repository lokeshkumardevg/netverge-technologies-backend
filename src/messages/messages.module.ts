import { Body, Controller, Delete, Get, Injectable, Module, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectModel, MongooseModule, Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { IsEmail, IsOptional, IsString, MaxLength } from 'class-validator';
import * as nodemailer from 'nodemailer';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { assertId } from '../common/object-id';

@Schema({ timestamps: true })
export class Message {
  @Prop({ required: true }) name: string;
  @Prop({ required: true }) email: string;
  @Prop() subject: string;
  @Prop({ required: true }) message: string;
  @Prop({ default: false }) isRead: boolean;
}
export const MessageSchema = SchemaFactory.createForClass(Message);

class CreateMessageDto {
  @IsString() @MaxLength(100) name: string;
  @IsEmail() email: string;
  @IsOptional() @IsString() @MaxLength(200) subject?: string;
  @IsString() @MaxLength(5000) message: string;
}

@Injectable()
export class MailService {
  constructor(private config: ConfigService) {}
  async notify(m: CreateMessageDto) {
    const host = this.config.get('SMTP_HOST');
    const to = this.config.get('NOTIFY_EMAIL');
    if (!host || !to) return;
    try {
      const t = nodemailer.createTransport({
        host, port: Number(this.config.get('SMTP_PORT') || 587),
        auth: { user: this.config.get('SMTP_USER'), pass: this.config.get('SMTP_PASS') },
      });
      await t.sendMail({
        from: this.config.get('SMTP_USER'), to, replyTo: m.email,
        subject: `New enquiry: ${m.subject || 'Website contact form'}`,
        text: `Name: ${m.name}\nEmail: ${m.email}\n\n${m.message}`,
      });
    } catch (e) { console.error('Mail failed', e.message); }
  }
}

@Controller('messages')
export class MessagesController {
  constructor(@InjectModel(Message.name) private model: Model<Message>, private mail: MailService) {}

  // public: contact form
  @Post()
  async create(@Body() dto: CreateMessageDto) {
    await this.model.create(dto);
    this.mail.notify(dto);
    return { ok: true, message: 'Thank you! We will get back to you soon.' };
  }

  @UseGuards(JwtAuthGuard) @Get()
  list(@Query('unread') unread?: string) {
    return this.model.find(unread === '1' ? { isRead: false } : {}).sort({ createdAt: -1 }).lean();
  }

  @UseGuards(JwtAuthGuard) @Patch(':id/read')
  async read(@Param('id') id: string, @Body() b: { isRead?: boolean }) {
    assertId(id);
    return this.model.findByIdAndUpdate(id, { isRead: b?.isRead ?? true }, { new: true });
  }

  @UseGuards(JwtAuthGuard) @Delete(':id')
  async remove(@Param('id') id: string) {
    assertId(id);
    await this.model.findByIdAndDelete(id);
    return { ok: true };
  }
}

@Module({
  imports: [MongooseModule.forFeature([{ name: Message.name, schema: MessageSchema }])],
  controllers: [MessagesController],
  providers: [MailService],
  exports: [MongooseModule],
})
export class MessagesModule {}

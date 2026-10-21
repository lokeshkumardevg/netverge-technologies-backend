import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { CatalogModule } from './catalog/catalog.module';
import { ContentModule } from './content/content.module';
import { MessagesModule } from './messages/messages.module';
import { UploadModule } from './upload/upload.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { SeedModule } from './seed/seed.module';
import { ChatbotModule } from './chatbot/chatbot.module'; // [CHATBOT]

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    MongooseModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (c: ConfigService) => ({ uri: c.get('MONGODB_URI') }),
    }),
    UsersModule,
    AuthModule,
    CatalogModule,
    ContentModule,
    MessagesModule,
    UploadModule,
    DashboardModule,
    SeedModule,
    ChatbotModule,
  ],
})
export class AppModule {}

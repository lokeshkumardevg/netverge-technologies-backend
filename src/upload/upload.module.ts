import { BadRequestException, Controller, Module, Post, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { randomBytes } from 'crypto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('upload')
export class UploadController {
  @UseGuards(JwtAuthGuard) @Post()
  @UseInterceptors(FileInterceptor('file', {
    storage: diskStorage({
      destination: './uploads',
      filename: (_req, file, cb) => cb(null, randomBytes(12).toString('hex') + extname(file.originalname).toLowerCase()),
    }),
    limits: { fileSize: 5 * 1024 * 1024 },
    fileFilter: (_req, file, cb) =>
      /image\/(png|jpe?g|webp|svg\+xml|gif)/.test(file.mimetype) ? cb(null, true) : cb(new BadRequestException('Only images allowed'), false),
  }))
  upload(@UploadedFile() file: Express.Multer.File) {
    if (!file) throw new BadRequestException('No file');
    const path = `/uploads/${file.filename}`;
    return { path, url: `${process.env.PUBLIC_URL || ''}${path}` };
  }
}

@Module({ controllers: [UploadController] })
export class UploadModule {}

import { BadRequestException } from '@nestjs/common';
import { diskStorage } from 'multer';
import { extname, join } from 'path';
import { randomUUID } from 'crypto';
import type { MulterOptions } from '@nestjs/platform-express/multer/interfaces/multer-options.interface';

const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
export const AVATAR_UPLOAD_DIR = join(process.cwd(), 'uploads', 'avatars');

export const avatarUploadOptions: MulterOptions = {
  storage: diskStorage({
    destination: AVATAR_UPLOAD_DIR,
    filename: (_req, file, callback) => {
      callback(null, `${randomUUID()}${extname(file.originalname)}`);
    },
  }),
  fileFilter: (_req, file, callback) => {
    if (!ALLOWED_MIME_TYPES.includes(file.mimetype)) {
      callback(
        new BadRequestException('Only JPEG, PNG, or WEBP images are allowed'),
        false,
      );
      return;
    }
    callback(null, true);
  },
  limits: { fileSize: 2 * 1024 * 1024 },
};

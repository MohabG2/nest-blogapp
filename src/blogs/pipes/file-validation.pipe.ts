import { PipeTransform, Injectable, BadRequestException } from '@nestjs/common';
import * as fs from 'fs';

@Injectable()
export class FileValidationPipe implements PipeTransform {
  private readonly allowedMimeTypes = ['image/jpeg', 'image/png', 'image/webp'];
  private readonly maxSize = 5 * 1024 * 1024; // 5MB

  transform(file: Express.Multer.File) {
    if (!file) throw new BadRequestException('No file uploaded');

    const isValidType = this.allowedMimeTypes.includes(file.mimetype);
    const isValidSize = file.size <= this.maxSize;

    if (!isValidType || !isValidSize) {
      if (file.path) fs.unlink(file.path, () => {});

      if (!isValidType) {
        throw new BadRequestException('Only jpeg, png, and webp files are allowed');
      }
      throw new BadRequestException('File size must not exceed 5MB');
    }

    return file;
  }
}

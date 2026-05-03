import { Injectable } from '@nestjs/common';
import { S3Client, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { v4 as uuidv4 } from 'uuid';
import * as path from 'path';
import { Request } from 'express';
import 'multer';

const multerS3 = require('multer-s3');


@Injectable()
export class S3Service {
  private s3: S3Client;

  constructor() {
    this.s3 = new S3Client({
      region: process.env.AWS_REGION,
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
      },
    });
  }

  getStorage() {
    return multerS3({
      s3: this.s3,
      bucket: process.env.AWS_S3_BUCKET!,
      acl: 'public-read',
      key: (_req: Request, file: Express.Multer.File, cb: (error: Error | null, key: string) => void) => {
        const ext = path.extname(file.originalname);
        cb(null, `${uuidv4()}${ext}`);
      },
    });
  }

  async deleteObject(imageUrl: string): Promise<void> {
    const key = imageUrl.split('/').pop();
    if (!key) return;
    await this.s3.send(
      new DeleteObjectCommand({
        Bucket: process.env.AWS_S3_BUCKET!,
        Key: key,
      }),
    );
  }
}

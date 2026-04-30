import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MulterModule } from '@nestjs/platform-express';
import { BlogsService } from './blogs.service';
import { BlogsController } from './blogs.controller';
import { Blog } from './entities/blog.entity';
import { RabbitMQModule } from '../rabbitmq/rabbitmq.module';
import { MailModule } from '../mail/mail.module';
import { BlogsConsumer } from './blogs.consumer';
import { S3Module } from '../s3/s3.module';
import { S3Service } from '../s3/s3.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Blog]),
    RabbitMQModule,
    MailModule,
    S3Module,
    MulterModule.registerAsync({
      imports: [S3Module],
      inject: [S3Service],
      useFactory: (s3Service: S3Service) => ({
        storage: s3Service.getStorage(),
        limits: { fileSize: 5 * 1024 * 1024 },
      }),
    }),
  ],
  controllers: [BlogsController],
  providers: [BlogsService, BlogsConsumer],
})
export class BlogsModule {}

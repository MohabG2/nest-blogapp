import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as fs from 'fs';
import * as path from 'path';
import { Blog, BlogStatus } from './entities/blog.entity';
import { CreateBlogDto } from './dto/create-blog.dto';
import { UpdateBlogDto } from './dto/update-blog.dto';
import { User } from '../users/entities/user.entity';
import { MailService } from '../mail/mail.service';

@Injectable()
export class BlogsService {
  constructor(
    @InjectRepository(Blog)
    private readonly blogRepository: Repository<Blog>,
    private readonly mailService: MailService,
  ) {}

  create(createBlogDto: CreateBlogDto, author: User): Promise<Blog> {
    const blog = this.blogRepository.create({ ...createBlogDto, authorId: author.id });
    return this.blogRepository.save(blog);
  }

  findAll(published?: boolean): Promise<Blog[]> {
    const where: Record<string, unknown> = { status: BlogStatus.APPROVED };
    if (published !== undefined) where.published = published;
    return this.blogRepository.find({ where, order: { createdAt: 'DESC' } });
  }

  findByAuthor(authorId: string): Promise<Blog[]> {
    return this.blogRepository.find({
      where: { authorId },
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string): Promise<Blog> {
    const blog = await this.blogRepository.findOne({ where: { id } });
    if (!blog) throw new NotFoundException(`Blog #${id} not found`);
    return blog;
  }

  async update(id: string, updateBlogDto: UpdateBlogDto, userId: string): Promise<Blog> {
    const blog = await this.findOne(id);
    if (blog.authorId !== userId) throw new ForbiddenException('Not your blog');
    Object.assign(blog, updateBlogDto);
    return this.blogRepository.save(blog);
  }

  async remove(id: string, userId: string): Promise<void> {
    const blog = await this.findOne(id);
    if (blog.authorId !== userId) throw new ForbiddenException('Not your blog');
    if (blog.imageUrl) this.deleteImageFile(blog.imageUrl);
    await this.blogRepository.remove(blog);
  }

  async updateImage(id: string, image: Express.Multer.File, userId: string): Promise<Blog> {
    const blog = await this.findOne(id);
    if (blog.authorId !== userId) throw new ForbiddenException('Not your blog');

    if (blog.imageUrl) this.deleteImageFile(blog.imageUrl);

    blog.imageUrl = `/uploads/${image.filename}`;
    return this.blogRepository.save(blog);
  }

  async approve(id: string): Promise<Blog> {
    const blog = await this.findOne(id);
    blog.status = BlogStatus.APPROVED;
    blog.published = true;
    const saved = await this.blogRepository.save(blog);

    void this.mailService.sendBlogApprovedEmail(
      { title: blog.title },
      blog.author.email,
    );

    return saved;
  }

  private deleteImageFile(imageUrl: string): void {
    const filename = path.basename(imageUrl);
    const filePath = path.join(process.cwd(), 'uploads', filename);
    fs.unlink(filePath, (err) => {
      if (err) console.error(`Failed to delete image file: ${filePath}`, err);
    });
  }
}

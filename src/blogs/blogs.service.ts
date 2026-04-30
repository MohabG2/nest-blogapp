import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  Inject,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import 'multer';
import { Blog, BlogStatus } from './entities/blog.entity';
import { CreateBlogDto } from './dto/create-blog.dto';
import { UpdateBlogDto } from './dto/update-blog.dto';
import { User } from '../users/entities/user.entity';
import { ClientProxy } from '@nestjs/microservices';
import { S3Service } from '../s3/s3.service';

@Injectable()
export class BlogsService {
  constructor(
    @InjectRepository(Blog)
    private readonly blogRepository: Repository<Blog>,
    @Inject('BLOG_SERVICE') private readonly blogClient: ClientProxy,
    private readonly s3Service: S3Service,
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

  async update(id: string, updateBlogDto: UpdateBlogDto, userId: string): Promise<void> {
    const blog = await this.findOne(id);
    if (blog.authorId !== userId) throw new ForbiddenException('Not your blog');
    Object.assign(blog, updateBlogDto);
    await this.blogRepository.save(blog);
  }

  async remove(id: string, userId: string): Promise<void> {
    const blog = await this.findOne(id);
    if (blog.authorId !== userId) throw new ForbiddenException('Not your blog');
    if (blog.imageUrl) await this.s3Service.deleteObject(blog.imageUrl);
    await this.blogRepository.remove(blog);
  }

  async updateImage(id: string, image: Express.Multer.File, userId: string): Promise<Blog> {
    const blog = await this.findOne(id);
    if (blog.authorId !== userId) throw new ForbiddenException('Not your blog');

    if (blog.imageUrl) await this.s3Service.deleteObject(blog.imageUrl);

    blog.imageUrl = (image as Express.Multer.File & { location: string }).location;
    return this.blogRepository.save(blog);
  }

  async approve(id: string): Promise<Blog> {
    const blog = await this.findOne(id);
    blog.status = BlogStatus.APPROVED;
    blog.published = true;
    const saved = await this.blogRepository.save(blog);

    this.blogClient.emit('blog_approved', {
      blogId: blog.id,
      blogName: blog.title,
      authorEmail: blog.author.email,
      authorName: blog.author.username,
    });

    return saved;
  }
}

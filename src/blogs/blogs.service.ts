import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Blog } from './entities/blog.entity';
import { CreateBlogDto } from './dto/create-blog.dto';
import { UpdateBlogDto } from './dto/update-blog.dto';
import { User } from '../users/entities/user.entity';

@Injectable()
export class BlogsService {
  constructor(
    @InjectRepository(Blog)
    private readonly blogRepository: Repository<Blog>,
  ) {}

  create(createBlogDto: CreateBlogDto, author: User): Promise<Blog> {
    const blog = this.blogRepository.create({ ...createBlogDto, authorId: author.id });
    return this.blogRepository.save(blog);
  }

  findAll(published?: boolean): Promise<Blog[]> {
    const where = published !== undefined ? { published } : {};
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
    await this.blogRepository.remove(blog);
  }
}

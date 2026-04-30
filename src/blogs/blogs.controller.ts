import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  ParseUUIDPipe,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiConsumes,
  ApiOperation,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import 'multer';
import { BlogsService } from './blogs.service';
import { CreateBlogDto } from './dto/create-blog.dto';
import { UpdateBlogDto } from './dto/update-blog.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { User, UserRole } from '../users/entities/user.entity';
import { FileValidationPipe } from './pipes/file-validation.pipe';

@ApiTags('Blogs')
@Controller('blogs')
export class BlogsController {
  constructor(private readonly blogsService: BlogsService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new blog post' })
  @ApiResponse({ status: 201, description: 'Blog created (pending admin approval)' })
  create(@Body() createBlogDto: CreateBlogDto, @CurrentUser() user: User) {
    return this.blogsService.create(createBlogDto, user);
  }

  @Post(':id/image')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Upload an image for a blog post' })
  @ApiConsumes('multipart/form-data')
  @ApiResponse({ status: 201, description: 'Image uploaded and blog updated' })
  @UseInterceptors(FileInterceptor('image'))
  uploadImage(
    @Param('id', ParseUUIDPipe) id: string,
    @UploadedFile(new FileValidationPipe()) image: Express.Multer.File,
    @CurrentUser() user: User,
  ) {
    return this.blogsService.updateImage(id, image, user.id);
  }

  @Patch(':id/approve')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Approve a blog post (admin only)' })
  @ApiResponse({ status: 200, description: 'Blog approved and author notified' })
  @ApiResponse({ status: 403, description: 'Forbidden – admin only' })
  approve(@Param('id', ParseUUIDPipe) id: string) {
    return this.blogsService.approve(id);
  }

  @Get()
  @ApiOperation({ summary: 'Get all approved blog posts' })
  @ApiQuery({ name: 'published', required: false, type: Boolean })
  @ApiResponse({ status: 200, description: 'List of approved blog posts' })
  findAll(@Query('published') published?: string) {
    const filter = published === undefined ? undefined : published === 'true';
    return this.blogsService.findAll(filter);
  }

  @Get('my')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get all blog posts by the current user' })
  @ApiResponse({ status: 200, description: 'List of your blog posts' })
  findMine(@CurrentUser() user: User) {
    return this.blogsService.findByAuthor(user.id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a blog post by ID' })
  @ApiResponse({ status: 200, description: 'Blog post found' })
  @ApiResponse({ status: 404, description: 'Blog post not found' })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.blogsService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update a blog post (owner only)' })
  @ApiResponse({ status: 200, description: 'Blog post updated' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateBlogDto: UpdateBlogDto,
    @CurrentUser() user: User,
  ) {
    return this.blogsService.update(id, updateBlogDto, user.id);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete a blog post (owner only)' })
  @ApiResponse({ status: 200, description: 'Blog post deleted' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  remove(@Param('id', ParseUUIDPipe) id: string, @CurrentUser() user: User) {
    return this.blogsService.remove(id, user.id);
  }
}

import {Controller} from '@nestjs/common';
import {EventPattern, Payload} from '@nestjs/microservices';
import { MailService} from '../mail/mail.service';

@Controller()
export class BlogsConsumer {
    constructor(private readonly mailService: MailService) {}

    @EventPattern('blog_approved')
    async handleBlogApproved(@Payload() data: { blogId: string,blogName: string, authorEmail: string, authorName: string }) {
        console.log(`Blog approved with ID: ${data.blogId}`);
        await this.mailService.sendBlogApprovedEmail({ title: data.blogName }, data.authorEmail);
    }
}

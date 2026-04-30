import { MailerService } from '@nestjs-modules/mailer';
import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);

  constructor(private readonly mailerService: MailerService) {}

  async sendWelcomeEmail(user: { email: string; username: string }): Promise<void> {
    try {
      await this.mailerService.sendMail({
        to: user.email,
        from: process.env.SMTP_FROM,
        subject: 'Welcome to Nest Blog!',
        template: 'welcome',
        context: { username: user.username },
      });
      this.logger.log(`Welcome email sent to ${user.email}`);
    } catch (error) {
      this.logger.error(`Failed to send welcome email to ${user.email}`, error);
    }
  }

  async sendBlogApprovedEmail(blog: { title: string }, authorEmail: string): Promise<void> {
    try {
      await this.mailerService.sendMail({
        to: authorEmail,
        from: process.env.SMTP_FROM,
        subject: `Your blog "${blog.title}" has been approved!`,
        template: 'blog-approved',
        context: { blogTitle: blog.title },
      });
      this.logger.log(`Blog approval email sent to ${authorEmail}`);
    } catch (error) {
      this.logger.error(`Failed to send blog approval email to ${authorEmail}`, error);
    }
  }
}

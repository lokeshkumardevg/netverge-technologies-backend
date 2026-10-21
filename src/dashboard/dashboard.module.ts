import { Controller, Get, Module, UseGuards } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CatalogModule } from '../catalog/catalog.module';
import { Message, MessagesModule } from '../messages/messages.module';
import { Faq, Partner, Service, TeamMember, Testimonial } from '../catalog/schemas';

@Controller('dashboard')
export class DashboardController {
  constructor(
    @InjectModel(Message.name) private messages: Model<Message>,
    @InjectModel(Service.name) private services: Model<Service>,
    @InjectModel(TeamMember.name) private team: Model<TeamMember>,
    @InjectModel(Partner.name) private partners: Model<Partner>,
    @InjectModel(Faq.name) private faqs: Model<Faq>,
    @InjectModel(Testimonial.name) private testimonials: Model<Testimonial>,
  ) {}

  @UseGuards(JwtAuthGuard) @Get('stats')
  async stats() {
    const [totalMessages, unreadMessages, services, team, partners, faqs, testimonials, recent] = await Promise.all([
      this.messages.countDocuments(),
      this.messages.countDocuments({ isRead: false }),
      this.services.countDocuments(),
      this.team.countDocuments(),
      this.partners.countDocuments(),
      this.faqs.countDocuments(),
      this.testimonials.countDocuments(),
      this.messages.find().sort({ createdAt: -1 }).limit(5).lean(),
    ]);
    return { totalMessages, unreadMessages, services, team, partners, faqs, testimonials, recent };
  }
}

@Module({ imports: [CatalogModule, MessagesModule], controllers: [DashboardController] })
export class DashboardModule {}

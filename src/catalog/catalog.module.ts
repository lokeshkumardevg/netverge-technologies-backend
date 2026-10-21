import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import {
  Faq, FaqSchema, Partner, PartnerSchema, Service, ServiceSchema,
  TeamMember, TeamMemberSchema, Testimonial, TestimonialSchema,
} from './schemas';
import { createCrudController } from './crud.factory';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Service.name, schema: ServiceSchema },
      { name: TeamMember.name, schema: TeamMemberSchema },
      { name: Partner.name, schema: PartnerSchema },
      { name: Faq.name, schema: FaqSchema },
      { name: Testimonial.name, schema: TestimonialSchema },
    ]),
  ],
  controllers: [
    createCrudController('services', Service.name, { slugFrom: 'title' }),
    createCrudController('team', TeamMember.name),
    createCrudController('partners', Partner.name),
    createCrudController('faqs', Faq.name),
    createCrudController('testimonials', Testimonial.name),
  ],
  exports: [MongooseModule],
})
export class CatalogModule {}

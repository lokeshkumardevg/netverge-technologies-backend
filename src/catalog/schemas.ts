import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

const Pair = { _id: false, title: String, text: String };
const QA = { _id: false, question: String, answer: String };

@Schema({ timestamps: true })
export class Service {
  @Prop({ required: true }) title: string;
  @Prop({ index: true }) slug: string;   // URL: /services/<slug> (auto-generated from title if empty)
  @Prop() icon: string;          // icon name e.g. "network", "shield", "cloud"
  @Prop() description: string;   // short text for cards
  @Prop({ type: [String], default: [] }) items: string[]; // bullet list (cards + "What we offer")

  // ---- detail page ----
  @Prop() heroImage: string;
  @Prop() tagline: string;                                   // small line under the title in the hero
  @Prop() overview: string;                                  // long text, blank line = new paragraph
  @Prop({ type: [Pair], default: [] }) benefits: { title: string; text: string }[];
  @Prop({ type: [Pair], default: [] }) process: { title: string; text: string }[];
  @Prop({ type: [String], default: [] }) technologies: string[];
  @Prop({ type: [QA], default: [] }) faqs: { question: string; answer: string }[];
  @Prop() ctaTitle: string;
  @Prop() ctaText: string;

  @Prop({ default: 0 }) order: number;
  @Prop({ default: true }) isActive: boolean;
}
export const ServiceSchema = SchemaFactory.createForClass(Service);

@Schema({ timestamps: true })
export class TeamMember {
  @Prop({ required: true }) name: string;
  @Prop() designation: string;
  @Prop() bio: string;
  @Prop() photo: string;
  @Prop() linkedin: string;
  @Prop({ default: false }) featured: boolean; // show on home page
  @Prop({ default: 0 }) order: number;
  @Prop({ default: true }) isActive: boolean;
}
export const TeamMemberSchema = SchemaFactory.createForClass(TeamMember);

@Schema({ timestamps: true })
export class Partner {
  @Prop({ required: true }) name: string;
  @Prop() logo: string;
  @Prop() url: string;
  @Prop() description: string;   // small caption under the logo, e.g. "Enterprise Communication"
  @Prop({ default: 0 }) order: number;
  @Prop({ default: true }) isActive: boolean;
}
export const PartnerSchema = SchemaFactory.createForClass(Partner);

/** Pages where an FAQ / testimonial can appear. Empty list = show on every page. */
export const PAGE_KEYS = ['home', 'about', 'services', 'leadership', 'contact'];

@Schema({ timestamps: true })
export class Faq {
  @Prop({ required: true }) question: string;
  @Prop({ default: '' }) answer: string;
  @Prop({ type: [String], default: [] }) pages: string[];
  @Prop({ default: 0 }) order: number;
  @Prop({ default: true }) isActive: boolean;
}
export const FaqSchema = SchemaFactory.createForClass(Faq);

@Schema({ timestamps: true })
export class Testimonial {
  @Prop({ required: true }) name: string;
  @Prop() designation: string;
  @Prop() company: string;
  @Prop({ required: true }) quote: string;
  @Prop() photo: string;
  @Prop({ default: 5, min: 1, max: 5 }) rating: number;
  @Prop({ type: [String], default: [] }) pages: string[];
  @Prop({ default: 0 }) order: number;
  @Prop({ default: true }) isActive: boolean;
}
export const TestimonialSchema = SchemaFactory.createForClass(Testimonial);

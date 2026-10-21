import { BadRequestException, Body, Controller, Delete, Get, NotFoundException, Param, Patch, Post, Put, Query, Type, UseGuards } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { assertId } from '../common/object-id';

/** Builds a REST controller: public GET, protected POST/PUT/DELETE/reorder. */
export const slugify = (v: string) =>
  String(v || '').toLowerCase().replace(/&/g, ' and ').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 80);

/** opts.slugFrom: field used to auto-generate a unique `slug` (and public GET /<path>/slug/:slug). */
export function createCrudController(path: string, modelName: string, opts: { slugFrom?: string } = {}): Type<any> {
  @Controller(path)
  class CrudController {
    constructor(@InjectModel(modelName) readonly model: Model<any>) {}

    /** Public list. Optional ?page=home filters models that have a `pages` field (faqs, testimonials). */
    @Get()
    list(@Query('page') page?: string) {
      const q: Record<string, any> = { isActive: true };
      if (page && this.model.schema.path('pages')) {
        q.$or = [{ pages: page }, { pages: { $size: 0 } }, { pages: { $exists: false } }];
      }
      return this.model.find(q).sort({ order: 1, createdAt: 1 }).lean();
    }

    @UseGuards(JwtAuthGuard) @Get('admin/all')
    listAll() { return this.model.find().sort({ order: 1, createdAt: 1 }).lean(); }

    @UseGuards(JwtAuthGuard) @Patch('admin/reorder')
    async reorder(@Body() body: { ids: string[] }) {
      if (!Array.isArray(body?.ids)) throw new BadRequestException('ids must be an array');
      body.ids.forEach(assertId);
      await Promise.all(body.ids.map((id, i) => this.model.updateOne({ _id: id }, { order: i })));
      return { ok: true };
    }

    /** Unique slug: "cloud-solutions", "cloud-solutions-2", ... */
    async uniqueSlug(base: string, selfId?: string) {
      const root = slugify(base) || 'item';
      let slug = root, n = 2;
      while (await this.model.exists({ slug, ...(selfId ? { _id: { $ne: selfId } } : {}) })) slug = `${root}-${n++}`;
      return slug;
    }

    @Get('slug/:slug')
    async bySlug(@Param('slug') slug: string) {
      const doc = await this.model.findOne({ slug: String(slug).toLowerCase(), isActive: true }).lean();
      if (!doc) throw new NotFoundException();
      return doc;
    }

    @Get(':id')
    async one(@Param('id') id: string) {
      assertId(id);
      const doc = await this.model.findById(id).lean();
      if (!doc) throw new NotFoundException();
      return doc;
    }

    @UseGuards(JwtAuthGuard) @Post()
    async create(@Body() body: Record<string, any>) {
      for (const k of ['_id', '__v', 'createdAt', 'updatedAt']) delete body[k];
      if (opts.slugFrom) body.slug = await this.uniqueSlug(body.slug || body[opts.slugFrom]);
      return this.model.create(body);
    }

    @UseGuards(JwtAuthGuard) @Put(':id')
    async update(@Param('id') id: string, @Body() body: Record<string, any>) {
      assertId(id);
      for (const k of ['_id', '__v', 'createdAt', 'updatedAt']) delete body[k];
      if (opts.slugFrom) {
        if (body.slug) body.slug = await this.uniqueSlug(body.slug, id);
        else if ('slug' in body || body[opts.slugFrom]) body.slug = await this.uniqueSlug(body[opts.slugFrom] || (await this.model.findById(id).lean())?.[opts.slugFrom], id);
      }
      const doc = await this.model.findByIdAndUpdate(id, body, { new: true });
      if (!doc) throw new NotFoundException();
      return doc;
    }

    @UseGuards(JwtAuthGuard) @Delete(':id')
    async remove(@Param('id') id: string) {
      assertId(id);
      await this.model.findByIdAndDelete(id);
      return { ok: true };
    }
  }
  return CrudController;
}

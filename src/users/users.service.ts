import { ConflictException, Injectable, OnApplicationBootstrap } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { ConfigService } from '@nestjs/config';
import { Model } from 'mongoose';
import * as bcrypt from 'bcryptjs';
import { User } from './user.schema';

@Injectable()
export class UsersService implements OnApplicationBootstrap {
  constructor(@InjectModel(User.name) private model: Model<User>, private config: ConfigService) {}

  // Create first super admin from .env if no user exists
  async onApplicationBootstrap() {
    if (await this.model.countDocuments()) return;
    const email = this.config.get('ADMIN_EMAIL');
    const pass = this.config.get('ADMIN_PASSWORD');
    if (!email || !pass) return;
    await this.model.create({ name: 'Super Admin', email, password: await bcrypt.hash(pass, 10), role: 'super_admin' });
    console.log(`Super admin created: ${email}`);
  }
  findByEmail(email: string) { return this.model.findOne({ email: email.toLowerCase() }); }
  findById(id: string) { return this.model.findById(id); }
  list() { return this.model.find().select('-password').lean(); }
  async create(d: { name: string; email: string; password: string; role?: string }) {
    if (await this.model.exists({ email: d.email.toLowerCase() })) throw new ConflictException('A user with this email already exists');
    const u = await this.model.create({ ...d, password: await bcrypt.hash(d.password, 10) });
    return { _id: u._id, name: u.name, email: u.email, role: u.role };
  }
  remove(id: string) { return this.model.findByIdAndDelete(id); }
  async setPassword(id: string, password: string) {
    await this.model.findByIdAndUpdate(id, { password: await bcrypt.hash(password, 10) });
  }
}

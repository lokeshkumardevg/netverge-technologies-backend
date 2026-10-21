import { Body, Controller, Get, Post, Put, Delete, Param, Req, UnauthorizedException, UseGuards, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { IsEmail, IsIn, IsOptional, IsString, MinLength } from 'class-validator';
import * as bcrypt from 'bcryptjs';
import { UsersService } from '../users/users.service';
import { JwtAuthGuard } from './jwt-auth.guard';
import { Roles, RolesGuard } from '../common/roles';
import { assertId } from '../common/object-id';

class LoginDto { @IsEmail() email: string; @IsString() password: string; }
class PasswordDto { @IsString() current: string; @MinLength(8) next: string; }
class CreateUserDto {
  @IsString() name: string;
  @IsEmail() email: string;
  @MinLength(8) password: string;
  @IsOptional() @IsIn(['super_admin', 'editor']) role?: string;
}

@Controller('auth')
export class AuthController {
  constructor(private users: UsersService, private jwt: JwtService) {}

  @Post('login')
  async login(@Body() dto: LoginDto) {
    const u = await this.users.findByEmail(dto.email);
    if (!u || !(await bcrypt.compare(dto.password, u.password))) throw new UnauthorizedException('Invalid email or password');
    const accessToken = this.jwt.sign({ sub: String(u._id), email: u.email, role: u.role });
    return { accessToken, user: { id: u._id, name: u.name, email: u.email, role: u.role } };
  }

  @UseGuards(JwtAuthGuard) @Get('me')
  async me(@Req() req) {
    const u = await this.users.findById(req.user.userId);
    if (!u) throw new UnauthorizedException();
    return { id: u._id, name: u.name, email: u.email, role: u.role };
  }

  @UseGuards(JwtAuthGuard) @Put('password')
  async changePassword(@Req() req, @Body() dto: PasswordDto) {
    const u = await this.users.findById(req.user.userId);
    if (!u || !(await bcrypt.compare(dto.current, u.password))) throw new BadRequestException('Current password is wrong');
    await this.users.setPassword(String(u._id), dto.next);
    return { ok: true };
  }

  // ---- admin users management (super_admin only) ----
  @UseGuards(JwtAuthGuard, RolesGuard) @Roles('super_admin') @Get('users')
  list() { return this.users.list(); }

  @UseGuards(JwtAuthGuard, RolesGuard) @Roles('super_admin') @Post('users')
  create(@Body() dto: CreateUserDto) { return this.users.create(dto); }

  @UseGuards(JwtAuthGuard, RolesGuard) @Roles('super_admin') @Delete('users/:id')
  async remove(@Param('id') id: string, @Req() req) {
    assertId(id);
    if (id === req.user.userId) throw new BadRequestException('You cannot delete yourself');
    await this.users.remove(id);
    return { ok: true };
  }
}

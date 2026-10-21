import { BadRequestException } from '@nestjs/common';
import { isValidObjectId } from 'mongoose';
export function assertId(id: string) {
  if (!isValidObjectId(id)) throw new BadRequestException('Invalid id');
}

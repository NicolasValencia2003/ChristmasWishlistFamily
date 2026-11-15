import { Body, Controller, Delete, HttpCode, Param, Post } from '@nestjs/common';
import { uuidPipe } from '../common/uuid.pipe';
import { CreateGiftDto } from './create-gift.dto';
import { GiftsService } from './gifts.service';

@Controller('gifts')
export class GiftsController {
  constructor(private readonly gifts: GiftsService) {}

  @Post()
  create(@Body() dto: CreateGiftDto) {
    return this.gifts.create(dto);
  }

  @Delete(':id')
  @HttpCode(200)
  remove(@Param('id', uuidPipe) id: string) {
    return this.gifts.remove(id);
  }
}

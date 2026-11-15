import { Controller, Get, Param } from '@nestjs/common';
import { uuidPipe } from '../common/uuid.pipe';
import { PeopleService } from './people.service';

@Controller('people')
export class PeopleController {
  constructor(private readonly people: PeopleService) {}

  @Get()
  findAll() {
    return this.people.findAll();
  }

  @Get(':id')
  findOne(@Param('id', uuidPipe) id: string) {
    return this.people.findOne(id);
  }
}

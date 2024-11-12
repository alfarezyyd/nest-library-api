import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Put,
} from '@nestjs/common';
import { BookService } from './book.service';
import { CreateBookDto } from './dto/create-book.dto';
import { UpdateBookDto } from './dto/update-book.dto';
import { WebResponse } from '../model/web.response';

@Controller('books')
export class BookController {
  constructor(private readonly bookService: BookService) {}

  @Post()
  async create(
    @Body() createBookDto: CreateBookDto,
  ): Promise<WebResponse<boolean>> {
    return {
      result: {
        data: await this.bookService.create(createBookDto),
      },
    };
  }

  @Get()
  async findAll(): Promise<WebResponse<any>> {
    return {
      result: {
        data: await this.bookService.findAll(),
      },
    };
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return {
      result: {
        data: await this.bookService.findOne(+id),
      },
    };
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() updateBookDto: UpdateBookDto) {
    return {
      result: {
        data: await this.bookService.update(+id, updateBookDto),
      },
    };
  }

  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number) {
    return {
      result: {
        data: await this.bookService.remove(+id),
      },
    };
  }
}

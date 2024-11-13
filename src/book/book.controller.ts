import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Put,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { BookService } from './book.service';
import { CreateBookDto } from './dto/create-book.dto';
import { UpdateBookDto } from './dto/update-book.dto';
import { WebResponse } from '../model/web.response';
import { FileInterceptor } from '@nestjs/platform-express';

@Controller('books')
export class BookController {
  constructor(private readonly bookService: BookService) {}

  @Post()
  @UseInterceptors(FileInterceptor('image'))
  async create(
    @Body() createBookDto: CreateBookDto,
    @UploadedFile() uploadedFile: Express.Multer.File,
  ): Promise<WebResponse<boolean>> {
    return {
      result: {
        data: await this.bookService.create(uploadedFile, createBookDto),
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
  @UseInterceptors(FileInterceptor('image'))
  async update(
    @Param('id') id: string,
    @Body() updateBookDto: UpdateBookDto,
    @UploadedFile() uploadedFile: Express.Multer.File,
  ) {
    return {
      result: {
        data: await this.bookService.update(+id, updateBookDto, uploadedFile),
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

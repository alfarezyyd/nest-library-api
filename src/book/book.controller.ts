import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Query,
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
  async findAll(@Query('search') search?: string): Promise<WebResponse<any>> {
    if (search) {
      return {
        result: {
          data: await this.bookService.searchBookByQuery(search),
        },
      };
    }
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

  @Get('categories/(:id)')
  async findAllByCategoryId(@Param('id', ParseIntPipe) id: number) {
    return {
      result: {
        data: await this.bookService.findAllByCategoryId(id),
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

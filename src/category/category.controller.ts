import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
} from '@nestjs/common';
import { CategoryService } from './category.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { WebResponse } from '../model/web.response';
import { Category } from '@prisma/client';

@Controller('category')
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  @Post()
  async create(
    @Body() createCategoryDto: CreateCategoryDto,
  ): Promise<WebResponse<boolean>> {
    return {
      result: {
        data: await this.categoryService.create(createCategoryDto),
      },
    };
  }

  @Get()
  async findAll(): Promise<WebResponse<Category[]>> {
    return {
      result: {
        data: await this.categoryService.findAll(),
      },
    };
  }

  @Get(':id')
  async findOne(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<WebResponse<Category>> {
    return {
      result: {
        data: await this.categoryService.findOne(id),
      },
    };
  }

  @Patch(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateCategoryDto: UpdateCategoryDto,
  ): Promise<WebResponse<boolean>> {
    return {
      result: {
        data: await this.categoryService.update(+id, updateCategoryDto),
      },
    };
  }

  @Delete(':id')
  async remove(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<WebResponse<boolean>> {
    return {
      result: {
        data: await this.categoryService.remove(id),
      },
    };
  }
}

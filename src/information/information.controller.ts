import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { InformationService } from './information.service';
import { CreateInformationDto } from './dto/create-information.dto';
import { UpdateInformationDto } from './dto/update-information.dto';
import { WebResponse } from '../model/web.response';
import { CurrentUser } from '../authentication/decorator/current-user.decorator';
import { User } from '@prisma/client';
import { FileInterceptor } from '@nestjs/platform-express';

@Controller('information')
export class InformationController {
  constructor(private readonly informationService: InformationService) {}

  @Post()
  @UseInterceptors(FileInterceptor('image'))
  async create(
    @CurrentUser() currentUser: User,
    @Body() createInformationDto: CreateInformationDto,
    @UploadedFile() uploadedFile: Express.Multer.File,
  ): Promise<WebResponse<boolean>> {
    return {
      result: {
        data: await this.informationService.create(
          currentUser,
          createInformationDto,
          uploadedFile,
        ),
      },
    };
  }

  @Get()
  findAll() {
    return this.informationService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.informationService.findOne(+id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateInformationDto: UpdateInformationDto,
  ) {
    return this.informationService.update(+id, updateInformationDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.informationService.remove(+id);
  }
}

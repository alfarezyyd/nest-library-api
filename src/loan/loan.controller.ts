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
import { LoanService } from './loan.service';
import { CreateLoanDto } from './dto/create-loan.dto';
import { CurrentUser } from '../authentication/decorator/current-user.decorator';
import { User } from '@prisma/client';
import { WebResponse } from '../model/web.response';
import { UpdateLoanDto } from './dto/update-loan.dto';

@Controller('loan')
export class LoanController {
  constructor(private readonly loanService: LoanService) {}

  @Post()
  async create(
    @CurrentUser() userPrisma: User,
    @Body() createLoanDto: CreateLoanDto,
  ): Promise<WebResponse<boolean>> {
    return {
      result: {
        data: await this.loanService.create(userPrisma, createLoanDto),
      },
    };
  }

  @Get()
  findAll() {
    return this.loanService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.loanService.findOne(+id);
  }

  @Put(':id')
  async update(
    @CurrentUser() userPrisma: User,
    @Param('id', ParseIntPipe) id: number,
    @Body() updateLoanDto: UpdateLoanDto,
  ): Promise<WebResponse<boolean>> {
    return {
      result: {
        data: await this.loanService.handleReturn(
          userPrisma,
          +id,
          updateLoanDto,
        ),
      },
    };
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.loanService.remove(+id);
  }
}

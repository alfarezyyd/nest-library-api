import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { NotificationService } from './notification.service';
import { UpdateNotificationDto } from './dto/update-notification.dto';
import { CurrentUser } from '../authentication/decorator/current-user.decorator';
import { User } from '@prisma/client';

@Controller('notifications')
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  @Post()
  async triggerNotification(@CurrentUser() currentUser: User) {
    return {
      result: {
        data: await this.notificationService.handleTriggerNotification(
          currentUser,
        ),
      },
    };
  }

  @Get()
  async findAllByUserId(@CurrentUser() currentUser: User) {
    return {
      result: {
        data: await this.notificationService.findAllByUserId(currentUser),
      },
    };
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.notificationService.findOne(+id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateNotificationDto: UpdateNotificationDto,
  ) {
    return this.notificationService.update(+id, updateNotificationDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.notificationService.remove(+id);
  }
}

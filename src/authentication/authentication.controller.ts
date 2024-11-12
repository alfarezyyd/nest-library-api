import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { AuthenticationService } from './authentication.service';
import { SignInDto } from './dto/sign-in.dto';
import { UpdateAuthenticationDto } from './dto/update-authentication.dto';
import { Public } from './decorator/public.decorator';

@Controller('authentication')
export class AuthenticationController {
  constructor(private readonly authenticationService: AuthenticationService) {}

  @Public()
  @Post()
  signIn(@Body() signIn: SignInDto) {
    return this.authenticationService.handleSignIn(signIn);
  }

  @Public()
  @Post()
  signUp() {
    return this.authenticationService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.authenticationService.findOne(+id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateAuthenticationDto: UpdateAuthenticationDto,
  ) {
    return this.authenticationService.update(+id, updateAuthenticationDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.authenticationService.remove(+id);
  }
}

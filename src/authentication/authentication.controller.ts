import { Body, Controller, Post } from '@nestjs/common';
import { AuthenticationService } from './authentication.service';
import { SignInDto } from './dto/sign-in.dto';
import { SignUpDto } from './dto/sign-up.dto';
import { Public } from './decorator/public.decorator';
import { WebResponse } from '../model/web.response';
import { ResponseAuthenticationDto } from './dto/response-authentication.dto';

@Controller('authentication')
export class AuthenticationController {
  constructor(private readonly authenticationService: AuthenticationService) {}

  @Public()
  @Post('sign-in')
  async signIn(@Body() signIn: SignInDto) {
    return {
      result: {
        data: await this.authenticationService.handleSignIn(signIn),
      },
    };
  }

  @Public()
  @Post('sign-up')
  async signUp(
    @Body() signUp: SignUpDto,
  ): Promise<WebResponse<ResponseAuthenticationDto>> {
    return {
      result: {
        data: await this.authenticationService.handleSignUp(signUp),
      },
    };
  }
}

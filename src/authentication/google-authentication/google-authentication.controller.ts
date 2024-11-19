import { Controller, Get, Query, Redirect } from '@nestjs/common';
import { GoogleAuthenticationService } from './google-authentication.service';
import { Public } from '../decorator/public.decorator';

@Controller('authentication')
export class GoogleAuthenticationController {
  constructor(
    private readonly googleAuthenticationService: GoogleAuthenticationService,
  ) {}

  @Public()
  @Get('google')
  @Redirect('', 301)
  async redirectGoogleAuthentication() {
    return {
      url: await this.googleAuthenticationService.forwardGoogleAuthentication(),
    };
  }

  @Public()
  @Get('google-redirect')
  @Redirect('', 302)
  async handleGoogleAuthenticationCallback(@Query('code') code: string) {
    const generatedAccessToken =
      await this.googleAuthenticationService.generateGoogleAuthenticationToken(
        code,
      );

    const jwtPayload =
      await this.googleAuthenticationService.getAuthenticatedGoogleUserInformation(
        generatedAccessToken,
      );
    // Generate JWT Token
    const generatedJWTToken =
      await this.googleAuthenticationService.generateJwtToken(jwtPayload);
    return {
      url: `https://next-library-app-liart.vercel.app/auth/login?token=${generatedJWTToken}`,
    };
  }
}

import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { JwtService } from '@nestjs/jwt';
import { firstValueFrom } from 'rxjs';
import PrismaService from '../../common/prisma.service';
import { User } from '@prisma/client';

@Injectable()
export class GoogleAuthenticationService {
  constructor(
    private readonly configService: ConfigService,
    private readonly jwtService: JwtService,
    private readonly httpService: HttpService,
    private readonly prismaService: PrismaService,
  ) {}

  async generateGoogleAuthenticationToken(code) {
    try {
      const responseAxios = await firstValueFrom(
        this.httpService.post('https://oauth2.googleapis.com/token', null, {
          params: {
            code,
            client_id: this.configService.get<string>('GOOGLE_CLIENT_ID'),
            client_secret: this.configService.get<string>(
              'GOOGLE_CLIENT_SECRET',
            ),
            redirect_uri: this.configService.get<string>('GOOGLE_REDIRECT_URI'),
            grant_type: 'authorization_code',
          },
        }),
      );
      const { access_token: accessToken } = responseAxios['data'];
      return accessToken;
    } catch (error) {
      throw new UnauthorizedException('Invalid Google authentication token');
    }
  }

  async getAuthenticatedGoogleUserInformation(accessToken: string) {
    const userInformation = await firstValueFrom(
      this.httpService.get('https://www.googleapis.com/oauth2/v3/userinfo', {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }),
    );
    const userData = userInformation['data'];
    let userPrisma: User = await this.prismaService.user.findFirst({
      where: {
        email: userData.email,
      },
    });
    console.log(userData);
    if (!userPrisma) {
      userPrisma = await this.prismaService.user.create({
        data: {
          fullName: userData['name'],
          email: userData['email'],
        },
      });
    }
    return userPrisma;
  }

  generateJwtToken(payloadJwt: any) {
    return this.jwtService.signAsync(payloadJwt);
  }

  async forwardGoogleAuthentication() {
    return encodeURI(
      `${this.configService.get<string>('GOOGLE_ENDPOINT')}?client_id=${this.configService.get<string>(
        'GOOGLE_CLIENT_ID',
      )}&redirect_uri=${this.configService.get<string>(
        'GOOGLE_REDIRECT_URI',
      )}&response_type=code&scope=profile email`,
    );
  }
}

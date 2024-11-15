import { HttpException, Injectable, NotFoundException } from '@nestjs/common';
import { SignInDto } from './dto/sign-in.dto';
import { SignUpDto } from './dto/sign-up.dto';
import { UserService } from '../user/user.service';
import { OneTimePasswordToken, User } from '@prisma/client';
import * as bcrypt from 'bcryptjs';
import { JwtService } from '@nestjs/jwt';
import { ResponseAuthenticationDto } from './dto/response-authentication.dto';
import ValidationService from '../common/validation.service';
import { AuthenticationValidation } from './authentication.validation';
import { CommonHelper } from '../helper/common.helper';
import PrismaService from '../common/prisma.service';
import { MailerService } from '../common/mailer.service';
import { VerifyTokenDto } from './dto/verify-token.dto';

@Injectable()
export class AuthenticationService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
    private readonly validationService: ValidationService,
    private readonly prismaService: PrismaService,
    private readonly mailerService: MailerService,
  ) {}

  async handleSignIn(signInDto: SignInDto) {
    const validatedSignInDto = this.validationService.validate(
      AuthenticationValidation.SIGN_IN,
      signInDto,
    );
    const userPrisma: User = await this.userService.findOne(
      validatedSignInDto.email,
    );
    const isPasswordCorrect = await bcrypt.compare(
      validatedSignInDto.password,
      userPrisma.password,
    );
    if (!isPasswordCorrect) {
      throw new HttpException('Password is incorrect', 400);
    }
    return {
      accessToken: await this.jwtService.signAsync(userPrisma),
    };
  }

  async handleSignUp(signUpDto: SignUpDto): Promise<ResponseAuthenticationDto> {
    const userPrisma: User = await this.userService.create({ ...signUpDto });
    return {
      accessToken: await this.jwtService.signAsync(userPrisma),
    };
  }

  async generateOneTimePasswordVerification(currentUser: {
    email: string;
  }): Promise<string> {
    const generatedOneTimePassword = await this.prismaService.$transaction(
      async (prismaTransaction) => {
        const userPrisma: User = await prismaTransaction.user
          .findFirstOrThrow({
            where: {
              email: currentUser.email,
            },
          })
          .catch(() => {
            throw new NotFoundException('User with this email not found');
          });
        const generatedOneTimePassword =
          await CommonHelper.generateOneTimePassword();
        const hashedGeneratedOneTimePassword = await bcrypt.hash(
          generatedOneTimePassword,
          10,
        );
        await prismaTransaction.oneTimePasswordToken.create({
          data: {
            userId: userPrisma['id'],
            hashedToken: hashedGeneratedOneTimePassword,
            expiresAt: new Date(new Date().getTime() + 10 * 60 * 1000),
          },
        });
        return generatedOneTimePassword;
      },
    );
    await this.mailerService.dispatchMailTransfer({
      recipients: [
        {
          name: currentUser['name'],
          address: currentUser['email'],
        },
      ],
      subject: 'One Time Password Verification',
      text: `Bang! ini kode OTP nya: ${generatedOneTimePassword}`,
    });
    return `Successfully send one time password`;
  }

  async verifyOneTimePasswordToken(
    verifyToken: VerifyTokenDto,
  ): Promise<boolean> {
    return this.prismaService.$transaction(async (prismaTransaction) => {
      const userPrisma: User = await prismaTransaction.user
        .findFirstOrThrow({
          where: {
            email: verifyToken.email,
          },
        })
        .catch(() => {
          throw new NotFoundException('User not found');
        });
      const validOneTimePasswordToken: OneTimePasswordToken =
        await prismaTransaction.oneTimePasswordToken.findFirstOrThrow({
          where: {
            userId: userPrisma.id,
            expiresAt: {
              gte: new Date(),
            },
          },
          orderBy: {
            id: 'desc',
          },
        });
      return !!(
        validOneTimePasswordToken &&
        (await bcrypt.compare(
          verifyToken.token,
          validOneTimePasswordToken.hashedToken,
        ))
      );
    });
  }
}

import { HttpException, Injectable } from '@nestjs/common';
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

  findOne(id: number) {
    return `This action returns a #${id} authentication`;
  }

  update(id: number, updateAuthenticationDto: SignUpDto) {
    return `This action updates a #${id} authentication`;
  }

  remove(id: number) {
    return `This action removes a #${id} authentication`;
  }

  async generateOneTimePasswordVerification(
    currentUser: User,
  ): Promise<string> {
    const generatedOneTimePassword = await this.prismaService.$transaction(
      async (prismaTransaction) => {
        const generatedOneTimePassword =
          await CommonHelper.generateOneTimePassword();
        const hashedGeneratedOneTimePassword = await bcrypt.hash(
          generatedOneTimePassword,
          10,
        );

        await prismaTransaction.oneTimePasswordToken.create({
          data: {
            userId: currentUser['id'],
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
    currentUser: User,
    oneTimePassword: string,
  ): Promise<string> {
    return this.prismaService.$transaction(async (prismaTransaction) => {
      const validOneTimePasswordToken: OneTimePasswordToken =
        await prismaTransaction.oneTimePasswordToken.findFirstOrThrow({
          where: {
            userId: currentUser.id,
            expiresAt: {
              gte: new Date(),
            },
          },
        });
      if (
        validOneTimePasswordToken &&
        (await bcrypt.compare(
          oneTimePassword,
          validOneTimePasswordToken.hashedToken,
        ))
      ) {
        return 'One time password verified';
      } else {
        return 'One time password not valid';
      }
    });
  }
}

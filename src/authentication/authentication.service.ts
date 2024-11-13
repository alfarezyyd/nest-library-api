import { HttpException, Injectable } from '@nestjs/common';
import { SignInDto } from './dto/sign-in.dto';
import { SignUpDto } from './dto/sign-up.dto';
import { UserService } from '../user/user.service';
import { User } from '@prisma/client';
import * as bcrypt from 'bcryptjs';
import { JwtService } from '@nestjs/jwt';
import { ResponseAuthenticationDto } from './dto/response-authentication.dto';
import ValidationService from '../common/validation.service';
import { AuthenticationValidation } from './authentication.validation';

@Injectable()
export class AuthenticationService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
    private readonly validationService: ValidationService,
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
}

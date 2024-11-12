import { BadRequestException, Injectable } from '@nestjs/common';
import { SignInDto } from './dto/sign-in.dto';
import { UpdateAuthenticationDto } from './dto/update-authentication.dto';
import { UserService } from '../user/user.service';
import { User } from '@prisma/client';
import * as bcrypt from 'bcryptjs';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthenticationService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
  ) {}

  async handleSignIn(signUpDto: SignInDto) {
    const userPrisma: User = await this.userService.findOne(signUpDto.email);
    await bcrypt.compare(
      signUpDto.password,
      userPrisma.password,
      (err: any, result: any) => {
        if (!result) {
          throw new BadRequestException('Password is incorrect');
        }
      },
    );
    const payloadJwt = userPrisma;
    return {
      accessToken: await this.jwtService.signAsync(payloadJwt),
    };
  }

  findAll() {
    return `This action returns all authentication`;
  }

  findOne(id: number) {
    return `This action returns a #${id} authentication`;
  }

  update(id: number, updateAuthenticationDto: UpdateAuthenticationDto) {
    return `This action updates a #${id} authentication`;
  }

  remove(id: number) {
    return `This action removes a #${id} authentication`;
  }
}

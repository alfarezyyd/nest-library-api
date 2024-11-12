import { BadRequestException, Injectable } from '@nestjs/common';
import { SignInDto } from './dto/sign-in.dto';
import { SignUpDto } from './dto/sign-up.dto';
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
    return {
      accessToken: await this.jwtService.signAsync(userPrisma),
    };
  }

  findAll() {
    return `This action returns all authentication`;
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

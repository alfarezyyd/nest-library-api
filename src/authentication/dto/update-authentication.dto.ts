import { PartialType } from '@nestjs/mapped-types';
import { SignUpDto } from './sign-up.dto';

export class UpdateAuthenticationDto extends PartialType(SignUpDto) {}

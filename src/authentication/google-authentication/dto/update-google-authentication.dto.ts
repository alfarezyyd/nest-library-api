import { CreateGoogleAuthenticationDto } from './create-google-authentication.dto';
import { PartialType } from '@nestjs/mapped-types';

export class UpdateGoogleAuthenticationDto extends PartialType(
  CreateGoogleAuthenticationDto,
) {}

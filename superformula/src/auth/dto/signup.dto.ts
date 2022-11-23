import {
  IsDateString,
  IsNotEmpty,
  IsString,
  Matches,
  MaxLength,
  MinLength,
  ValidateIf,
} from 'class-validator';
import { Match } from 'src/decorator';

export class SignUpDTO {
  @IsNotEmpty({ message: 'Username cannot be empty' })
  name: string;

  @IsNotEmpty({ message: 'Password field cannot be empty' })
  @MinLength(8, {
    message: 'Password field length is below minimum length of eight',
  })
  @MaxLength(40, {
    message: 'Password field exceeds maximum length of forty',
  })
  @Matches(/((?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/, {
    message:
      "Password field should be strong, don't use common passwords and use character combinations",
  })
  password: string;

  @Match('password', {
    message: 'Password confirmation should be same as password'
  })
  confirmPassword: string;

  @IsDateString()
  dob: string;

  @IsString()
  @ValidateIf((object, value) => value !== undefined)
  address?: string;

  @IsString()
  @ValidateIf((object, value) => value !== undefined)
  description?: string;
}

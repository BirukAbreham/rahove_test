import { IsNotEmpty } from 'class-validator';

export class SignInDTO {
  @IsNotEmpty({ message: 'Username cannot be empty' })
  username: string;

  @IsNotEmpty({ message: 'Password field cannot be empty' })
  password: string;
}

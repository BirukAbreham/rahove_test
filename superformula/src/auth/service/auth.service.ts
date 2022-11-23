import * as bcrypt from 'bcrypt';
import { HttpStatus, Injectable, UnauthorizedException } from '@nestjs/common';
import { SignUpDTO } from '../dto/signup.dto';
import { UserRepository } from '../repository/user.repository';
import { User } from '@prisma/client';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthService {
  constructor(
    private readonly userRepo: UserRepository,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async createUser(signupDto: SignUpDTO) {
    const user = {
      name: signupDto.name,
      password: bcrypt.hashSync(signupDto.password, 10),
      dob: new Date(signupDto.dob),
      address: signupDto?.address,
      description: signupDto?.description,
    };

    const { password, refreshHash, ...theRest} = await this.userRepo.create(user);

    return theRest;
  }

  async signInUser(credentials: any) {
    const { username, password } = credentials;

    let existingUser: User = await this.userRepo.getUserByName(username);

    if (existingUser === null) {
      throw new UnauthorizedException({
        statusCode: HttpStatus.FORBIDDEN,
        message: 'Access denied',
      });
    }

    if (!bcrypt.compareSync(password, existingUser.password)) {
      throw new UnauthorizedException({
        statusCode: HttpStatus.BAD_REQUEST,
        message: 'Your password is incorrect',
      });
    }

    const { accessToken, refreshToken } = await this.signToken(existingUser);

    await this.updateUser(existingUser.id, {
      refreshHash: bcrypt.hashSync(refreshToken, 10),
    });

    return { accessToken, refreshToken };
  }

  async refresh(token: string, userId: number) {
    const existingUser: User = await this.userRepo.get(Number(userId));

    if (existingUser === null) {
      throw new UnauthorizedException({
        statusCode: HttpStatus.FORBIDDEN,
        message: 'Access denied',
      });
    }

    if (!bcrypt.compareSync(token, existingUser.refreshHash)) {
      throw new UnauthorizedException({
        statusCode: HttpStatus.FORBIDDEN,
        message: 'Access denied',
      });
    }

    const { accessToken, refreshToken } = await this.signToken(existingUser);

    await this.updateUser(existingUser.id, {
      refreshHash: bcrypt.hashSync(refreshToken, 10),
    });

    return { accessToken, refreshToken };
  }

  async getUser(userId: number) {
    const { password, refreshHash, ...theRest} = await this.userRepo.get(Number(userId));

    return theRest;
  }

  async updateUser(userId: number, data: any) {
    const { password, refreshHash, ...theRest} = await this.userRepo.update(Number(userId), data);

    return theRest;
  }

  async deleteUser(userId: number) {
    const deletedUser = await this.userRepo.delete(Number(userId));

    return deletedUser;
  }

  private async signToken(
    user: User,
  ): Promise<{ accessToken: string; refreshToken: string }> {
    const payload = {
      sub: user.id,
      id: user.id,
      username: user.name,
    };

    const refreshPayload = {
      sub: user.id,
      id: user.id,
    };

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.sign(payload, {
        privateKey: this.configService.get<string>('ACCESS_SIG_SECRET'),
        expiresIn: '3600000ms',
      }),
      this.jwtService.sign(refreshPayload, {
        privateKey: this.configService.get<string>('REFRESH_SIG_SECRET'),
        expiresIn: '7200000ms',
      }),
    ]);

    return { accessToken, refreshToken };
  }
}

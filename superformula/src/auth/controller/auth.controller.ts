import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Put,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { User } from '@prisma/client';
import { Request, Response } from 'express';
import { GetUser } from 'src/decorator';
import { SignInDTO } from '../dto/signin.dto';
import { SignUpDTO } from '../dto/signup.dto';
import { AuthService } from '../service/auth.service';

@Controller('/api/auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('/sign_up')
  @HttpCode(HttpStatus.CREATED)
  async signUp(@Body() signUp: SignUpDTO) {
    return this.authService.createUser(signUp);
  }

  @Post('/sign_in')
  @HttpCode(HttpStatus.OK)
  async signIn(
    @Body() credentials: SignInDTO,
    @Res({ passthrough: true }) res,
  ) {
    const { accessToken, refreshToken } = await this.authService.signInUser(
      credentials,
    );

    res.cookie('auth-token', refreshToken, { httpOnly: true });

    return { accessToken };
  }

  @Post('/refresh')
  @HttpCode(HttpStatus.OK)
  @UseGuards(AuthGuard('jwt-refresh'))
  async refresh(
    @GetUser() user: User,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const token = req?.cookies['auth-token'];

    const { accessToken, refreshToken } = await this.authService.refresh(
      token,
      user.id,
    );

    res.cookie('auth-token', refreshToken, { httpOnly: true });

    return { accessToken };
  }

  @Get('/user/:userId')
  @HttpCode(HttpStatus.OK)
  @UseGuards(AuthGuard('jwt'))
  async getUser(@Param('userId') userId: number) {
    return await this.authService.getUser(userId);
  }

  @Put('/user/:userId')
  @HttpCode(HttpStatus.OK)
  @UseGuards(AuthGuard('jwt'))
  async updateUser(@Param('userId') userId: number, @Body() data: any) {
    return await this.authService.updateUser(userId, data);
  }

  @Delete('/user/:userId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(AuthGuard('jwt'))
  async deleteUser(@Param('userId') userId: number) {
    return await this.authService.deleteUser(userId);
  }
}

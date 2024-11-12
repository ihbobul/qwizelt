import { Request, Response } from 'express';

import {
  Body,
  Controller,
  HttpCode,
  HttpException,
  HttpStatus,
  Post,
  Req,
  Res,
} from '@nestjs/common';

import { CreateUserDto, LoginUserDto } from '../user/dto/create-user.dto';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  private setRefreshTokenCookie(res: Response, refreshToken: string) {
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
  }

  @Post('register')
  @HttpCode(201)
  async register(@Body() createUserDto: CreateUserDto) {
    return await this.authService.register(createUserDto);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(
    @Body() loginUserDto: LoginUserDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const { accessToken, refreshToken } =
      await this.authService.login(loginUserDto);

    if (!accessToken || !refreshToken) {
      throw new HttpException('Invalid credentials.', HttpStatus.UNAUTHORIZED);
    }

    this.setRefreshTokenCookie(res, refreshToken);

    return { accessToken };
  }

  @Post('refresh')
  @HttpCode(200)
  async refreshToken(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const { refreshToken } = req.cookies;

    if (!refreshToken) {
      throw new HttpException(
        'Refresh token not provided.',
        HttpStatus.BAD_REQUEST,
      );
    }

    const newTokens = await this.authService.refresh(refreshToken);

    this.setRefreshTokenCookie(res, newTokens.refreshToken);

    return { accessToken: newTokens.accessToken };
  }

  @Post('logout')
  @HttpCode(200)
  async logout(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const { refreshToken } = req.cookies;

    if (!refreshToken) {
      throw new HttpException(
        'Refresh token not provided.',
        HttpStatus.BAD_REQUEST,
      );
    }

    const message = await this.authService.logout(refreshToken);

    res.clearCookie('refreshToken');

    return message;
  }
}

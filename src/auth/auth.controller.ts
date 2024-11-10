import {
  Body,
  Controller,
  HttpCode,
  HttpException,
  HttpStatus,
  Post,
} from '@nestjs/common';

import { CreateUserDto, LoginUserDto } from '../user/dto/create-user.dto';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @HttpCode(201)
  async register(@Body() createUserDto: CreateUserDto) {
    return await this.authService.register(createUserDto);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() loginUserDto: LoginUserDto) {
    const { accessToken, refreshToken } =
      await this.authService.login(loginUserDto);

    if (!accessToken || !refreshToken) {
      throw new HttpException('Invalid credentials.', HttpStatus.UNAUTHORIZED);
    }

    return { accessToken, refreshToken };
  }

  @Post('refresh')
  @HttpCode(200)
  async refreshToken(@Body() body: { refreshToken: string }) {
    const { refreshToken } = body;

    const newTokens = await this.authService.refresh(refreshToken);

    return newTokens;
  }

  @Post('logout')
  @HttpCode(200)
  async logout(@Body() body: { refreshToken: string }) {
    const { refreshToken } = body;

    return await this.authService.logout(refreshToken);
  }
}

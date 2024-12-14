import * as bcrypt from 'bcrypt';
import { Cache } from 'cache-manager';
import { CreateUserDto, LoginUserDto } from 'src/user/dto/create-user.dto';

import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

import { UserService } from './../user/user.service';

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private jwtService: JwtService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  async register(createUserDto: CreateUserDto) {
    const userExists = await this.userService.findByEmail(createUserDto.email);

    if (userExists) {
      throw new BadRequestException('Email already in use.');
    }

    await this.userService.create(createUserDto);

    return {
      message: 'User registered successfully!',
    };
  }

  async login(loginUserDto: LoginUserDto) {
    const user = await this.userService.findByEmail(loginUserDto.email);

    if (user && (await bcrypt.compare(loginUserDto.password, user.password))) {
      const { id, email, firstName, lastName, organization } = user;

      const accessToken = this.generateAccessToken(
        id,
        email,
        firstName,
        lastName,
        organization,
      );
      const refreshToken = this.generateRefreshToken(
        id,
        email,
        firstName,
        lastName,
        organization,
      );

      const tokenExpiration = this.jwtService.decode(refreshToken)['exp'];
      const ttlInMilliseconds = tokenExpiration - Math.floor(Date.now() / 1000);
      const ttl = ttlInMilliseconds * 1000;

      await this.cacheManager.set(refreshToken, 'valid', ttl);

      return { accessToken, refreshToken };
    } else {
      throw new BadRequestException('Invalid credentials.');
    }
  }

  private generateAccessToken(
    userId: number,
    username: string,
    firstName: string,
    lastName: string,
    organization?: string,
  ): string {
    const payload = {
      sub: userId,
      username,
      firstName,
      lastName,
      organization,
    };
    return this.jwtService.sign(payload);
  }

  private generateRefreshToken(
    userId: number,
    username: string,
    firstName: string,
    lastName: string,
    organization?: string,
  ): string {
    const payload = {
      sub: userId,
      username,
      firstName,
      lastName,
      organization,
    };
    return this.jwtService.sign(payload, { expiresIn: '7d' });
  }

  async refresh(refreshToken: string) {
    const isRefreshInvalidated = await this.isRefreshInvalidated(refreshToken);

    if (isRefreshInvalidated) {
      throw new BadRequestException('Refresh token has been invalidated.');
    }

    try {
      const decoded = this.jwtService.verify(refreshToken);
      const {
        sub: userId,
        username,
        firstName,
        lastName,
        organization,
      } = decoded;

      const accessToken = this.generateAccessToken(
        userId,
        username,
        firstName,
        lastName,
        organization,
      );
      const newRefreshToken = this.generateRefreshToken(
        userId,
        username,
        firstName,
        lastName,
        organization,
      );

      const tokenExpiration = this.jwtService.decode(newRefreshToken)['exp'];
      const ttlInMilliseconds = tokenExpiration - Math.floor(Date.now() / 1000);
      const ttl = ttlInMilliseconds * 1000;

      await this.cacheManager.set(newRefreshToken, 'valid', ttl);

      return { accessToken, refreshToken: newRefreshToken };
    } catch (error) {
      console.log('Error verifying refresh token: ', error);
      throw new BadRequestException('Invalid refresh token');
    }
  }

  async isRefreshInvalidated(refreshToken: string): Promise<boolean> {
    const result = await this.cacheManager.get(refreshToken);
    return result == null;
  }

  async logout(refreshToken: string) {
    try {
      const decoded = this.jwtService.verify(refreshToken);

      if (!decoded) {
        throw new BadRequestException('Invalid refresh token');
      }

      await this.cacheManager.del(refreshToken);

      return { message: 'Logout successful' };
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      throw new BadRequestException('Invalid refresh token');
    }
  }
}

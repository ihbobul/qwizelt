import * as bcrypt from 'bcrypt';
import { CreateUserDto, LoginUserDto } from 'src/user/dto/create-user.dto';

import { BadRequestException, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

import { UserService } from './../user/user.service';

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private jwtService: JwtService,
  ) {}

  async register(createUserDto: CreateUserDto) {
    const { email, password } = createUserDto;

    const userExists = await this.userService.findByEmail(email);

    if (userExists) {
      throw new BadRequestException('Email already in use.');
    }

    await this.userService.create(email, password);

    return {
      message: 'User registered successfully!',
    };
  }

  async login(loginUserDto: LoginUserDto) {
    const user = await this.userService.findByEmail(loginUserDto.email);
    if (user && (await bcrypt.compare(loginUserDto.password, user.password))) {
      const { id, email } = user;
      const payload = { sub: id, username: email };
      return this.jwtService.sign(payload);
    }
  }
}

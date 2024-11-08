import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateAuthDto } from './dto/create-auth.dto';

@Injectable()
export class AuthService {
  private users = [];

  register(createAuthDto: CreateAuthDto) {
    const { email, password } = createAuthDto;

    const userExists = this.users.some((user) => user.email === email);

    if (userExists) {
      throw new BadRequestException('Email already in use.');
    }

    this.users.push({ email, password });

    return {
      message: 'User registered successfully!',
    };
  }
}

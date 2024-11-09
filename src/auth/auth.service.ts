import { UserService } from './../user/user.service';
import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateUserDto } from 'src/user/dto/create-user.dto';

@Injectable()
export class AuthService {
  constructor(private userService: UserService) {}

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
}

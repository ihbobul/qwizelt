import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';

import { Controller, Get, Param, UseGuards } from '@nestjs/common';

import { UserService } from './user.service';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  async findOne(@Param('id') id: string) {
    const user = await this.userService.findOne(+id);
    if (!user) {
      return 'User not found.';
    }
    return `User with id ${id} has email: ${user.email}.`;
  }
}

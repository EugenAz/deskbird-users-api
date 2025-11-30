import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  NotFoundException,
  UseGuards,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { User } from './user.entity';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const sanitizeUser = ({ passwordHash, ...rest }: User) => rest;

@UseGuards(JwtAuthGuard)
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  async findAll(): Promise<ReturnType<typeof sanitizeUser>[]> {
    const users = await this.usersService.findAll();
    return users.map(sanitizeUser);
  }

  @Get(':id')
  async findOne(
    @Param('id') id: string,
  ): Promise<ReturnType<typeof sanitizeUser>> {
    const user = await this.usersService.findOne(id);
    if (!user) {
      throw new NotFoundException(`User with id ${id} not found`);
    }
    return sanitizeUser(user);
  }

  @Post()
  async create(@Body() user: User): Promise<ReturnType<typeof sanitizeUser>> {
    const created = await this.usersService.create(user);
    return sanitizeUser(created);
  }

  @Delete(':id')
  remove(@Param('id') id: string): Promise<void> {
    return this.usersService.remove(id);
  }
}

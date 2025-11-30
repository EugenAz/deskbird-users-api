import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  NotFoundException,
  UseGuards,
  Req,
} from '@nestjs/common';
import { Request } from 'express';
import { UsersService } from './users.service';
import { User, UserRole } from './user.entity';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { JwtPayload } from '../auth/interfaces/jwt-payload.interface';
import { Roles } from '../auth/decorators/roles.decorator';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const sanitizeUser = ({ passwordHash, ...rest }: User) => rest;

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  async findAll(
    @Req() req: Request & { user?: JwtPayload },
  ): Promise<ReturnType<typeof sanitizeUser>[]> {
    const users = await this.usersService.findVisibleFor(req.user?.role);
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
  @Roles(UserRole.Admin)
  async create(@Body() user: User): Promise<ReturnType<typeof sanitizeUser>> {
    const created = await this.usersService.create(user);
    return sanitizeUser(created);
  }

  @Delete(':id')
  @Roles(UserRole.Admin)
  remove(@Param('id') id: string): Promise<void> {
    return this.usersService.remove(id);
  }
}

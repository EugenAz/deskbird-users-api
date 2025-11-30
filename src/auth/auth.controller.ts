import { Controller, Post, Request, UseGuards } from '@nestjs/common';
import { AuthService, SafeUser } from './auth.service';
import { LocalAuthGuard } from './guards/local-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @UseGuards(LocalAuthGuard)
  @Post('login')
  async login(@Request() req: { user: SafeUser }) {
    return this.authService.login(req.user);
  }
}

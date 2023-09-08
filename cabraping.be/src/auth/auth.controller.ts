import { Controller, Get, Post, Req } from '@nestjs/common';
import { Request } from 'express';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  // POST /auth/signup
  @Post('signup')
  signup(@Req() req: Request) {
    console.log(req.header);
    return this.authService.signup();
  }

  // POST /auth/signin
  @Get('signin')
  signin() {
    return this.authService.signin();
  }
}

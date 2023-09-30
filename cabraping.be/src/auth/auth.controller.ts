import { Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { Request } from 'express';
import { AuthService } from './auth.service';
import { FortyTwoGuard } from './guards/42-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  // GET /42/login
  @Get('42/login')
  @UseGuards(FortyTwoGuard)
  handle42Login() {
    return this.authService.handle42Login();
  }

  // GET /42/redirect
  @Get('42/redirect')
  @UseGuards(FortyTwoGuard)
  handle42Callback() {
    // return { msg: 'Google Auth: Redirect' };
    return this.authService.handle42Callback();
  }
}

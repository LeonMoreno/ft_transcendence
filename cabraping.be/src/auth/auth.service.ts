import { Injectable, UseGuards } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class AuthService {
  constructor(private prisma: PrismaService) {}

  handle42Login() {
    return { msg: 'Google Auth: Hello' };
  }

  handle42Callback() {
    return { msg: 'Google Auth: Redirect' };
  }
}

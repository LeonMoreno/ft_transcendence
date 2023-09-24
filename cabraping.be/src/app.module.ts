import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { PrismaModule } from './prisma/prisma.module';
import { TestModule } from './test/test.module';

@Module({
  imports: [AuthModule, UserModule, PrismaModule, TestModule],
})
export class AppModule {}

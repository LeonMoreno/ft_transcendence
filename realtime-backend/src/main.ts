import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

// async function bootstrap() {
//   const app = await NestFactory.create(AppModule);
//   await app.listen(3001);
// }

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const server = app.getHttpServer();
  const serverAddress = server.address();

  if (serverAddress) {
    const address = typeof serverAddress === 'string' ? serverAddress : serverAddress.address;
    const port = serverAddress.port;

    console.log(`Server is running at ws://${address}:${port}`);
  }

  await app.listen(3001);
}

bootstrap();

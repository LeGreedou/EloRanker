import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  app.setGlobalPrefix('api');
  
  // CORS active pour permettre au client NextJS (port 3000) de parler au serveur
  app.enableCors({
    origin: '*', 
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  });

  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));

  await app.listen(3001); // Le client tourne sur 3000 ou 8080, on met le serveur sur 3001
  console.log(`Application is running on: ${await app.getUrl()}`);
}
bootstrap();

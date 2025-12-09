import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    rawBody: true, // Enable raw body for webhook signature verification
  });

  // Enable CORS
  app.enableCors({
    origin: '*',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // Swagger configuration
  const config = new DocumentBuilder()
    .setTitle('Wallet Service API')
    .setDescription(
      'Wallet Service with Paystack, JWT & API Keys - HNG Backend Stage 8',
    )
    .setVersion('1.0')
    .addBearerAuth()
    .addApiKey(
      {
        type: 'apiKey',
        name: 'x-api-key',
        in: 'header',
        description: 'API Key for service-to-service authentication',
      },
      'x-api-key',
    )
    .addTag('Authentication', 'Google OAuth and JWT endpoints')
    .addTag('API Keys', 'API Key management endpoints')
    .addTag('Wallet', 'Wallet operations and transactions')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
      tagsSorter: 'alpha',
      operationsSorter: 'alpha',
    },
  });

  const port = process.env.PORT || 3000;
  await app.listen(port);

  console.log(`
  ╔════════════════════════════════════════════════════════════╗
  ║                                                            ║
  ║   🚀 Wallet Service API is running!                       ║
  ║                                                            ║
  ║   📍 Server URL:        http://localhost:${port}              ║
  ║   📚 API Documentation: http://localhost:${port}/api          ║
  ║   🔐 Authentication:    Google OAuth + JWT + API Keys      ║
  ║   💳 Payment Provider:  Paystack                           ║
  ║                                                            ║
  ╚════════════════════════════════════════════════════════════╝
  `);
}
bootstrap();

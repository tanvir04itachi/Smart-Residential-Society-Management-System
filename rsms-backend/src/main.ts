import { join } from 'path';
import { mkdirSync } from 'fs';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { ConfigService } from '@nestjs/config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { AVATAR_UPLOAD_DIR } from './modules/users/avatar-upload.config';

async function bootstrap() {
  mkdirSync(AVATAR_UPLOAD_DIR, { recursive: true });

  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  const configService = app.get(ConfigService);

  app.useStaticAssets(join(process.cwd(), 'uploads'), { prefix: '/uploads' });

  const apiPrefix = configService.get<string>('app.apiPrefix') ?? 'api/v1';
  app.setGlobalPrefix(apiPrefix);

  app.enableCors({
    origin: configService.get<string>('app.frontendUrl'),
    credentials: true,
  });

  const config = new DocumentBuilder()
    .setTitle('RSMS API')
    .setDescription('Smart Residential Society Management System')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  const port = configService.get<number>('app.port') ?? 3001;
  await app.listen(port);

  console.log(`RSMS backend running on http://localhost:${port}/${apiPrefix}`);

  console.log(`Swagger docs available at http://localhost:${port}/api/docs`);
}
void bootstrap();

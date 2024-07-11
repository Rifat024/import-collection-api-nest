import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as AWS from 'aws-sdk';
import { AppConfig } from './utils/environment/appconfig';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import * as dotenv from 'dotenv';
import * as express from 'express';

const environment = process.env.env || 'dev';
console.log(`Loaded environment variables from: ${environment}`);
const envFileName = '.env.' + environment;
console.log(`Loaded environment variables from: ${envFileName}`);

dotenv.config({ path: envFileName });
console.log(`Loaded environment variables from: ${JSON.stringify(dotenv)}`);

async function bootstrap() {
  const app = await NestFactory.create(AppModule);


  app.use(express.json({ limit: '500mb' }));
  app.use(express.urlencoded({ limit: '500mb', extended: true }));

  AWS.config.update({
    accessKeyId: AppConfig.AWS_ACCESS_KEY_ID,
    secretAccessKey: AppConfig.AWS_SECRET_ACCESS_KEY,
    region: AppConfig.REGION
  });

  const config = new DocumentBuilder()
    .setTitle('Example API')
    .setDescription('The example API description')
    .setVersion('1.0')
    .addTag('example')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  await app.listen(3000);

}
bootstrap();

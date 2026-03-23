import { NestFactory } from '@nestjs/core';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import { AppModule } from './app.module';

async function bootstrap() {
  // Usa FastifyAdapter invece del default ExpressAdapter
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter(),
  );

  // Ascolta su tutte le interfacce di rete (0.0.0.0) invece di solo localhost
  // necessario per Docker e deploy futuri
  await app.listen(3000, '0.0.0.0');

  console.log(`🚀 Server running on http://localhost:3000`);
  console.log(`📊 GraphQL endpoint on http://localhost:3000/graphql`);
}

bootstrap();

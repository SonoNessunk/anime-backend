import { Module } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import { MercuriusDriver, MercuriusDriverConfig } from '@nestjs/mercurius';
import { AppResolver } from './app.resolver';
import { PrismaModule } from './prisma/prisma.module';
import { MediaModule } from './media/media.module';
import { ConfigModule } from '@nestjs/config';
import { AnilistModule } from './anilist/anilist.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    GraphQLModule.forRoot<MercuriusDriverConfig>({
      driver: MercuriusDriver,
      graphiql: true,
      autoSchemaFile: true,
    }),
    PrismaModule,
    MediaModule,
    AnilistModule,
  ],
  providers: [AppResolver],
})
export class AppModule {}

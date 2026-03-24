import { Module } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import { MercuriusDriver, MercuriusDriverConfig } from '@nestjs/mercurius';
import { AppResolver } from './app.resolver';
import { PrismaModule } from './prisma/prisma.module';
import { MediaModule } from './media/media.module';
import { ConfigModule } from '@nestjs/config';
import { AnilistModule } from './anilist/anilist.module';
import { AuthModule } from './auth/auth.module';
import { UserListModule } from './user-list/user-list.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    GraphQLModule.forRoot<MercuriusDriverConfig>({
      driver: MercuriusDriver,
      graphiql: true,
      autoSchemaFile: true,
      context: (request: any, reply: any) => {
        return { request, reply };
      },
    }),
    PrismaModule,
    MediaModule,
    AnilistModule,
    AuthModule,
    UserListModule,
  ],
  providers: [AppResolver],
})
export class AppModule {}

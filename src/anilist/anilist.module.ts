import { Module } from '@nestjs/common';
import { AnilistResolver } from './anilist.resolver';
import { AnilistService } from './anilist.service';

@Module({
  providers: [AnilistResolver, AnilistService],
})
export class AnilistModule {}

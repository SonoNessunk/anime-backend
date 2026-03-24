import { Args, Int, Mutation, Resolver } from '@nestjs/graphql';
import { AnilistService } from './anilist.service';

@Resolver()
export class AnilistResolver {
  constructor(private anilistService: AnilistService) {}

  @Mutation(() => Int)
  // Ritorna il numero di media sincronizzati
  async syncAnilist(
    @Args('type', { defaultValue: 'ANIME' }) type: 'ANIME' | 'MANGA',
    @Args('pages', { type: () => Int, defaultValue: 5 }) pages: number,
    // defaultValue = valore usato se l'argomento non viene passato nella query
  ): Promise<number> {
    return this.anilistService.sync(type, pages);
  }
}

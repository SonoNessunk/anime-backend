import { Args, Int, Mutation, Query, Resolver } from '@nestjs/graphql';
import { MediaType } from '../../generated/prisma';
import { MediaModel } from './models/media.model';
import { MediaService } from './media.service';
import { PaginatedMedia } from './models/paginated-media.model';

@Resolver(() => MediaModel)
// @Resolver dice a GraphQL che questo class gestisce le operazioni per il tipo MediaModel
export class MediaResolver {
  constructor(private mediaService: MediaService) {}

  @Query(() => [MediaModel])
  // @Query espone questo metodo come query GraphQL — ritorna un array di MediaModel
  async medias(
    @Args('type', { type: () => MediaType, nullable: true }) type?: MediaType,
    @Args('search', { nullable: true }) search?: string,
    @Args('limit', { type: () => Int, nullable: true }) limit?: number,

    // @Args mappa gli argomenti GraphQL ai parametri della funzione
  ) {
    return this.mediaService.findAll({ type, search, limit });
  }

  @Query(() => MediaModel, { nullable: true })
  // nullable: true = la query può ritornare null se non trova il media
  async media(@Args('id', { type: () => Int }) id: number) {
    return this.mediaService.findOne(id);
  }

  @Mutation(() => MediaModel)
  // @Mutation espone questo metodo come mutation GraphQL (operazione che modifica dati)
  async createMedia(
    @Args('type', { type: () => MediaType }) type: MediaType,
    @Args('titleRomaji') titleRomaji: string,
    @Args('titleEnglish', { nullable: true }) titleEnglish?: string,
    @Args('titleNative', { nullable: true }) titleNative?: string,
    @Args('description', { nullable: true }) description?: string,
    @Args('episodes', { type: () => Int, nullable: true }) episodes?: number,
    @Args('chapters', { type: () => Int, nullable: true }) chapters?: number,
  ) {
    return this.mediaService.create({
      type,
      titleRomaji,
      titleEnglish,
      titleNative,
      description,
      episodes,
      chapters,
    });
  }

  @Query(() => PaginatedMedia)
  async mediasPaginated(
    @Args('type', { type: () => MediaType, nullable: true }) type?: MediaType,
    @Args('search', { nullable: true }) search?: string,
    @Args('page', { type: () => Int, nullable: true }) page?: number,
    @Args('perPage', { type: () => Int, nullable: true }) perPage?: number,
    @Args('sort', { nullable: true })
    sort?: 'popularity' | 'score' | 'title' | 'id',
    @Args('order', { nullable: true }) order?: 'asc' | 'desc',
  ) {
    return this.mediaService.findAllPaginated({
      type,
      search,
      page,
      perPage,
      sort,
      order,
    });
  }
}

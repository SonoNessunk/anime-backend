import {
  Args,
  Field,
  Int,
  Mutation,
  ObjectType,
  Query,
  Resolver,
} from '@nestjs/graphql';
import { SearchService } from './search.service';

// Tipo GraphQL per i risultati della search
// lo definiamo qui perché è specifico della search e non è un model Prisma
@ObjectType()
class SearchResultItem {
  @Field(() => Int)
  id: number;

  @Field()
  type: string;

  @Field()
  titleRomaji: string;

  @Field()
  titleEnglish: string;

  @Field()
  coverImage: string;

  @Field(() => Int)
  popularity: number;
}

@ObjectType()
class SearchResult {
  @Field(() => [SearchResultItem])
  hits: SearchResultItem[];

  @Field(() => Int)
  total: number;

  @Field(() => Int)
  page: number;

  @Field(() => Int)
  perPage: number;

  @Field(() => Int)
  totalPages: number;
}

@Resolver()
export class SearchResolver {
  constructor(private searchService: SearchService) {}

  @Query(() => SearchResult)
  async search(
    @Args('query') query: string,
    @Args('type', { nullable: true }) type?: string,
    @Args('page', { type: () => Int, nullable: true }) page?: number,
    @Args('perPage', { type: () => Int, nullable: true }) perPage?: number,
  ) {
    return this.searchService.search(query, { type }, page ?? 1, perPage ?? 25);
  }

  @Mutation(() => Int)
  // mutation per triggerare il reindex manualmente (utile dopo una sync AniList)
  async indexSearch(): Promise<number> {
    return this.searchService.indexAll();
  }
}

import { Field, Int, ObjectType } from '@nestjs/graphql';
import { MediaModel } from './media.model';

@ObjectType()
export class PageInfo {
  @Field(() => Int)
  total: number; // totale record nel database

  @Field(() => Int)
  page: number; // pagina corrente

  @Field(() => Int)
  perPage: number; // record per pagina

  @Field(() => Int)
  totalPages: number; // totale pagine

  @Field()
  hasNextPage: boolean; // ci sono altre pagine dopo questa?

  @Field()
  hasPrevPage: boolean; // ci sono pagine prima di questa?
}

@ObjectType()
export class PaginatedMedia {
  @Field(() => [MediaModel])
  items: MediaModel[]; // i media di questa pagina

  @Field(() => PageInfo)
  pageInfo: PageInfo; // informazioni sulla paginazione
}

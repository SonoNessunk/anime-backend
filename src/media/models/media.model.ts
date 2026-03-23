import {
  Field,
  Float,
  Int,
  ObjectType,
  registerEnumType,
} from '@nestjs/graphql';
import { MediaSeason, MediaStatus, MediaType } from '../../../generated/prisma';

// Registra gli enum Prisma come enum GraphQL
// senza questo GraphQL non saprebbe come serializzarli
registerEnumType(MediaType, { name: 'MediaType' });
registerEnumType(MediaStatus, { name: 'MediaStatus' });
registerEnumType(MediaSeason, { name: 'MediaSeason' });

@ObjectType()
// @ObjectType dice a GraphQL che questa classe è un tipo restituibile nelle query
export class MediaModel {
  @Field(() => Int)
  // @Field espone il campo in GraphQL — () => Int specifica il tipo GraphQL esplicitamente
  id: number;

  @Field(() => MediaType)
  type: MediaType;

  @Field(() => MediaStatus)
  status: MediaStatus;

  @Field()
  // senza argomenti, NestJS inferisce il tipo dal tipo TypeScript (String → String)
  titleRomaji: string;

  @Field({ nullable: true })
  // nullable: true = il campo può essere null nella risposta GraphQL
  titleEnglish?: string;

  @Field({ nullable: true })
  titleNative?: string;

  @Field(() => [String])
  // [String] = array di stringhe in GraphQL
  synonyms: string[];

  @Field({ nullable: true })
  description?: string;

  @Field({ nullable: true })
  coverImage?: string;

  @Field({ nullable: true })
  bannerImage?: string;

  @Field()
  isAdult: boolean;

  @Field(() => Int, { nullable: true })
  episodes?: number;

  @Field(() => Int, { nullable: true })
  duration?: number;

  @Field(() => MediaSeason, { nullable: true })
  season?: MediaSeason;

  @Field(() => Int, { nullable: true })
  seasonYear?: number;

  @Field(() => Int, { nullable: true })
  chapters?: number;

  @Field(() => Int, { nullable: true })
  volumes?: number;

  @Field(() => Int, { nullable: true })
  anilistId?: number;

  @Field(() => Int, { nullable: true })
  malId?: number;

  @Field(() => Float, { nullable: true })
  // Float per i numeri decimali (es. 8.5)
  averageScore?: number;

  @Field(() => Int, { nullable: true })
  popularity?: number;

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;
}

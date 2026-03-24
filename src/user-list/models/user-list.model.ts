import {
  Field,
  Float,
  Int,
  ObjectType,
  registerEnumType,
} from '@nestjs/graphql';
import { UserMediaStatus } from '../../../generated/prisma';
import { MediaModel } from '../../media/models/media.model';

registerEnumType(UserMediaStatus, { name: 'UserMediaStatus' });

@ObjectType()
export class UserMediaEntryModel {
  @Field(() => Int)
  id: number;

  @Field(() => Int)
  userId: number;

  @Field(() => Int)
  mediaId: number;

  @Field(() => UserMediaStatus)
  status: UserMediaStatus;

  @Field(() => Float, { nullable: true })
  score?: number;

  @Field(() => Int)
  progress: number;

  @Field({ nullable: true })
  notes?: string;

  @Field({ nullable: true })
  startDate?: Date;

  @Field({ nullable: true })
  endDate?: Date;

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;

  @Field(() => MediaModel, { nullable: true })
  // include il media collegato nella risposta
  media?: MediaModel;
}

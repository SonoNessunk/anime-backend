import { Field, Float, InputType, Int } from '@nestjs/graphql';
import { UserMediaStatus } from '../../../generated/prisma';

@InputType()
export class AddToListInput {
  @Field(() => Int)
  mediaId: number;

  @Field(() => UserMediaStatus)
  status: UserMediaStatus;

  @Field(() => Float, { nullable: true })
  score?: number;

  @Field(() => Int, { nullable: true })
  progress?: number;

  @Field({ nullable: true })
  notes?: string;

  @Field({ nullable: true })
  startDate?: Date;

  @Field({ nullable: true })
  endDate?: Date;
}

@InputType()
export class UpdateListEntryInput {
  @Field(() => UserMediaStatus, { nullable: true })
  status?: UserMediaStatus;

  @Field(() => Float, { nullable: true })
  score?: number;

  @Field(() => Int, { nullable: true })
  progress?: number;

  @Field({ nullable: true })
  notes?: string;

  @Field({ nullable: true })
  startDate?: Date;

  @Field({ nullable: true })
  endDate?: Date;
}

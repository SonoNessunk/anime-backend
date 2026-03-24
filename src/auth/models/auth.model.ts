import { Field, Int, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class UserModel {
  @Field(() => Int)
  id: number;

  @Field()
  username: string;

  @Field()
  email: string;

  @Field({ nullable: true })
  avatar?: string;

  @Field({ nullable: true })
  bio?: string;

  @Field()
  isAdmin: boolean;

  @Field()
  createdAt: Date;
}

@ObjectType()
export class AuthPayload {
  @Field()
  accessToken: string;
  // il JWT token che il client salva e manda in ogni richiesta

  @Field(() => UserModel)
  user: UserModel;
}

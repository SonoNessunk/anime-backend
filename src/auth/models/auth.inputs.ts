import { Field, InputType } from '@nestjs/graphql';

@InputType()
// @InputType = tipo usato come argomento nelle mutation (diverso da @ObjectType che è il return)
export class RegisterInput {
  @Field()
  username: string;

  @Field()
  email: string;

  @Field()
  password: string;
}

@InputType()
export class LoginInput {
  @Field()
  email: string;

  @Field()
  password: string;
}

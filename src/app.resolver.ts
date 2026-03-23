import { Query, Resolver } from '@nestjs/graphql';

@Resolver()
export class AppResolver {
  @Query(() => String)
  // @Query dice a GraphQL che questo metodo è una query
  // () => String specifica il tipo di ritorno (String GraphQL)
  hello(): string {
    return 'Hello from GraphQL!';
  }
}

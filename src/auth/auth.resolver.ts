import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthPayload, UserModel } from './models/auth.model';
import { RegisterInput, LoginInput } from './models/auth.inputs';
import { CurrentUser } from './current-user.decorator';
import { GqlAuthGuard } from './gql-auth.guard';

@Resolver()
export class AuthResolver {
  constructor(private authService: AuthService) {}

  @Mutation(() => AuthPayload)
  async register(@Args('input') input: RegisterInput): Promise<AuthPayload> {
    return this.authService.register(input);
  }

  @Mutation(() => AuthPayload)
  async login(@Args('input') input: LoginInput): Promise<AuthPayload> {
    return this.authService.login(input);
  }

  @Query(() => UserModel)
  @UseGuards(GqlAuthGuard)
  // @UseGuards attiva il guard JWT — se il token non è valido, la query ritorna 401
  async me(@CurrentUser() user: UserModel): Promise<UserModel> {
    // @CurrentUser è un decorator custom che estrae l'utente dalla request
    return user;
  }
}

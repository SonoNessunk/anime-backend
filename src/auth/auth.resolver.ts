import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthPayload, UserModel } from './models/auth.model';
import { RegisterInput, LoginInput } from './models/auth.inputs';
import { CurrentUser } from './current-user.decorator';
import { GqlAuthGuard } from './gql-auth.guard';
import { PrismaService } from '../prisma/prisma.service';

@Resolver()
export class AuthResolver {
  constructor(
    private authService: AuthService,
    private prisma: PrismaService,
  ) {}

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

  @Query(() => [UserModel])
  @UseGuards(GqlAuthGuard)
  async users(@CurrentUser() user: any) {
    if (!user.isAdmin) throw new Error('Non autorizzato');
    return this.prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
      // null → undefined per compatibilità con UserModel
      select: {
        id: true,
        username: true,
        email: true,
        avatar: true,
        bio: true,
        isAdmin: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }
}

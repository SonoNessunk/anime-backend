import { UseGuards } from '@nestjs/common';
import { Args, Int, Mutation, Query, Resolver } from '@nestjs/graphql';
import { UserMediaStatus } from '../../generated/prisma';
import { CurrentUser } from '../auth/current-user.decorator';
import { GqlAuthGuard } from '../auth/gql-auth.guard';
import {
  AddToListInput,
  UpdateListEntryInput,
} from './models/user-list.inputs';
import { UserMediaEntryModel } from './models/user-list.model';
import { UserListService } from './user-list.service';

interface AuthUser {
  id: number;
  email: string;
  username: string;
  isAdmin: boolean;
}

@Resolver()
@UseGuards(GqlAuthGuard)
// @UseGuards a livello di classe = tutte le query/mutation di questo resolver richiedono auth
export class UserListResolver {
  constructor(private userListService: UserListService) {}

  @Query(() => [UserMediaEntryModel])
  async myList(
    @CurrentUser() user: AuthUser,
    @Args('status', { type: () => UserMediaStatus, nullable: true })
    status?: UserMediaStatus,
  ) {
    return this.userListService.getUserList(user.id, status);
  }

  @Mutation(() => UserMediaEntryModel)
  async addToList(
    @CurrentUser() user: AuthUser,
    @Args('input') input: AddToListInput,
  ) {
    return this.userListService.addToList(user.id, input);
  }

  @Mutation(() => UserMediaEntryModel)
  async updateListEntry(
    @CurrentUser() user: AuthUser,
    @Args('mediaId', { type: () => Int }) mediaId: number,
    @Args('input') input: UpdateListEntryInput,
  ) {
    return this.userListService.updateEntry(user.id, mediaId, input);
  }

  @Mutation(() => Boolean)
  async removeFromList(
    @CurrentUser() user: AuthUser,
    @Args('mediaId', { type: () => Int }) mediaId: number,
  ) {
    return this.userListService.removeFromList(user.id, mediaId);
  }
}

import { Module } from '@nestjs/common';
import { UserListResolver } from './user-list.resolver';
import { UserListService } from './user-list.service';

@Module({
  providers: [UserListResolver, UserListService],
})
export class UserListModule {}

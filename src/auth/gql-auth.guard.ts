import { ExecutionContext, Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { GqlExecutionContext } from '@nestjs/graphql';

@Injectable()
export class GqlAuthGuard extends AuthGuard('jwt') {
  // Sovrascriviamo getRequest per restituire la request Fastify dal context GraphQL
  // di default AuthGuard cerca la request HTTP standard, ma con GraphQL è diverso
  getRequest(context: ExecutionContext) {
    const ctx = GqlExecutionContext.create(context);
    return ctx.getContext().request;
    // ctx.getContext().request è la request Fastify che contiene gli headers
  }
}

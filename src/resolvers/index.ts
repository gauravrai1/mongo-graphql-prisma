import {postsResolvers} from './posts';
import {usersResolvers} from './users';
import {commentsResolvers} from './comments';
import { DateTimeResolver } from 'graphql-scalars'

export const resolvers = {
  User: {
    ...usersResolvers.User,
  },
  Post: {
    ...postsResolvers.Post,
  },
  Comment: {
    ...commentsResolvers.Comment,
  },
  Query: {
    ...postsResolvers.Query,
    ...usersResolvers.Query,
    ...commentsResolvers.Query
  },
  Mutation: {
    ...usersResolvers.Mutation,
    ...postsResolvers.Mutation,
    ...commentsResolvers.Mutation
  },
  DateTime: DateTimeResolver,
};
import { Context } from '../context'

export const usersResolvers = {
    Query: {
      allUsers: (_parent, _args, context: Context) => {
        return context.prisma.user.findMany()
      },
      userById: (_parent, args: { id: number }, context: Context) => {
        return context.prisma.user.findUnique({
          where: {
            id: args.id || undefined
          },
        })
      }
    },
    Mutation: {
      signupUser: (
        _parent,
        args: { data: UserCreateInput },
        context: Context,
      ) => {
  
        return context.prisma.user.create({
          data: {
            firstName: args.data.firstName,
            email: args.data.email,
            lastName: args.data.lastName,
          },
        })
      },
      updateFirstName: (
        _parent,
        args: { data: UserUpdateFirstNameInput },
        context: Context,
      ) => {
        return context.prisma.user.update({
          where: {
            id: args.data.userId,
          },
          data: {
            firstName: args.data.firstName,
          },
        })
      },
      updateLastName: (
        _parent,
        args: { data: UserUpdateLastNameInput },
        context: Context,
      ) => {
        return context.prisma.user.update({
          where: {
            id: args.data.userId,
          },
          data: {
            lastName: args.data.lastName,
          },
        })
      }
    },
    User: {
      posts: (parent, _args, context: Context) => {
        return context.prisma.user
          .findUnique({
            where: { id: parent?.id },
          })
          .posts()
      },
      comments: (parent, _args, context: Context) => {
        return context.prisma.user
          .findUnique({
            where: { id: parent?.id },
          })
          .comments()
      }
    }
  }

interface UserCreateInput {
    email: string
    firstName: string
    lastName?: string
  }

interface UserUpdateFirstNameInput {
    userId: number
    firstName: string
}

interface UserUpdateLastNameInput {
    userId: number
    lastName: string
}
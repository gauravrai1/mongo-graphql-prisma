import { Context } from '../context'

export const postsResolvers = {
    Query: {
      postsByUser: (
        _parent,
        args: { userId: number },
        context: Context,
      ) => {
        return context.prisma.user
          .findUnique({
            where: {
              id: args.userId},
          })
          .posts({
            where: {
              published: true,
            },
          })
      },
      draftsByUser: (
        _parent,
        args: { userId: number },
        context: Context,
      ) => {
        return context.prisma.user
          .findUnique({
            where: {
              id: args.userId
            },
          })
          .posts({
            where: {
              published: false,
            },
          })
      },
      postById: (_parent, args: { id: number }, context: Context) => {
        return context.prisma.post.findUnique({
          where: { id: args.id || undefined },
        })
      },
      feed: (
        _parent,
        args: {
          searchString: string
          skip: number
          take: number
          orderBy: PostOrderByUpdatedAtInput
        },
        context: Context,
      ) => {
        const or = args.searchString
          ? {
              OR: [
                { content: { contains: args.searchString } },
              ],
            }
          : {}
  
        return context.prisma.post.findMany({
          where: {
            published: true,
            ...or,
          },
          take: args?.take,
          skip: args?.skip,
          orderBy: args?.orderBy,
        })
      }
    },
    Mutation: {
      createDraft: (
        _parent,
        args: { data: PostCreateInput},
        context: Context,
      ) => {
        return context.prisma.post.create({
          data: {
            content: args.data.content,
            author: {
              connect: { id: args.data.userId },
            },
            published: args.data.published || false,
          },
        })
      },
      togglePublishPost: async (
        _parent,
        args: { id: number },
        context: Context,
      ) => {
        try {
          const post = await context.prisma.post.findUnique({
            where: { id: args.id || undefined },
            select: {
              published: true,
            },
          })
  
          return context.prisma.post.update({
            where: { id: args.id || undefined },
            data: { published: !post?.published },
          })
        } catch (error) {
          throw new Error(
            `Post with ID ${args.id} does not exist in the database.`,
          )
        }
      },
      deletePost: (_parent, args: { id: number }, context: Context) => {
        return context.prisma.post.delete({
          where: { id: args.id },
        })
      },
      updatePost: (_parent, args: { data: PostUpdateInput }, context: Context) => {
        return context.prisma.post.update({
          where: { id: args.data.postId },
          data: {
            content: args.data.content,
          },
        })
      }
    },
    Post: {
      author: (parent, _args, context: Context) => {
        return context.prisma.post
          .findUnique({
            where: { id: parent?.id },
          })
          .author()
      },
      comments: (parent, _args, context: Context) => {
        return context.prisma.post
          .findUnique({
            where: { id: parent?.id },
          })
          .comments()
      }
    }
}
  
  enum SortOrder {
    asc = 'asc',
    desc = 'desc',
  }
  
  interface PostOrderByUpdatedAtInput {
    updatedAt: SortOrder
  }

  interface PostUpdateInput {
    postId: number
    content: string
  }
  
  interface PostCreateInput {
    content: string
    published?: boolean
    userId: number
  }
import { Context } from '../context'
import { checkAuth } from '../utils/auth-check'
const { UserInputError } = require('apollo-server');

export const postsResolvers = {
    Query: {
      postsByUser: async (
        _parent,
        args: { userId: number },
        context: Context,
      ) => {

        // Checking if user is authenticated
        checkAuth(context);

        // Fetching user by id to check if user exists
        const queriedUser = await context.prisma.user.findUnique({
            where: {
                id: args.userId || undefined
            }
        })

        // Checking if user exists
        if (queriedUser) {

            // Returning posts by user id
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

        } else {

            // Throwing error if user does not exist
            throw new UserInputError('User not found')
        }
      },
      draftsByUser: (
        _parent,
        args: { userId: number },
        context: Context,
      ) => {

        // Checking if user is authenticated
        checkAuth(context);

        // Returning drafts by user id
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
      postById: async (_parent, args: { id: number }, context: Context) => {

        // Checking if user is authenticated
        checkAuth(context);

        // Returning post by id
        const post = await context.prisma.post.findUnique({
          where: { id: args.id || undefined },
        })

        // Checking if post exists
        if (post) {
            return post
        } else {
            throw new UserInputError('Post not found')
        }
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

        // Checking if user is authenticated
        checkAuth(context);

        // Generating clauseable object
        const or = args.searchString
          ? {
              OR: [
                { content: { contains: args.searchString } },
              ],
            }
          : {}
  
        // Returning posts by user id and search string if provided 
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
        args: { content: string, published?: boolean },
        context: Context,
      ) => {

        // Validating user input
        if (args.content.trim() === '') {
            throw new UserInputError('Content cannot be empty')
        }

        // Checking if user is authenticated
        const user = checkAuth(context);

        // Creating draft
        return context.prisma.post.create({
          data: {
            content: args.content,
            author: {
              connect: { id: user.id },
            },
            published: args.published || false,
          },
        })

      },
      togglePublishPost: async (
        _parent,
        args: { id: number },
        context: Context,
      ) => {
        try {

            // Checking if user is authenticated
            const user = checkAuth(context);

            // Fetching post by id
            const post = await context.prisma.post.findUnique({
                where: {   
                    id: args.id || undefined
                }
            })

            // Checking if post exists
            if (!post) {
                throw new UserInputError('Post not found')
            }

            // Checking if user is the author of the post
            if (post.authorId !== user.id) {
                throw new UserInputError('Action not allowed')
            }
            
            // publishing status to toggle true
            await context.prisma.post.findUnique({
                where: { id: args.id || undefined },
                select: {
                    published: true,
                },
            })
    
            // Updating post published status
            return context.prisma.post.update({
                where: { id: args.id || undefined },
                data: { published: !post?.published },
            })

        } catch (error) {
          throw new UserInputError(
            `Post with ID ${args.id} does not exist in the database.`,
          )
        }
      },
      deletePost: async (_parent, args: { id: number }, context: Context) => {

        // Checking if user is authenticated
        const user = checkAuth(context);

        // fetching post by id
        const post = await context.prisma.post.findUnique({
            where: { id: args.id || undefined },
        })

        // Checking if post exists
        if (!post) {
            throw new UserInputError('Post not found')
        }

        // Checking if user is the author of the post
        if (post.authorId !== user.id) {
            throw new UserInputError('Action not allowed')
        }

        // Deleting post
        return context.prisma.post.delete({
          where: { id: args.id },
        })
      },
      updatePost: async (_parent, args: { data: PostUpdateInput }, context: Context) => {

        // Checking if user is authenticated
        const user = checkAuth(context);

        // Fetching post by id
        const post = await context.prisma.post.findUnique({
            where: { id: args.data.postId || undefined },
        })

        // Checking if post exists
        if (!post) {
            throw new UserInputError('Post not found')
        }

        // Checking if user is the author of the post
        if (post.authorId !== user.id) {
            throw new UserInputError('Action not allowed')
        }

        // Updating post content
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

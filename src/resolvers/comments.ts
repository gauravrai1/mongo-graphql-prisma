import { Context } from '../context'
import { checkAuth } from '../utils/auth-check'
const { UserInputError } = require('apollo-server');

export const commentsResolvers = {
    Query: {
      commentsOfPost: async (_parent, args: { id: number }, context: Context) => {

        // Checking if user is authenticated
        checkAuth(context);

        // fetching post by id
        const post = context.prisma.post.findUnique({
          where: {
            id: args.id || undefined
          },
        })

        // Checking if post exists
        if (!post) {
          throw new UserInputError('Post not found')
        }

        // Returning comments of post
        return context.prisma.comment.findMany({
          where: {
            postId: args.id || undefined,
          },
        })
      },
      commentById: async (_parent, args: { id: number }, context: Context) => {

        // Checking if user is authenticated
        const user = checkAuth(context);

        // Returning comment by id
        const comment = await context.prisma.comment.findUnique({
          where: {
            id: args.id || undefined,
          },
        })

        // Checking if comment exists
        if(!comment) {
          return comment
        } else {
          throw new UserInputError('Comment not found')
        }
  
      },
      commentByReplyTo: (_parent, args: { replyToId: number }, context: Context) => {

        // Checking if user is authenticated
        checkAuth(context);

        // Returning comment by replyToId
        return context.prisma.comment.findMany({
          where: {
            replytoId: args.replyToId || undefined,
          },
        })
      }
    },
    Mutation: {
      createComment: async (
        _parent,
        args: { data: CommentCreateInput},
        context: Context,
      ) => {

        // Checking if user is authenticated
        const user = checkAuth(context);

        // Validating comment data
        if (args.data.content.trim() === '') {
          throw new UserInputError('Comment body must not be empty')
        }

        // Fetching post by id to check if post exists
        const post = await context.prisma.post.findUnique({
          where: {
            id: args.data.postId || undefined
          },
        })

        // Checking if post exists
        if (!post) {
          throw new UserInputError('Post not found')
        }

        // checking is replyToId is a valid comment
        if (args.data.replyTo) {
          const replyToComment = await context.prisma.comment.findUnique({
            where: {
              id: args.data.replyTo || undefined
            },
          })

          // Checking if replyToComment exists
          if (!replyToComment) {
            throw new UserInputError('Reply to Comment not found')
          }

          // Creating comment with replyToId
          const comment = await context.prisma.comment.create({
            data: {
              content: args.data.content,
              post: {
                connect: { id: args.data.postId },
              },
              author: {
                connect: { id: user.id },
              },
              replyto: {
                connect: { id: args.data.replyTo },
              },
            },
          })

          // Pushing new comment event
          await context.pubsub.publish('NEW_COMMENT', {
            newComment: comment
          });

        return comment

        } else {

          // Creating comment
          console.log(args.data.postId)
          const comment = await context.prisma.comment.create({
                data: {
                  content: args.data.content,
                  post: {
                    connect: { id: args.data.postId },
                  },
                  author: {
                    connect: { id: user.id },
                  }
                },
          })

          // publishing new comment event
          await context.pubsub.publish('NEW_COMMENT', {
            newComment: comment
          });

          return comment

        }
      },
      deleteComment: async (_parent, args: { id: number }, context: Context) => {

        // Checking if user is authenticated
        const user = checkAuth(context);

        // Fetching comment by id
        const comment = await context.prisma.comment.findUnique({
          where: {
            id: args.id || undefined
          },
        })

        // Checking if comment exists
        if (!comment) {
          throw new UserInputError('Comment not found')
        }

        // Checking if user is the author of the comment
        if (comment.authorId !== user.id) {
          throw new UserInputError('Action not allowed')
        }

        // Deleting comment
        return context.prisma.comment.delete({
          where: { id: args.id },
        })
      },
      updateComment: async (_parent, args: {data: CommentUpdateInput}, context: Context) => {

        // Checking if user is authenticated
        const user = checkAuth(context);

        // Fetching comment by id
        const comment = await context.prisma.comment.findUnique({
          where: {
            id: args.data.commentId || undefined
          },
        })

        // Checking if comment exists
        if (!comment) {
          throw new UserInputError('Comment not found')
        }

        // Checking if user is the author of the comment
        if (comment.authorId !== user.id) {
          throw new UserInputError('Action not allowed')
        }

        // Updating comment
        return context.prisma.comment.update({
            where: {
              id: args.data.commentId,
            },
            data: {
              content: args.data.content,
            },
          })
      }
    },
    Subscription: {
      newComment: {
        subscribe: (_, __, { pubsub }) => pubsub.asyncIterator('NEW_COMMENT')
      }
    },
    Comment: {
        replyto: (parent, _args, context: Context) => {
            return context.prisma.comment
                .findUnique({
                where: { id: parent?.id },
                })
                .replyto()
            },
        replies: (parent, _args, context: Context) => {
            return context.prisma.comment
                .findUnique({
                where: { id: parent?.id },
                })
                .replies()
            },
        post: (parent, _args, context: Context) => {
          return context.prisma.comment
            .findUnique({
              where: { id: parent?.id },
            })
            .post()
        },
        author: (parent, _args, context: Context) => {
          return context.prisma.comment
            .findUnique({
              where: { id: parent?.id },
            })
            .author()
        },
    }
  }
  
  interface CommentCreateInput {
    content: string
    postId: number
    replyTo?: number
  }

  interface CommentUpdateInput {
    commentId: number
    content: string
  }
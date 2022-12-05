import { Context } from '../context'

export const commentsResolvers = {
    Query: {
      commentsOfPost: (_parent, args: { id: number }, context: Context) => {
        return context.prisma.comment.findMany({
          where: {
            postId: args.id || undefined,
          },
        })
      },
      commentById: (_parent, args: { id: number }, context: Context) => {
        return context.prisma.comment.findUnique({
          where: {
            id: args.id || undefined,
          },
        })
      },
      commentByReplyTo: (_parent, args: { replyToId: number }, context: Context) => {
        return context.prisma.comment.findMany({
          where: {
            replytoId: args.replyToId || undefined,
          },
        })
      }
    },
    Mutation: {
      createComment: (
        _parent,
        args: { data: CommentCreateInput},
        context: Context,
      ) => {
        if (args.data.replyTo) {
            return context.prisma.comment.create({
                data: {
                  content: args.data.content,
                  post: {
                    connect: { id: args.data.postId },
                  },
                  author: {
                    connect: { id: args.data.authorId },
                  },
                  replyto: {
                    connect: { id: args.data.replyTo },
                  },
                },
              })
        } else {
            return context.prisma.comment.create({
                data: {
                  content: args.data.content,
                  post: {
                    connect: { id: args.data.postId },
                  },
                  author: {
                    connect: { id: args.data.authorId },
                  }
                },
              })
        }
      },
      deleteComment: (_parent, args: { id: number }, context: Context) => {
        return context.prisma.comment.delete({
          where: { id: args.id },
        })
      },
      updateComment:  (_parent, args: {data: CommentUpdateInput}, context: Context) => {
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
        
    }
  }
  
  interface CommentCreateInput {
    content: string
    postId: number
    authorId: number
    replyTo?: number
  }

  interface CommentUpdateInput {
    commentId: number
    content: string
  }
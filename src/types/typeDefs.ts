export const typeDefs = `#graphql

  type Mutation {
    signupUser(data: UserCreateInput!): User!
    updateFirstName(data: UserUpdateFirstNameInput!): User!
    updateLastName(data: UserUpdateLastNameInput!): User!
    createDraft(data: PostCreateInput!): Post
    togglePublishPost(id: Int!): Post
    deletePost(id: Int!): Post
    updatePost(data: PostUpdateInput!): Post
    createComment(data: CommentCreateInput!): Comment
    deleteComment(id: Int!): Comment
    updateComment(data: CommentUpdateInput!): Comment
  }

  type Comment {
    authorId: Int!
    content: String!
    createdAt: DateTime!
    id: Int!
    post: Post!
    author: User!
    replyto: Comment
    replies: [Comment!]
  }

  input CommentUpdateInput {
    commentId: Int!
    content: String!
  }

  input CommentCreateInput {
    content: String!
    postId: Int!
    authorId: Int!
    replyTo: Int
  }

  type Post {
    id: Int!
    author: User!
    content: String!
    createdAt: DateTime!
    published: Boolean!
    updatedAt: DateTime!
    comments: [Comment!]
  }

  input PostCreateInput {
    content: String
    published: Boolean
    authorId: Int!
  }

  input PostUpdateInput {
    postId: Int!
    content: String!
  }

  input PostOrderByUpdatedAtInput {
    updatedAt: SortOrder!
  }

  type Query {
    allUsers: [User!]!
    userById(id: Int!): User
    postsByUser(userId: Int!): [Post]
    draftsByUser(userId: Int!): [Post]
    postById(id: Int): Post
    feed(
      orderBy: PostOrderByUpdatedAtInput
      searchString: String
      skip: Int
      take: Int
    ): [Post!]!
    commentsOfPost(postId: Int!): [Comment!]!
    commentById(id: Int!): Comment
    commentByReplyTo(replyToId: Int!): [Comment!]!
  }

  enum SortOrder {
    asc
    desc
  }

  type User {
    email: String!
    id: Int!
    firstName: String
    lastName: String
    posts: [Post!]
    comments: [Comment!]
  }

  input UserCreateInput {
    firstName: String
    lastName: String
    email: String!
  }

  input UserUpdateFirstNameInput {
    userId: Int!
    firstName: String!
  }

  input UserUpdateLastNameInput {
    userId: Int!
    lastName: String!
  }

  type Subscription {
    newComment: Comment!
  }

  scalar DateTime
`

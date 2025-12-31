/**
 * GraphQL Schema Definition
 */

import { buildSchema } from 'graphql';

export const schema = buildSchema(`
  type User {
    id: ID!
    email: String!
    username: String
    name: String
    role: String!
    plan: String!
    credits: Int!
    avatarUrl: String
    bio: String
    createdAt: String!
    posts: [Post!]
    jobs: [Job!]
    followers: [User!]
    following: [User!]
  }

  type Job {
    id: ID!
    userId: ID!
    type: String!
    status: String!
    progress: Int!
    prompt: String!
    provider: String!
    outputUrl: String
    error: String
    createdAt: String!
    completedAt: String
    user: User!
  }

  type Post {
    id: ID!
    authorId: ID!
    title: String
    content: String!
    mediaUrl: String
    createdAt: String!
    updatedAt: String!
    author: User!
    likes: [Like!]
    comments: [Comment!]
    likesCount: Int!
    commentsCount: Int!
  }

  type Comment {
    id: ID!
    postId: ID!
    authorId: ID!
    content: String!
    createdAt: String!
    author: User!
    post: Post!
  }

  type Like {
    id: ID!
    userId: ID!
    postId: ID!
    createdAt: String!
    user: User!
    post: Post!
  }

  type Provider {
    id: ID!
    name: String!
    category: String!
    description: String!
    pricing: String!
    apiStatus: String!
    models: [String!]
  }

  type Analytics {
    totalUsers: Int!
    activeUsers: Int!
    totalJobs: Int!
    completedJobs: Int!
    failedJobs: Int!
    totalPosts: Int!
    revenue: Float!
  }

  type PlatformStats {
    providers: Int!
    models: Int!
    users: Int!
    jobs: Int!
    posts: Int!
  }

  input CreateJobInput {
    type: String!
    prompt: String!
    provider: String!
    settings: String
  }

  input CreatePostInput {
    title: String
    content: String!
    mediaUrl: String
    tags: [String!]
  }

  input UpdateUserInput {
    username: String
    name: String
    bio: String
    avatarUrl: String
  }

  type AuthPayload {
    user: User!
    accessToken: String!
    refreshToken: String!
  }

  type Query {
    # User queries
    me: User
    user(id: ID!): User
    users(limit: Int, offset: Int): [User!]!

    # Job queries
    job(id: ID!): Job
    jobs(status: String, type: String, limit: Int): [Job!]!
    myJobs(limit: Int): [Job!]!

    # Post queries
    post(id: ID!): Post
    posts(limit: Int, offset: Int): [Post!]!
    feed(limit: Int, offset: Int): [Post!]!

    # Provider queries
    providers: [Provider!]!
    provider(id: ID!): Provider
    providersByCategory(category: String!): [Provider!]!

    # Analytics
    analytics: Analytics!
    platformStats: PlatformStats!

    # Search
    searchPosts(query: String!, limit: Int): [Post!]!
    searchUsers(query: String!, limit: Int): [User!]!
  }

  type Mutation {
    # Authentication
    register(email: String!, password: String!, name: String): AuthPayload!
    login(email: String!, password: String!): AuthPayload!

    # User mutations
    updateProfile(input: UpdateUserInput!): User!
    followUser(userId: ID!): Boolean!
    unfollowUser(userId: ID!): Boolean!

    # Job mutations
    createJob(input: CreateJobInput!): Job!
    cancelJob(jobId: ID!): Boolean!

    # Post mutations
    createPost(input: CreatePostInput!): Post!
    updatePost(postId: ID!, content: String!): Post!
    deletePost(postId: ID!): Boolean!
    likePost(postId: ID!): Boolean!
    unlikePost(postId: ID!): Boolean!

    # Comment mutations
    createComment(postId: ID!, content: String!): Comment!
    deleteComment(commentId: ID!): Boolean!

    # Admin mutations
    updateUserCredits(userId: ID!, credits: Int!): User!
    updateUserPlan(userId: ID!, plan: String!): User!
  }

  type Subscription {
    jobProgress(jobId: ID!): Job!
    newPost: Post!
    newNotification: String!
  }
`);

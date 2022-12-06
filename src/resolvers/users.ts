import { Context } from '../context'
import * as bcrpyt from "bcryptjs";
import * as jwt from "jsonwebtoken";
import { validateRegisterInput, validateLoginInput } from '../utils/validators'
import { checkAuth } from '../utils/auth-check'
const { UserInputError } = require('apollo-server');

function generateToken(user) {
  const SECRET_KEY  = process.env.SECRET_KEY;
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
    },
    SECRET_KEY,
    { expiresIn: '36h' }
  );
}

export const usersResolvers = {
    Query: {
      allUsers: (_parent, _args, context: Context) => {

        // Checking if user is authenticated
        const user = checkAuth(context);

        // Returning all users
        return context.prisma.user.findMany()
      },
      userById: (_parent, args: { id: number }, context: Context) => {

        // Checking if user is authenticated
        const user = checkAuth(context);

        // Returning user by id
        return context.prisma.user.findUnique({
          where: {
            id: args.id || undefined
          },
        })
      },
    },
    Mutation: {
      login: async (_parent, args: { email: string, password: string }, context: Context) => {

        // Validate user data
        const { email, password } = args;
        const { valid, errors } = validateLoginInput(email, password);
        if (!valid) {
          throw new UserInputError('Errors', { errors });
        }

        // Checking if user exists
        const user = await context.prisma.user.findUnique({
          where: {
            email: email
          }
        })
        if (!user) {
          errors["general"] = 'User not found';
          throw new UserInputError('User not found', { errors });
        }

        // Validating password
        const match = await bcrpyt.compare(password, user.password);
        if (!match) {
          errors["general"] = 'Wrong credentials';
          throw new UserInputError('Wrong credentials', { errors });
        }

        // Generating session token
        const token = generateToken(user);

        // Returning user data
        return {
          ...user,
          token,
        };
      },
      signupUser: async (
        _parent,
        args: { data: RegisterInput },
        context: Context,
      ) => {

        // Validate user data
        const { valid, errors } = validateRegisterInput(
          args.data.email,
          args.data.password,
          args.data.confirmPassword 
        );

        if (!valid) {
          throw new UserInputError('Errors', { errors });
        }

        // Checking if user exists
        const user = await context.prisma.user.findUnique({ where: { email: args.data.email } });

        if (user) {
          throw new UserInputError('Email is taken', {
            errors: {
              email: 'This email is taken'
            }
          })
        }

        // Hashing password
        const password = await bcrpyt.hash(args.data.password, 12);

        // Creating user
        const Saveduser = await context.prisma.user.create({
          data: {
            firstName: args.data.firstName || undefined,
            email: args.data.email,
            lastName: args.data.lastName || undefined,
            password: password,
          },
        })

        // Generating session token
        const token = generateToken(Saveduser);

        // Returning user data with token to directly login
        return {
          ...Saveduser,
          token,
        }

      },
      updateFirstName: (
        _parent,
        args: { data: UserUpdateFirstNameInput },
        context: Context,
      ) => {

        // Checking if user is authenticated
        const user = checkAuth(context);

        // Validating user data
        if (args.data.firstName.trim() === '') {
          throw new UserInputError('First name must not be empty');
        }

        // Updating user's first name
        return context.prisma.user.update({
          where: {
            id: user.id,
          },
          data: {
            firstName: args.data.firstName,
          },
        })
      },
      updateLastName: async (
        _parent,
        args: { data: UserUpdateLastNameInput },
        context: Context,
      ) => {

        // Checking if user is authenticated
        const user = checkAuth(context);

        // Validating user data
        if (args.data.lastName.trim() === '') {
          throw new UserInputError('Last name must not be empty');
        }

        // Updating user's last name
        return context.prisma.user.update({
          where: {
            id: user.id,
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

interface RegisterInput {
  firstName?: string
  lastName?: string
  password: string
  confirmPassword: string
  email: string
}

interface UserUpdateFirstNameInput {
    firstName: string
}

interface UserUpdateLastNameInput {
    userId: number
    lastName: string
}
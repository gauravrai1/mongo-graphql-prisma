const { AuthenticationError } = require('apollo-server');
import * as jwt from "jsonwebtoken";

export const checkAuth = (context) => {
  const authHeader = context.req.headers.authorization;
  const SECRET_KEY  = process.env.SECRET_KEY;

  if (authHeader) {
    const token = authHeader.split('Bearer ')[1];
    if (token) {
      try {
        const user = jwt.verify(token, SECRET_KEY);
        return user;
      } catch (err) {
        throw new AuthenticationError('Invalid/Expired token');
      }
    }
    throw new Error("Authentication token must be 'Bearer [token]");
  }
  throw new Error('Authorization header must be provided');
};
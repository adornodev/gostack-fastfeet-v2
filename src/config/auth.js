import 'dotenv/config';

export default {
  secret: process.env.TOKEN_SECRET_KEY,
  expiresIn: process.env.TOKEN_EXPIRATION,
};

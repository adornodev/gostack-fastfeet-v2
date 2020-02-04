import 'dotenv/config';
export default {
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER_ID,
    pass: process.env.EMAIL_USER_PASSWORD,
  },
  default: {
    from: process.env.EMAIL_FROM,
  },
};

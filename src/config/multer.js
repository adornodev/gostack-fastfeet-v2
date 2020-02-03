import crypto from 'crypto';
import multer from 'multer';
import { extname, resolve } from 'path';

export default {
  storage: multer.diskStorage({
    destination: resolve(__dirname, '..', '..', 'tmp', 'uploads'),
    filename: (req, file, callback) => {
      crypto.randomBytes(16, (err, res) => {
        if (err) return callback(err);

        // O primeiro parâmetro é o erro. Como nesse caso não é de erro, coloca-se null
        return callback(null, res.toString('hex') + extname(file.originalname));
      });
    },
  }),
};

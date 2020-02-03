import cors from 'cors';
import express from 'express';
import 'express-async-errors';
import { resolve } from 'path';
import Youch from 'youch';
import './database';
import routes from './routes';

class App {
  constructor() {
    this.server = express();
    this.middleware();
    this.routes();
    this.exceptionHandler();
  }

  middleware() {
    this.server.use(cors());
    this.server.use(express.json());

    // Permite servir arquivos estáticos
    this.server.use(
      '/files',
      express.static(resolve(__dirname, '..', 'tmp', 'uploads'))
    );
  }

  routes() {
    this.server.use(routes);
  }

  exceptionHandler() {
    this.server.use(async (err, req, res, next) => {
      if (process.env.NODE_ENV === 'development') {
        const errors = await new Youch(err, req).toJSON();

        return res.status(500).json(errors);
      }

      return res.status(500).json({ error: 'Internal Server Error' });
    });
  }
}

export default new App().server;

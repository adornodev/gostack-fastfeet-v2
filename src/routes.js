import { Router } from 'express';
import RecipientController from './app/controllers/RecipientController';
import SessionController from './app/controllers/SessionController';
import UserController from './app/controllers/UserController';
import authMiddleware from './app/middlewares/auth';

const routes = Router();

routes.post('/sessions', SessionController.store);

routes.put('/users/:id', authMiddleware, UserController.update);
routes.post('/users', authMiddleware, UserController.store);
routes.get('/users', authMiddleware, UserController.index);

routes.post('/recipients', authMiddleware, RecipientController.store);
routes.put('/recipients/:id', authMiddleware, RecipientController.update);

export default routes;

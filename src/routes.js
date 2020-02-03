import { Router } from 'express';
import 'express-async-errors';
import multer from 'multer';
import DeliveryManController from './app/controllers/DeliveryManController';
import FileController from './app/controllers/FileController';
import OrderController from './app/controllers/OrderController';
import RecipientController from './app/controllers/RecipientController';
import SessionController from './app/controllers/SessionController';
import UserController from './app/controllers/UserController';
import authMiddleware from './app/middlewares/auth';
import multerConfig from './config/multer';

const routes = Router();
const upload = multer(multerConfig);

routes.post('/sessions', SessionController.store);

routes.put('/users/:id', authMiddleware, UserController.update);
routes.post('/users', authMiddleware, UserController.store);
routes.get('/users', authMiddleware, UserController.index);

routes.post('/recipients', authMiddleware, RecipientController.store);
routes.put('/recipients/:id', authMiddleware, RecipientController.update);

routes.post(
  '/files',
  authMiddleware,
  upload.single('file'),
  FileController.store
);

routes.post('/deliverymen', authMiddleware, DeliveryManController.store);
routes.put('/deliverymen/:id', authMiddleware, DeliveryManController.update);
routes.delete('/deliverymen/:id', authMiddleware, DeliveryManController.delete);
routes.get('/deliverymen/:id', authMiddleware, DeliveryManController.show);
routes.get('/deliverymen', authMiddleware, DeliveryManController.index);

routes.post('/order', authMiddleware, OrderController.store);
routes.put('/order/:id', authMiddleware, OrderController.update);
routes.delete('/order/:id', authMiddleware, OrderController.delete);
routes.get('/order/:id', authMiddleware, OrderController.show);
routes.get('/order', authMiddleware, OrderController.index);

export default routes;

import { Router } from 'express';
import 'express-async-errors';
import multer from 'multer';
import DeliveredController from './app/controllers/DeliveredController';
import DeliveryManController from './app/controllers/DeliveryManController';
import FileController from './app/controllers/FileController';
import OrderController from './app/controllers/OrderController';
import RecipientController from './app/controllers/RecipientController';
import SessionController from './app/controllers/SessionController';
import UserController from './app/controllers/UserController';
import WithdrawController from './app/controllers/WithdrawController';
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

routes.post('/orders', authMiddleware, OrderController.store);
routes.put('/orders/:id', authMiddleware, OrderController.update);
routes.delete('/orders/:id', authMiddleware, OrderController.delete);
routes.get('/orders/:id', authMiddleware, OrderController.show);
routes.get('/orders', authMiddleware, OrderController.index);

routes.put('/withdraws/:deliveryMan_id/:order_id', WithdrawController.update);
routes.put(
  '/delivereds/:deliveryMan_id/:order_id',
  upload.single('signature'),
  DeliveredController.update
);

export default routes;

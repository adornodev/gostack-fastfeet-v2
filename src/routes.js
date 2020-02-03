import { Router } from 'express';
import multer from 'multer';
import DeliveryManController from './app/controllers/DeliveryManController';
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
  '/deliverymen',
  authMiddleware,
  upload.single('avatar'),
  DeliveryManController.store
);
routes.put('/deliverymen/:id', authMiddleware, DeliveryManController.update);
routes.delete('/deliverymen/:id', authMiddleware, DeliveryManController.delete);
routes.get('/deliverymen/:id', authMiddleware, DeliveryManController.show);
routes.get('/deliverymen', authMiddleware, DeliveryManController.index);

export default routes;

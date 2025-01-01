import { Router } from 'express';
import validator from '../middlewares/validator';
import authSchema from '../schemas/auth.schema';
import { userController } from '../controllers/user.controller';

export class UserRoutes {
  router: Router;

  constructor() {
    this.router = Router();
    this.routes();
  }
  routes() {
    // REGISTER
    this.router.post(
      '/register',
      validator({ body: authSchema.signup }),
      userController.registerUser,
    );

    // LOGIN
    this.router.post(
      '/login',
      validator({ body: authSchema.credential }),
      userController.authenticateUser,
    );
  }
}
export const userRoutes = new UserRoutes();

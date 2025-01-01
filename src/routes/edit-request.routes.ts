import { Router } from 'express';
import validator from '../middlewares/validator';
import editRequestSchema from '../schemas/edit-request.schema';
import { authorizationMiddleware } from '../auth/authorization';
import { editRequestController } from '../controllers/edit-request.controller';
import authSchema from '../schemas/auth.schema';
import { authController } from '../controllers/auth.controller';

export class EditRequestRoutes {
  public router: Router;

  constructor() {
    this.router = Router();
    this.routes();
  }

  routes() {
    // PROTECTED ROUTES
    this.router.use(
      validator({ headers: authSchema.auth }),
      authController.authenticateJWT,
    );

    this.router.get(
      '/question/:questionId',
      authorizationMiddleware.authorization,
      validator({ params: editRequestSchema.editRequestId }),
      editRequestController.getEditRequestsQuestion,
    );

    this.router.get(
      '/answer/:answerId',
      authorizationMiddleware.authorization,
      validator({ params: editRequestSchema.editRequestId }),
      editRequestController.getEditRequestsAnswer,
    );

    this.router.get(
      '/:id',
      authorizationMiddleware.authorization,
      validator({ params: editRequestSchema.editRequestId }),
      editRequestController.getEditRequest,
    );

    this.router.post(
      '/question/:questionId',
      authorizationMiddleware.authorization,
      validator({
        body: editRequestSchema.editRequestQuestion,
        params: editRequestSchema.editRequestId,
      }),
      editRequestController.createEditRequestQuestion,
    );
    this.router.post(
      '/answer/:answerId',
      authorizationMiddleware.authorization,
      validator({
        body: editRequestSchema.editRequestAnswer,
        params: editRequestSchema.editRequestId,
      }),
      editRequestController.createEditRequestAnswer,
    );

    this.router.patch(
      '/answer/:answerId/:id',
      authorizationMiddleware.authorization,
      validator({
        params: editRequestSchema.editRequestId,
        body: editRequestSchema.editRequest,
      }),
      editRequestController.updateEditRequestAnswer,
    );

    this.router.patch(
      '/question/:questionId/:id',
      authorizationMiddleware.authorization,
      validator({
        params: editRequestSchema.editRequestId,
        body: editRequestSchema.editRequest,
      }),
      editRequestController.updateEditRequestQuestion,
    );
  }
}

export const editRequestRoutes = new EditRequestRoutes();

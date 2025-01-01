import { Router } from 'express';
import validator from '../middlewares/validator';
import answerSchema from '../schemas/answer.schema';
import restrict from '../middlewares/restrict';
import { authorizationMiddleware } from '../auth/authorization';
import { answerController } from '../controllers/answer.controller';
import authSchema from '../schemas/auth.schema';
import { authController } from '../controllers/auth.controller';

export class AnswerRoutes {
  public router: Router;

  constructor() {
    this.router = Router({ mergeParams: true });
    this.routes();
  }

  routes() {
    // PROTECTED ROUTES
    this.router.use(validator({ params: answerSchema.questionId }));

    // GET ALL ANSWERS
    this.router.get('/', answerController.getAnswers);

    // GET ANSWER BY ID
    this.router.get(
      '/:id',
      validator({ params: answerSchema.answerId }),
      answerController.getAnswer,
    );

    // CREATE ANSWER
    this.router.post(
      '/',
      validator({ headers: authSchema.auth }),
      authController.authenticateJWT,
      authorizationMiddleware.authorization,
      validator({ body: answerSchema.answerCreate }),
      answerController.createAnswer,
    );

    // UPDATE ANSWER BY ID
    this.router.patch(
      '/:id',
      validator({ headers: authSchema.auth }),
      authController.authenticateJWT,
      authorizationMiddleware.authorization,
      validator({
        params: answerSchema.answerId,
        body: answerSchema.answerUpdate,
      }),
      answerController.updateAnswer,
    );

    // DELETE ANSWER BY ID
    this.router.delete(
      '/:id',
      validator({ headers: authSchema.auth }),
      authController.authenticateJWT,
      authorizationMiddleware.authorization,
      validator({ params: answerSchema.answerId }),
      answerController.deleteAnswer,
    );
  }
}

export const answerRoutes = new AnswerRoutes();

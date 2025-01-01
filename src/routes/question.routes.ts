import { Router } from 'express';
import validator from '../middlewares/validator';
import questionSchema from '../schemas/question.schema';
import { authorizationMiddleware } from '../auth/authorization';
import { questionController } from '../controllers/question.controller';
import authSchema from '../schemas/auth.schema';
import { authController } from '../controllers/auth.controller';

export class QuestionRoutes {
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

    // GET ALL QUESTIONS
    this.router.get(
      '/',
      authorizationMiddleware.authorization,
      validator({ query: questionSchema.questionAll }),
      questionController.getQuestions,
    );

    // GET QUESTION BY ID
    this.router.get(
      '/:id',
      authorizationMiddleware.authorization,
      validator({ params: questionSchema.questionId }),
      questionController.getQuestion,
    );

    // CREATE QUESTION
    this.router.post(
      '/',
      authorizationMiddleware.authorization,
      validator({ body: questionSchema.questionCreate }),
      questionController.createQuestion,
    );

    // UPDATE QUESTION BY ID
    this.router.patch(
      '/:id',
      authorizationMiddleware.authorization,
      validator({
        params: questionSchema.questionId,
        body: questionSchema.questionUpdate,
      }),
      questionController.updateQuestion,
    );

    // DELETE QUESTION BY ID
    this.router.delete(
      '/:id',
      authorizationMiddleware.authorization,
      validator({ params: questionSchema.questionId }),
      questionController.deleteQuestion,
    );
  }
}

export const questionRoutes = new QuestionRoutes();
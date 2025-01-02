import { Router } from 'express';
import validator from '../middlewares/validator';
import questionSchema from '../schemas/question.schema';
import { authorizationMiddleware } from '../auth/authorization';
import { questionController } from '../controllers/question.controller';
import authSchema from '../schemas/auth.schema';
import { authController } from '../controllers/auth.controller';
import { answerRoutes } from './answer.routes';
export class QuestionRoutes {
  public router: Router;

  constructor() {
    this.router = Router();
    this.routes();
  }

  routes() {
    this.router.use('/:questionId/answers', answerRoutes.router);

    // GET ALL QUESTIONS
    this.router.get(
      '/',
      validator({ query: questionSchema.questionAll }),
      questionController.getQuestions,
    );

    this.router.get(
      '/similar',
      validator({ query: questionSchema.questionAll }),
      questionController.getQuestionSimilar,
    );

    // GET QUESTION BY ID
    this.router.get(
      '/:id',
      validator({ params: questionSchema.questionId }),
      questionController.getQuestion,
    );

    // CREATE QUESTION
    this.router.post(
      '/',
      validator({ headers: authSchema.auth }),
      authController.authenticateJWT,
      authorizationMiddleware.authorization,
      validator({ body: questionSchema.questionCreate }),
      questionController.createQuestion,
    );

    // UPDATE QUESTION BY ID
    this.router.patch(
      '/:id',
      validator({ headers: authSchema.auth }),
      authController.authenticateJWT,
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
      validator({ headers: authSchema.auth }),
      authController.authenticateJWT,
      authorizationMiddleware.authorization,
      validator({ params: questionSchema.questionId }),
      questionController.deleteQuestion,
    );

    this.router.patch(
      '/:id/vote',
      validator({ headers: authSchema.auth }),
      authController.authenticateJWT,
      authorizationMiddleware.authorization,
      validator({
        params: questionSchema.questionId,
        body: questionSchema.vote,
      }),
      questionController.updateVoteQuestion,
    );
  }
}

export const questionRoutes = new QuestionRoutes();

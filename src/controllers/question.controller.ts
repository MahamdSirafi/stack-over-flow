import { Response, ParsedRequest } from 'express';
import {
  AuthFailureError,
  InternalError,
  NotFoundError,
} from '../core/ApiError';
import asyncHandler from '../middlewares/asyncHandler';
import { NextFunction } from 'express-serve-static-core';
import {
  QuestionFindOptions,
  questionRepository,
} from '../database/repositories/question.repository';
import {
  IQuestionAllSchema,
  IQuestionIdSchema,
  IQuestionCreateSchema,
  IQuestionUpdateSchema,
} from '../schemas/question.schema';
import { defaultOrderParams } from '../utils/order';
import { defaultPaginationParams } from '../utils/pagination';
import { needRecord } from '../utils/record';

export class QuestionController {
  // Get all Questions by author
  public getQuestions = asyncHandler(
    async (
      req: ParsedRequest<void, IQuestionAllSchema>,
      res: Response,
      next: NextFunction,
    ): Promise<void> => {
      const options: QuestionFindOptions = {
        filter: {
          search: req.valid.query.search,
        },
        order: defaultOrderParams(
          req.valid.query.orderColumn,
          req.valid.query.orderDirection,
        ),
        pagination: defaultPaginationParams(
          req.valid.query.page,
          req.valid.query.pageSize,
        ),
      };
      const questions = await questionRepository.findForAdmin(options);
      res.ok({ message: 'success', data: questions });
    },
  );

  // Get question by Id for authenticated user
  public getQuestion = asyncHandler(
    async (
      req: ParsedRequest<void, void, IQuestionIdSchema>,
      res: Response,
    ): Promise<void> => {
      const question = needRecord(
        await questionRepository.findById(req.valid.params.id),
        new NotFoundError('Question not found'),
      );

      res.ok({ message: 'success', data: question });
    },
  );

  // Create question handler
  public createQuestion = asyncHandler(
    async (
      req: ParsedRequest<IQuestionCreateSchema>,
      res: Response,
      next: NextFunction,
    ): Promise<void> => {
      console.log(req.user);
      const newQuestion = { ...req.valid.body, userId: req.user._id };
      const question = await questionRepository.insert(newQuestion);
      if (question === null) {
        throw new InternalError();
      }
      res.created({ message: 'Question has been created', data: question });
    },
  );

  // Update question by Id for authenticated user
  public updateQuestion = asyncHandler(
    async (
      req: ParsedRequest<IQuestionUpdateSchema, void, IQuestionIdSchema>,
      res: Response,
      next: NextFunction,
    ): Promise<void> => {
      const updateBody = req.valid.body;

      const question = needRecord(
        await questionRepository.findById(req.valid.params.id),
        new NotFoundError('Question not found'),
      );
      if (!req.user._id.equals(question.userId._id))
        throw new AuthFailureError('Permission denied');

      const data = await questionRepository.patchById(question.id, updateBody);

      res.ok({ message: 'Question has been updated', data });
    },
  );

  // Delete question by Id for authenticated user
  public deleteQuestion = asyncHandler(
    async (
      req: ParsedRequest<void, void, IQuestionIdSchema>,
      res: Response,
    ): Promise<void> => {
      const question = needRecord(
        await questionRepository.findById(req.valid.params.id),
        new NotFoundError('Question not found'),
      );

      if (!req.user._id.equals(question.userId._id))
        throw new AuthFailureError('Permission denied');

      await questionRepository.deleteById(question.id);
      res.noContent({ message: 'Question deleted successfully' });
    },
  );

  public updateVoteQuestion = asyncHandler(
    async (
      req: ParsedRequest<void, void, IQuestionIdSchema>,
      res: Response,
    ): Promise<void> => {
      const question = needRecord(
        await questionRepository.findById(req.valid.params.id),
        new NotFoundError('Question not found'),
      );

      if (question.voters.includes(req.user._id.toString()))
        throw new AuthFailureError('you have a vote');

      req.body.vote == '1' ? question.votes++ : question.votes--;
      question.voters.push(req.user._id.toString());
      await question.save();
      res.ok({ message: 'Question has been updated', data: question });
    },
  );
}

export const questionController = new QuestionController();

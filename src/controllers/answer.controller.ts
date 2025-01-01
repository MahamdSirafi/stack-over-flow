import { Response, ParsedRequest } from 'express';
import {
  AuthFailureError,
  InternalError,
  NotFoundError,
} from '../core/ApiError';
import asyncHandler from '../middlewares/asyncHandler';
import { NextFunction } from 'express-serve-static-core';
import { answerRepository } from '../database/repositories/answer.repository';
import {
  IAnswerIdSchema,
  IAnswerCreateSchema,
  IAnswerUpdateSchema,
} from '../schemas/answer.schema';
import { needRecord } from '../utils/record';

export class AnswerController {
  public getAnswers = asyncHandler(
    async (
      req: ParsedRequest,
      res: Response,
      next: NextFunction,
    ): Promise<void> => {
      const answers = await answerRepository.findBy({
        questionId: req.params.questionId,
      });
      res.ok({
        message: 'success',
        data: { results: answers, total: answers.length },
      });
    },
  );

  public getAnswer = asyncHandler(
    async (
      req: ParsedRequest<void, void, IAnswerIdSchema>,
      res: Response,
    ): Promise<void> => {
      const answer = needRecord(
        await answerRepository.findById(req.valid.params.id),
        new NotFoundError('Answer not found'),
      );

      res.ok({ message: 'success', data: answer });
    },
  );

  public createAnswer = asyncHandler(
    async (
      req: ParsedRequest<IAnswerCreateSchema>,
      res: Response,
      next: NextFunction,
    ): Promise<void> => {
      const newAnswer = {
        ...req.valid.body,
        userId: req.user._id.toString(),
        questionId: req.params.questionId.toString(),
      };
      const answer = await answerRepository.insert(newAnswer);
      if (answer === null) {
        throw new InternalError();
      }
      res.created({ message: 'Answer has been created', data: answer });
    },
  );

  public updateAnswer = asyncHandler(
    async (
      req: ParsedRequest<IAnswerUpdateSchema, void, IAnswerIdSchema>,
      res: Response,
      next: NextFunction,
    ): Promise<void> => {
      const updateBody = req.valid.body;

      const answer = needRecord(
        await answerRepository.findById(req.valid.params.id),
        new NotFoundError('Answer not found'),
      );
      if (!req.user._id.equals(answer.userId._id))
        throw new AuthFailureError('Permission denied');

      const data = await answerRepository.patchById(answer.id, updateBody);

      res.ok({ message: 'Answer has been updated', data });
    },
  );

  public deleteAnswer = asyncHandler(
    async (
      req: ParsedRequest<void, void, IAnswerIdSchema>,
      res: Response,
    ): Promise<void> => {
      const answer = needRecord(
        await answerRepository.findById(req.valid.params.id),
        new NotFoundError('Answer not found'),
      );

      if (!req.user._id.equals(answer.userId._id))
        throw new AuthFailureError('Permission denied');

      await answerRepository.deleteById(answer.id);
      res.noContent({ message: 'Answer deleted successfully' });
    },
  );

  public updateVoteAnswer = asyncHandler(
    async (
      req: ParsedRequest<void, void, IAnswerIdSchema>,
      res: Response,
    ): Promise<void> => {
      const answer = needRecord(
        await answerRepository.findById(req.valid.params.id),
        new NotFoundError('Answer not found'),
      );
      if (answer.voters.includes(req.user._id.toString()))
        throw new AuthFailureError('you have a vote');

      req.body.vote == '1' ? answer.votes++ : answer.votes--;
      answer.voters.push(req.user._id.toString());
      await answer.save();
      res.ok({ message: 'Answer has been updated', data: answer });
    },
  );
}

export const answerController = new AnswerController();

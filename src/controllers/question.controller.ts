import { Response, ParsedRequest } from 'express';
import {
  AuthFailureError,
  InternalError,
  NoDataError,
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
import axios from 'axios';
import { env_vars } from '../config';
import Logger from '../core/Logger';
import { Env } from '../utils/enum';
import { answerRepository } from '../database/repositories/answer.repository';
import { TfIdf } from 'natural';
import { getOpenAIResponse } from '../openAI';

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

  public createQuestion = asyncHandler(
    async (
      req: ParsedRequest<IQuestionCreateSchema>,
      res: Response,
      next: NextFunction,
    ): Promise<void> => {
      const newQuestion = { ...req.valid.body, userId: req.user._id };
      const question = await questionRepository.insert(newQuestion);
      if (question === null) {
        throw new InternalError();
      }
      const answer = await getOpenAIResponse(question);
      if (answer) {
        await answerRepository.insert(answer);
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

  public getQuestionSimilar = asyncHandler(
    async (
      req: ParsedRequest<void, IQuestionAllSchema>,
      res: Response,
    ): Promise<void> => {
      const question = await this.findSimilarQuestions(
        req.valid.query.search as string,
      );

      res.ok({
        message: 'success',
        data: { results: question, total: question.length },
      });
    },
  );

  public findSimilarQuestions = async (inputText: string) => {
    const tfidfInput = new TfIdf();
    tfidfInput.addDocument(inputText);

    const inputVector = tfidfInput.listTerms(0).map((term) => term.tfidf);

    const questions = await questionRepository.findAll();

    const similarQuestions = questions
      .map((question) => {
        const similarity = this.calculateCosineSimilarity(
          inputVector,
          question.vector,
        );
        return { question, similarity };
      })
      .sort((a, b) => b.similarity - a.similarity);

    return similarQuestions.slice(0, 5);
  };

  public calculateCosineSimilarity = (
    vecA: number[],
    vecB: number[],
  ): number => {
    const dotProduct = vecA.reduce(
      (sum, val, i) => sum + val * (vecB[i] || 0),
      0,
    );
    const magnitudeA = Math.sqrt(vecA.reduce((sum, val) => sum + val * val, 0));
    const magnitudeB = Math.sqrt(vecB.reduce((sum, val) => sum + val * val, 0));

    return dotProduct / (magnitudeA * magnitudeB);
  };
}
export const questionController = new QuestionController();

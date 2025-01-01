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
  public getOpenAIResponse = async (
    question: string,
  ): Promise<string | void> => {
    try {
      const response = await axios.post(
        'https://api.openai.com/v1/chat/completions',
        {
          model: 'gpt-3.5-turbo',
          messages: [{ role: 'user', content: question }],
        },
        {
          headers: {
            Authorization: `Bearer ${env_vars.ai}`,
            'Content-Type': 'application/json',
          },
        },
      );
      return response.data.choices[0].message.content;
    } catch (error) {
      Logger.info(error);
      new NoDataError('An error occurred while contacting OpenAI API');
    }
  };
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
      if ((env_vars.env = Env.production)) {
        const answer = await this.getOpenAIResponse(`
  Please provide a detailed answer to the following question:
  **Title:** ${question.title}.
  **Description:** ${question.description}.
  **Additional Details:** ${question.details}.
  Please elaborate on the problem described above in to parts ,the first for solution and the second for explain.`);
        if (answer) {
          const answerArr = answer.split('explain', 2);
          await answerRepository.insert({
            solution: answerArr[0],
            explain: answerArr[1],
          });
        }
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

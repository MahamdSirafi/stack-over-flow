import { Response, ParsedRequest } from 'express';
import {
  AuthFailureError,
  InternalError,
  NotFoundError,
} from '../core/ApiError';
import asyncHandler from '../middlewares/asyncHandler';
import { NextFunction } from 'express-serve-static-core';
import { editRequestRepository } from '../database/repositories/edit-request.repository';
import {
  IEditRequestAnswerSchema,
  IEditRequestIdSchema,
  IEditRequestQuestionSchema,
  IEditRequestSchema,
} from '../schemas/edit-request.schema';
import { Item, RequestStatus } from '../utils/enum';
import { needRecord } from '../utils/record';
import { questionRepository } from '../database/repositories/question.repository';
import { answerRepository } from '../database/repositories/answer.repository';
import Logger from '../core/Logger';

export class EditRequestController {
  public getEditRequestsQuestion = asyncHandler(
    async (
      req: ParsedRequest<void, void, IEditRequestIdSchema>,
      res: Response,
      next: NextFunction,
    ): Promise<void> => {
      const question = needRecord(
        await questionRepository.findById(req.params.questionId),
        new NotFoundError('Question not found'),
      );
      if (!req.user._id.equals(question.userId._id))
        throw new AuthFailureError('Permission denied');

      const editRequests = await editRequestRepository.findBy({
        itemId: req.valid.params.questionId,
      });

      res.ok({ message: 'success', data: editRequests });
    },
  );

  public getEditRequestsAnswer = asyncHandler(
    async (
      req: ParsedRequest<void, void, IEditRequestIdSchema>,
      res: Response,
      next: NextFunction,
    ): Promise<void> => {
      const answer = needRecord(
        await answerRepository.findById(req.params.answerId),
        new NotFoundError('Answer not found'),
      );
      if (!req.user._id.equals(answer.userId._id))
        throw new AuthFailureError('Permission denied');

      const editRequests = await editRequestRepository.findBy({
        itemId: req.valid.params.answerId,
      });

      res.ok({ message: 'success', data: editRequests });
    },
  );

  public getEditRequest = asyncHandler(
    async (
      req: ParsedRequest<void, void, IEditRequestIdSchema>,
      res: Response,
    ): Promise<void> => {
      const editRequest = needRecord(
        await editRequestRepository.findById(req.params.id),
        new NotFoundError('EditRequest not found'),
      );

      res.ok({ message: 'success', data: editRequest });
    },
  );

  public createEditRequestQuestion = asyncHandler(
    async (
      req: ParsedRequest<
        IEditRequestQuestionSchema,
        void,
        IEditRequestIdSchema
      >,
      res: Response,
      next: NextFunction,
    ): Promise<void> => {
      console.log(req.valid.params.questionId);
      const newEditRequest = {
        ...req.valid.body,
        userId: req.user._id,
        itemId: req.valid.params.questionId,
        itemType: Item.question,
      };
      const editRequest = await editRequestRepository.insert(newEditRequest);
      if (editRequest === null) {
        throw new InternalError();
      }
      res.created({
        message: 'EditRequest question has been created',
        data: editRequest,
      });
    },
  );

  public createEditRequestAnswer = asyncHandler(
    async (
      req: ParsedRequest<IEditRequestAnswerSchema, void, IEditRequestIdSchema>,
      res: Response,
      next: NextFunction,
    ): Promise<void> => {
      const newEditRequest = {
        ...req.valid.body,
        userId: req.user._id,
        itemId: req.valid.params.answerId,
        itemType: Item.answer,
      };
      const editRequest = await editRequestRepository.insert(newEditRequest);
      if (editRequest === null) {
        throw new InternalError();
      }
      res.created({
        message: 'EditRequest answer has been created',
        data: editRequest,
      });
    },
  );

  public updateEditRequestQuestion = asyncHandler(
    async (
      req: ParsedRequest<IEditRequestSchema, void, IEditRequestIdSchema>,
      res: Response,
      next: NextFunction,
    ): Promise<void> => {
      const editRequest = needRecord(
        await editRequestRepository.findById(req.params.id),
        new NotFoundError('EditRequest not found'),
      );

      if (!req.user._id.equals(editRequest.userId._id))
        throw new AuthFailureError('Permission denied');

      const data = await editRequestRepository.patchById(editRequest.id, {
        status: req.valid.body.status,
      });

      if (req.valid.body.status == RequestStatus.approved && data) {
        await questionRepository.patchById(
          req.params.questionId,
          data.newContent,
        );
      }

      res.ok({ message: 'EditRequest question has been updated', data });
    },
  );

  public updateEditRequestAnswer = asyncHandler(
    async (
      req: ParsedRequest<IEditRequestSchema, void, IEditRequestIdSchema>,
      res: Response,
      next: NextFunction,
    ): Promise<void> => {
      const editRequest = needRecord(
        await editRequestRepository.findById(req.params.id),
        new NotFoundError('EditRequest not found'),
      );

      if (!req.user._id.equals(editRequest.userId._id))
        throw new AuthFailureError('Permission denied');

      const data = await editRequestRepository.patchById(editRequest.id, {
        status: req.valid.body.status,
      });

      if (req.valid.body.status == RequestStatus.approved && data)
        await questionRepository.patchById(
          req.params.questionId,
          data.newContent,
        );

      res.ok({ message: 'EditRequest question has been updated', data });
    },
  );
}

export const editRequestController = new EditRequestController();

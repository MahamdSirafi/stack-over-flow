import { RequestStatus } from './../utils/enum';
import { Item } from './../utils/enum';
import { object, z, type TypeOf } from 'zod';
import { zodObjectId } from '../middlewares/validator';
import questionSchema from './question.schema';
import answerSchema from './answer.schema';

const editRequestIdSchema = object({
  questionId: zodObjectId.optional(),
  answerId: zodObjectId.optional(),
  id: zodObjectId.optional(),
});

export type IEditRequestIdSchema = TypeOf<typeof editRequestIdSchema>;

const editRequestSchema = object({
  status: z.nativeEnum(RequestStatus),
});

export type IEditRequestSchema = TypeOf<typeof editRequestSchema>;

const editRequestQuestionSchema = object({
  // <creating-property-create-schema />

  newContent: questionSchema.questionUpdate,
}).strict();

export type IEditRequestQuestionSchema = TypeOf<
  typeof editRequestQuestionSchema
>;

const editRequestAnswerSchema = object({
  // <creating-property-create-schema />

  newContent: answerSchema.answerUpdate,
}).strict();

export type IEditRequestAnswerSchema = TypeOf<typeof editRequestAnswerSchema>;

export default {
  editRequest: editRequestSchema,
  editRequestId: editRequestIdSchema,
  editRequestQuestion: editRequestQuestionSchema,
  editRequestAnswer: editRequestAnswerSchema,
};

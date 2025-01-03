import { object, z, type TypeOf } from 'zod';
import { zodObjectId } from '../middlewares/validator';

const answerIdSchema = object({
  id: zodObjectId,
});

export type IAnswerIdSchema = TypeOf<typeof answerIdSchema>;

const voteSchema = object({
  vote: z.number().min(-1).max(1),
});

export type IVoteSchema = TypeOf<typeof voteSchema>;

const questionIdSchema = object({
  questionId: zodObjectId,
});

export type IQuestionIdSchema = TypeOf<typeof questionIdSchema>;

const answerCreateSchema = object({
  // <creating-property-create-schema />

  solution: z.string(),

  explain: z.string(),
}).strict();

export type IAnswerCreateSchema = TypeOf<typeof answerCreateSchema>;

const answerUpdateSchema = object({
  // <creating-property-update-schema />

  solution: z.string().optional(),

  explain: z.string().optional(),
}).strict();

export type IAnswerUpdateSchema = TypeOf<typeof answerUpdateSchema>;

export default {
  vote: voteSchema,
  answerId: answerIdSchema,
  answerCreate: answerCreateSchema,
  answerUpdate: answerUpdateSchema,
  questionId: questionIdSchema,
};

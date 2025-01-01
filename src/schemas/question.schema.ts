import { object, z, string, type TypeOf } from 'zod';
import { zodObjectId } from '../middlewares/validator';
import { orderColumn, orderDirection, page, pageSize } from './common';

const questionIdSchema = object({
  id: zodObjectId,
});

export type IQuestionIdSchema = TypeOf<typeof questionIdSchema>;

const voteSchema = object({
  vote: z.number().min(-1).max(1),
});

export type IVoteSchema = TypeOf<typeof voteSchema>;

const questionAllSchema = object({
  page,
  pageSize,
  orderColumn,
  orderDirection,
  search: string().optional(),
});

export type IQuestionAllSchema = TypeOf<typeof questionAllSchema>;

const questionCreateSchema = object({
  // <creating-property-create-schema />

  tags: z.array(z.string()).min(2),

  description: z.string().min(20),

  details: z.string().min(20),

  // userId: zodObjectId,

  title: z.string(),
}).strict();

export type IQuestionCreateSchema = TypeOf<typeof questionCreateSchema>;

const questionUpdateSchema = object({
  // <creating-property-update-schema />

  tags: z.array(z.string()).min(2).optional(),

  description: z.string().min(20).optional(),

  details: z.string().min(20).optional(),

  // userId: zodObjectId.optional(),

  title: z.string().optional(),
}).strict();

export type IQuestionUpdateSchema = TypeOf<typeof questionUpdateSchema>;

export default {
  vote: voteSchema,
  questionId: questionIdSchema,
  questionAll: questionAllSchema,
  questionCreate: questionCreateSchema,
  questionUpdate: questionUpdateSchema,
};

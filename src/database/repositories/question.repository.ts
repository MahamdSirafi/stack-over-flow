import { type FilterQuery } from 'mongoose';
import { type PaginatedList } from '../../utils/pagination';
import { OrderDirection, type OrderOptions } from '../../utils/order';
import { BaseRepository, type FindOptions } from './base.repository';
import Question, { type IQuestion } from '../models/question.model';

export interface QuestionFilterOptions {}

export interface QuestionFindOptions
  extends FindOptions<QuestionFilterOptions> {
  order: OrderOptions;
}

export class QuestionRepository extends BaseRepository<IQuestion> {
  constructor() {
    super(Question);
  }

  async findForAdmin(
    options: QuestionFindOptions,
  ): Promise<PaginatedList<IQuestion>> {
    const { order, pagination, search } = options;

    const query: FilterQuery<IQuestion> = { deletedAt: null };
    if (search) {
      query.$or = [];
    }

    const total = await this.model.where(query).countDocuments();
    const results = await this.model
      .find(query)
      .sort({
        [order.column]: order.direction === OrderDirection.asc ? 1 : -1,
      })
      .limit(pagination.pageSize)
      .skip(--pagination.page * pagination.pageSize)
      .populate({ path: 'userId', select: 'name' });
    return { results, total };
  }
}

export const questionRepository = new QuestionRepository();

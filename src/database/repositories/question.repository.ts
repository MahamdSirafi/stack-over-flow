import { type FilterQuery } from 'mongoose';
import { type PaginatedList } from '../../utils/pagination';
import { OrderDirection, type OrderOptions } from '../../utils/order';
import { BaseRepository, type FindOptions } from './base.repository';
import Question, { type IQuestion } from '../models/question.model';

export interface QuestionFilterOptions {
  search: string | undefined;
}

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
    const { order, pagination, filter } = options;

    const query: FilterQuery<IQuestion> = { deletedAt: null };
    if (filter && filter.search) {
      query.$or = [{ $text: { $search: filter.search } }];

      // query.$or = [
      //   { title: { $regex: new RegExp(filter.search, 'i') } },
      //   { description: { $regex: new RegExp(filter.search, 'i') } },
      //   { details: { $regex: new RegExp(filter.search, 'i') } },
      // ];
    }

    const total = await this.model.where(query).countDocuments();
    const results = await this.model
      .find(query)
      .sort({
        [order.column]: order.direction === OrderDirection.asc ? 1 : -1,
      })
      .limit(pagination.pageSize)
      .skip(--pagination.page * pagination.pageSize);
    return { results, total };
  }
}

export const questionRepository = new QuestionRepository();

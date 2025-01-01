import { type FilterQuery } from 'mongoose';
import { type PaginatedList } from '../../utils/pagination';
import { OrderDirection, type OrderOptions } from '../../utils/order';
import { BaseRepository, type FindOptions } from './base.repository';
import Answer, { type IAnswer } from '../models/answer.model';

export interface AnswerFilterOptions {}

export interface AnswerFindOptions extends FindOptions<AnswerFilterOptions> {
  order: OrderOptions;
}

export class AnswerRepository extends BaseRepository<IAnswer> {
  constructor() {
    super(Answer);
  }

  async findForAdmin(
    options: AnswerFindOptions,
  ): Promise<PaginatedList<IAnswer>> {
    const { order, pagination, search } = options;

    const query: FilterQuery<IAnswer> = { deletedAt: null };
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
      .skip(pagination.page * pagination.pageSize);

    return { results, total };
  }

  async findall(questionId: string): Promise<PaginatedList<IAnswer>> {
    const query: FilterQuery<IAnswer> = { deletedAt: null, questionId };
    const total = await this.model.where(query).countDocuments();
    const results = await this.model.find(query).populate({
      path: 'userId',
      select: 'name',
    });
    return { results, total };
  }

  async findByIdPop(id: string): Promise<IAnswer | null> {
    const query: FilterQuery<IAnswer> = { deletedAt: null, _id: id };
    const results = await this.model.findOne(query).populate({
      path: 'userId',
      select: 'name',
    });
    return results;
  }
}

export const answerRepository = new AnswerRepository();

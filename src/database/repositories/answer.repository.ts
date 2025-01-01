import { BaseRepository } from './base.repository';
import Answer, { type IAnswer } from '../models/answer.model';

export class AnswerRepository extends BaseRepository<IAnswer> {
  constructor() {
    super(Answer);
  }
}

export const answerRepository = new AnswerRepository();

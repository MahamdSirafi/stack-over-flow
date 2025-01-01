import { BaseRepository } from './base.repository';
import EditRequest, { type IEditRequest } from '../models/edit-request.model';

export class EditRequestRepository extends BaseRepository<IEditRequest> {
  constructor() {
    super(EditRequest);
  }
}

export const editRequestRepository = new EditRequestRepository();

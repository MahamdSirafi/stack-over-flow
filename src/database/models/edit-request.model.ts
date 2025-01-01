import { RequestStatus } from './../../utils/enum';

import { IUser } from './user.model';

import { Item } from './../../utils/enum';

import { IQuestion } from './question.model';

import { IAnswer } from './answer.model';

import mongoose from 'mongoose';

import { model, Schema, type Document as MongooseDocument } from 'mongoose';
import { Query } from 'mongoose';

export interface IEditRequest extends MongooseDocument {
  id: string;
  // <creating-property-interface />
  status: RequestStatus;

  newContent: IQuestion | IAnswer;

  userId: IUser;

  itemType: Item;

  itemId: IQuestion['_id'];

  deletedAt: Date | null;
}

const editRequestSchema: Schema = new Schema<IEditRequest>(
  {
    // <creating-property-schema />
    status: {
      type: String,
      enum: Object.values(RequestStatus),
      default: RequestStatus.pending,
    },

    newContent: Object,

    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },

    itemType: {
      type: String,
      enum: Object.values(Item),
    },

    itemId: {
      type: mongoose.Schema.Types.ObjectId,
    },

    deletedAt: {
      type: Date,
      default: null,
    },
  },
  {
    collection: 'EditRequest',
    timestamps: true,
    versionKey: false,
  },
);

editRequestSchema.pre<Query<IAnswer, IAnswer>>(/^find/, function (next) {
  this.populate({
    path: 'userId',
    select: 'name',
  });

  next();
});

export default model<IEditRequest>('EditRequest', editRequestSchema);

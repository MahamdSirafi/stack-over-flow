import { IUser } from './user.model';

import mongoose from 'mongoose';

import { model, Schema, type Document as MongooseDocument } from 'mongoose';
import { omit } from 'lodash';

export interface IQuestion extends MongooseDocument {
  id: string;
  // <creating-property-interface />
  tags: string[];

  description: string;

  details: string;

  userId: IUser['_id'];
  user: IUser;

  title: string;

  deletedAt: Date | null;
}

const questionSchema: Schema = new Schema<IQuestion>(
  {
    // <creating-property-schema />
    tags: [
      {
        type: String,
        index: 'text',
      },
    ],

    description: {
      type: String,
      index: 'text',
    },
    details: {
      type: String,
      index: 'text',
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },

    title: {
      type: String,
      index: 'text',
    },
    deletedAt: {
      type: Date,
      default: null,
    },
  },
  {
    collection: 'Question',
    timestamps: true,
    versionKey: false,
  },
);

export default model<IQuestion>('Question', questionSchema);

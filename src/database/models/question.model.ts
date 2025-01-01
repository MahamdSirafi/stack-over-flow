import { IUser } from './user.model';

import mongoose from 'mongoose';

import { model, Schema, type Document as MongooseDocument } from 'mongoose';


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
      },
    ],

    description: {
      type: String,
    },
    details: {
      type: String,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },

    title: {
      type: String,
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
questionSchema.index(
  { details: 'text', description: 'text', title: 'text' },
  {
    weights: {
      title: 5,
      description: 3,
      details: 1,
    },
  },
);
export default model<IQuestion>('Question', questionSchema);

import { IQuestion } from './question.model';

import { IUser } from './user.model';

import mongoose, { Query } from 'mongoose';

import { model, Schema, type Document as MongooseDocument } from 'mongoose';

export interface IAnswer extends MongooseDocument {
  id: string;
  // <creating-property-interface />
  questionId: IQuestion['_id'];

  question: IQuestion;

  userId: IUser;

  solution: string;

  explain: string;

  deletedAt: Date | null;
}

const answerSchema: Schema = new Schema<IAnswer>(
  {
    // <creating-property-schema />
    questionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Question',
    },

    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },

    solution: {
      type: String,
    },
    explain: {
      type: String,
    },
    deletedAt: {
      type: Date,
      default: null,
    },
  },
  {
    collection: 'Answer',
    timestamps: true,
  },
);
answerSchema.pre<Query<IAnswer, IAnswer>>(/^find/, function (next) {
  this.populate({
    path: 'userId',
    select: 'name',
  });

  next();
});

export default model<IAnswer>('Answer', answerSchema);

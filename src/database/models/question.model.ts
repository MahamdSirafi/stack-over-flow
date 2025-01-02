import { IUser } from './user.model';
import mongoose from 'mongoose';
import { Query } from 'mongoose';
import { model, Schema, type Document as MongooseDocument } from 'mongoose';
import { Tokenizer, TfIdf } from 'natural';
export interface IQuestion extends MongooseDocument {
  id: string;
  // <creating-property-interface />
  tags: string[];

  description: string;

  details: string;

  userId: IUser;

  title: string;

  votes: number;

  voters: string[];

  vector: number[];

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

    votes: {
      type: Number,
      default: 0,
    },

    voters: Array,

    vector: { type: [Number] },

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

const tfidf = new TfIdf();

questionSchema.pre('save', function (next) {
  const text = this.title + ' ' + this.description + ' ' + this.details;
  
  tfidf.addDocument(text);
  
  const vector = tfidf.listTerms(0).map(term => term.tfidf);
  
  this.vector = vector;
  next();
});

questionSchema.pre<Query<IQuestion, IQuestion>>(/^find/, function (next) {
  this.populate({
    path: 'userId',
    select: 'name',
  });

  next();
});
export default model<IQuestion>('Question', questionSchema);

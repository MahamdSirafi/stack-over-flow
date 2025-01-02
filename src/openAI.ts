// import OpenAI from 'openai';
import OpenAI from 'openai';
import { env_vars } from './config';
import { IQuestion } from './database/models/question.model';
import { IAnswer } from './database/models/answer.model';
import { NoDataError } from './core/ApiError';
import Logger from './core/Logger';
import { Env } from './utils/enum';

const openai = new OpenAI({
  apiKey: env_vars.ai,
});
const system = `
Request for Assistance: API Development

I need your help in developing an API for our system, which will be similar to Stack Overflow. The goal is to provide intelligent answers to people asking various questions.

Rules:

1. Simplicity of Solutions: The solutions provided should be simple and easy to understand, avoiding unnecessary complexities.

2. References: Please include references used to answer the questions, along with a brief explanation for each source.

3. Reteurn a JSON object with the solution and explain

{"solution": "" ,"explain" : ""}

For examle
{
  "solution": "def reverse_string(s): return s[::-1]",
  "explain": "This function takes a string 's' as input and returns the reversed string using Python's slicing feature.
   The slice notation 's[::-1]' effectively steps through the string backwards,creating a new string that is the reverse of the original.
   source is "https://www.python.org/""
}

- Onely return a JSON object. Do NOT include any text aoutside of the JSON object.Just the JSON object is needed
`;
export const getOpenAIResponse = async (
  question: IQuestion,
): Promise<IAnswer | undefined> => {
  if (env_vars.env !== Env.production) return undefined;
  try {
    const message = ` **Title:** ${question.title}.
  **Description:** ${question.description}.
  **Additional Details:** ${question.details}.
  **Tags:** ${question.details}.
`;
    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        { role: 'system', content: system },
        { role: 'user', content: message },
      ],
      max_tokens: 1024,
      temperature: 0.6,
    });
    const content = response.choices[0]?.message?.content?.trim() ?? '';
    if (content && content.includes('{') && content.includes('}'))
      return extractJson(content);
    else {
      new NoDataError('An error occurred while contacting OpenAI API');
    }
  } catch (error) {
    Logger.info(error);
    new NoDataError('An error occurred while contacting OpenAI API');
  }
};
const extractJson = (content: string): IAnswer => {
  const regex = /\{(?:[^{}]|{[^{}]*})*\}/g;
  const match = content.match(regex) || '';
  const answer: IAnswer = JSON.parse(match[0]);
  return answer;
};

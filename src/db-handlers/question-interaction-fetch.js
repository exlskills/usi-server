import QuestionInteraction from '../db-models/question-interaction-model';
import { basicFind } from './basic-query-handler';
import { logger } from '../utils/logger';

export const fetchByUserQuestExamAttempt = async (
  user_id,
  question_id,
  exam_attempt_id
) => {
  logger.debug(`in QuestionInteraction fetchByUserQuestExamAttempt `);
  try {
    return await basicFind(
      QuestionInteraction,
      { isOne: true },
      { user_id, question_id, exam_attempt_id }
    );
  } catch (err) {
    return null;
  }
};

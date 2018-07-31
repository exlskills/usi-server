import QuestionInteraction from '../db-models/question-interaction-model';
import Question from '../db-models/question-model';
import mongoose from 'mongoose';
const ObjectId = mongoose.Types.ObjectId;
export const findById = async (obj_id, viewer, info) => {
  let record;
  try {
    //model, runParams, queryVal, sortVal, selectVal
    record = await basicFind(Question, {
      isById: true
    }, obj_id);
  } catch (errInternalAllreadyReported) {
    return null;
  }
  return record;
};

export const findQuestion = async (user_id, question_id, quiz_id, act) => {
  try {
    let updateObject = {
      user_id: user_id,
      question_id: question_id,
      exam_attempt_id: quiz_id,
      is_complete: false, // quiz false by default
      points: 0,
      pct_score: 0
    };

    if (response_data) {
      updateObject.$push.response_data = response_data;
    }
    const question = await findById(question_id, viewer);
    if (!question) {
      return {
        completionObj: {
          code: '1',
          msg: 'ERROR cannot find question'
        }
      };
    }
    let is_correct = false;
    let explain_text = '';
    //let duration = moment().toDate() - moment(start_date).toDate();
    let duration = new Date() - new Date(start_date);
    const result = await upsertQuestionInteraction(updateObject);
    try {
      await QuestionInteraction.update({
          user_id: user_id,
          question_id: question_id,
          exam_attempt_id: exam_attempt_id,
          trace: ['havent_learned'],
          duration_sec: duration
        },
        object, {
          upsert: true
        }
      ).exec();
    } catch (err) {
      return Promise.reject(err);
    }
  } catch (error) {
    return Promise.reject(error);
  }
};
import { fromGlobalId } from '../utils/graphql-id-parser';
import { logger } from '../utils/logger';

import UserSysInteraction from '../db-models/user-sys-interaction-model';
import QuestionInteraction from '../db-models/question-interaction-model';
import CardInteraction from '../db-models/card-interaction-model';

import { fetchByUserIdAndCardId } from '../db-handlers/card-interaction-fetch';
import { fetchByUserQuestExamAttempt } from '../db-handlers/question-interaction-fetch';
import { fetchCourseItemRefByCourseUnitCardId } from '../db-handlers/section-card-fetch';
import * as UserFetch from '../db-handlers/user-fetch';
import { updateLastAccessedAt } from '../db-handlers/user-course-role-cud';

export const user_ques = async data => {
  logger.debug(`in user_ques`);
  data.ques_id = fromGlobalId(data.ques_id).id;
  data.quiz_id = fromGlobalId(data.quiz_id).id;

  /*
  let questInte = await QuestionInteraction.findOne({
    user_id: data.user_id,
    question_id: data.ques_id,
    exam_attempt_id: data.quiz_id
  });
  */

  let questInte = await fetchByUserQuestExamAttempt(
    data.user_id,
    data.ques_id,
    data.quiz_id
  );

  if (!questInte) {
    questInte = await QuestionInteraction.create({
      user_id: data.user_id,
      question_id: data.ques_id,
      exam_attempt_id: data.quiz_id,
      is_complete: false, // quiz false by default
      entered_at: [new Date()],
      result: 'skipped',
      points: 0,
      pct_score: 0,
      trace: ['havent_learned']
    });
  } else {
    let duration = new Date() - [...questInte.entered_at].pop();
    duration = Math.round(duration / 1000);
    questInte.duration_sec = duration;
    questInte.trace.push('havent_learned');
    questInte.result = 'skipped';
    questInte.is_complete = false;
    questInte.points = 0;
    questInte.pct_score = 0;
  }
  await questInte.save();
};

export const user_locale = async data => {
  logger.debug(`in user_locale`);
  let locale_from = data.locale_from;
  let locale_to = data.locale_to;
  let action = 'chloc';
  let arrayInsertSys = {
    user_id: data.user_id,
    action: action,
    object: locale_from,
    object_to: locale_to,
    recorded_at: new Date()
  };
  await UserSysInteraction.create(arrayInsertSys);
  const user = await UserFetch.findById(data.user_id);
  if (!user) {
    return Promise.reject(Error('User does not exist'));
  }
  let full_name = user.username;
  let primary_email = user.primary_email;
  if (full_name === '' && primary_email === '') {
    user.primary_locale = locale_to;
    await user.save();
  } else {
    //nothing to do
  }
};

export const card_action = async (data, viewer) => {
  logger.debug(`in card_action`);
  logger.debug(`   data ` + JSON.stringify(data));

  if (!(data.card_id && data.user_id)) {
    return Promise.reject(Error('card_id and user_id are required'));
  }

  if (viewer.user_id !== data.user_id) {
    logger.error(`user IDs don't match ` + viewer.user_id + ` ` + data.user_id);
    // TODO - exit
  } else {
    logger.debug(`user IDs match`);
  }

  const received_at = new Date();

  const user = await UserFetch.findById(data.user_id, {
    _id: 1
  });
  if (!user) {
    return Promise.reject(Error('User does not exist'));
  }

  if (!data.card_id) {
    return Promise.reject(Error('card_id is required'));
  }

  let courseId;
  const cardId = fromGlobalId(data.card_id).id;
  let cardInter = await fetchByUserIdAndCardId(data.user_id, cardId);

  if (!cardInter) {
    if (!data.course_id || !data.unit_id) {
      return Promise.reject(Error('course_id and unit_id are required'));
    }

    courseId = fromGlobalId(data.course_id).id;
    const unitId = fromGlobalId(data.unit_id).id;
    let sectionId = null;
    if (data.section_id) {
      sectionId = fromGlobalId(data.section_id).id;
    } else {
      const cardRec = await fetchCourseItemRefByCourseUnitCardId(
        courseId,
        unitId,
        cardId
      );
      logger(`  cardRec for section_id ` + JSON.stringify(cardRec));

      if (!cardRec) {
        return Promise.reject(
          Error(`Card not found by Unit and Card ID: ${cardId}`)
        );
      }

      sectionId =
        cardRec.course_item_ref && cardRec.course_item_ref.section_id
          ? cardRec.course_item_ref.section_id
          : '';
      logger(` section_id ` + sectionId);
    }

    try {
      await CardInteraction.create({
        user_id: data.user_id,
        card_id: cardId,
        action: {
          action: data.action,
          recorded_at: received_at
        },
        course_item_ref: {
          course_id: courseId,
          unit_id: unitId,
          section_id: sectionId
        }
      });
    } catch (err) {
      logger.error(`Card Interaction insert failed ` + err);
      return Promise.reject(Error(`Card Interaction insert failed`));
    }
  } else {
    // Get courseId for the Last Accessed update
    courseId = cardInter.course_item_ref.course_id;

    // Override latest action
    cardInter.action = {
      action: data.action,
      recorded_at: received_at
    };
    try {
      await cardInter.save();
    } catch (err) {
      logger.error(`in card_action cardInter.save ` + err);
      return Promise.reject(`Error saving Card Interaction document`);
    }
  }

  try {
    await updateLastAccessedAt(data.user_id, courseId, received_at);
  } catch (alreadyReported) {
    return Promise.reject(`Error updating user_course_role`);
  }

  return Promise.resolve({});
};

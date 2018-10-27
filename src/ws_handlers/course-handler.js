import { fromGlobalId } from '../utils/graphql-id-parser';
import { logger } from '../utils/logger';

import UserSysInteraction from '../db-models/user-sys-interaction-model';
import QuestionInteraction from '../db-models/question-interaction-model';
import CardInteraction from '../db-models/card-interaction-model';

import { fetchByUserIdAndCardId } from '../db-handlers/card-interaction-fetch';
import { fetchByUserQuestExamAttempt } from '../db-handlers/question-interaction-fetch';
import { fetchCardRefByCourseUnitCardId } from '../db-handlers/section-card-fetch';
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

export const card_action = async data => {
  logger.debug(`in card_action`);
  logger.debug(`   data ` + JSON.stringify(data));

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

  const cardId = fromGlobalId(data.card_id).id;
  let cardInter = await fetchByUserIdAndCardId(data.user_id, cardId);

  let courseId;

  if (!cardInter) {
    if (!data.course_id || !data.unit_id || !data.card_id) {
      return Promise.reject(Error('course_id, unit_id, card_id are required'));
    }

    courseId = fromGlobalId(data.course_id).id;
    const unitId = fromGlobalId(data.unit_id).id;
    let sectionId = '';
    if (data.section_id) {
      sectionId = fromGlobalId(data.section_id).id;
    }

    if (!sectionId) {
      const cardRef = await fetchCardRefByCourseUnitCardId(
        courseId,
        unitId,
        cardId
      );
      logger(`  cardRef for section_id ` + JSON.stringify(cardRef));

      if (!cardRef || cardRef.length < 1) {
        return Promise.reject(
          Error(`Card not found by Unit and Card ID: ${cardId}`)
        );
      }

      if (cardRef.course_item_ref && cardRef.course_item_ref.section_id) {
        sectionId = cardRef.course_item_ref.section_id;
        logger(` section_id ` + sectionId);
      } else {
        // TODO deprecate
        const cardRefSection = cardRef.card_ref.EmbeddedDocRef.embedded_doc_refs.find(
          item => item.level === 'section'
        );
        sectionId =
          cardRefSection && cardRefSection.doc_id ? cardRefSection.doc_id : '';
      }
    }

    // TODO deprecate
    const embedded_doc_refs = [
      {
        level: 'course',
        doc_id: courseId
      },
      {
        level: 'unit',
        doc_id: unitId
      },
      {
        level: 'section',
        doc_id: sectionId
      }
    ];

    cardInter = await CardInteraction.create({
      user_id: data.user_id,
      card_id: cardId,
      action: {
        action: data.action,
        recorded_at: received_at
      },
      card_ref: {
        EmbeddedDocRef: {
          embedded_doc_refs
        }
      },
      course_item_ref: {
        course_id: courseId,
        unit_id: unitId,
        section_id: sectionId
      }
    });
  } else {
    // TODO - remove extra logic when card_ref.EmbeddedDocRef is deprecated as we'll
    // always have cardInter.course_item_ref.course_id populated
    if (!cardInter.course_item_ref) {
      if (data.course_id) {
        courseId = fromGlobalId(data.course_id).id;
      } else {
        // Note - this stored ID maybe incorrect
        courseId = cardInter.card_ref.EmbeddedDocRef.embedded_doc_refs.find(
          item => item.level === 'course'
        ).doc_id;
      }
    } else {
      courseId = cardInter.course_item_ref.course_id;
    }

    // Override latest action
    cardInter.action = {
      action: data.action,
      recorded_at: received_at
    };
    try {
      await cardInter.save();
    } catch (err) {
      logger.error(`in card_action cardInter.save ` + err);
      return Promise.reject(`Error saving card_interaction document`);
    }
  }

  try {
    await updateLastAccessedAt(data.user_id, courseId, received_at);
  } catch (alreadyReported) {
    return Promise.reject(`Error updating user_course_role`);
  }

  return Promise.resolve({});
};

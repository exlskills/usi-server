import { fromGlobalId } from '../utils/graphql-id-parser';
import { logger } from '../utils/logger';

import UserSysInteraction from '../db-models/user-sys-interaction-model';
import QuestionInteraction from '../db-models/question-interaction-model';
import CardInteraction from '../db-models/card-interaction-model';

import { fetchByUserIdAndCardId } from '../db-handlers/card-interaction-fetch';
import { fetchByUserQuestExamAttempt } from '../db-handlers/question-interaction-fetch';
import { fetchCardRefByCourseUnitCardId } from '../db-handlers/section-card-fetch';
import * as UserFetch from '../db-handlers/user-fetch';

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

export const course_unit_last_access = async data => {
  logger.debug(`in course_unit_last_access`);
  const user = await UserFetch.findById(data.user_id);
  if (!user) {
    return Promise.reject(Error('User does not exist'));
  }
  const courseId = fromGlobalId(data.cour_id).id;
  const unitId = fromGlobalId(data.unit_id).id;
  const courseRole = user.course_roles.find(
    item => item.course_id === courseId
  );
  try {
    if (courseRole) {
      //Check exist last_accessed_item
      if (courseRole.last_accessed_item) {
        if (courseRole.last_accessed_item.EmbeddedDocRef) {
          let arrayDocRef =
            courseRole.last_accessed_item.EmbeddedDocRef.embedded_doc_refs;
          if (arrayDocRef.length > 0) {
            //Update
            let FindCourse = arrayDocRef.find(item => item.level === 'course');
            FindCourse.doc_id = courseId;
            let FindUnit = arrayDocRef.find(item => item.level === 'unit');
            FindUnit.doc_id = unitId;
            await user.save();
          } else {
            let araryDocRefPush = [
              {
                level: 'course',
                doc_id: courseId
              },
              {
                level: 'unit',
                doc_id: unitId
              }
            ];
            courseRole.last_accessed_item.EmbeddedDocRef.embedded_doc_refs = araryDocRefPush;
          }
        } else {
          let array_last_accessed_item = {
            embedded_doc_refs: [
              {
                level: 'course',
                doc_id: courseId
              },
              {
                level: 'unit',
                doc_id: unitId
              }
            ]
          };
          courseRole.last_accessed_item.EmbeddedDocRef = array_last_accessed_item;
          user.save();
        }
      } else {
        let array_last_accessed_item = {
          EmbeddedDocRef: {
            embedded_doc_refs: [
              {
                level: 'course',
                doc_id: courseId
              },
              {
                level: 'unit',
                doc_id: unitId
              }
            ]
          }
        };
        courseRole.last_accessed_item = array_last_accessed_item;
        user.save();
      }
    } else {
      let arrayCoursePush = {
        course_id: courseId,
        role: ['viewer'],
        last_accessed_at: new Date(),
        last_accessed_item: {
          EmbeddedDocRef: {
            embedded_doc_refs: [
              {
                level: 'course',
                doc_id: courseId
              },
              {
                level: 'unit',
                doc_id: unitId
              }
            ]
          }
        }
      };
      user.course_roles.push(arrayCoursePush);
      await user.save();
    }
  } catch (error) {
    return Promise.reject(Error('Cannot set unit last accessed'));
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

  if (!cardInter) {
    const courseId = fromGlobalId(data.course_id).id;
    const unitId = fromGlobalId(data.unit_id).id;
    let sectionId = '';
    if (data.section_id) {
      sectionId = fromGlobalId(data.section_id).id;
    }

    if (!data.course_id || !data.unit_id || !data.card_id) {
      return Promise.reject(Error('course_id, unit_id, card_id are required'));
    }

    if (!sectionId) {
      const cardRef = await fetchCardRefByCourseUnitCardId(
        courseId,
        unitId,
        cardId
      );

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
    // Override latest action
    cardInter.action = {
      action: data.action,
      recorded_at: received_at
    };
    await cardInter.save();
  }

  if (data.action === 'answ_c') {
    // TODO: what would we need here? Before this went into quiz_lvl
    // This is called on Haven't Studied Yet
    /*
    let userCourse = user.course_roles.find(
      item => (item.course_id = courseId)
    );
    if (!userCourse) {
      // This would never happen (?)
    }

    await user.save();
    */
  }

  return Promise.resolve({});
};

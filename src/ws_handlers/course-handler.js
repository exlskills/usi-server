import * as UserFetch from '../db-handlers/user-fetch';
import * as CourseFetch from '../db-handlers/course-fetch';
import { fromGlobalId } from '../utils/graphql-id-parser';
import * as CardInteractionFetch from '../db-handlers/card-interaction-fetch';
import UserSysInteraction from '../db-models/user-sys-interaction-model';
import QuestionInteraction from '../db-models/question-interaction-model';
import CardInteraction from '../db-models/card-interaction-model';

export const user_ques = async data => {
  data.ques_id = fromGlobalId(data.ques_id).id;
  data.quiz_id = fromGlobalId(data.quiz_id).id;

  let questInte = await QuestionInteraction.findOne({
    user_id: data.user_id,
    question_id: data.ques_id,
    exam_attempt_id: data.quiz_id
  });

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
  if (full_name == '' && primary_email == '') {
    user.primary_locale = locale_to;
    await user.save();
  } else {
    //nothing to do
  }
};

export const course_unit_last_access = async data => {
  const user = await UserFetch.findById(data.user_id);
  if (!user) {
    return Promise.reject(Error('User does not exist'));
  }
  const courseId = fromGlobalId(data.cour_id).id;
  const unitId = fromGlobalId(data.unit_id).id;
  const courseRole = user.course_roles.find(item => item.course_id == courseId);
  try {
    if (courseRole) {
      //Check exist last_accessed_item
      if (courseRole.last_accessed_item) {
        if (courseRole.last_accessed_item.EmbeddedDocRef) {
          let arrayDocRef =
            courseRole.last_accessed_item.EmbeddedDocRef.embedded_doc_refs;
          if (arrayDocRef.length > 0) {
            //Update
            let FindCourse = arrayDocRef.find(item => item.level == 'course');
            FindCourse.doc_id = courseId;
            let FindUnit = arrayDocRef.find(item => item.level == 'unit');
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
    return Promise.reject(Error('Cannot increase course view count'));
  }
};

export const card_action = async data => {
  const user = await UserFetch.findById(data.user_id);
  if (!user) {
    return Promise.reject(Error('User does not exist'));
  }

  if (!data.card_id) {
    return Promise.reject(Error('card_id is required'));
  }

  const cardId = fromGlobalId(data.card_id).id;
  const courseId = fromGlobalId(data.course_id).id;
  const unitId = fromGlobalId(data.unit_id).id;
  let sectionId = '';
  if (data.section_id) {
    sectionId = fromGlobalId(data.section_id).id;
  }

  let cardInter = await CardInteractionFetch.findByUserIdAndCardId(
    data.user_id,
    cardId
  );

  if (!cardInter) {
    if (!data.course_id || !data.unit_id /* || !data.section_id */) {
      return Promise.reject(
        Error('course_id, unit_id, section_id is required')
      );
    }

    if (!sectionId) {
      const course = await CourseFetch.findById(courseId);
      if (!course) {
        return Promise.reject(Error(`Course not found: ${courseId}`));
      }
      const unit = course.units.Units.find(item => item._id == unitId);
      if (!unit) {
        return Promise.reject(Error(`CourseUnit not found: ${unitId}`));
      }
      const section = unit.sections.Sections.find(
        item => !!item.cards.Cards.find(item2 => item2._id == cardId)
      );
      if (!section) {
        return Promise.reject(
          Error(`UnitSection not found for card: ${cardId}`)
        );
      }
      sectionId = section._id;
    }

    const embedded_doc_refs = [
      { level: 'course', doc_id: courseId },
      { level: 'unit', doc_id: unitId },
      { level: 'section', doc_id: sectionId }
    ];

    cardInter = await CardInteraction.create({
      user_id: data.user_id,
      card_id: cardId,
      action: {
        action: data.action,
        recorded_at: new Date()
      },
      card_ref: { EmbeddedDocRef: { embedded_doc_refs } }
    });
  } else {
    cardInter.action = {
      action: data.action,
      recorded_at: new Date()
    };
    await cardInter.save();
  }

  if (data.action == 'answ_c') {
    const userCourse = user.course_roles.find(
      item => (item.course_id = courseId)
    );
    if (!userCourse) {
      return Promise.reject(Error('UserCourseRole does not exist'));
    }

    if (!userCourse.course_unit_status) {
      userCourse.course_unit_status = [];
    }
    const unitStatus = userCourse.course_unit_status.find(
      item => item.unit_id == unitId
    );

    if (!unitStatus) {
      userCourse.course_unit_status.push({
        unit_id: unitId,
        quiz_lvl: 1,
        quiz_lvl_updated_at: new Date()
      });
    } else if (unitStatus.quiz_lvl == 0) {
      unitStatus.quiz_lvl = 1;
      unitStatus.quiz_lvl_updated_at = new Date();
    }

    await user.save();
  }

  return Promise.resolve({});
};

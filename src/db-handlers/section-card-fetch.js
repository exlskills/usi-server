import Course from '../db-models/course-model';
import { logger } from '../utils/logger';

export const fetchCourseItemRefByCourseUnitCardId = async (
  courseId,
  unitId,
  //  sectionId,
  cardId
) => {
  logger.debug(`in fetchCourseItemRefByCourseUnitCardId`);
  let array = [];
  let selectFields = {};

  // Find the course
  array.push({ $match: { _id: courseId } });

  // Find the unit
  array.push({
    $project: {
      ...selectFields,
      unit: {
        $filter: {
          input: '$units.Units',
          cond: { $eq: ['$$this._id', unitId] }
        }
      }
    }
  });
  array.push({ $unwind: '$unit' });

  // Unwind Unit Sections
  array.push({
    $project: {
      ...selectFields,
      section: '$unit.sections.Sections'
    }
  });
  array.push({ $unwind: '$section' });

  // Find the card
  array.push({
    $project: {
      ...selectFields,
      cards: {
        $filter: {
          input: '$section.cards.Cards',
          cond: { $eq: ['$$this._id', cardId] }
        }
      }
    }
  });

  // Prepare card data
  array.push({ $unwind: '$cards' });
  array.push({
    $project: {
      ...selectFields,
      course_item_ref: '$cards.course_item_ref'
    }
  });

  try {
    const result = await Course.aggregate(array).exec();
  } catch (err) {
    logger.error(`in fetchCourseItemRefByCourseUnitCardId ` + err);
    return null;
  }
  return result.length > 0 ? result[0] : null;
};

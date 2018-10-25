import Course from '../db-models/course-model';
import { logger } from '../utils/logger';

export const fetchCardRefByCourseUnitCardId = async (
  courseId,
  unitId,
  //  sectionId,
  cardId
) => {
  logger.debug(`in fetchCardRefByCourseUnitCardId`);
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

  // Find the section
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
      card_ref: '$cards.card_ref',
      course_item_ref: '$cards.course_item_ref'
    }
  });

  const result = await Course.aggregate(array).exec();
  return result.length > 0 ? result[0] : {};
};

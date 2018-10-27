import User from '../db-models/user-model';
import { logger } from '../utils/logger';

export const updateLastAccessedAt = async (user_id, course_id, dateVal) => {
  logger.debug(`in updateLastAccessedAt`);
  try {
    return await User.updateOne(
      { _id: user_id },
      { $set: { 'course_roles.$[elem].last_accessed_at': dateVal } },
      {
        arrayFilters: [{ 'elem.course_id': course_id }]
      }
    ).exec();
  } catch (err) {
    logger.error(`in user-course-role-cud updateLastAccessedAt ` + err);
  }
};

import {
  basicFind
} from './basic-query-handler';
import Course from '../db-models/course-model';

export const findById = async obj_id => {
  try {
    return await basicFind(Course, {
      isById: true
    }, obj_id);
  } catch (error) {
    return null;
  }
};
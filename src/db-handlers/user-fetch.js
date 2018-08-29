import { basicFind } from './basic-query-handler';
import User from '../db-models/user-model';

export const findById = async obj_id => {
  try {
    return await basicFind(
      User,
      {
        isById: true
      },
      obj_id
    );
  } catch (error) {
    return null;
  }
};

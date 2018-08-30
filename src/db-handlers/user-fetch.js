import { basicFind } from './basic-query-handler';
import User from '../db-models/user-model';

export const findById = async (obj_id, selectVal) => {
  try {
    return await basicFind(
      User,
      {
        isById: true
      },
      obj_id,
      false,
      selectVal
    );
  } catch (error) {
    return null;
  }
};

import { basicFind } from '../db-handlers/basic-query-handler';
import CardInteraction from '../db-models/card-interaction-model.js';

export const findById = async (obj_id, viewer, info) => {
  let record;
  try {
    //model, runParams, queryVal, sortVal, selectVal
    record = await basicFind(CardInteraction, { isById: true }, obj_id);
  } catch (errInternalAllreadyReported) {
    return null;
  }
  return record;
};

export const fetchByUserIdAndCardId = async (user_id, card_id, selectVal) => {
  try {
    return await basicFind(
      CardInteraction,
      { isOne: true },
      { user_id, card_id },
      null,
      selectVal
    );
  } catch (err) {
    return null;
  }
};

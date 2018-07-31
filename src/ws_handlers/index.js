import { WS_EVENTS } from './constants';
import {
  course_unit_last_access,
  user_locale,
  user_ques,
  card_action
} from './course-handler';
export default (ws, req) => {
  // You might use location.query.access_token to authenticate or share sessions
  // or req.headers.cookie (see http://stackoverflow.com/a/16395220/151312)

  ws.on('message', message => {
    process_message(message);
  });

  ws.on(
    'close',
    (c, d) =>
      // No-op
      null
  );
};

const process_message = async message => {
  let msgObj;
  try {
    msgObj = JSON.parse(message);
  } catch (err) {
    console.error('error parsing message', err);
    return;
  }

  if (msgObj.payload && msgObj.payload.event && msgObj.payload.data) {
    try {
      switch (msgObj.payload.event) {
        case WS_EVENTS.courseUserItem:
          course_unit_last_access(msgObj.payload.data);
          break;
        case WS_EVENTS.userLocale:
          user_locale(msgObj.payload.data);
          break;
        case WS_EVENTS.userQuestion:
          user_ques(msgObj.payload.data);
          break;
        case WS_EVENTS.cardAction:
          card_action(msgObj.payload.data);
          break;
        default:
          console.error('Invalid event type:', message.payload.event);
          break;
      }
    } catch (err) {
      console.error('error processing', err);
    }
  } else {
    console.error('payload.event not provided');
  }
};

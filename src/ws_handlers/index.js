import { WS_EVENTS } from './constants';
import { user_locale, user_ques, card_action } from './course-handler';
import { logger } from '../utils/logger';
import { stringify } from 'flatted/cjs';
import jwt from 'jsonwebtoken';
import { jwtpublic_key } from '.././config';

export default (ws, req) => {
  logger.debug(`WS =======>> On Connect ` + JSON.stringify(req.headers));

  ws.on('message', message => {
    logger.debug(`WS =======>> req headers cookie  ` + req.headers.cookie);
    const viewer = getViewer(req);
    logger.debug(` viewer ` + JSON.stringify(viewer));

    // TODO exit if viewer is null

    // Not waiting as nothing is acknowledged back to the sender
    process_message(message, viewer);
  });

  ws.on(
    'close',
    (c, d) =>
      // No-op
      null
  );
};

const process_message = async (message, viewer) => {
  let msgObj;
  try {
    msgObj = JSON.parse(message);
  } catch (err) {
    logger.error('error parsing message', err);
    return;
  }

  if (msgObj.payload && msgObj.payload.event && msgObj.payload.data) {
    try {
      switch (msgObj.payload.event) {
        /*
        case WS_EVENTS.userLocale:
          user_locale(msgObj.payload.data);
          break;
        case WS_EVENTS.userQuestion:
          user_ques(msgObj.payload.data);
          break;
          */
        case WS_EVENTS.cardAction:
          card_action(msgObj.payload.data, viewer);
          break;
        default:
          logger.error('Invalid event type:', message.payload.event);
          break;
      }
    } catch (err) {
      logger.error('error processing', err);
    }
  } else {
    logger.error('payload.event not provided');
  }
};

const getViewer = req => {
  logger.debug(`in getViewer`);
  if (!req || !req.headers || !req.headers.cookie) {
    logger.info(`token not provided`);
    return null;
  }

  const cookieElems = req.headers.cookie.split(';');
  if (!cookieElems || cookieElems.length < 1) {
    logger.info(`token not provided`);
    return null;
  }

  let tokenString;
  for (let cookieElem of cookieElems) {
    if (cookieElem.startsWith('token=')) {
      tokenString = cookieElem.substring(6);
      break;
    }
  }
  if (!tokenString) {
    logger.info(`token not provided`);
    return null;
  }
  logger.debug(`token string ` + tokenString);
  let decoded = null;
  try {
    decoded = jwt.verify(tokenString, jwtpublic_key, {
      algorithm: 'RS256'
    });
  } catch (err) {
    logger.info(`token verification error ` + err);
    return null;
  }

  return {
    user_id: decoded.user_id,
    locale: decoded.locale
  };
};

const unbase64 = i => new Buffer(i, 'base64').toString('utf8');

export const fromGlobalId = globalId => {
  var unbasedGlobalId = (0, unbase64)(globalId);
  var delimiterPos = unbasedGlobalId.indexOf(':');
  return {
    type: unbasedGlobalId.substring(0, delimiterPos),
    id: unbasedGlobalId.substring(delimiterPos + 1)
  };
};

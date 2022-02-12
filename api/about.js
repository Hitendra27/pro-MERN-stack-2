let aboutMessage = 'Issue Tracker API v1.0';

function settMessage(_, {message}) {
  aboutMessage = message;
  return aboutMessage;
}

function getMessage() {
  return aboutMessage;
}

module.exports = {getMessage, settMessage};

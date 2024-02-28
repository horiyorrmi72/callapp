const { google } = require("googleapis");
const { OAuth2 } = google.auth;

const CREDENTIIALS = {};
const {
  calendarSummary,
  calendarDescription,
  calendarStart,
  calendarEnd,
  userTimeZone,
} = req.body;

const event = {
  summary: calendarSummary,
  location: null,
  desription: calendarDescription,
  start: {
    dateTime: calendarStart,
    timeZone: userTimeZone,
  },
  end: {
    dateTime: calendarEnd,
    timeZone: userTimeZone,
  },
  reminders: {
    useDefault: false,
    overrides: [
      { method: "email", minute: 24 * 60 },
      { method: "popup", minute: 10 },
    ],
  },
};

calendar.events.insert({
    auth: auth,
    calendarId: 'primary',
    resource: event,

}, function (err, event) {
    if (err)
    {
        console.log('there was an error adding event to your calendar.');
        return;
    }
    console.log('event created successfuly')
})

require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const twilio = require("twilio");

const app = express();
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// const accountSid = process.env.TWILIO_ACCOUNT_SID;
// const authToken = process.env.TWILIO_AUTH_TOKEN;
const fromNumber = process.env.PHONE_NUMBER;
const toNumber = "+2348118486243";
const VoiceResponse = require("twilio").twiml.VoiceResponse;

// const client = twilio(accountSid, authToken);

const accountSid = "ACad337149af7a4774d47e3066b1a3c96f";
const authToken = "ad7fc83d74ac0db08d962d04bb3bba82";
const client = require("twilio")(accountSid, authToken);


app.post("/call", (req, res) => {
  // const toNumber = toNumber;
  const audioUrl =
    "http://ocrmirror.org/files/music/remixes/Street_Fighter_2_Guile%27s_Theme_Goes_with_Metal_OC_ReMix.mp3";

  client.calls
    .create({
      url: `http://your-app-domain.com/play?url=${encodeURIComponent(
        audioUrl
      )}`,
      to: toNumber,
      from: fromNumber,
    })
    .then((call) => {
      console.log(`Call created: ${call.sid}`);
      res.status(200).send("Call initiated");
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send("Error initiating call");
    });
});

app.get("/play", (req, res) => {
  const twimlResponse = new twilio.twiml.VoiceResponse();
  const audioUrl = req.query.url;

  twimlResponse.say("Hello, your call is being connected.");
  twimlResponse.play(audioUrl);

  res.type("text/xml");
  res.send(twimlResponse.toString());
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
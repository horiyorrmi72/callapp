const Call = require("../models/call.model");
//const User = require("../models/users.model");
const twilio = require("twilio");
const passport = require("passport");

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const client = twilio(accountSid, authToken);
const AccessToken = require("twilio").jwt.AccessToken;
const VoiceGrant = AccessToken.VoiceGrant;
const VoiceResponse = twilio.twiml.VoiceResponse;
const callerId = "queenevaagent";

const defaultIdentity = "queenevaagent";

function callTokenGenerator(req, res) {
  var identity = null;
  if (req.method == "POST") {
    identity = req.body.identity;
  } else {
    identity = req.query.identity;
  }

  if (!identity) {
    identity = defaultIdentity;
  }

  // Used when generating any kind of tokens
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const apiKey = process.env.API_KEY;
  const apiSecret = process.env.API_KEY_SECRET;

  // Grant access to Twilio Voice capabilities
  const voiceGrant = new VoiceGrant({
    outgoingApplicationSid: process.env.TWILIO_APP_SID,
    incomingAllow: true, // Allow incoming calls
  });
  // Create an access token which we will sign and return to the client,
  // containing the grant we just created
  const callToken = new AccessToken(accountSid, apiKey, apiSecret);

  // Add the grant to the token
  callToken.addGrant(voiceGrant);

  // Set the identity of the token
  callToken.identity = identity;

  console.log("Token:" + callToken.toJwt());
  return response.send(callToken.toJwt());
}

const generateCallTwiML = (calleeNumber) => {
  const twiml = new VoiceResponse();
//  twiml.play(
//    "https://drab-zebu-6611.twil.io/assets/TunePocket-Touch-Of-Life-Logo-Preview.mp3"
//  );
twiml.say("Hi, i'm eva, welcome to queen eva real estate, please hold..")
  twiml.play(
    "https://drab-swan-8352.twil.io/assets/TunePocket-Calm-Meditation-Relaxing-Road-30-Min-Preview.mp3",

 );

  return twiml.toString();
};

const makeCall = async (req, res) => {
  const { calleeNumber, calleeName, calldirection } = req.body;
  try {
    let numberToCall = calleeNumber || process.env.DEFAULT_PHONE_NUMBER;

    if (!numberToCall) {
      return res.status(400).json({ message: 'No number to call provided and no default number set.' });
    }

    const twimlResponse = generateCallTwiML(numberToCall);

    const call = await client.calls.create({
      twiml: twimlResponse,
      to: numberToCall,
      from: process.env.PHONE_NUMBER,
//      statusCallback: "https://drab-zebu-6611.twil.io/status",
      statusCallbackMethod: "POST",
      statusCallbackEvent: ["initiated", "ringing", "answered", "completed"],
    });

    const checkDirection = function () {
      if (call.direction === "outbound-api") {
        return "outbound";
      }
    };

    const callRecord = new Call({
      callSid: call.sid,
      phoneNumber: numberToCall,
      calldirection: checkDirection(),
      callDuration: call.duration,
      callDate: new Date().toDateString(),
    });
    await callRecord.save();

    res.status(200).json({
      message: "Call initiated successfully",
      callRecord: callRecord,
    });
  } catch (err) {
    console.error("Error making the call:", err);
    res.status(500).send("Failed to make the call");
  }
};

const getCurrentCallSid = async () => {
  // const user = req.user._id;
  try {
    const calls = await client.calls.list({ status: "in-progress" });
    return calls && calls.length > 0 ? calls[0].sid : null;
  } catch (error) {
    console.error("Failed to fetch current call SID:", error);
    throw new Error("Failed to fetch current call SID");
  }
};

const endCall = async (req, res) => {
  try {
    const callSid = await getCurrentCallSid();

    if (!callSid) {
      res.status(404).send("No ongoing calls found");
      return;
    }
     await client.calls(callSid).update({ status: "completed" });
      return res.status(200).json({ message: "Call ended successfully" });

  } catch (error) {
    console.error("Failed to end the call:", error);
    res.status(500).json({ msg: "Failed to end call", error });
  }
};

const webhook = async (req, res) => {
  try {
    const status = req.body.CallStatus;
    const callSid = req.body.CallSid;

    console.log(`Call status update: ${status}, Call SID: ${callSid}`);

    if (status === "completed") {
      client
        .calls(callSid)
        .fetch()
        .then((call) => {
          const audioUrl = call.url;
          console.log(`Audio file URL: ${audioUrl}`);
        })
        .catch((error) => {
          console.error("Failed to fetch call details:", error);
        });
    }

    res.status(200).end();
  } catch (error) {
    console.error("Error handling webhook:", error);
    res.status(500).send("Internal Server Error");
  }
};
const getTwilioCallLogs = async (req, res) => {
  try {
    const calls = await client.calls.list({ limit: 20 }); // Adjust limit as needed
    res.status(200).json({ calls });
  } catch (error) {
    console.error("Failed to fetch call logs:", error);
    res.status(500).json({ error: "Failed to fetch call logs" });
  }
};

/**
 * get all custom call logs from db
 * return ok status (200) if sucessful with call logs
 * return error if there is error and console.log error.
 
*/
const getCustomCallLogs = async (req, res) => {
  try {
    const callLogs = await Call.find();
    res.status(200).json({ callLogs });
  } catch (err) {
    console.error("Failed to fetch call logs:", err);
    res.status(500).json({ error: "Failed to fetch call logs" });
  }
};

/**
 *
 * get user making call
 * fetch all outbound calls from database (custom data)
 * return ok status (200) if sucessful with call logs
 * return error if there is error and console.log error.
 */

const getCustomOutboundCallLogs = async (req, res) => {
  try {
    // const user = req.user._id;
    const callsData = await Call.find({
      calldirection: (calldirection = "outbound"),
    });
    console.log(callsData);
    res.status(200).json({ data: callsData });
  } catch (error) {
    console.error("Failed to fetch call logs:", error);
    res.status(500).json({ error: "Failed to fetch call logs" });
  }
};

module.exports = {
  makeCall,
  endCall,
  getCurrentCallSid,
  webhook,
  getTwilioCallLogs,
  getCustomOutboundCallLogs,
  getCustomCallLogs,
};

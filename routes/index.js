const express = require("express");
const callcontroller = require("../controllers/callcontroller");
const sidcontroller = require("../utils/service.utils");

const router = express.Router();

/*call routes*/
router.post("/make-call", callcontroller.makeCall);
router.post("/end-call", callcontroller.endCall);
router.get("/status", callcontroller.webhook);
router.get("/twilioLogs", callcontroller.getTwilioCallLogs);
router.get("/outboundCallLogs", callcontroller.getCustomOutboundCallLogs);
router.get("/customlogs", callcontroller.getCustomCallLogs);


// sid creator
router.get("/getSid", sidcontroller.createService);





module.exports = router;

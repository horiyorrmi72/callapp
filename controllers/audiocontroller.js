const twilio = require("twilio");
// const multer = require("multer");
const audio = require("../models/audio.model");

// handling file data and creating asset
const uploadAsset = async (req, res, next) => {
  const { friendlyName, category, assetLink } = req.body;

  console.log(req.body);

  try {
    if (!friendlyName || !category || !assetLink) {
      return res.status(400).json({ error: "All inputs required" });
    }

    const existingAsset = await audio.findOne({
      $or: [{ friendlyName }, { assetLink }],
    });
    if (existingAsset) {
      return res.status(409).json({
        error: "File with this data already exists",
      });
    }

    const asset = new audio({
      friendlyName,
      category,
      assetLink,
    });

    await asset.save();

    return res
      .status(200)
      .json({ message: "Asset created successfully", asset, assetLink });
  } catch (error) {
    console.error("Error creating asset:", error);
    res.status(500).json({ error: `Error creating asset: ${error.message}` });
  }
};

const getAudioLinkByCategory = async (req, res) => {
  try {
    const { category } = req.params;
    const audioFile = await audio.findOne({ category: category });

    if (!audioFile) {
      return res
        .status(404)
        .json({ message: `No audio file found for category: ${category}` });
    }

    // Construct TwiML response with <Play> verb to play the audio file
    const twiml = new twilio.twiml.VoiceResponse();
    twiml.play(audioFile.assetLink);

    res.type("text/xml");
    return res.send(twiml.toString());
  } catch (error) {
    console.error("Error fetching audio file:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};


module.exports = {
  uploadAsset,
  getAudioLinkByCategory,
};

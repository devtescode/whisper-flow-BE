
const jwt = require("jsonwebtoken")
const env = require("dotenv")
const mongoose = require("mongoose")
const bcrypt = require("bcryptjs")
const { default: axios } = require("axios")
// const crypto = require("crypto");
// const nodemailer = require("nodemailer");
const { Userschema } = require("../Models/user.models");
const ADMIN_SECRET_KEY = process.env.JWT_SECRET_KEY
// const cloudinary = require('cloudinary').v2;
env.config()

// const Link = require("../models/Link");
const crypto = require("crypto");
const Link = require("../Models/link")



module.exports.userwelcome = async (req, res) => {
    res.status(200).json({ message: "Welcome to WhisperFlow" })
}




// Helper to generate random ID
const generateRandomId = () => crypto.randomBytes(6).toString("hex");

module.exports.create = async (req, res) => {
  try {
    const { nickname } = req.body;

    if (!nickname) {
      return res.status(400).json({ error: "Nickname is required" });
    }

    const publicId = generateRandomId();
    const inboxId = generateRandomId();

    const link = new Link({
      nickname,
      publicId,
      inboxId,
      messages: [], // ✅ ensure messages exists
    });

    console.log(link, "link create");
    

    await link.save();

    // ✅ RETURN EVERYTHING THE FRONTEND NEEDS
    return res.status(201).json({
      _id: link._id,
      nickname: link.nickname,
      publicId: link.publicId,
      inboxId: link.inboxId,
      messages: link.messages,
      createdAt: link.createdAt,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Failed to create anonymous link" });
  }
};




// Get inbox by inboxId along with messages
module.exports.getInbox = async (req, res) => {
  try {
    const { inboxId } = req.params;
    const link = await Link.findOne({ inboxId });
    console.log("This is the link", link);
    if (!link) {
      return res.status(404).json({ error: "Inbox link not found" });
    }

    // Send link info + messages
    return res.status(200).json({
      _id: link._id,
      nickname: link.nickname,
      publicId: link.publicId,
      inboxId: link.inboxId,
      messages: link.messages, // include all messages
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Server error" });
  }
};



// Send anonymous message
// module.exports.sendMessage = async (req, res) => {
//   try {
//     const { publicId } = req.params;
//     const { content, email } = req.body;

//     if (!content || !content.trim()) {
//       return res.status(400).json({ error: "Message content is required" });
//     }

//     // Find the link by publicId
//     const link = await Link.findOne({ publicId });
//     if (!link) {
//       return res.status(404).json({ error: "Link not found" });
//     }

//     // Add message
//     const message = {
//       content: content.trim(),
//       senderEmail: email?.trim() || undefined,
//       createdAt: new Date(),
//     };

//     link.messages.push(message);
//     await link.save();

//     return res.status(201).json({ message: "Message sent successfully" });
//   } catch (err) {
//     console.error(err);
//     return res.status(500).json({ error: "Server error" });
//   }
// };



module.exports.sendMessage = async (req, res) => {
  try {
    const { publicId } = req.params;
    const { content, sender } = req.body; // sender comes from frontend

    if (!content?.trim()) {
      return res.status(400).json({ error: "Message required" });
    }

    const link = await Link.findOne({ publicId });
    if (!link) return res.status(404).json({ error: "Link not found" });

    const message = {
      content: content.trim(),
      senderName: sender?.name,       // Google name
      senderEmail: sender?.email,     // Google email
      senderPicture: sender?.picture, // Google profile picture
      senderIp: req.ip,
      userAgent: req.headers["user-agent"],
      createdAt: new Date(),
    };

    link.messages.push(message);
    await link.save();

    res.status(201).json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};



module.exports.getLinkByPublicId = async (req, res) => {
  try {
    const { publicId } = req.params;
    const link = await Link.findOne({ publicId });

    if (!link) {
      return res.status(404).json({ error: "Link not found" });
    }

    // Send only necessary fields to frontend
    return res.status(200).json({
      publicId: link.publicId,
      nickname: link.nickname,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Server error" });
  }
};



module.exports.getMessages = async (req, res) => {
  try {
    const { linkId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(linkId)) {
      return res.status(400).json({ error: "Invalid linkId" });
    }

    const link = await Link.findById(linkId);
    if (!link) {
      return res.status(404).json({ error: "Link not found" });
    }

    // 📅 Get today's start & end
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    // ✅ Filter messages sent TODAY
    const todaysMessages = link.messages.filter(msg => {
      const createdAt = new Date(msg.createdAt);
      return createdAt >= startOfDay && createdAt <= endOfDay;
    });

    return res.status(200).json({
      count: todaysMessages.length,
      messages: todaysMessages,
    });
  } catch (err) {
    console.error("getMessages error:", err);
    return res.status(500).json({ error: "Server error" });
  }
};


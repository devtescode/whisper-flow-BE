const mongoose = require("mongoose");

const linkSchema = new mongoose.Schema(
  {
    nickname: { type: String, required: true },
    publicId: { type: String, required: true, unique: true },
    inboxId: { type: String, required: true, unique: true },
    messages: [
      {
        content: { type: String, required: true },
        senderEmail: { type: String }, // Only admin can see
        senderName: { type: String },   // auto from OAuth
        senderIp: { type: String },
        userAgent: { type: String },
        senderPicture: { type: String },
        createdAt: { type: Date, default: Date.now },
      },
    ],
    createdAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

const Link = mongoose.model("link", linkSchema);
module.exports = Link;

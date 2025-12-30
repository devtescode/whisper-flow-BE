
const jwt = require("jsonwebtoken")
const env = require("dotenv")
const mongoose = require("mongoose")
const bcrypt = require("bcryptjs")
const { default: axios } = require("axios")
const { Userschema } = require("../Models/user.models");
const ADMIN_SECRET_KEY = process.env.JWT_SECRET_KEY
// const cloudinary = require('cloudinary').v2;
env.config()
const crypto = require("crypto");
const Link = require("../Models/link")
const Admin = require("../Models/user.models"); 



module.exports.checkAdmin = async (req, res) => {
  try {
    const adminCount = await Admin.countDocuments();
    if (adminCount === 0) {
      return res.json({ exists: false }); // no admin yet → show registration
    } else {
      return res.json({ exists: true }); // admin exists → show login only
    }
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Server error" });
  }
};



module.exports.register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const adminCount = await Admin.countDocuments();
    if (adminCount > 0) {
      return res.status(400).json({ error: "Admin already exists" });
    }

    const newAdmin = new Admin({ name, email, password });
    await newAdmin.save();

    res.status(201).json({ message: "Admin registered successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};



module.exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const admin = await Admin.findOne({ email });
    if (!admin) return res.status(401).json({ error: "Invalid credentials" });

    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) return res.status(401).json({ error: "Invalid credentials" });

    const token = jwt.sign({ id: admin._id }, process.env.JWT_SECRET || "secret", { expiresIn: "1hr" });
    res.json({ message: "Login successful", token });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};




// Get all messages with link nickname
module.exports.admingetMessages = async (req, res) => {
  try {
    const links = await Link.find({}, "nickname messages");

    const allMessages = links.flatMap(link =>
      link.messages.map(msg => ({
        id: msg._id.toString(),
        content: msg.content,
        senderEmail: msg.senderEmail || "Anonymous",
        senderName: msg.senderName || "Anonymous",
        senderPicture: msg.senderPicture || null,
        senderIp: msg.senderIp,
        createdAt: msg.createdAt,
        userAgent: msg.userAgent,
        linkId: link._id,
        nickname: link.nickname
      }))
    );

    console.log("All messages:", allMessages);

    allMessages.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    res.json(allMessages);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch messages" });
  }
};


module.exports.getLinks = async (req, res) => {
  try {
    const links = await Link.find();

    res.json(
      links.map(link => ({
        id: link._id.toString(),        
        nickname: link.nickname,
        publicId: link.publicId,
        isActive: link.isActive,
        createdAt: link.createdAt,
      }))
    );
  } catch (err) {
    console.error("getLinks error:", err);
    res.status(500).json({ error: "Failed to fetch links" });
  }
};



module.exports.toggleLinkStatus = async (req, res) => {
  console.log(req.body);
  console.log("noticed toggle request");
  
  try {
    const { id } = req.params;

    const link = await Link.findById(id);
    console.log(link.isActive, "active");
    
    if (!link) {
      return res.status(404).json({ error: "Link not found" });
    }

    // 🔁 Toggle ONLY when clicked
    link.isActive = !link.isActive;
    await link.save();

    res.json({
      id: link._id.toString(),
      isActive: link.isActive,
    });
  } catch (err) {
    console.error("toggleLinkStatus error:", err);
    res.status(500).json({ error: "Failed to toggle status" });
  }
};




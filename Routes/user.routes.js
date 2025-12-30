const express = require("express")
const { userwelcome, create, sendMessage, getLinkByPublicId, getInbox, getMessages } = require("../Controllers/user.controllers")
const { checkAdmin, register, login, admingetMessages, getLinks, toggleLinkStatus } = require("../Controllers/admin")
const router = express.Router()


router.get("/userwelcome", userwelcome)
router.post("/create", create)
router.get("/inbox/:inboxId", getInbox)
router.post("/u/:publicId/messages", sendMessage)
router.get("/u/:publicId", getLinkByPublicId);
// router.get("/link/messages/:linkId", getMessages);
router.get("/messages/:linkId", getMessages);


router.get("/check", checkAdmin)
router.post("/register", register)
router.post("/login", login)
router.get("/admingetMessages",  admingetMessages) 
router.get("/getLinks", getLinks)
router.patch("/links/:id/toggle", toggleLinkStatus)

module.exports = router
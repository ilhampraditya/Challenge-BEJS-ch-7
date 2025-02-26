const express = require("express");
const router = express.Router();
const User = require("../v1/user.routes")
const Auth = require("../v1/auth.routes")
const Notif = require("../v1/notif.routes")

router.use("/api/v1", User);
router.use("/api/v1", Auth)
router.use("/api/v1", Notif)

module.exports = router
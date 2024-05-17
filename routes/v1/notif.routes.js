const router = require("express").Router();
const { getUserNotifications } = require("../../controllers/notification.controller")


// Notification routes
router.get("/users/:id/notifications", getUserNotifications);

module.exports = router
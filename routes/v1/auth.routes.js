const router = require("express").Router();
const{login, auth} = require("../../controllers/auth.controllers")
const { restrict } = require('../../middlewares/auth.middleware')


router.post("/auth/login", login);
router.get("/auth/authenticate", restrict, auth);


module.exports = router;
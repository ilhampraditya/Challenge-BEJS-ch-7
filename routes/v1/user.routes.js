const router = require("express").Router();
const {register, allUser, detailUser, pageLogin, forgotPassword, resetPassword, pageForgetPassword, pageResetPassword } = require('../../controllers/user.controllers')


const {restrict} = require ('../../middlewares/auth.middleware')

router.post("/users", register)
router.get("/users", allUser)
router.get("/users/:id", restrict, detailUser)
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);


// Render page
router.get("/login", pageLogin);
router.get("/forgot-password", pageForgetPassword);
router.get("/reset-password", pageResetPassword);

module.exports = router
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const path = require("path");
const { JWT_SECRET } = process.env;
const nodemailer = require("../libs/nodemailer");
const { getHTML, sendMail } = require("../libs/nodemailer");


module.exports = {
    register: async (req, res, next) => {
        try {
            const { first_name, last_name, email, password } = req.body;

            const exist = await prisma.user.findUnique({
                where: { email },
            });

            if (!first_name || !last_name || !email || !password) {
                return res.status(400).json({
                    status: false,
                    message: "Input must be required",
                    data: null,
                });
            } else if (exist) {
                return res.status(401).json({
                    status: false,
                    message: "Email already used!",
                });
            }

            let encryptedPassword = await bcrypt.hash(password, 10);
            const user = await prisma.user.create({
                data: {
                    first_name,
                    last_name,
                    email,
                    password: encryptedPassword,
                },
            });
            delete user.password;

            // Send welcome notification
            const notification = await prisma.notification.create({
                data: {
                    user_id: user.id,
                    title: "Welcome!",
                    body: "Your account has been created successfully.",
                },
            });

            io.emit(`user-${user.id}`, notification);

            res.status(201).json({
                status: true,
                message: "User Created Successfully",
                data: user,
            });
        } catch (error) {
            next(error);
        }
    },

    allUser: async (req, res, next) => {
        try {
            const user = await prisma.user.findMany()
            res.status(200).json({
                status: true,
                message: "success",
                data: user,
            })
        } catch (error) {
            next(error)
        }
    },

    detailUser: async (req, res, next) => {
        const id = Number(req.params.id);
        try {
            const user = await prisma.user.findUnique({
                where: { id },
            });

            if (!user) {
                return res.status(404).json({
                    status: false,
                    message: `User with id ${id} not found`,
                    data: null,
                });
            }
            delete user.password;
            res.status(200).json({
                status: true,
                message: "success",
                data: user,
            });
        } catch (error) {
            next(error);
        }
    },

    pageLogin: async (req, res, next) => {
        try {
            res.render("login.ejs");
        } catch (error) {
            next(error);
        }
    },

    forgotPassword: async (req, res, next) => {
        try {
            let { email } = req.body;
            const findUser = await prisma.user.findUnique({ where: { email } });

            if (!findUser) {
                return res.status(404).json({
                    status: false,
                    message: "Email not found",
                });
            }

            const token = jwt.sign({ email: findUser.email }, JWT_SECRET);

            const html = await nodemailer.getHTML("email-reset-password.ejs", {
                name: findUser.first_name,
                url: `${req.protocol}://${req.get(
                    "host"
                )}/api/v1/reset-password?token=${token}`,
            });

            try {
                await nodemailer.sendMail(email, "Email Forget Password", html);
                return res.status(200).json({
                    status: true,
                    message: "Success Send Email Forget Password",
                });
            } catch (error) {
                return res.status(500).json({
                    status: false,
                    message: "Failed to send email",
                });
            }
        } catch (error) {
            next(error);
        }
    },

    resetPassword: async (req, res, next) => {
        try {
            let { token } = req.query;
            let { password, confirmPassword } = req.body;

            if (!password || !confirmPassword) {
                return res.status(400).json({
                    status: false,
                    message:
                        "Password and Password confirmation must be required",
                    data: null,
                });
            }

            if (password !== confirmPassword) {
                return res.status(400).json({
                    status: false,
                    message:
                        "Please ensure that the password and password confirmation match!",
                    data: null,
                });
            }

            let encryptedPassword = await bcrypt.hash(password, 10);

            jwt.verify(token, JWT_SECRET, async (err, decoded) => {
                if (err) {
                    return res.status(400).json({
                        status: false,
                        message: "Bad request",
                        err: err.message,
                        data: null,
                    });
                }
                const updateUser = await prisma.user.update({
                    where: { email: decoded.email },
                    data: { password: encryptedPassword },
                    select: { id: true, first_name: true, last_name: true, email: true },
                });

                // Send password reset notification
                const notification = await prisma.notification.create({
                    data: {
                        user_id: updateUser.id,
                        title: "Password Reset",
                        body: "Your password has been reset successfully.",
                    },
                });

                io.emit(`user-${updateUser.id}`, notification);

                res.status(200).json({
                    status: true,
                    message: "Reset user password successfully!",
                    data: updateUser,
                });
            });
        } catch (err) {
            next(err);
        }
    },
    pageForgetPassword: async (req, res, next) => {
        try {
            res.render("forgotPassword.ejs");
        } catch (error) {
            next(error);
        }
    },

   pageResetPassword: async (req, res, next) => {
    try {
        let { token } = req.query;
        if (!token) {
            return res.status(400).json({ status: false, message: "Token is required" });
        }
        res.render("resetPassword.ejs", { token });
    } catch (error) {
        next(error);
    }
}




}
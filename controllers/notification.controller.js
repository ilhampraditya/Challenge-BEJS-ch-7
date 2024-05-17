const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

module.exports = {
    getUserNotifications: async (req, res, next) => {
        const userId = Number(req.params.id);
        try {
            const notifications = await prisma.notification.findMany({
                where: { user_id: userId },
                orderBy: { createdAt: 'desc' }
            });

            if (!notifications.length) {
                return res.status(404).json({
                    status: false,
                    message: "There are no notifications for this user.",
                    data: null,
                });
            }

            res.render('notification.ejs', {
                userID: userId,
                notifications: notifications
            });
        } catch (error) {
            next(error);
        }
    }
};

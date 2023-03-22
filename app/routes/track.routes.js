const { authJwt } = require("../middlewares");
const controller = require("../controllers/track.controller");

module.exports = function (app) {
    app.use(function (req, res, next) {
        res.header(
            "Access-Control-Allow-Headers",
            "x-access-token, Origin, Content-Type, Accept"
        );
        next();
    });

    app.get("/api/track/dashboard/:date", [authJwt.verifyToken], controller.getAll);
    app.get("/api/track/dashboard/:date/:userId", [authJwt.verifyToken], controller.getByUser);

    app.get("/api/index.aspx", controller.setTrack);
    app.patch('/api/update/:id', controller.updateUser);
    app.delete('/api/delete/:id', controller.delete);
};

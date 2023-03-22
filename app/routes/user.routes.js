const { authJwt } = require("../middlewares");
const controller = require("../controllers/user.controller");

module.exports = function (app) {
  app.use(function (req, res, next) {
    res.header(
      "Access-Control-Allow-Headers",
      "x-access-token, Origin, Content-Type, Accept"
    );
    next();
  });

  app.get("/api/user/getAll", [authJwt.verifyToken, authJwt.isSuperOrAdmin], controller.getAll);
  app.get("/api/user/ssp", [authJwt.verifyToken, authJwt.isSuperOrAdmin], controller.ssp);
  app.post("/api/user/save", [authJwt.verifyToken, authJwt.isSuperOrAdmin], controller.save);
  app.post("/api/user/delete", [authJwt.verifyToken, authJwt.isSuperOrAdmin], controller.delete);
  app.get("/api/user/getGuest", [authJwt.verifyToken, authJwt.isUser], controller.getGuest);
  app.post("/api/user/share", [authJwt.verifyToken, authJwt.isUser], controller.shareLink);
  app.get("/api/user/getLinks", [authJwt.verifyToken], controller.getLinkList);
  app.post("/api/user/unlink", [authJwt.verifyToken, authJwt.isGuest], controller.unlink);
};

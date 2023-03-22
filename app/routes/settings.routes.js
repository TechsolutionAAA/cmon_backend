const { authJwt } = require("../middlewares");
const multer = require("multer");
const path = require("path");
const bodyparser = require("body-parser");
const controller = require("../controllers/settings.controller");

//! Use of Multer
var storage = multer.diskStorage({
    destination: (req, file, callBack) => {
        callBack(null, "./uploads/");
    },
    filename: (req, file, callBack) => {
        callBack(
            null,
            file.fieldname + "-" + Date.now() + path.extname(file.originalname)
        );
    },
});

var upload = multer({
    storage: storage,
});


module.exports = function (app) {
    app.use(function (req, res, next) {
        res.header(
            "Access-Control-Allow-Headers",
            "x-access-token, Origin, Content-Type, Accept"
        );
        next();
    });

    // body-parser middleware use
    app.use(bodyparser.json());
    app.use(
        bodyparser.urlencoded({
            extended: true,
        })
    );

    app.get("/api/settings", controller.getSettings);

    app.post(
        "/api/settings/companyLogo",
        upload.single("uploadfile"),
        controller.setCompanyLogo
    );

    app.post("/api/settings/domain", [authJwt.verifyToken, authJwt.isSuper], controller.setDomain);
    app.post("/api/settings/webDesc", [authJwt.verifyToken, authJwt.isSuper], controller.setWebDesc);
};

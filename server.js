const express = require("express");
const cors = require("cors");
const dbConfig = require("./app/config/db.config");
const path = require("path");
var bcrypt = require("bcryptjs");

const app = express();

var corsOptions = {
  origin: "http://localhost:3000",
};

app.use(cors(corsOptions));

// parse requests of content-type - application/json
app.use(express.json());

// parse requests of content-type - application/x-www-form-urlencoded
app.use(express.urlencoded({ extended: true }));

const db = require("./app/models");
const Role = db.role;
const User = db.user;
db.mongoose
  .connect("mongodb+srv://cmon:cmon@cmondb.vfrm2t1.mongodb.net/test", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("Successfully connect to MongoDB.");
    initial();
  })
  .catch((err) => {
    console.error("Connection error", err);
    process.exit();
  });

// simple route
app.get("/", (req, res) => {
  res.json({ message: "Welcome to bezkoder application." });
});

// routes
require("./app/routes/auth.routes")(app);
require("./app/routes/user.routes")(app);
require("./app/routes/track.routes")(app);
require("./app/routes/settings.routes")(app);

app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// set port, listen for requests
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}.`);
});

function initial() {
  // Check if the collection exists
  db.mongoose.connection.db
    .listCollections({ name: "settings" })
    .next((err, collectionInfo) => {
      if (!collectionInfo) {
        // Create the collection if it does not exist
        db.mongoose.connection.createCollection(
          "settings",
          function (err, res) {
            if (err) throw err;
            console.log("Settings collection created!");
          }
        );
      }
    });

  Role.estimatedDocumentCount((err, count) => {
    if (!err && count === 0) {
      new Role({
        name: "user",
      }).save((err, r) => {
        if (err) {
          console.log("error", err);
          return false;
        }

        console.log("added 'user' to roles collection");
      });

      new Role({
        name: "superadmin",
      }).save((err, r) => {
        if (err) {
          console.log("error", err);
          return false;
        }

        console.log(r);

        new User({
          username: "super",
          email: "super@admin.com",
          password: bcrypt.hashSync("12345678", 8),
          roles: [r._id],
        }).save((uerr) => {
          if (uerr) {
            console.log("error", err);
            return false;
          }

          console.log("added 'super' to user collection");
        });

        console.log("added 'superadmin' to roles collection");
      });

      new Role({
        name: "admin",
      }).save((err, r) => {
        if (err) {
          console.log("error", err);
          return false;
        }

        new User({
          username: "joseph",
          email: "joseph@papawheelie.com.au",
          password: bcrypt.hashSync("12345678", 8),
          roles: [r._id],
        }).save((uerr) => {
          if (uerr) {
            console.log("error", err);
            return false;
          }

          console.log("added 'joseph' to user collection");
        });

        console.log("added 'admin' to roles collection");
      });

      new Role({
        name: "guest",
      }).save((err) => {
        if (err) {
          console.log("error", err);
          return false;
        }

        console.log("added 'guest' to roles collection");
      });
    }
  });
}

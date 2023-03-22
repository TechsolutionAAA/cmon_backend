const db = require("../models");
const User = db.user;
const Role = db.role;
var bcrypt = require("bcryptjs");

exports.allAccess = (req, res) => {
  res.status(200).send("Public Content.");
};

exports.userBoard = (req, res) => {
  res.status(200).send("User Content.");
};

exports.adminBoard = (req, res) => {
  res.status(200).send("Admin Content.");
};

exports.moderatorBoard = (req, res) => {
  res.status(200).send("Moderator Content.");
};

exports.getAll = (req, res) => {
  User.find({}).populate("roles", "-__v").exec((err, users) => {
    let _list = [];
    for (var i = 0; i < users.length; i++) {
      _list.push({
        id: users[i]._id,
        username: users[i].username,
        email: users[i].email,
        role: users[i].roles[0].name.toUpperCase()
      });
    }
    res.status(200).send(_list);
  })
};

exports.ssp = (req, res) => {
  const page = req.query._page;
  const order = req.query._order;
  const orderBy = req.query._orderBy;
  const filter = req.query._filter.trim();
  const limit = req.query._limit;
  const query = filter === "" ? {} : { username: { $regex: ".*" + filter + ".*" } };

  User.find(query)
    .populate("roles", "-__v")
    .sort([[orderBy, order == "asc" ? 1 : -1]])
    .limit(Number(limit))
    .skip(page * limit)
    .exec((err, rows) => {
      if (err) {
        res.status(500).send({ message: err });
        return;
      }

      User.count(query, (err, cnt) => {
        if (err) {
        } else {
          res.status(200).send({
            total: cnt,
            data: rows,
          });
        }
      });
    });
};

exports.save = async (req, res) => {
  const id = req.body.id;
  const _name = req.body.name;
  const _email = req.body.email;
  const _role = req.body.role;
  const _pwd = req.body.pwd;
  const _vd = req.body.vd;

  let setData = {
    username: _name,
    email: _email
  };

  if (_pwd && _pwd !== '') {
    setData.password = bcrypt.hashSync(_pwd, 8)
  }

  if (_role === undefined || _role === '') {
    _role = 'user';
  }

  if (_role === 'user')
    setData.viewdetail = _vd;

  try {
    const roles = await Role.find({ name: _role });
    setData.roles = roles.map(role => role._id);
  } catch (e) {
    res.status(500).send({ message: err });
    return;
  }

  if (id.trim() === "") {
    try {
      const user = new User(setData);
      user.save(err => {
        if (err) {
          res.status(500).send({ message: err });
          return;
        }

        res.status(200).send({
          data: user
        });
      });
    } catch (e) {
      res.status(500).send({ message: e });
      return;
    }
  } else {
    try {
      User.findOneAndUpdate({ _id: id }, { $set: setData }, { upsert: true })
        .then((r) => {
          res.status(200).send({});
        })
        .catch((err) => {
          res.send(500, { error: err });
        });
    } catch (e) {
      res.status(500).send({ message: e });
      return;
    }
  }
};

exports.delete = (req, res) => {
  try {
    User.find({ _id: req.body.id }).remove((err) => {
      if (!err) {
        res.status(200).send({});
      } else {
        res.status(500).send({ message: err });
      }
    });
  } catch (e) {
    res.status(500).send({ message: e });
    return;
  }
};


exports.getGuest = async (req, res) => {
  try {
    const role = await Role.findOne({ name: 'guest' });
    User.find({ roles: { $in: [role._id] } })
      .then(users => {
        let _list = [];
        for (var i = 0; i < users.length; i++) {
          _list.push({
            id: users[i]._id,
            username: users[i].username,
            email: users[i].email,
          });
        }
        res.status(200).send(_list);
      })
      .catch(error => {
        console.log(error);
        res.status(500).send(error);
      });
  } catch (err) {
    console.log(err);
    res.status(500).send(err);
  }

};

exports.shareLink = async (req, res) => {
  const { user, date, guest, url } = req.body;
  try {
    User.findOne({ _id: guest })
      .then(guestUser => {
        var links = [];
        if (guestUser.links != null && guestUser.links.length > 0)
          links = [...guestUser.links];
        links.push({
          'user': user,
          'date': date,
          'url': url
        });
        guestUser.links = links;
        try {
          User.findOneAndUpdate({ _id: guest }, { $set: { 'links': links } }, { upsert: true })
            .then((r) => {
              res.status(200).send({});
            })
            .catch((err) => {
              res.send(500, { error: err });
            });
        } catch (e) {
          res.status(500).send({ message: e });
          return;
        }
      })
      .catch(error => {
        console.log(error);
        res.status(500).send(error);
      });
  } catch (err) {
    console.log(err);
    res.status(500).send(err);
  }
}

exports.getLinkList = (req, res) => {
  try {
    User.findOne({ _id: req.userId })
      .then(async (guestUser) => {
        for (var i = 0; i < guestUser.links.length; i++) {
          try {
            const usr = await User.findOne({ _id: guestUser.links[i].user });
            guestUser.links[i].user = usr.username;
          } catch (e) {
            console.log(e);
          }
        }
        res.status(200).send(guestUser.links);
      })
      .catch(error => {
        console.log(error);
        res.status(500).send(error);
      });
  } catch (err) {
    console.log(err);
    res.status(500).send(err);
  }
}

exports.unlink = async (req, res) => {
  const linkId = req.body.id;
  const guestId = req.userId;
  try {
    User.findOne({ _id: guestId })
      .then(guestUser => {
        var links = [];
        if (guestUser.links != null && guestUser.links.length > 0)
          links = [...guestUser.links];

        links = links.filter(l => l._id != linkId);
        try {
          User.findOneAndUpdate({ _id: guestId }, { $set: { 'links': links } }, { upsert: true })
            .then((r) => {
              res.status(200).send({});
            })
            .catch((err) => {
              res.send(500, { error: err });
            });
        } catch (e) {
          res.status(500).send({ message: e });
          return;
        }
      })
      .catch(error => {
        console.log(error);
        res.status(500).send(error);
      });
  } catch (err) {
    console.log(err);
    res.status(500).send(err);
  }
}
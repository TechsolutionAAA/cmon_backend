const db = require("../models");
const Settings = db.settings;

exports.getSettings = (req, res) => {
    Settings.find({}).exec((err, settings) => {
        if (err) {
            res.status(500).send({ message: err });
            return;
        }
        var result = {
            domain: '',
            webDesc: '',
            companyLogo: ''
        };

        for (var i = 0; i < settings.length; i++) {
            if (settings[i].type == 'DOMAIN')
                result.domain = settings[i].data;
            else if (settings[i].type == 'WEBDESC')
                result.webDesc = settings[i].data;
            else if (settings[i].type == 'COMPANYLOGO')
                result.companyLogo = settings[i].data;
        }

        res.status(200).send(result);
    });
};

function setSetting(_type, _data, res) {
    Settings.findOne({
        type: _type
    }).exec((err, setting) => {
        if (err) {
            res.status(500).send({ message: err });
            return;
        }

        if (setting) {
            try {
                Settings.findOneAndUpdate({ _id: setting.id }, { $set: { data: _data } }, { upsert: true })
                    .then((r) => {
                        res.status(200).send({ data: _data });
                    })
                    .catch((err) => {
                        res.send(500, { error: err });
                    });
            } catch (e) {
                res.status(500).send({ message: e });
                return;
            }
        } else {
            try {
                setting = new Settings({
                    type: _type,
                    data: _data
                });
                setting.save(err => {
                    if (err) {
                        res.status(500).send({ message: err });
                        return;
                    }

                    res.status(200).send({ data: _data });
                });
            } catch (e) {
                res.status(500).send({ message: e });
                return;
            }
        }
    });
}

exports.setDomain = async (req, res) => {
    setSetting('DOMAIN', req.body.domain, res);
};

exports.setWebDesc = async (req, res) => {
    setSetting('WEBDESC', req.body.webDesc, res);
};

exports.setCompanyLogo = (req, res) => {
    const protocol = req.protocol;
    const hostName = req.get('host');
    // const fullPath = req.originalUrl;

    const currentUrl = `${protocol}://${hostName}/uploads/${req.file.filename}`;
    setSetting('COMPANYLOGO', currentUrl, res);
};

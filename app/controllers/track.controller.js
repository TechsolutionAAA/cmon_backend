const db = require("../models");
const User = db.user;
const Track = db.track;
const fs = require('fs');

//Get by ID Method
exports.getAll = async (req, res) => {
    try {
        const { date } = req.params
        const workingTimeData = await db.track.aggregate([
            {
                $project: {
                    TimeStamp: {
                        $dateToString: {
                            format: "%Y-%m-%d %H:%M:%S",
                            date: "$TimeStamp"
                        }
                    },
                    DistanceValue: 1,
                    UserEvent: 1
                },
            },
            {
                $match: {
                    "TimeStamp": {
                        "$gte": date.concat(' 00'),
                        "$lte": date.concat(' 24')
                    }
                },
            },
            {
                $group: {
                    _id: {
                        TimeStamp: "$TimeStamp",
                    },
                }
            },
            {
                $sort: {
                    "_id.TimeStamp": 1
                }
            },
            {
                $group: {
                    _id: null,
                    count: {
                        $sum: 1
                    }
                }
            },
        ]);

        let workingTime = workingTimeData.length === 0 ? 0 : workingTimeData[0].count * 7
        workingTime = new Date(workingTime * 1000).toISOString().substring(11, 16)

        const data4Card = await db.track.aggregate([
            {
                $project: {
                    TimeStamp: {
                        $dateToString: {
                            format: "%Y-%m-%d %H:%M",
                            date: "$TimeStamp"
                        }
                    },
                    DistanceValue: 1,
                    UserEvent: 1
                },
            },
            {
                $match: {
                    "TimeStamp": {
                        "$gte": date.concat(' 00'),
                        "$lte": date.concat(' 24')
                    }
                },
            },
            {
                $group: {
                    _id: {
                        TimeStamp: "$TimeStamp",
                        UserEvent: "$UserEvent"
                    },
                    activityCnt: {
                        $sum: "$DistanceValue"
                    }
                }
            },
            {
                $sort: {
                    "_id.TimeStamp": 1
                }
            }
        ]);

        const chartData4OverallEvent = await db.track.aggregate([
            {
                $project: {
                    TimeStamp: {
                        $dateToString: {
                            format: "%Y-%m-%d %H:%M",
                            date: "$TimeStamp"
                        }
                    },
                    DistanceValue: 1,
                    UserEvent: 1
                },
            },
            {
                $match: {
                    "TimeStamp": {
                        "$gte": date.concat(' 00'),
                        "$lte": date.concat(' 24')
                    },
                    UserEvent: 1
                },
            },
            {
                $group: {
                    _id: {
                        TimeStamp: "$TimeStamp",
                        UserEvent: "$UserEvent"
                    },
                    activityCnt: {
                        $sum: "$DistanceValue"
                    }
                }
            },
            {
                $sort: {
                    "_id.TimeStamp": 1
                }
            }
        ]);

        const chartData4SystemEvent = await db.track.aggregate([
            {
                $project: {
                    TimeStamp: {
                        $dateToString: {
                            format: "%Y-%m-%d %H:%M",
                            date: "$TimeStamp"
                        }
                    },
                    DistanceValue: 1,
                    UserEvent: 1
                },
            },
            {
                $match: {
                    "TimeStamp": {
                        "$gte": date.concat(' 00'),
                        "$lte": date.concat(' 24')
                    },
                    UserEvent: 2
                },
            },
            {
                $group: {
                    _id: {
                        TimeStamp: "$TimeStamp",
                        UserEvent: "$UserEvent"
                    },
                    activityCnt: {
                        $sum: "$DistanceValue"
                    }
                }
            },
            {
                $sort: {
                    "_id.TimeStamp": 1
                }
            }
        ]);

        const chartData4KeyboardEvent = await db.track.aggregate([
            {
                $project: {
                    TimeStamp: {
                        $dateToString: {
                            format: "%Y-%m-%d %H:%M",
                            date: "$TimeStamp"
                        }
                    },
                    DistanceValue: 1,
                    UserEvent: 1
                },
            },
            {
                $match: {
                    "TimeStamp": {
                        "$gte": date.concat(' 00'),
                        "$lte": date.concat(' 24')
                    },
                    UserEvent: 3
                },
            },
            {
                $group: {
                    _id: {
                        TimeStamp: "$TimeStamp",
                        UserEvent: "$UserEvent"
                    },
                    activityCnt: {
                        $sum: "$DistanceValue"
                    }
                }
            },
            {
                $sort: {
                    "_id.TimeStamp": 1
                }
            }
        ]);

        const chartData4MouseEvent = await db.track.aggregate([
            {
                $project: {
                    TimeStamp: {
                        $dateToString: {
                            format: "%Y-%m-%d %H:%M",
                            date: "$TimeStamp"
                        }
                    },
                    DistanceValue: 1,
                    UserEvent: 1
                },
            },
            {
                $match: {
                    "TimeStamp": {
                        "$gte": date.concat(' 00'),
                        "$lte": date.concat(' 24')
                    },
                    UserEvent: 4
                },
            },
            {
                $group: {
                    _id: {
                        TimeStamp: "$TimeStamp",
                        UserEvent: "$UserEvent"
                    },
                    activityCnt: {
                        $sum: "$DistanceValue"
                    }
                }
            },
            {
                $sort: {
                    "_id.TimeStamp": 1
                }
            }
        ]);

        const chartData4Image = await db.track.aggregate([
            {
                $project: {
                    TimeStamp: {
                        $dateToString: {
                            format: "%Y-%m-%d %H:%M",
                            date: "$TimeStamp"
                        }
                    },
                    fileName: "$fileName",
                    UserEvent: 1
                },
            },
            {
                $match: {
                    "TimeStamp": {
                        "$gte": date.concat(' 00'),
                        "$lte": date.concat(' 24')
                    },
                    UserEvent: 5
                },
            },
        ]);

        if (data4Card.length === 0) {
            res.status(200).json({ cardData: {}, chartData: {} })
        } else {
            const workStartTime = data4Card[0]._id.TimeStamp.split(' ')[1]
            const workEndTime = data4Card[data4Card.length - 1]._id.TimeStamp.split(' ')[1]
            let overallAction = 0
            let systemAction = 0
            let keyboardAction = 0
            let mouseAction = 0
            data4Card.map(t => {
                if (t._id.UserEvent === 1) overallAction += t.activityCnt
                else if (t._id.UserEvent === 2) systemAction += t.activityCnt
                else if (t._id.UserEvent === 3) keyboardAction += t.activityCnt
                else if (t._id.UserEvent === 4) mouseAction += t.activityCnt
            })
            const cardData = {
                overallAction: `${overallAction}`, systemAction: `${systemAction}`, keyboardAction: `${keyboardAction}`,
                mouseAction: `${mouseAction}`, workStartTime, workEndTime, workingTime: workingTime
            }

            const startH = parseInt(data4Card[0]._id.TimeStamp.split(' ')[1].split(':')[0])
            const startM = parseInt(data4Card[0]._id.TimeStamp.split(' ')[1].split(':')[1])
            const endH = parseInt(data4Card[data4Card.length - 1]._id.TimeStamp.split(' ')[1].split(':')[0])
            const endM = parseInt(data4Card[data4Card.length - 1]._id.TimeStamp.split(' ')[1].split(':')[1])
            let flag
            let workingM
            if (endM - startM >= 0) {
                workingM = endM - startM
                flag = 0
            } else {
                workingM = 60 - startM + endM
                flag = 1
            }
            const workingH = endH - startH - flag
            const workingPeriod = workingH * 60 + workingM
            const chartLabels = []
            const trackData1 = []
            const trackData2 = []
            const trackData3 = []
            const trackData4 = []
            const imageData = []
            const startMinutes = startH * 60 + startM
            for (let i = 0; i <= workingPeriod; i++) {
                label = new Date((startMinutes + i) * 1000 * 60).toISOString().substring(11, 16)
                chartLabels.push(label)
                const overallValue = chartData4OverallEvent.find(t => t._id.TimeStamp.split(' ')[1] === `${label}`) ? chartData4OverallEvent.find(t => t._id.TimeStamp.split(' ')[1] === `${label}`).activityCnt : 0
                const systemValue = chartData4SystemEvent.find(t => t._id.TimeStamp.split(' ')[1] === `${label}`) ? chartData4SystemEvent.find(t => t._id.TimeStamp.split(' ')[1] === `${label}`).activityCnt : 0
                const keyboardValue = chartData4KeyboardEvent.find(t => t._id.TimeStamp.split(' ')[1] === `${label}`) ? chartData4KeyboardEvent.find(t => t._id.TimeStamp.split(' ')[1] === `${label}`).activityCnt : 0
                const mouseValue = chartData4MouseEvent.find(t => t._id.TimeStamp.split(' ')[1] === `${label}`) ? chartData4MouseEvent.find(t => t._id.TimeStamp.split(' ')[1] === `${label}`).activityCnt : 0

                let imageFileName = chartData4Image.find(t => t.TimeStamp.split(' ')[1] === `${label}`) ? chartData4Image.find(t => t.TimeStamp.split(' ')[1] === `${label}`).fileName : ''
                imageFileName = imageFileName ? imageFileName : ''
                trackData1.push(overallValue)
                trackData2.push(systemValue)
                trackData3.push(keyboardValue)
                trackData4.push(mouseValue)
                imageData.push(imageFileName)
            }

            const chartData = { chartLabels, trackData1, trackData2, trackData3, trackData4 }
            console.log({ cardData, chartData, imageData });
            res.status(200).json({ cardData, chartData, imageData })
        }
    }
    catch (error) {
        console.error(error.message)
        res.status(500).json({ msg: error.message })
    }
};

exports.getByUser = async (req, res) => {
    try {
        const { date, userId } = req.params;
        const userInfo = await User.findOne({ _id: userId });

        const workingTimeData = await db.track.aggregate([
            {
                $project: {
                    TimeStamp: {
                        $dateToString: {
                            format: "%Y-%m-%d %H:%M:%S",
                            date: "$TimeStamp"
                        }
                    },
                    DistanceValue: 1,
                    UserEvent: 1,
                    UserName: 1
                },
            },
            {
                $match: {
                    UserName: userInfo.username,
                    TimeStamp: {
                        "$gte": date.concat(' 00'),
                        "$lte": date.concat(' 24')
                    }
                },
            },
            {
                $group: {
                    _id: {
                        TimeStamp: "$TimeStamp",
                    },
                }
            },
            {
                $sort: {
                    "_id.TimeStamp": 1
                }
            },
            {
                $group: {
                    _id: null,
                    count: {
                        $sum: 1
                    }
                }
            },
        ]);

        let workingTime = workingTimeData.length === 0 ? 0 : workingTimeData[0].count * 7
        workingTime = new Date(workingTime * 1000).toISOString().substring(11, 16)

        const data4Card = await db.track.aggregate([
            {
                $project: {
                    TimeStamp: {
                        $dateToString: {
                            format: "%Y-%m-%d %H:%M",
                            date: "$TimeStamp"
                        }
                    },
                    DistanceValue: 1,
                    UserEvent: 1,
                    UserName: 1
                },
            },
            {
                $match: {
                    TimeStamp: {
                        "$gte": date.concat(' 00'),
                        "$lte": date.concat(' 24')
                    },
                    UserName: userInfo.username
                },
            },
            {
                $group: {
                    _id: {
                        TimeStamp: "$TimeStamp",
                        UserEvent: "$UserEvent"
                    },
                    activityCnt: {
                        $sum: "$DistanceValue"
                    }
                }
            },
            {
                $sort: {
                    "_id.TimeStamp": 1
                }
            }
        ]);

        const chartData4OverallEvent = await db.track.aggregate([
            {
                $project: {
                    TimeStamp: {
                        $dateToString: {
                            format: "%Y-%m-%d %H:%M",
                            date: "$TimeStamp"
                        }
                    },
                    DistanceValue: 1,
                    UserEvent: 1,
                    UserName: 1
                },
            },
            {
                $match: {
                    TimeStamp: {
                        "$gte": date.concat(' 00'),
                        "$lte": date.concat(' 24')
                    },
                    UserEvent: 1,
                    UserName: userInfo.username
                },
            },
            {
                $group: {
                    _id: {
                        TimeStamp: "$TimeStamp",
                        UserEvent: "$UserEvent"
                    },
                    activityCnt: {
                        $sum: "$DistanceValue"
                    }
                }
            },
            {
                $sort: {
                    "_id.TimeStamp": 1
                }
            }
        ]);

        const chartData4SystemEvent = await db.track.aggregate([
            {
                $project: {
                    TimeStamp: {
                        $dateToString: {
                            format: "%Y-%m-%d %H:%M",
                            date: "$TimeStamp"
                        }
                    },
                    DistanceValue: 1,
                    UserEvent: 1,
                    UserName: 1
                },
            },
            {
                $match: {
                    TimeStamp: {
                        "$gte": date.concat(' 00'),
                        "$lte": date.concat(' 24')
                    },
                    UserEvent: 2,
                    UserName: userInfo.username
                },
            },
            {
                $group: {
                    _id: {
                        TimeStamp: "$TimeStamp",
                        UserEvent: "$UserEvent"
                    },
                    activityCnt: {
                        $sum: "$DistanceValue"
                    }
                }
            },
            {
                $sort: {
                    "_id.TimeStamp": 1
                }
            }
        ]);

        const chartData4KeyboardEvent = await db.track.aggregate([
            {
                $project: {
                    TimeStamp: {
                        $dateToString: {
                            format: "%Y-%m-%d %H:%M",
                            date: "$TimeStamp"
                        }
                    },
                    DistanceValue: 1,
                    UserEvent: 1,
                    UserName: 1
                },
            },
            {
                $match: {
                    TimeStamp: {
                        "$gte": date.concat(' 00'),
                        "$lte": date.concat(' 24')
                    },
                    UserEvent: 3,
                    UserName: userInfo.username
                },
            },
            {
                $group: {
                    _id: {
                        TimeStamp: "$TimeStamp",
                        UserEvent: "$UserEvent"
                    },
                    activityCnt: {
                        $sum: "$DistanceValue"
                    }
                }
            },
            {
                $sort: {
                    "_id.TimeStamp": 1
                }
            }
        ]);

        const chartData4MouseEvent = await db.track.aggregate([
            {
                $project: {
                    TimeStamp: {
                        $dateToString: {
                            format: "%Y-%m-%d %H:%M",
                            date: "$TimeStamp"
                        }
                    },
                    DistanceValue: 1,
                    UserEvent: 1,
                    UserName: 1
                },
            },
            {
                $match: {
                    TimeStamp: {
                        "$gte": date.concat(' 00'),
                        "$lte": date.concat(' 24')
                    },
                    UserEvent: 4,
                    UserName: userInfo.username
                },
            },
            {
                $group: {
                    _id: {
                        TimeStamp: "$TimeStamp",
                        UserEvent: "$UserEvent"
                    },
                    activityCnt: {
                        $sum: "$DistanceValue"
                    }
                }
            },
            {
                $sort: {
                    "_id.TimeStamp": 1
                }
            }
        ]);

        const chartData4Image = await db.track.aggregate([
            {
                $project: {
                    TimeStamp: {
                        $dateToString: {
                            format: "%Y-%m-%d %H:%M",
                            date: "$TimeStamp"
                        }
                    },
                    fileName: "$fileName",
                    UserEvent: 1,
                    UserName: 1
                },
            },
            {
                $match: {
                    TimeStamp: {
                        "$gte": date.concat(' 00'),
                        "$lte": date.concat(' 24')
                    },
                    UserEvent: 5,
                    UserName: userInfo.username
                },
            },
        ]);

        if (data4Card.length === 0) {
            res.status(200).json({ cardData: {}, chartData: {}, username: userInfo.username, date: date, vd: userInfo.viewdetail })
        } else {
            const workStartTime = data4Card[0]._id.TimeStamp.split(' ')[1]
            const workEndTime = data4Card[data4Card.length - 1]._id.TimeStamp.split(' ')[1]
            let overallAction = 0
            let systemAction = 0
            let keyboardAction = 0
            let mouseAction = 0
            data4Card.map(t => {
                if (t._id.UserEvent === 1) overallAction += t.activityCnt
                else if (t._id.UserEvent === 2) systemAction += t.activityCnt
                else if (t._id.UserEvent === 3) keyboardAction += t.activityCnt
                else if (t._id.UserEvent === 4) mouseAction += t.activityCnt
            })
            const cardData = {
                overallAction: `${overallAction}`, systemAction: `${systemAction}`, keyboardAction: `${keyboardAction}`,
                mouseAction: `${mouseAction}`, workStartTime, workEndTime, workingTime: workingTime
            }

            const startH = parseInt(data4Card[0]._id.TimeStamp.split(' ')[1].split(':')[0])
            const startM = parseInt(data4Card[0]._id.TimeStamp.split(' ')[1].split(':')[1])
            const endH = parseInt(data4Card[data4Card.length - 1]._id.TimeStamp.split(' ')[1].split(':')[0])
            const endM = parseInt(data4Card[data4Card.length - 1]._id.TimeStamp.split(' ')[1].split(':')[1])
            let flag
            let workingM
            if (endM - startM >= 0) {
                workingM = endM - startM
                flag = 0
            } else {
                workingM = 60 - startM + endM
                flag = 1
            }
            const workingH = endH - startH - flag
            const workingPeriod = workingH * 60 + workingM
            const chartLabels = []
            const trackData1 = []
            const trackData2 = []
            const trackData3 = []
            const trackData4 = []
            const imageData = []
            const startMinutes = startH * 60 + startM
            for (let i = 0; i <= workingPeriod; i++) {
                label = new Date((startMinutes + i) * 1000 * 60).toISOString().substring(11, 16)
                chartLabels.push(label)
                const overallValue = chartData4OverallEvent.find(t => t._id.TimeStamp.split(' ')[1] === `${label}`) ? chartData4OverallEvent.find(t => t._id.TimeStamp.split(' ')[1] === `${label}`).activityCnt : 0
                const systemValue = chartData4SystemEvent.find(t => t._id.TimeStamp.split(' ')[1] === `${label}`) ? chartData4SystemEvent.find(t => t._id.TimeStamp.split(' ')[1] === `${label}`).activityCnt : 0
                const keyboardValue = chartData4KeyboardEvent.find(t => t._id.TimeStamp.split(' ')[1] === `${label}`) ? chartData4KeyboardEvent.find(t => t._id.TimeStamp.split(' ')[1] === `${label}`).activityCnt : 0
                const mouseValue = chartData4MouseEvent.find(t => t._id.TimeStamp.split(' ')[1] === `${label}`) ? chartData4MouseEvent.find(t => t._id.TimeStamp.split(' ')[1] === `${label}`).activityCnt : 0

                let imageFileName = chartData4Image.find(t => t.TimeStamp.split(' ')[1] === `${label}`) ? chartData4Image.find(t => t.TimeStamp.split(' ')[1] === `${label}`).fileName : ''
                imageFileName = imageFileName ? imageFileName : ''
                trackData1.push(overallValue)
                trackData2.push(systemValue)
                trackData3.push(keyboardValue)
                trackData4.push(mouseValue)
                imageData.push(imageFileName)
            }

            const chartData = { chartLabels, trackData1, trackData2, trackData3, trackData4 }
            res.status(200).json({ cardData, chartData, imageData, username: userInfo.username, date: date, vd: userInfo.viewdetail });
        }
    }
    catch (error) {
        console.error(error.message)
        res.status(500).json({ msg: error.message })
    }
}

exports.setTrack = async (req, res) => {
    try {
        const data = req.query

        // const base64 = fs.readFileSync('image.jpg', {encoding: 'base64'});
        const base64 = data.Base64Data
        const userEvnt = data.UserEvent
        if (userEvnt == 5) {
            data.fileName = `img${new Date().getTime()}.jpg`
            fs.writeFileSync(`../frontend/public/static/screenshots/img${new Date().getTime()}.jpg`, base64, 'base64', function (err) {
                if (err) console.log('error ------------->', err);
            });
        }

        data.TimeStamp = new Date(data.TimeStamp)
        const newTrackData = new Track(data)
        const result = await newTrackData.save()
        res.status(200).json(result)
    } catch (error) {
        res.status(400).json({ message: error.message })
    }
}

exports.updateUser = async (req, res) => {
    try {
        const id = req.params.id;
        const updatedData = req.body;
        const options = { new: true };

        const result = await User.findByIdAndUpdate(
            id, updatedData, options
        )

        res.send(result)
    }
    catch (error) {
        res.status(400).json({ message: error.message })
    }
}

exports.delete = async (req, res) => {
    try {
        const id = req.params.id;
        const data = await Track.findByIdAndDelete(id)
        res.send(`Document with ${data.name} has been deleted..`)
    }
    catch (error) {
        res.status(400).json({ message: error.message })
    }
}
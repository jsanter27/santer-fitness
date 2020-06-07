const GraphQLSchema = require('graphql').GraphQLSchema;
const GraphQLObjectType = require('graphql').GraphQLObjectType;
const GraphQLList = require('graphql').GraphQLList;
const GraphQLEnumType = require('graphql').GraphQLEnumType;
const GraphQLInputObjectType = require('graphql').GraphQLInputObjectType;
const GraphQLNonNull = require('graphql').GraphQLNonNull;
//const GraphQLNull = require('graphql').GraphQLNull;
//const GraphQLID = require('graphql').GraphQLID;
const GraphQLString = require('graphql').GraphQLString;
//const GraphQLInt = require('graphql').GraphQLInt;
//const GraphQLFloat = require('graphql').GraphQLFloat;
const GraphQLBoolean = require('graphql').GraphQLBoolean;
const GraphQLDate = require('graphql-date');
const UserModel = require('../models/User');
const SlideModel = require('../models/Slide');
const EventModel = require('../models/Event');
const AlertModel = require('../models/Alert');
const bcrypt = require('bcrypt');

const userType = new GraphQLObjectType({
    name: "userType",
    fields: function () {
        return {
            _id: {
                type: GraphQLString
            },
            username: {
                type: GraphQLString
            },
            password: {
                type: GraphQLString
            },
            resetPasswordToken: {
                type: GraphQLString
            },
            resetPasswordExpires: {
                type: GraphQLDate
            }
        }
    }
});

const slideType = new GraphQLObjectType({
    name: "slideType",
    fields: function () {
        return {
            _id: {
                type: GraphQLString
            },
            header: {
                type: GraphQLString
            },
            body: {
                type: GraphQLString
            },
            backgroundColor: {
                type: GraphQLString
            },
            lastModifiedBy: {
                type: GraphQLString
            }
        }
    }
});

const dayEnum = new GraphQLEnumType({
    name: "dayEnum",
    values: {
        SUN: {
            value: "SUN"
        },
        MON: {
            value: "MON"
        },
        TUE: {
            value: "TUE"
        },
        WED: {
            value: "WED"
        },
        THU: {
            value: "THU"
        },
        FRI: {
            value: "FRI"
        },
        SAT: {
            value: "SAT"
        }
    }
});

const classType = new GraphQLObjectType({
    name: "classType",
    fields: function () {
        return {
            instructor: {
                type: GraphQLString
            },
            day: {
                type: dayEnum
            },
            startTime: {
                type: GraphQLString
            },
            endTime: {
                type: GraphQLString
            }
        }
    } 
});

const classInput = new GraphQLInputObjectType({
    name: "classInput",
    fields: function () {
        return {
            instructor: {
                type: GraphQLNonNull(GraphQLString)
            },
            day: {
                type: GraphQLNonNull(dayEnum)
            },
            startTime: {
                type: GraphQLNonNull(GraphQLString)
            },
            endTime: {
                type: GraphQLNonNull(GraphQLString)
            }
        }
    }
});

const eventType = new GraphQLObjectType({
    name: "eventType",
    fields: function () {
        return {
            _id: {
                type: GraphQLString
            },
            name: {
                type: GraphQLString
            },
            description: {
                type: GraphQLString
            },
            times: {
                type: GraphQLList(classType)
            },
            lastModifiedBy: {
                type: GraphQLString
            }
        }
    }
});

const alertType = new GraphQLObjectType({
    name: "alertType",
    fields: function () {
        return {
            _id: {
                type: GraphQLString
            },
            message: {
                type: GraphQLString
            },
            isActive: {
                type: GraphQLBoolean
            },
            lastModifiedBy: {
                type: GraphQLString
            }
        }
    }
});

const queryType = new GraphQLObjectType({
    name: "Query",
    fields: function () {
        return {
            getUserByToken: {
                type: userType,
                args: {
                    resetPasswordToken : {
                        type: GraphQLString
                    }
                },
                resolve: function (root, params) {
                    const user = UserModel.findOne({ resetPasswordToken: params.resetPasswordToken }).exec();
                    if (!user){
                        return null;
                    }
                    return user;
                }
            },
            getAllSlides: {
                type: new GraphQLList(slideType),
                resolve: function () {
                    const slides = SlideModel.find().exec();
                    if (!slides){
                        return null;
                    }
                    return slides;
                }
            },
            getAllEvents: {
                type: new GraphQLList(eventType),
                resolve: function () {
                    const events = EventModel.find().exec();
                    if (!events){
                        return null;
                    }
                    return events;
                }
            },
            getAllAlerts: {
                type: new GraphQLList(alertType),
                resolve: function () {
                    const alerts = AlertModel.find().exec();
                    if (!alerts){
                        return null;
                    }
                    return alerts;
                }
            },
            getActiveAlerts: {
                type: new GraphQLList(alertType),
                resolve: function () {
                    const alerts = AlertModel.find({ isActive: true }).exec();
                    if (!alerts){
                        return null;
                    }
                    return alerts;
                }
            },
        }
    }
});

const mutationType = new GraphQLObjectType({
    name: "Mutation",
    fields: function () {
        return {
            changeUserPassword: {
                type: userType,
                args: {
                    id: {
                        name: 'id',
                        type: new GraphQLNonNull(GraphQLString)
                    },
                    password: {
                        type: new GraphQLNonNull(GraphQLString)
                    }
                },
                resolve: function (root, params) {
                    let user = UserModel.findById(params.id).exec();
                    if (!user){
                        throw new Error("Could not find User");
                    }
                    if (!user.resetPasswordToken || user.resetPasswordExpires < Date.now()){
                        throw new Error("Cannot change this User's password");
                    }
                    let pass = params.password;
                    bcrypt.hash(pass, 10, (err, hashedPassword) => {
                        if (err){
                            throw new Error("Hash Error");
                        }
                        user.updateOne({ password: hashedPassword }, (err) => {
                            if (err){
                                throw new Error("Update Error")
                            }
                        });
                        return user;
                    });
                }
            },
            addSlide: {
                type: slideType,
                args: {
                    header: {
                        type: new GraphQLNonNull(GraphQLString)
                    },
                    body: {
                        type: new GraphQLNonNull(GraphQLString)
                    },
                    backgroundColor: {
                        type: new GraphQLNonNull(GraphQLString)
                    },
                    lastModifiedBy: {
                        type: new GraphQLNonNull(GraphQLString)
                    }
                },
                resolve: function (root, params) {
                    const slideModel = new SlideModel(params);
                    const newSlide = slideModel.save();
                    if (!newSlide) {
                        throw new Error("Could not save Slide");
                    }
                    return newSlide;
                }
            },
            updateSlide: {
                type: slideType,
                args: {
                    id: {
                        name: 'id',
                        type: new GraphQLNonNull(GraphQLString)
                    },
                    header: {
                        type: new GraphQLNonNull(GraphQLString)
                    },
                    body: {
                        type: new GraphQLNonNull(GraphQLString)
                    },
                    backgroundColor: {
                        type: new GraphQLNonNull(GraphQLString)
                    },
                    lastModifiedBy: {
                        type: new GraphQLNonNull(GraphQLString)
                    }
                },
                resolve: function (root, params) {
                    return SlideModel.findByIdAndUpdate(params.id, {
                        header: params.header,
                        body: params.body,
                        backgroundColor: params.backgroundColor,
                        lastModifiedBy: params.lastModifiedBy
                    }, (err) => {
                        if (err)
                            throw new Error('Could not update Slide');
                    });
                }
            },
            removeSlide: {
                type: slideType,
                args: {
                    id: {
                        name: 'id',
                        type: new GraphQLNonNull(GraphQLString)
                    }
                },
                resolve: function (root, params) {
                    const removedSlide = SlideModel.findByIdAndRemove(params.id).exec();
                    if (!removedSlide) {
                        throw new Error("Could not remove Slide");
                    }
                    return removedSlide;
                }
            },
            addEvent: {
                type: eventType,
                args: {
                    name: {
                        type: new GraphQLNonNull(GraphQLString)
                    },
                    description: {
                        type: new GraphQLNonNull(GraphQLString)
                    },
                    times: {
                        type: new GraphQLList(classInput)
                    },
                    lastModifiedBy: {
                        type: new GraphQLNonNull(GraphQLString)
                    }
                },
                resolve: function (root, params) {
                    const eventModel = new EventModel(params);
                    const newEvent = eventModel.save();
                    if (!newEvent) {
                        throw new Error("Could not save Event");
                    }
                    return newEvent;
                }
            },
            updateEvent: {
                type: eventType,
                args: {
                    id: {
                        name: 'id',
                        type: new GraphQLNonNull(GraphQLString)
                    },
                    name: {
                        type: new GraphQLNonNull(GraphQLString)
                    },
                    description: {
                        type: new GraphQLNonNull(GraphQLString)
                    },
                    times: {
                        type: new GraphQLList(classInput)
                    },
                    lastModifiedBy: {
                        type: new GraphQLNonNull(GraphQLString)
                    }
                },
                resolve: function (root, params) {
                    return EventModel.findByIdAndUpdate(params.id, {
                        name: params.name,
                        description: params.description,
                        times: params.times,
                        lastModifiedBy: params.lastModifiedBy
                    }, (err) => {
                        if (err)
                            throw new Error('Could not update Event');
                    });
                }
            },
            removeEvent: {
                type: eventType,
                args: {
                    id: {
                        name: 'id',
                        type: new GraphQLNonNull(GraphQLString)
                    }
                },
                resolve: function (root, params) {
                    const removedEvent = EventModel.findByIdAndRemove(params.id).exec();
                    if (!removedEvent) {
                        throw new Error("Could not remove Event");
                    }
                    return removedEvent;
                }
            },
            addAlert: {
                type: alertType,
                args: {
                    message: {
                        type: new GraphQLNonNull(GraphQLString)
                    },
                    isActive: {
                        type: new GraphQLNonNull(GraphQLBoolean)
                    },
                    lastModifiedBy: {
                        type: new GraphQLNonNull(GraphQLString)
                    }
                },
                resolve: function (root, params) {
                    const alertModel = new AlertModel(params);
                    const newAlert = alertModel.save();
                    if (!newAlert) {
                        throw new Error("Could not save Alert");
                    }
                    return newAlert;
                }
            },
            updateAlert: {
                type: alertType,
                args: {
                    id: {
                        name: 'id',
                        type: new GraphQLNonNull(GraphQLString)
                    },
                    message: {
                        type: new GraphQLNonNull(GraphQLString)
                    },
                    isActive: {
                        type: new GraphQLNonNull(GraphQLBoolean)
                    },
                    lastModifiedBy: {
                        type: new GraphQLNonNull(GraphQLString)
                    }
                },
                resolve: function (root, params) {
                    return AlertModel.findByIdAndUpdate(params.id, {
                        message: params.message,
                        isActive: params.isActive,
                        lastModifiedBy: params.lastModifiedBy
                    }, (err) => {
                        if (err)
                            throw new Error('Could not update Alert');
                    });
                }
            },
            removeAlert: {
                type: alertType,
                args: {
                    id: {
                        name: 'id',
                        type: new GraphQLNonNull(GraphQLString)
                    }
                },
                resolve: function (root, params) {
                    const removedAlert = AlertModel.findByIdAndRemove(params.id).exec();
                    if (!removedAlert) {
                        throw new Error("Could not remove Alert");
                    }
                    return removedAlert;
                }
            }
        }
    }
});

module.exports = new GraphQLSchema({ query: queryType, mutation: mutationType });
var mongoose = require('mongoose')
    , Schema = mongoose.Schema
    , utils = require('../../lib/utils')
    , fs = require('fs')
    , easyimage = require('easyimage')

var BicycleSchema = new Schema({
    title: { type: String, default: '', trim: true},
    brand: { type: String, default: '', trim: true},
    owner: {type: Schema.ObjectId, ref: 'User'},
    desc: { type: String, default: '', trim: true},
    comments: [{
        body: { type: String, default: ''},
        user: { type: Schema.ObjectId, ref: 'User'},
        createdAt: { type: Date, default: Date.now}
    }],
    customers: {
        user: { type: Schema.ObjectId, ref: 'User'},
        createdAt: { type: Date, default: Date.now}
    },
    image: {
        url: String
    },
    available: [{
        type: 
    createdAt: { type: Date, default: Date.now}
});

BicycleSchema.path('title').required(true, 'Bicycle title cannot be blank');
BicycleSchema.path('desc').required(true, 'just say something about it.');

BicycleSchema.methods = {
    moveAndSave: function (files, cb) {
        var url;
        image = files.image;
        if (!image) return this.save(cb);
        utils.moveImage(image, 'public/img/upload/', function(newPath) {
            utils.thumbnailImage(newPath, 'public/img/thumbnail/', function(thumbnailPath){
                var self = this;
                this.validate(function(err){
                    if (err) return cb(err);
                    self.image = { url: thumbnailPath};
                    self.save(cb);
                });
            });
        });
    },
    saveOnly: function(cb) {
        var self = this;
        this.validate(function(err){
            if (err) return cb(err);
            self.save(cb);
        });
    },
    addComment: function(user, comment, cb) {
        this.comments.push({
            body: comment.body,
            user: user._id
        });
        this.save(cb);
    },
    removeComment: function(commentId, cb) {
        var index = utils.indexof(this.comments, {
            id: commentId
        });
        if (~index) this.comments.splice(index, 1);
        else return cb('not found');
        this.save(cb);
    },
    setCustomer: function(user, cb) {
        this.user = {
            user: user._id
        };
        this.save(cb);
    },
    removeRentee: function(cb) {
        this.rentee = {};
        this.save(cb);
    }
};

BicycleSchema.statics = {
    load: function(id, cb) {
        this.findOne({_id: id})
            .populate('user', 'name email username')
            .populate('comments.user')
            .populate('rentee.user')
            .exec(cb)
    },
    list: function(options, cb) {
        var criteria = options.criteria || {}

        this.find(criteria)
            .populate('user', 'name username')
            .sort({'createdAt': -1})
            .limit(options.perPage)
            .skip(options.perPage * options.page)
            .exec(cb)
    }
};

mongoose.model('Bicycle', BicycleSchema);

var mongoose = require('mongoose')
    , Schema = mongoose.Schema
    , utils = require('../../lib/utils')
    , fs = require('fs')
    , easyimage = require('easyimage')

var CarSchema = new Schema({
    title: { type: String, default: '', trim: true},
    brand: { type: String, default: '', trim: true},
    user: { type: Schema.ObjectId, ref: 'User'},
    desc: { type: String, default: '', trim: true},
    comments: [{
        body: { type: String, default: ''},
        user: { type: Schema.ObjectId, ref: 'User'},
        createdAt: { type: Date, default: Date.now}
    }],
    rentee: {
        user: { type: Schema.ObjectId, ref: 'User'},
        createdAt: { type: Date, default: Date.now}
    },
    image: {
        url: String
    },
    createdAt: { type: Date, default: Date.now}
});

CarSchema.path('title').required(true, 'Car title cannot be blank');
CarSchema.path('desc').required(true, 'just say something about it.');

CarSchema.methods = {
    moveAndSave: function (files, cb) {
        image = files.image;
        if (!image) return this.save(cb);
        var tmpPath = image.path;
        var index = image.path.lastIndexOf('/');
        var filename = image.path.substr(index);
        var targetPath = 'public/img/upload'+filename;
        var thumbnailPath = 'public/img/thumbnail'+filename;
        var url = '/img/thumbnail'+filename;
        fs.rename(tmpPath, targetPath, function(err){
            if (err) return this.save(cb);
            fs.unlink(tmpPath, function() {
                if (err) throw err; //TODO really ?
            });
        });
        easyimage.thumbnail({
            src: targetPath,
            dst: thumbnailPath,
            height: 128,
            width: 128,
            x: 0,
            y: 0
        }, function(err, image) {
            if (err) throw err;
        });
        //var imager = new Imager(imagerConfig, 'S3')
        var self = this;
        this.validate(function(err){
            if (err) return cb(err);
            self.image = { url: url};
            self.save(cb);
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
    addRentee: function(user, cb) {
        this.rentee = {
            user: user._id
        };
        this.save(cb);
    },
    removeRentee: function(cb) {
        this.rentee = {};
        this.save(cb);
    }
};

CarSchema.statics = {
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

mongoose.model('Car', CarSchema);

var mongoose = require('mongoose')
    , Car = mongoose.model('Car')
    , utils = require('../../lib/utils')
    , extend = require('util')._extend

exports.load = function(req, res, next, id) {
    //var User = mongoose.model('User');
    Car.load(id, function(err, car) {
        if (err) return next(err);
        if (!car) return next(new Error('not found'));
        req.car = car;
        next();
    })
};

exports.index = function(req, res) {
    var page = (req.param('page')>0? req.param('page'): 1) -1;
    var perPage = 30;
    var options = {
        perPage: perPage,
        page: page
    };
    Car.list(options, function(err, cars) {
        if (err) return res.render('500');
        Car.count().exec(function(err, count) {
            res.render('cars/index', {
                title: 'Cars',
                cars: cars,
                page: page + 1,
                pages: Math.ceil(count/perPage)
            })
        })
    });
};

exports.new = function(req, res) {
    res.render('cars/new', {
        title: 'New Car',
        car: new Car({})
    });
};

exports.create = function(req, res) {
    var car = new Car(req.body);
    car.user = req.user;
    car.moveAndSave(req.files, function(err) {
        if (!err) {
            req.flash('success', 'Successfully created car!');
            return res.redirect('/cars/'+car._id);
        }
        res.render('cars/new', {
            title: 'New Car',
            car: car,
            error: utils.errors(err.errors || err)
        });
    });
};

exports.edit = function(req, res) {
    res.render('cars/edit', {
        title: 'Edit ' + req.car.title,
        car: req.car
    });
};

exports.update = function(req, res) {
    var car = req.car;
    var url = req.car.image.url;
    car = extend(car, req.body);
    var cb = function(err) {
        if (!err) {
            return res.redirect('/cars/'+car._id);
        }
        res.render('cars/edit', {
            title: 'Edit car',
            car: car,
            error: utils.errors(err.errors || err)
        });
    };
    if (req.files.image.originalFilename)
        car.moveAndSave(req.files, cb);
    else
        car.saveOnly(cb);
};

exports.show = function(req, res) {
    res.render('cars/show', {
        title: req.car.title,
        car: req.car,
        user: req.user
    });
};

exports.destroy = function(req, res) {
    var car = req.car;
    car.remove(function(err) {
        req.flash('info', 'Deleted successfully');
        res.redirect('/cars');
    });
};

exports.showrent = function(req, res) {
    res.render('cars/rent', {
        title: '订单详情',
        car: req.car,
        user: req.user
    });
};

exports.rent = function(req, res) {
    var car = req.car;
    console.log(car);
    var user = req.user;
    car.addRentee(user, function(err) {
        if (err) res.render('500');
        res.redirect('/users/'+user._id);
    });
    user.addRenting(car, function(err) {
        if (err) res.render('500');
        res.redirect('/users/'+user._id);
    });
};

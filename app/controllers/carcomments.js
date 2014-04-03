var mongoose = require('mongoose');
var utils = require('../../lib/utils');

exports.load = function(req, res, next, id) {
    var car = req.car;
    utils.findByParam(car.comments, {id: id}, function(err, comment) {
        if (err) return next(err);
        req.comment = comment;
        next();
    });
};

exports.create = function(req, res) {
    var car = req.car;
    var user = req.user;
    if (!req.body.body) return res.redirect('/cars/'+car.id); //???
    car.addComment(user, req.body, function(err) {
        if (err) return res.render('500');
        res.redirect('/cars/'+car.id);
    });
}

exports.destroy = function(req, res) {
    var car = req.car;
    car.removeComment(req.param('carcommentId'), function(err) {
        if (err) {
            req.flash('error', 'Oops! The comment was not found');
        } else {
            req.flash('info', 'Removed comment');
        }
        res.redirect('/cars/'+car.id);
    });
};


/**
 * Module dependencies.
 */

var mongoose = require('mongoose')
  , User = mongoose.model('User')
  , utils = require('../../lib/utils')

var login = function (req, res) {
  var redirectTo = req.session.returnTo ? req.session.returnTo : '/'
  delete req.session.returnTo
  res.redirect(redirectTo)
}

exports.signin = function (req, res) {}

/**
 * Auth callback
 */

exports.authCallback = login

/**
 * Show login form
 */

exports.login = function (req, res) {
  res.render('users/login', {
    title: 'Login',
    message: req.flash('error')
  })
}

/**
 * Show sign up form
 */

exports.signup = function (req, res) {
  res.render('users/signup', {
    title: 'Sign up',
    user: new User()
  })
}

/**
 * Logout
 */

exports.logout = function (req, res) {
  req.logout()
  res.redirect('/login')
}

/**
 * Session
 */

exports.session = login

/**
 * Create user
 */

exports.create = function (req, res) {
  var user = new User(req.body)
  user.provider = 'local'
  user.save(function (err) {
    if (err) {
      return res.render('users/signup', {
        error: utils.errors(err.errors),
        user: user,
        title: 'Sign up'
      })
    }

    // manually login the user once successfully signed up
    req.logIn(user, function(err) {
      if (err) return next(err)
      return res.redirect('/')
    })
  })
}

/**
 *  Show profile
 */

exports.show = function (req, res) {
  var user = req.profile;
  var cars = [];
  for (var i=0;i<user.rentings.length;i++) {
      var car = user.rentings[i].car;
      User.findOne({_id: car.user}).exec(function(err, user) {
          if (err) {
            throw err
          }
          //TODO pass user to viewer
      });
  }
  res.render('users/show', {
    title: user.name,
    user: user
  })
}

/**
 * Find user by id
 */

exports.load = function (req, res, next, id) {
    User.load(id, function(err, user) {
        if (err) return next(err);
        if (!user) return next(new Error('failed to load user'));
        req.profile = user;
        next();
    });
    /*
  User
    .findOne({ _id : id })
    .exec(function (err, user) {
      if (err) return next(err)
      if (!user) return next(new Error('Failed to load User ' + id))
      req.profile = user
      next()
    })
    */
}

exports.edit = function(req, res) {
    res.render('users/edit', {
        title: 'Edit '+req.user.name,
        user: req.user
    });
};

exports.password = function(req, res) {
    res.render('users/password', {
        title: 'Change Password',
        user: req.user
    });
};

exports.changePassword = function(req, res) {
    var user = req.user;
    console.log(req.body.prePassword);
    if (!user.authenticate(req.body.prePassword)) {
        console.log('error'); //TODO tell user about this
        return res.redirect('/');
    }
    user.set('password', req.body.newPassword);
    user.save(function(err) {
        if (err) {
            return res.render('users/show', {
                title: user.name,
                user: user
            });
        }
    });
    console.log('succ change'); //TODO tell user about this
    return res.redirect('/');
};

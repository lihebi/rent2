/*!
 * Module dependencies.
 */

var async = require('async')

/**
 * Controllers
 */

var users = require('../app/controllers/users')
  , articles = require('../app/controllers/articles')
  , cars = require('../app/controllers/cars')
  , auth = require('./middlewares/authorization')

/**
 * Route middlewares
 */

var articleAuth = [auth.requiresLogin, auth.article.hasAuthorization]
var commentAuth = [auth.requiresLogin, auth.comment.hasAuthorization]
var userAuth = [auth.requiresLogin, auth.user.hasAuthorization]
var carAuth = [auth.requiresLogin, auth.car.hasAuthorization]
var carcommentAuth = [auth.requiresLogin, auth.carcomment.hasAuthorization]

/**
 * Expose routes
 */

module.exports = function (app, passport) {

  // user routes
  app.get('/login', users.login)
  app.get('/signup', users.signup)
  app.get('/logout', users.logout)
  app.post('/users', users.create)
  app.post('/users/session',
    passport.authenticate('local', {
      failureRedirect: '/login',
      failureFlash: 'Invalid email or password.'
    }), users.session)
  app.get('/users/:userId', users.show)
    app.get('/users/:userId/edit', userAuth, users.edit);
    app.get('/users/:userId/password', userAuth, users.password);
    app.post('/users/password', auth.requiresLogin, users.changePassword);
  app.param('userId', users.load)
      /*
  app.get('/auth/google',
    passport.authenticate('google', {
      failureRedirect: '/login',
      scope: [
        'https://www.googleapis.com/auth/userinfo.profile',
        'https://www.googleapis.com/auth/userinfo.email'
      ]
    }), users.signin)
  app.get('/auth/google/callback',
    passport.authenticate('google', {
      failureRedirect: '/login'
    }), users.authCallback)
*/

  // article routes
  app.param('articleId', articles.load)
  app.get('/articles', articles.index)
  app.get('/articles/new', auth.requiresLogin, articles.new)
  app.post('/articles', auth.requiresLogin, articles.create)
  app.get('/articles/:articleId', articles.show)
  app.get('/articles/:articleId/edit', articleAuth, articles.edit)
  app.put('/articles/:articleId', articleAuth, articles.update)
  app.del('/articles/:articleId', articleAuth, articles.destroy)

  // home route
  //app.get('/', articles.index)
  app.get('/', cars.index);

  // comment routes
  var comments = require('../app/controllers/comments')
  app.param('commentId', comments.load)
  app.post('/articles/:articleId/comments', auth.requiresLogin, comments.create)
  app.get('/articles/:articleId/comments', auth.requiresLogin, comments.create)
  app.del('/articles/:articleId/comments/:commentId', commentAuth, comments.destroy)

  // tag routes
  var tags = require('../app/controllers/tags')
  app.get('/tags/:tag', tags.index)

  app.param('carId', cars.load);
  app.get('/cars', cars.index);
  app.get('/cars/new', auth.requiresLogin, cars.new);
  app.post('/cars', auth.requiresLogin, cars.create);
  app.get('/cars/:carId', cars.show);
  app.get('/cars/:carId/edit', carAuth, cars.edit);
  app.put('/cars/:carId', carAuth, cars.update);
  app.del('/cars/:carId', carAuth, cars.destroy);

  var carcomments = require('../app/controllers/carcomments');
  app.param('carcommentId', carcomments.load);
  app.post('/cars/:carId/comments', auth.requiresLogin, carcomments.create);
  app.get('/cars/:carId/comments', auth.requiresLogin, carcomments.create);
  app.del('/cars/:carId/comments/:carcommentId', carcommentAuth, carcomments.destroy);


  app.get('/cars/:carId/rent', auth.requiresLogin, cars.showrent);
  app.post('/cars/:carId/rent', auth.requiresLogin, cars.rent);

}

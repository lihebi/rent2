/**
 * Module dependencies.
 */

var mongoose = require('mongoose')
  , Schema = mongoose.Schema
  , crypto = require('crypto')
  , oAuthTypes = ['github', 'twitter', 'facebook', 'google', 'linkedin']
  , utils = require('../../lib/utils')

/**
 * User Schema
 */

var UserSchema = new Schema({
  name: { type: String, default: '' },
  email: { type: String, default: '' },
  username: { type: String, default: '' },
  provider: { type: String, default: '' },
  hashed_password: { type: String, default: '' },
  salt: { type: String, default: '' },
  authToken: { type: String, default: '' },
  facebook: {},
  twitter: {},
  github: {},
  google: {},
  linkedin: {},
    rentings: [{
        car: { type: Schema.ObjectId, ref: 'Car'}, //hbcmt caocaocao!!!
        createdAt: {type: Date, default: Date.now}
    }]
})

/**
 * Virtuals
 */

UserSchema
  .virtual('password')
  .set(function(password) {
    this._password = password
    this.salt = this.makeSalt()
    this.hashed_password = this.encryptPassword(password)
  })
  .get(function() { return this._password })

/**
 * Validations
 */

var validatePresenceOf = function (value) {
  return value && value.length
}

// the below 5 validations only apply if you are signing up traditionally

UserSchema.path('name').validate(function (name) {
  if (this.doesNotRequireValidation()) return true
  return name.length
}, 'Name cannot be blank')

UserSchema.path('email').validate(function (email) {
  if (this.doesNotRequireValidation()) return true
  return email.length
}, 'Email cannot be blank')

UserSchema.path('email').validate(function (email, fn) {
  var User = mongoose.model('User')
  if (this.doesNotRequireValidation()) fn(true)

  // Check only when it is a new user or when email field is modified
  if (this.isNew || this.isModified('email')) {
    User.find({ email: email }).exec(function (err, users) {
      fn(!err && users.length === 0)
    })
  } else fn(true)
}, 'Email already exists')

UserSchema.path('username').validate(function (username) {
  if (this.doesNotRequireValidation()) return true
  return username.length
}, 'Username cannot be blank')

UserSchema.path('hashed_password').validate(function (hashed_password) {
  if (this.doesNotRequireValidation()) return true
  return hashed_password.length
}, 'Password cannot be blank')


/**
 * Pre-save hook
 */

UserSchema.pre('save', function(next) {
  if (!this.isNew) return next()

  if (!validatePresenceOf(this.password)
    && !this.doesNotRequireValidation())
    next(new Error('Invalid password'))
  else
    next()
})

/**
 * Methods
 */

UserSchema.methods = {
    addRenting: function(car, cb) {
        this.rentings.push({
            car: car._id
        });
        this.save(cb);
    },
    removeRenting: function(carId, cb) {
        var index = utils.indexof(this.rentings, {
            id: carId
        });
        if (~index) this.rentings.splice(index, 1);
        else return cb('not found');
        this.save(cb);
    },

  /**
   * Authenticate - check if the passwords are the same
   *
   * @param {String} plainText
   * @return {Boolean}
   * @api public
   */

  authenticate: function (plainText) {
    return this.encryptPassword(plainText) === this.hashed_password
  },

  /**
   * Make salt
   *
   * @return {String}
   * @api public
   */

  makeSalt: function () {
    return Math.round((new Date().valueOf() * Math.random())) + ''
  },

  /**
   * Encrypt password
   *
   * @param {String} password
   * @return {String}
   * @api public
   */

  encryptPassword: function (password) {
    if (!password) return ''
    var encrypred
    try {
      encrypred = crypto.createHmac('sha1', this.salt).update(password).digest('hex')
      return encrypred
    } catch (err) {
      return ''
    }
  },

  /**
   * Validation is not required if using OAuth
   */

  doesNotRequireValidation: function() {
    return ~oAuthTypes.indexOf(this.provider);
  }
}

UserSchema.statics = {
    load: function(id, cb) {
        this.findOne({_id: id})
            .populate('rentings.car')
            .exec(cb);
    }
};


mongoose.model('User', UserSchema)

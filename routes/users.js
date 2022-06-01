const express = require('express');
const passport = require('passport');
const router = express.Router();
const users = require('../controllers/users');
const catchAsync = require('../utils/asyncError');


router.route('/register')
    .get(users.registerForm)
    .post(catchAsync(users.register));

router.route('/login')
    .get(users.loginForm)
    /**  passport.authenticate is a middleware of passport to authenticate the user with options
     this logs-in to the session aswell after that we can be certain that our function will run
     on authenticated users only */
    .post(passport.authenticate('local', { failureFlash: true, failureRedirect: '/login' }),
        users.loginDirect)

router.get('/logout', users.logout);


module.exports = router;
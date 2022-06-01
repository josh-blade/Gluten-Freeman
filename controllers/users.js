const User = require('../models/user');

module.exports.registerForm = (req, res) => {
    res.render('users/register')
}

module.exports.register = async (req, res) => {
    try {
        const { email, username, password } = req.body;
        const user = new User({ username, email });
        //creates a hashed password with salt through the register method (created by passport) on the class
        const regUser = await User.register(user, password);
        //connect the new user to the session for the login continously
        req.login(regUser, err => {
            if (err) return next(err);
            req.flash('success', 'Welcome to Yelp Camp!');
            res.redirect('/campgrounds');
        })
    } catch (e) {
        //here we're handling our errors manually by flashing the error and reloading the register form
        req.flash('error', e.message);
        res.redirect('/register');
    }
}

module.exports.loginForm = (req, res) => {
    res.render('users/login');
}

module.exports.loginDirect = (req, res) => {
    req.flash('success', 'Welcome back!');
    //if req.session.returnTo doesn't exists the default route is curr /campgrounds
    const redirection = req.session.returnTo || '/campgrounds'
    //empty the returnTo property to not have excess memory stored
    delete req.session.returnTo
    res.redirect(redirection);
}

module.exports.logout = (req, res) => {
    req.logout();
    req.flash('success', 'Logged out, goodbye!')
    res.redirect('/campgrounds')
}
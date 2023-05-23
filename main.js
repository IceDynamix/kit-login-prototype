const express = require("express");
const passport = require("passport");
const session = require('express-session');
const {Issuer, Strategy} = require("openid-client");

const config = require("./config.json");

const app = express();

async function setupAuth() {
    const kitIssuer = await Issuer.discover("https://oidc.scc.kit.edu/auth/realms/kit");
    const client = new kitIssuer.Client({
        client_id: config.openid.clientId,
        client_secret: config.openid.clientSecret,
        redirect_uris: ["http://localhost:3000/auth/openid/callback"],
        response_types: ['code']
    });

    app.use(session({
        secret: 'keyboard cat',
        resave: false,
        saveUninitialized: true
    }));
    app.use(passport.initialize());
    app.use(passport.session());

    passport.use(
        'kit',
        new Strategy({client}, (tokenSet, userinfo, done) => done(null, tokenSet.claims()))
    );

    passport.serializeUser(function (user, done) {
        done(null, user);
    });
    passport.deserializeUser(function (user, done) {
        done(null, user);
    });
}

function setupRoutes() {
    app.get('/', (req, res) => {
        res.json(req.user || {message: "not logged in"});
    });

    app.get("/auth", passport.authenticate("kit", {}, null));

    app.get('/auth/openid/callback', (req, res, next) => {
        passport.authenticate('kit', {successRedirect: '/', failureRedirect: '/'}, null)(req, res, next);
    });

    app.get("/logout", (req, res, next) => {
        req.logout(err => res.redirect('/'));
    });
}

async function main() {
    await setupAuth();
    setupRoutes();

    const port = config.server.port;
    app.listen(port, () => console.log(`Example app listening on port ${port}`));
}

main();
const express = require("express");
const passport = require("passport");
const session = require("express-session");
const {Issuer, Strategy} = require("openid-client");
const url = require("url");

const config = require("./config.json");

const app = express();
const port = config.server.port;

async function setupAuth() {
    const kitIssuer = await Issuer.discover("https://oidc.scc.kit.edu/auth/realms/kit");
    const client = new kitIssuer.Client({
        client_id: config.openid.clientId,
        client_secret: config.openid.clientSecret,
        redirect_uris: config.openid.redirectUris,
        response_types: ["code"]
    });

    app.use(session({
        secret: config.openid.sessionSecret,
        resave: false,
        saveUninitialized: true
    }));
    app.use(passport.initialize());
    app.use(passport.session());

    passport.use(
        "kit",
        new Strategy({client}, (tokenSet, userinfo, done) => {
            // this is what's executed after the authentication process is finished,
            // it receives the data from the authentication process
            //
            // you can then use it to query or create your own user model in your database
            done(null, userinfo);
        })
    );

    // these two functions describe how to store the user into the session,
    // to stay logged-in across multiple http requests
    //
    // usually this serializes into just the user id because storing the whole user data would take too much space
    // then the user is deserialized using a database query, this is what's going to be put as req.user
    passport.serializeUser(function (user, done) {
        // <insert serialize code here>
        done(null, user);
    });

    passport.deserializeUser(function (user, done) {
        // <insert deserialize code here>
        done(null, user);
    });
}

function setupRoutes() {
    app.get("/", (req, res) => {
        const user = req.user; // access the currently logged-in user, null if not logged-in
        const baseUrl = url.format({
            protocol: req.protocol,
            host: req.get('host'),
            pathname: req.originalUrl
        });

        res.json({
            login: `${baseUrl}auth`,
            logout: `${baseUrl}logout`,
            user: user || null
        });
    });

    app.get("/auth", passport.authenticate("kit", {}, null));

    app.get("/auth/openid/callback", passport.authenticate("kit", {}, null),
        (req, res) => res.redirect("/")
    );

    app.get("/logout", (req, res) => {
        req.logout(_ => res.redirect("/"));
    });
}

async function main() {
    await setupAuth();
    setupRoutes();

    app.listen(port, () => console.log(`Example app listening on port ${port}`));
}

main();
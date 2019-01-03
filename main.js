var express             = require('express'),
    app                 = express(),
    session             = require('express-session'),
    bodyParser          = require("body-parser"),
    SequelizeStore      = require("connect-session-sequelize")(session.Store),

    User                = require("./database/models/users"),
    Product             = require("./database/models/products"),
    Shop                = require("./database/models/shops"),
    Price               = require("./database/models/prices"),
    sequelize           = require("./database/connect"),
    index_router        = require("./routing/index_router"),
    AuthRouter          = require("./routing/AuthRouter"),
    ApiRouter           = require("./routing/ApiRouter"),
    sessionOptions      = require("./config/session");

/*
set view engine as ejs to omit .ejs when rendering a view
--------------------------------------------------------------------------------------------
Documentation: https://expressjs.com/en/guide/using-template-engines.html
 */
app.set("view engine", "ejs");


/*
 - - - - - - - - - - - - - - - - - - MIDDLEWARES - - - - - - - - - - - - - - - - - - - - - - - -
Middleware is/are function(s) run between the client request and the server answer. 
The most common middleware functionality needed are error managing, database interaction, 
getting info from static files or other resources. To move on the middleware stack the next 
callback must be called, you can see it in the end of middleware function to move to the next step in the flow.

Documentation: https://expressjs.com/en/guide/using-middleware.html
*/

/* 
Add bodyParser middleware to parse POST request body
--------------------------------------------------------------------------------------------
Documentation: https://www.npmjs.com/package/body-parser
*/
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

/*
Session configuration and store session cookie in db
--------------------------------------------------------------------------------------------
Documentation1: https://www.npmjs.com/package/express-session
Documentation2:https://www.npmjs.com/package/connect-session-sequelize
*/
const myConnectionStore = new SequelizeStore({
    db: sequelize
})
sessionOptions.store = myConnectionStore;
myConnectionStore.sync();
app.use(session(sessionOptions));

/*
Set static folder
--------------------------------------------------------------------------------------------
Documentation: https://expressjs.com/en/starter/static-files.html
*/
app.use("/static", express.static("public"));



/*
 - - - - -- - - - - - - - -- - - - - -- ROUTING - -- - - - - - - -- - - - - - -- - - - - - -- - - -  -- - -
*/

//testing
app.use('/', index_router)

app.use('/login', AuthRouter)

app.use('/observatory/api', ApiRouter)



app.listen(process.env.PORT || 1245, () => {
    console.log("Hello World console");
})



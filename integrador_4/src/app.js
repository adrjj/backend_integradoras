const dotenv = require("dotenv");
dotenv.config();
const express = require("express");
const app = express();
const http = require("http").Server(app);
const io = require("socket.io")(http); // Importing the Socket.IO server
const path = require('path');
const exphbs = require("express-handlebars");
const passport = require("passport")
const { initializePassport } = require("./config/passport.config.js")
const errorHandler = require("./middleware/index.js")
const loggerRouter = require('./router/logger.router.js');
const logger = require('./utils/logger');
const flash = require('connect-flash');

const ProductController = require("./controllers/productController.js");
const manager = new ProductController();
//chat
const ChatManager = require("./dao/chatManagerdb.js")
const chat = new ChatManager
const mongoStore = require("connect-mongo")

const mongoose = require('mongoose');
const session = require("express-session")

const socketLogic = require("./socket/socketLogica.js");
const PORT = 8080;

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Handlebars setup

const hbs = exphbs.create({
    helpers: {
        json: function (context) {
            return JSON.stringify(context, null, 2);
        },
        ifCond: function (v1, operator, v2, options) {
            switch (operator) {
                case '==':
                    return (v1 == v2) ? options.fn(this) : options.inverse(this);
                case '===':
                    return (v1 === v2) ? options.fn(this) : options.inverse(this);
                default:
                    return options.inverse(this);
            }
        }
    },

});
app.engine("handlebars", hbs.engine);




app.set('views', path.join(__dirname, './public/views'));
console.log("esta es la ubicaccion", __dirname)
app.set("view engine", "handlebars");

// Importing routers
const productRouter = require('./router/products.router.js');
const cartRouter = require("./router/carts.router.js");
const sessionRouter = require("./router/session.router.js")
const mockingRouter = require("./router/mocking.router.js")

//coneccion con connect-mongo
app.use(session({
    secret: 'tu_secreto', // Cambia esto por un secreto único para tu aplicación
    resave: false,
    saveUninitialized: false,
    store: mongoStore.create({ mongoUrl: process.env.CONECCCION })

}));

initializePassport();
app.use(passport.initialize());
app.use(passport.session());

// Serialización
passport.serializeUser((user, done) => {
    done(null, user._id); // Almacena solo el _id del usuario en la sesión
});

// Deserialización
passport.deserializeUser((_id, done) => {
    UserModel.findById(_id, (err, user) => {
        done(err, user); // Devuelve el objeto de usuario completo
    });
});
app.use(flash());

app.use((req, res, next) => {
    res.locals.success_msg = req.flash('success_msg');

    next();
});

const viewRouter = require('./router/views.router.js');
app.use("/", viewRouter)

app.use("/api/products", productRouter);
app.use("/api/carts", cartRouter);
app.use("/api/sessions", sessionRouter);
app.use("/mockingproducts", mockingRouter)
app.use("/loggerTest", loggerRouter)

app.use(errorHandler) //manipulador de errores



const chatRouter = require('./router/chat.router.js');
const { Session } = require("inspector");
app.use("/chat", chatRouter)

// Configuración y manejo de eventos de WebSocket
socketLogic(io, manager, chat);

//coneccion con mongoose
mongoose.connect(process.env.CONECCCION,)
    .then(() => { console.log("campeon del mundo, te conectaste a la base") })
    .catch(error => console.error("te rechasaron, no pudiste conectarte a la base de datos", error))

http.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
});

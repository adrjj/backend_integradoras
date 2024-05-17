const express = require("express");
const app = express();
const http = require("http").Server(app);
const io = require("socket.io")(http); // Importing the Socket.IO server
const path = require('path');
const exphbs = require("express-handlebars");
const ProductManager = require("./dao/ProductsManager.js");
const manager = new ProductManager();
const socketLogic = require("./socket/socketLogica.js");
const PORT = 8080;

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Handlebars setup
const hbs = exphbs.create();
app.engine("handlebars", hbs.engine);
app.set('views', path.join(__dirname, './public/views'));
console.log("esta es la ubicaccion", __dirname)
app.set("view engine", "handlebars");

// Importing routers
const productRouter = require('./router/products.router.js');
//const cartRouter = require("./router/carts.router.js");

app.use("/api/products", productRouter);
//app.use("/api/carts", cartRouter);

const viewRouter = require('./router/views.router.js')
//app.use("/home", viewRouter)
app.use("/",viewRouter)

// Configuración y manejo de eventos de WebSocket
socketLogic(io, manager);



/*
app.get("/home", async (req, res) => {
    try {
        const productos = await manager.loadProducts();
        res.render("home", { productos });
    } catch (error) {
        res.status(500).json({ error: "Error retrieving products.", message: error.message });
    }
});

app.get("/realtimeproducts", async (req, res) => {
    try {
        const productos = await manager.loadProducts();
        res.render("realTimeProducts", { productos });
    } catch (error) {
        res.status(500).json({ error: "Error retrieving products.", message: error.message });
    }
});
*/
http.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
});

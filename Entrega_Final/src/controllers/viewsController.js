// controllers/views.controller.js
const ProductController = require("./productController.js");
const CartController = require("./cartController.js");
const productModel = require("../models/products.model");
const userModel = require("../models/user.model.js")
class ViewsController {
    constructor() {
        this.manager = new ProductController();
        this.cartManager = new CartController();
    }
    async getProduct(filter, options) {
        try {
            const result = await productModel.paginate(filter, options);
            return result;
        } catch (err) {
            throw new Error(err.message);
        }
    }

    async getUser(req, res) {
        try {
            const result = await userModel.find()
            return result;
        } catch (error) {
            res.status(500).json({ error: "Error al cargar los usuarios", message: error.message });
        }

    }
    async loadHome(req, res) {
        try {
            const productos = await this.manager.loadProducts();
            res.render("home", { productos });
        } catch (error) {
            res.status(500).json({ error: "Error al cargar los datos", message: error.message });
        }
    }

    async loadRealTimeProducts(req, res) {
        try {
            const productos = await this.manager.loadProducts();
            res.render("realTimeProducts", { productos });
        } catch (error) {
            res.status(500).json({ error: "Error al cargar los datos", message: error.message });
        }
    }

    async loadProducts(req, res) {
        try {
            let page = parseInt(req.query.page) || 1;
            // const welcome = req.query.welcome || '';
            // const username = req.session.user ? (req.session.user.username || req.session.user.email) : '';

            // Obtén el nombre de usuario y el mensaje de bienvenida de la sesión
            const username = req.session.user ? (req.session.user.username || req.session.user.email) : '';
            const welcomeMessage = req.session.welcomeMessage || ''; // Obtén el mensaje de bienvenida de la sesión

            const productos = await productModel.paginate({}, { page, limit: 6, lean: true });

            productos.prevLink = productos.hasPrevPage ? `http://localhost:8080/products?page=${productos.prevPage}` : '#';
            productos.nextLink = productos.hasNextPage ? `http://localhost:8080/products?page=${productos.nextPage}` : '#';
            productos.isValid = !(page <= 0 || page > productos.totalPages);

            //let welcomeMessage = "";
           // if (welcome === "1") {
            //    welcomeMessage = `¡Bienvenido/a, <strong>${username}</strong>, a nuestra tienda en línea!`;
            //}

            if (req.headers['content-type'] === 'application/json') {
                return res.json(productos.docs);
            }

            res.render("products", { productos, welcomeMessage });
        } catch (error) {
            res.status(500).json({ error: "Error al cargar los datos", message: error.message });
        }
    }

    async loadCart(req, res) {
        try {
            const cartId = req.params.cid;
            const productos = await this.cartManager.getCartWithProducts(cartId);
            res.render("cart", { productos });
        } catch (error) {
            res.status(500).json({ error: "Error al cargar los datos", message: error.message });
        }
    }

    getUserList = async (req, res) => {
        try {
            const users = await userModel.find({}, 'first_name last_name email role _id').lean(); // Solo obtener los campos necesarios
            res.render("userList", { users });
        } catch (error) {
            res.status(500).send({ error: 'Error al cargar los usuarios' });
        }
    };



    modifyRole = async (req, res) => {
        const userId = req.params.id;
        const newRole = req.body.role;

        try {
            // Actualizar el rol del usuario en la base de datos
            await userModel.findByIdAndUpdate(userId, { role: newRole });
            res.json({ success: true, message: 'Rol actualizado con éxito' });
        } catch (err) {
            res.status(500).json({ success: false, message: 'Error al actualizar el rol' });
        }
    }

    deleteUser = async (req, res) => {
        const userId = req.params.id;

        try {
            await userModel.findByIdAndDelete(userId);
            res.json({ success: true, message: 'usuario eliminado  con éxito' })
        } catch (err) {
            res.status(500).json({ success: false, message: 'Error al eliminar el usuario' });
        }

    }


    deleteInactiveUsers = async (req, res) => {
        console.log("deleteInactiveUsers function called");
        const twoDaysAgo = new Date();
        twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);
        console.log(twoDaysAgo);
        try {
            // Eliminar los usuarios cuyo 'last_connection' sea anterior a dos días
            const result = await userModel.deleteMany({
                last_connection: { $ne: null, $lt: twoDaysAgo }
            });

            if (result.deletedCount > 0) {
                return res.json({ success: true, message: `${result.deletedCount} usuarios inactivos eliminados` });
            } else {
                return res.json({ success: false, message: 'No se encontraron usuarios inactivos para eliminar' });
            }
        } catch (err) {
            return res.status(500).json({ success: false, message: 'Error al eliminar usuarios inactivos', error: err.message });
        }
    };

}

module.exports = new ViewsController();

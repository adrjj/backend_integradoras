
const RepositoryP = require("../repositories/productRepository.js")
const ProductRepository = new RepositoryP()
const Repository = require("../repositories/cartReposytories.js")
const CartRepository = new Repository
const { v4: uuidv4 } = require('uuid'); // para generar códigos únicos
//const TicketModel = require("../models/ticket.model.js")
const { transporter } = require('../config/config');
const TicketRepository = require('../repositories/ticket.repositoy.js');
const logger = require('../utils/logger'); 


class CartController {
    async createCart(req, res) {
        try {
            const userId = req.user.id;
            const productos = req.body.productos || [];
            logger.debug('Creando carrito', userId);
            const updatedData = await CartRepository.createCart(userId, productos);
            logger.info(`Carrito creado exitosamente para el usuario: ${userId}`);
            res.status(200).json({ message: "Carrito actualizado exitosamente.", cart: updatedData.cart });
        } catch (error) {
            logger.error(`Error al actualizar el carrito para el usuario: ${userId}`, error);
            res.status(500).json({ error: "Error al actualizar el carrito.", message: error.message });
        }
    }

    async getCartProducts(req, res) {
        try {
            const userId = req.user.id;
            logger.debug('Iniciando la obtención de productos del carrito para el usuario:', userId);
            const user = await CartRepository.getCartProducts(userId);
            logger.warning('Carrito no encontrado o productos vacíos para el usuario:', userId);
            if (!user || !user.cart || !Array.isArray(user.cart.productos)) {
                return res.status(404).render('cart', { error: "Carrito no encontrado o productos vacíos." });
            }

            const transformedProducts = user.cart.productos.map(product => ({
                pid: product.pid._id,
                _id: product._id,
                title: product.pid.title,
                description: product.pid.description,
                price: product.pid.price,
                thumbnail: product.pid.thumbnail,
                quantity: product.quantity
            }));
            logger.info(`Productos del carrito obtenidos exitosamente para el usuario: ${userId}`);
            res.render('cart', { products: transformedProducts, userId });
        } catch (error) {
            logger.error('Error al obtener los productos del carrito:', error);
           // console.error('Error al obtener los productos del carrito:', error);
            res.status(500).render('cart', { error: "Error al obtener los productos del carrito." });
        }
    }

    async deleteCart(req, res) {
        const cid = req.params.cid;
        try {
            logger.debug(`Iniciando la eliminación del carrito con ID: ${cid}`);
            const deletedCart = await CartRepository.deleteCart(cid);
            if (!deletedCart) {
                logger.warning(`No se encontró ningún carrito con el ID proporcionado: ${cid}`);
                return res.status(404).json({ message: "No se encontró ningún producto con el ID proporcionado." });
            }
            logger.info(`Carrito con ID: ${cid} eliminado exitosamente`);
            return res.status(200).json({ message: "Producto eliminado exitosamente." });
        } catch (error) {
            logger.error(`Error al eliminar el carrito con ID: ${cid}`, error);
            return res.status(500).json({ message: "Error al eliminar el producto: " + error.message });
        }
    }

    async emptyCart(req, res) {
        const cid = req.params.cid;
        try {
            logger.debug(`Iniciando el vaciado del carrito con ID: ${cid}`);
            await CartRepository.emptyCart(cid);
            logger.info(`Carrito con ID: ${cid} vaciado exitosamente`);
            return res.json({ message: "El carrito se ha vaciado exitosamente." });
        } catch (error) {
            logger.error(`Error al vaciar el carrito con ID: ${cid}`, error);
            return res.status(500).json({ error: "Error al vaciar el carrito." });
        }
    }

    async modifyCart(req, res) {
        try {
            const cid = req.params.cid;
            const productos = req.body.productos;
            logger.debug(`Intentando modificar el carrito con ID: ${cid}`);
            if (!Array.isArray(productos) || productos.length === 0) {
                logger.warning(`El cuerpo de la solicitud no contiene un array de productos válido: ${productos}`);
                return res.status(400).json({ error: "El cuerpo de la solicitud debe contener un array de productos." });
            }

            await CartRepository.modifyCart(cid, productos);
            logger.info(`Producto(s) agregado(s) al carrito con ID: ${cid} exitosamente`);
            res.status(200).json({ message: "Producto(s) agregado(s) al carrito exitosamente." });
        } catch (error) {
            logger.error(`Error al agregar el producto al carrito con ID: ${cid}`, error);
            res.status(500).json({ error: "Error al agregar el producto al carrito.", message: error.message });
        }
    }

    async deleteProduct(req, res) {
        try {
            const cid = req.params.cid;
            const pid = req.params.pid;
            logger.debug(`Iniciando la eliminación del producto con ID: ${pid} del carrito con ID: ${cid}`);
           
            await CartRepository.deleteProduct(cid, pid);
            logger.info(`Producto con ID: ${pid} eliminado del carrito con ID: ${cid} exitosamente`);
            res.status(200).json({ message: "Producto eliminado del carrito exitosamente." });
        } catch (error) {
            logger.error(`Error al eliminar el producto con ID: ${pid} del carrito con ID: ${cid}`, error);
            res.status(500).json({ error: "Error al eliminar el producto del carrito.", message: error.message });
        }
    }

    async addProductToCart(req, res) {

        const { cid, pid } = req.params;
        const { quantity } = req.body;
        logger.debug(`Iniciando la adición del producto con ID: ${pid} al carrito con ID: ${cid}`);
        try {

            const cart = await CartRepository.addProductToCart(cid, pid, quantity);
            logger.info(`Producto con ID: ${pid} agregado al carrito con ID: ${cid} exitosamente`);
            res.status(200).json({ message: 'Producto agregado al carrito', cart });
        } catch (error) {
            logger.error(`Error al agregar el producto con ID: ${pid} al carrito con ID: ${cid}`, error);
            res.status(500).json({ message: 'Error al agregar el producto al carrito', error });
        }
    }


    async getCartTickets(req, res) {
        try {
            const userId = req.user.id;
            logger.debug('Obteniendo los tickets del carrito para el User ID:', userId)

            const user = await CartRepository.getCartProducts(userId);
            logger.debug('Contenido del carrito del usuario:', user);

            if (!user || !user.cart || !Array.isArray(user.cart.productos)) {
                return res.status(404).render('ticket', { error: "Carrito no encontrado o productos vacíos." });
            }

            const transformedProducts = user.cart.productos.map(product => ({
                pid: product.pid._id,
                _id: product._id,
                title: product.pid.title,
                description: product.pid.description,
                price: product.pid.price,
                thumbnail: product.pid.thumbnail,
                quantity: product.quantity
            }));

            const totalPrice = transformedProducts.reduce((acc, product) => acc + product.price * product.quantity, 0);
            const totalQuantity = transformedProducts.reduce((acc, product) => acc + product.quantity, 0);

            res.render('ticket', {
                products: transformedProducts,
                userId,
                totalPrice,
                totalQuantity
            });
        } catch (error) {
            logger.error('Error al obtener los productos del carrito:', error);
            res.status(500).render('cart', { error: "Error al obtener los productos del carrito." });
        }
    }



    

async confirmPurchase(req, res) {
    try {
        const userId = req.user.id;
        const userEmail = req.user.email;
        logger.debug("Iniciando confirmación de compra para el User ID:", userId);
        const user = await CartRepository.getCartProducts(userId);

        if (!user || !user.cart || !Array.isArray(user.cart.productos)) {
            return res.status(404).render('ticket', { error: "Carrito no encontrado o productos vacíos." });
        }

        let totalAmount = 0;
        // Actualizar stock y calcular el total
        for (const product of user.cart.productos) {
            await ProductRepository.updateStock(product.pid._id, product.quantity);
            logger.debug("Actualizando stock para el producto ID:", product.pid._id, "Cantidad:", product.quantity);
            totalAmount += product.quantity * product.pid.price;
        }
        logger.info("Stock actualizado para todos los productos.");

        // Crear el ticket utilizando el repositorio
        const ticketData = {
            code: uuidv4(),
            amount: totalAmount,
            purchaser: userEmail
        };

        const ticket = await TicketRepository.createTicket(ticketData);
        logger.info("Ticket creado:", ticket);

        // Limpiar el carrito del usuario (opcional, pero recomendado)
        await CartRepository.emptyCart(userId);

        // Enviar correo electrónico
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: userEmail,
            subject: 'Confirmación de compra',
            text: `Gracias por tu compra. Aquí están los detalles de tu ticket:
                   \nCódigo: ${ticket.code}
                   \nMonto $: ${ticket.amount}
                   \nComprador: ${ticket.purchaser}`
        };

        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                logger.error('Error al enviar el correo electrónico:', error);
            } else {
                logger.info('Correo electrónico enviado:', info.response);
            }
        });

        return res.render('confirmation', { ticket: ticket.toObject() });
    } catch (error) {
        logger.error('Error al confirmar la compra:', error);
        res.status(500).render('ticket', { error: "Error al confirmar la compra." });
    }
}




};



module.exports = CartController;

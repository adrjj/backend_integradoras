const CartModel = require("../dao/models/carts.model")

class CartController {
    // Constructor and other methods remain unchanged

    async createCart(req, res) {
        try {
            const newCart = {
                productos: []
            };
    
            if (req.body.productos && Array.isArray(req.body.productos)) {
           
                req.body.productos.forEach(producto => {
                    console.log("Producto:", producto);
                    if (producto.pid && producto.quantity) {
                        newCart.productos.push({
                            pid: producto.pid,
                            quantity: producto.quantity
                        });
                    }
                });
            }
    
            // Save new cart to MongoDB using Mongoose
            const cart = await CartModel.create(newCart);
            console.log("Carrito guardado en la base de datos:", cart);
    
            res.status(200).json({ message: "Carrito creado exitosamente.", cart: cart });
        } catch (error) {
            res.status(500).json({ error: "Error al agregar el producto.", message: error.message });
        }
    }
    


    async getCartProducts(req, res) {
        try {
            const cartId = (req.params.cid);
            console.log("datos del req ",cartId)
            const cart = await CartModel.findById(cartId);
            console.log("esto tiene el cart",cart)

            if (!cart) {
                return res.status(404).json({ error: "Carrito no encontrado." });
            }

            res.json(cart.productos);
        } catch (error) {
            res.status(500).json({ error: "Error al obtener los productos del carrito.", message: error.message });
        }
    }

    async addProductToCart(req, res) {
        try {
            const cid = (req.params.cid);
            const pid = parseInt(req.params.pid);

            // Buscar carrito por id
            const cart = await CartModel.findById(cid);
            console.log("esto es cart",cart)

            if (!cart) {
                return res.status(404).json({ error: "Carrito no encontrado." });
            }

            // Check if the product already exists in the cart
            const existingProductIndex = cart.productos.findIndex(product => product.pid === pid);

            if (existingProductIndex !== -1) {
                cart.productos[existingProductIndex].quantity++;
            } else {
                cart.productos.push({ pid: pid, quantity: 1 });
            }

            // Save the updated cart
            await cart.save();

            res.status(200).json({ message: "Producto agregado al carrito exitosamente." });
        } catch (error) {
            res.status(500).json({ error: "Error al agregar el producto al carrito.", message: error.message });
        }
    }
}

module.exports = CartController;
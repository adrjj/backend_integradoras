const CartModel = require("../dao/models/carts.model");
const UserModel = require("../dao/models/user.model");


class CartController {
   
async createCart(req, res) {
        try {
            const userId = req.user.id; // Asumiendo que el ID del usuario está disponible en req.user.id
            console.log("1// createCart", userId)
            let userData = await UserModel.findById(userId); // Busca el usuario por ID
    
            if (!userData) {
                return res.status(404).json({ error: "Usuario no encontrado." });
            }
    
            if (req.body.productos && Array.isArray(req.body.productos)) {
                req.body.productos.forEach(producto => {
                    if (producto.pid && producto.quantity) {
                        // Verifica si el producto ya existe en el carrito para evitar duplicados
                        const existingProductIndex = userData.cart.productos.findIndex(p => p.pid.toString() === producto.pid.toString());
                        if (existingProductIndex!== -1) {
                            // Actualiza la cantidad si el producto ya está en el carrito
                            userData.cart.productos[existingProductIndex].quantity += producto.quantity;
                        } else {
                            // Agrega el producto al carrito si no está presente
                            userData.cart.productos.push({
                                pid: producto.pid,
                                quantity: producto.quantity
                            });
                        }
                    }
                });
            }
    
            // Guarda los cambios en el documento del usuario
            const updatedData = await userData.save();
    
            res.status(200).json({ message: "Carrito actualizado exitosamente.", cart: updatedData.cart });
        } catch (error) {
            res.status(500).json({ error: "Error al actualizar el carrito.", message: error.message });
        }
    }
    
   /* async createCart(req, res) {
        try {
            const newCart = {
                productos: []
            };

            if (req.body.productos && Array.isArray(req.body.productos)) {

                req.body.productos.forEach(producto => {
                    console.log("//1 createCart () ", producto);
                    if (producto.pid && producto.quantity) {
                        newCart.productos.push({
                            pid: producto.pid,
                            quantity: producto.quantity
                        });

                    }

                });
                console.log("//2 createCart () newCart ", newCart);
            }

            // Save new cart to MongoDB using Mongoose
            const cart = await CartModel.create(newCart);
            console.log("Carrito guardado en la base de datos:", cart);

            res.status(200).json({ message: "Carrito creado exitosamente.", cart: cart });
        } catch (error) {
            res.status(500).json({ error: "Error al agregar el producto.", message: error.message });
        }
    }*/
        async getCartProducts(req, res) {
            try {
                const userId = req.user.id;
                console.log("datos del req ", userId);
          
        
                // Buscar el documento del usuario por su ID y poblar los productos del carrito
                const user = await UserModel.findById(userId).populate({
                    path: 'cart.productos.pid',
                    model: 'products' // Asegúrate de que este nombre coincida exactamente con el nombre de tu modelo en Mongoose
                })
               
            
                console.log("populate", JSON.stringify(user, null, 2)); 
                if (!user ||!user.cart ||!Array.isArray(user.cart.productos)) {
                    return res.status(404).render('cart', { error: "Carrito no encontrado o productos vacíos." });
                }
                console.log("productos para la vista:", JSON.stringify(user.cart.productos, null, 2));
                // Pasar los productos a la plantilla
                const transformedProducts = user.cart.productos.map(product => ({
                    _id: product._id,
                    title: product.pid.title,
                    description: product.pid.description,
                    price: product.pid.price,
                    thumbnail: product.pid.thumbnail,
                    quantity: product.quantity
                }));
                res.render('cart', { products: transformedProducts});
            } catch (error) {
                console.error('Error al obtener los productos del carrito:', error);
                res.status(500).render('cart', { error: "Error al obtener los productos del carrito." });
            }
        }
        
        
/*
        async  getCartProducts(req, res) {
            try {
                const userId = req.user.id;
                console.log("datos del req ", userId);
        
                // Buscar el documento del usuario por su ID
                const user = await UserModel.findById(userId);
        
                if (!user ||!user.cart ||!Array.isArray(user.cart.productos)) {
                    return res.status(404).render('cart', { error: "Carrito no encontrado o productos vacíos." });
                }
        
                // Extraer los productos del carrito
                const products = user.cart.productos;
                console.log("3/ los productos del array ",products)
                // Pasar los productos a la plantilla
                res.render('cart', { products: products });
            } catch (error) {
                console.error('Error al obtener los productos del carrito:', error);
                res.status(500).render('cart', { error: "Error al obtener los productos del carrito." });
            }
        }
        */
        

/*
    async getCartProducts(req, res) {
        try {
            const cartId = (req.params.cid);
            console.log("datos del req ", cartId)
            const cart = await CartModel.findById(cartId);
            console.log("esto tiene el cart", cart)

            if (!cart) {
                return res.status(404).json({ error: "Carrito no encontrado." });
            }

            res.json(cart.productos);
        } catch (error) {
            res.status(500).json({ error: "Error al obtener los productos del carrito.", message: error.message });
        }
    }*/

    
    


    async deleteCart(req, res) {

        const cid = req.params.cid;
        console.log("//1 deleteCart() esto es cid", cid)
        try {
            const deletedCart = await CartModel.findByIdAndDelete(cid);
            if (!deletedCart) {
                return res.status(404).json({ message: "No se encontró ningún producto con el ID proporcionado." });
            }
            return res.status(200).json({ message: "Producto eliminado exitosamente." });
        } catch (error) {
            return res.status(500).json({ message: "Error al eliminar el producto: " + error.message });
        }


    }

    async emptyCart(req, res) {
        const cid = req.params.cid;
        console.log("//1 esto es el _id", cid);
        try {
            const cart = await CartModel.findById(cid);
            if (!cart) {
                return res.status(404).json({ error: "Carrito no encontrado." });
            }
    
            // Vaciar el arreglo de productos del carrito
            cart.productos = [];
    
            // Guardar el carrito actualizado
            await cart.save();
    
            return res.json({ message: "El carrito se ha vaciado exitosamente." });
    
        } catch (error) {
            return res.status(500).json({ error: "Error al vaciar el carrito." });
        }
    }

    async modifyCart(req, res) {
        try {
            const cid = req.params.cid;
            const productos = req.body.productos;
            console.log("//1 modifyCart() esto es cid y productos", cid, productos);

            // Verificar que productos sea un array y tenga al menos un producto
            if (!Array.isArray(productos) || productos.length === 0) {
                return res.status(400).json({ error: "El cuerpo de la solicitud debe contener un array de productos." });
            }

            // Buscar carrito por id
            const cart = await CartModel.findById(cid);
            

            if (!cart) {
                return res.status(404).json({ error: "Carrito no encontrado." });
            }

            // Procesar cada producto en el array
            productos.forEach(producto => {
                const pid = producto.pid;
                const quantity = parseInt(producto.quantity);

                // Verificar que pid y quantity sean números válidos
                if ( isNaN(quantity)) {
                    return res.status(400).json({ error: "PID y quantity deben ser números." });
                }

                // Verificar si el producto ya existe en el carrito
                const existingProductIndex = cart.productos.findIndex(product => product.pid === pid);

                if (existingProductIndex !== -1) {
                    cart.productos[existingProductIndex].quantity += quantity;
                } else {
                    cart.productos.push({ pid: pid, quantity: quantity });
                }
            });

            // Guardar el carrito actualizado
            await cart.save();

            res.status(200).json({ message: "Producto(s) agregado(s) al carrito exitosamente." });
        } catch (error) {
            res.status(500).json({ error: "Error al agregar el producto al carrito.", message: error.message });
        }
    }
   

    async deleteProduct(req, res) {
        try {
            const cid = req.params.cid;
            const pid = req.params.pid; // Asegurarse de obtener el pid correctamente
            console.log("Esto es pid", pid);
    
            // Buscar carrito por id
            const cart = await CartModel.findById(cid);
    
            if (!cart) {
                return res.status(404).json({ error: "Carrito no encontrado." });
            }
    
            // Encontrar el índice del producto en el carrito
            const productIndex = cart.productos.findIndex(product => product.pid.equals(pid));
    
            if (productIndex === -1) {
                return res.status(404).json({ error: "Producto no encontrado en el carrito." });
            }
    
            // Eliminar el producto del carrito
            cart.productos.splice(productIndex, 1);
    
            // Guardar el carrito actualizado
            await cart.save();
    
            res.status(200).json({ message: "Producto eliminado del carrito exitosamente." });
        } catch (error) {
            res.status(500).json({ error: "Error al eliminar el producto del carrito.", message: error.message });
        }
    }

    getCartWithProducts = async (cartId) => {
        try {
            console.log("//1 getCartWithProducts() cartID", cartId);
            const cart = await CartModel.findById(cartId)
                .populate('productos.pid') // Popula el campo 'pid' en los subdocumentos de 'productos'
                .exec();
            
            if (!cart) {
                throw new Error("Carrito no encontrado.");
            }
            const productos = cart.productos.map(item => ({
                title: item.pid.title,
                description: item.pid.description,
                price: item.pid.price,
                thumbnail: item.pid.thumbnail,
                id: item.pid._id,
                quantity: item.quantity
            }));
    
            return productos;
        } catch (error) {
            throw new Error(error.message);
        }
    };
    
    addProductToCart = async (req, res) => {
        const { cid, pid } = req.params;  // Obtener cid y pid de los parámetros de la URL
        const { quantity } = req.body;    // Obtener quantity del cuerpo de la solicitud
        console.log(cid,pid,quantity);
        
        try {
            // Buscar el carrito por cid
            const cart = await CartModel.findById(cid);
            if (!cart) {
                return res.status(404).json({ message: 'Cart not found' });
            }
            
            // Convertir quantity a un número
            const quantityToAdd = parseInt(quantity, 10);
    
            // Buscar el producto en el carrito
            const productIndex = cart.productos.findIndex(p => p.pid.toString() === pid);
            
            if (productIndex > -1) {
                // Si el producto existe en el carrito, sumar la cantidad
                cart.productos[productIndex].quantity += quantityToAdd;
            } else {
                // Si el producto no existe en el carrito, añadirlo
                cart.productos.push({ pid: pid, quantity: quantityToAdd });
            }
            
            // Guardar los cambios en la base de datos
            await cart.save();
            
            res.status(200).json({ message: 'Product added to cart', cart });
        } catch (error) {
            res.status(500).json({ message: 'Error adding product to cart', error });
        }
    };
    

   
 
    
}


module.exports = CartController;
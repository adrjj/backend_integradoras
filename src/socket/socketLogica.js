const socketLogic = (io, manager) => {
    io.on("connection", (socket) => {
        console.log("User connected");

        socket.on("productAdded", async (newProduct) => {
            try {
                const productos = await manager.loadProducts();
                const addedProduct = productos.find(product => product.code === newProduct.code);
                io.emit("productAdded", addedProduct);
            } catch (error) {
                console.log("Error al cargar el producto", error.message);
            }
        });

        socket.on("productDeleted", async (productId) => {
            console.log("esto es lo que recibo del handlebars", productId)
            try {
                await manager.deleteProduct(productId);
                console.log("después de la promesa que llega", productId)
                console.log(`Product with ID ${productId} successfully deleted`);
                io.emit("productDeleted", productId);
            } catch (error) {
                console.error("Error al eliminar el producto", error);
            }
        });

        socket.on("disconnect", () => {
            console.log("User disconnected");
        });
    });
};

module.exports = socketLogic;

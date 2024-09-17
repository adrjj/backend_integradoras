addProduct(req, res) {
    try {
        const { title, description, price, thumbnail, code, stock, category, status } = req.body;
        console.log("addProduct", req.body);
        
        // Verifica si todos los campos obligatorios están presentes
        if (!title || !description || !price || !thumbnail || !code || !stock || !category) {
            const errorMessage = generateProductErrorInfo({ title, description, price, thumbnail, code, stock, category });
            return res.status(400).json({
                error: "ValidationError",
                message: "Todos los campos obligatorios deben estar presentes.",
                details: errorMessage
            });
        }

        // Datos del producto
        const productData = { title, description, price, thumbnail, code, stock, status, category };
        
        // Añade el producto usando el repositorio
        const newProduct = await ProductRepository.addProduct(productData);
        res.status(201).json({ message: "Producto agregado exitosamente.", product: newProduct });
    } catch (error) {
        logger.error('Error al agregar el producto:', error);
        res.status(500).json({ error: "Error al agregar el producto.", message: error.message });
    }
}

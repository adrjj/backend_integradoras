const express = require("express");
const router = express.Router();
const ProductManager = require("../dao/productManagerDb");
const manager = new ProductManager();

router.post('/', async (req, res) => {
    try {
        const { title, description, price, thumbnail, code, stock, category, status } = req.body;
        if (!title || !description || !price || !thumbnail || !code || !stock || !category) {
            return res.status(400).json({ error: "Todos los campos son obligatorios." });
        }
        await manager.addProduct(title, description, price, thumbnail, code, stock, status, category);
        res.status(201).json({ message: "Producto agregado exitosamente." });
    } catch (error) {
        res.status(500).json({ error: "Error al agregar el producto.", message: error.message });
    }
});

router.get('/', async (req, res) => {
    try {
        const productos = await manager.loadProducts();
        res.status(200).json(productos);
       
    } catch (error) {
        res.status(500).json({ error: "Error al recuperar productos.", message: error.message });
    }
});

router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const producto = await manager.getProductsById(id);
        res.status(200).json(producto);
    } catch (error) {
        res.status(500).json({ error: "Error al recuperar el producto.", message: error.message });
    }
});

router.put('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const newData = req.body;
        await manager.updateProduct(id, newData);
        res.status(200).json({ message: "Producto actualizado exitosamente." });
    } catch (error) {
        res.status(500).json({ error: "Error al actualizar el producto.", message: error.message });
    }
});

router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        await manager.deleteProduct(id);
        res.status(200).json({ message: "Producto eliminado exitosamente." });
    } catch (error) {
        res.status(500).json({ error: "Error al eliminar el producto.", message: error.message });
    }
});







module.exports = router;

const express = require("express");
const router = express.Router();
const ProductManager = require("../dao/ProductsManager.js");
const manager = new ProductManager();

router.get("/home", async (req, res) => {
    try {
        const productos = await manager.loadProducts();
        res.render("home", { productos });
    } catch (error) {
        res.status(500).json({ error: "Error retrieving products.", message: error.message });
    }
});

router.get("/realTimeProducts", async (req, res) => {
    try {
        const productos = await manager.loadProducts();
        res.render("realTimeProducts", { productos });
    } catch (error) {
        res.status(500).json({ error: "Error retrieving products.", message: error.message });
    }
});


module.exports = router;

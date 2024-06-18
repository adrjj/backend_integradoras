const express = require("express");
const router = express.Router();
//const CartManager = require('../dao/CartManager.js');
const CartManager = require('../dao/cartManagerDb.js')

const cartManager = new CartManager();

router.post('/', cartManager.createCart.bind(cartManager));

router.get('/:cid', cartManager.getCartProducts.bind(cartManager));
router.post('/:cid/product/:pid', cartManager.addProductToCart.bind(cartManager));

module.exports = router;

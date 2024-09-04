const express = require("express");
const router = express.Router();
const generateMockProducts = require('../mocking/mocking.js');


router.get('/', (req, res) => {
    const products = generateMockProducts();
    res.json(products);
  });

  module.exports = router;
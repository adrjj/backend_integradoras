const ProductDAO = require("../dao/productDao.js");
const Repositorie = require("../repositories/productRepository.js")

const CustomError = require('../services/custom.Error');
const { generateProductErrorInfo } = require('../services/info');
const EErrors = require('../services/enum.js');

const logger = require('../utils/logger.js');
const ProductRepository = new Repositorie()

const sendDeleteProduct = require("../utils/sendDeleteProduct")
const productModel = require("../models/products.model")
const userModel= require("../models/user.model.js")
class ProductController {
    async getProducts(req, res) {
        try {
            const { limit = 10, page = 1, sort, category } = req.query;

            let sortQuery = {};
            if (sort === 'price') {
                sortQuery = { price: 1 };
            } else if (sort === '-price') {
                sortQuery = { price: -1 };
            }

            const filterQuery = category ? { category } : {};

            logger.debug("Filter Query:", filterQuery);
            logger.debug("Sort Query:", sortQuery);
            logger.debug("Limit:", limit, "Page:", page);

            const options = {
                limit: parseInt(limit, 10),
                page: parseInt(page, 10),
                sort: Object.keys(sortQuery).length > 0 ? sortQuery : undefined
            };

            const result = await ProductRepository.getProduct(filterQuery, options);

            if (!result) {
                throw new Error("No se pudieron obtener los productos.");
            }

            const { docs, totalPages, hasNextPage, hasPrevPage, nextPage, prevPage, page: currentPage } = result;

            res.json({
                status: 'success',
                payload: docs,
                totalPages,
                prevPage,
                nextPage,
                page: currentPage,
                hasPrevPage,
                hasNextPage,
                prevLink: hasPrevPage ? `?limit=${limit}&page=${prevPage}&sort=${sort || ''}&category=${category || ''}` : null,
                nextLink: hasNextPage ? `?limit=${limit}&page=${nextPage}&sort=${sort || ''}&category=${category || ''}` : null
            });
        } catch (error) {
            logger.error('Error al recuperar productos:', error);
            res.status(500).json({ error: "Error al recuperar productos.", message: error.message });
        }
    }



    async addProduct(req, res) {
        try {
            const { title, description, price, thumbnail, code, stock, category, status } = req.body;
            console.log("addProduct", req.body)

            // Verifica si todos los campos obligatorios están presentes
            if (!title || !description || !price || !thumbnail || !code || !stock || !category) {
                const errorMessage = generateProductErrorInfo({ title, description, price, thumbnail, code, stock, category });
                CustomError.createError({
                    name: "ValidationError",
                    cause: errorMessage,
                    message: "Error en la creación del producto",
                    code: EErrors.INVALID_TYPES_ERROR
                });
            }
            const createdBy = req.user._id;

            const productData = { title, description, price, thumbnail, code, stock, status, category, createdBy };
            await ProductRepository.addProduct(productData);
            res.status(201).json({ message: "Producto agregado exitosamente." });
        } catch (error) {
            logger.error('Error al agregar el producto:', error);
            res.status(500).json({ error: "Error al agregar el producto.", message: error.message });
        }
    }



    async getProductById(req, res) {
        try {
            const { id } = req.params;
            const product = await ProductRepository.getProductById(id);
            res.status(200).json(product);
        } catch (error) {
            logger.error('Error al recuperar el producto:', error);
            res.status(500).json({ error: "Error al recuperar el producto.", message: error.message });
        }
    }

    async updateProduct(req, res) {
        try {
            const { id } = req.params;
            const newData = req.body;
            await ProductRepository.updateProduct(id, newData);
            res.status(200).json({ message: "Producto actualizado exitosamente." });
        } catch (error) {
            logger.error('Error al actualizar el producto:', error);
            res.status(500).json({ error: "Error al actualizar el producto.", message: error.message });
        }
    }



    async deleteProduct(req, res) {
        try {
            const productId = req.params.id;

            // Buscar el producto por ID y popular el campo 'createdBy'
            const product = await productModel.findById(productId).populate('createdBy');

            // Verifica si el producto fue encontrado
            if (!product) {
                return res.status(404).json({ message: 'Producto no encontrado' });
            }

            // Verificar si el creador del producto es premium
            if (product.createdBy && product.createdBy.role === 'premium') {
                // Aquí envías el correo notificando que se ha eliminado el producto
                const email = product.createdBy.email; // Asumiendo que el modelo de usuario tiene un campo 'email'
                const productName = product.title;
                await sendDeleteProduct(email, productName, productId); // Implementa esta función para enviar el correo
                console.log(`Correo enviado a ${email}: Producto "${productName}" (ID: ${productId}) eliminado.`);
            }

            // Eliminar el producto
            await productModel.findByIdAndDelete(productId);

            res.json({ message: 'Producto eliminado con éxito' });
        } catch (error) {
            console.error('Error al eliminar el producto', error.message); // Log para debugging
            res.status(500).json({ message: 'Error al eliminar el producto', error: error.message });
        }
    }


    async loadProducts() {
        try {
            return await ProductRepository.loadProducts();

        } catch (error) {
            logger.error('Error al cargar los productos:', error);
            throw error;
        }
    }

    
    async getProdcutsAll(req, res) {
        try {
            const products = await ProductRepository.getProdcutsAll();
    
            // Verificar si se encontraron productos
            if (!products || products.length === 0) {
                return res.status(404).json({ error: "No se encontraron productos." });
            }
    
            // Responder con los productos
            return res.json({
                status: 'success',
                payload: products
            });
        } catch (error) {
            // Manejar errores y enviar una respuesta adecuada
            console.error("Error al cargar los productos:", error);
            return res.status(500).json({ error: "Error al cargar los productos.", message: error.message });
        }
    }
    

}

module.exports = ProductController;


const productModel = require("./models/products.model.js")

class ProductManager {
    async addProduct(title, description, price, thumbnail, code, stock, status, category) {
        try {
            const newProduct = new productModel({
                title,
                description,
                price,
                thumbnail,
                code,
                stock,
                status: true,
                category
            });
            await newProduct.save();
            return newProduct;
        } catch (error) {
            throw new Error("Error al agregar el producto: " + error.message);
        }
    }

    async getProductsById(_id) {
        try {
            const product = await productModel.findById(_id);
            if (!product) {
                throw new Error("No se encontró ningún producto con el ID proporcionado.");
            }
            return product;
        } catch (error) {
            throw new Error("Error al obtener el producto: " + error.message);
        }
    }

    async updateProduct(_id, newData) {
        try {
            const updatedProduct = await productModel.findByIdAndUpdate(_id, newData, { new: true });
            if (!updatedProduct) {
                throw new Error("No se encontró ningún producto con el ID proporcionado.");
            }
            return updatedProduct;
        } catch (error) {
            throw new Error("Error al actualizar el producto: " + error.message);
        }
    }

    async deleteProduct(_id) {
        try {
            const deletedProduct = await productModel.findByIdAndDelete(_id);
            if (!deletedProduct) {
                throw new Error("No se encontró ningún producto con el ID proporcionado.");
            }
        } catch (error) {
            throw new Error("Error al eliminar el producto: " + error.message);
        }
    }
 

    async loadProducts() {
        try {
            const products = await productModel.find();
          //  console.log("Estos son los datos que se cargan:", products);
            return products;
        } catch (error) {
            throw new Error("Error al cargar los productos: " + error.message);
        }
    }
}

module.exports = ProductManager;


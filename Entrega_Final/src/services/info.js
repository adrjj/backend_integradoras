const generateProductErrorInfo = (product) => {
    return `Una o más propiedades del producto no tienen los valores correctos. Lista de propiedades:
    * title: necesita un string, y se recibió ${product.title}
    * description: necesita un string, y se recibió ${product.description}
    * price: necesita un número, y se recibió ${product.price}
    * thumbnail: necesita un string, y se recibió ${product.thumbnail}
    * code: necesita un string, y se recibió ${product.code}
    * stock: necesita un número, y se recibió ${product.stock}
    * category: necesita un string, y se recibió ${product.category}`;
}

const generateUserErrorInfo = (user) => {
    return `Una o más propiedades del usuario no tienen los valores correctos. Lista de propiedades:
    * first_name: necesita un string, y se recibió ${user.first_name}
    * last_name: necesita un string, y se recibió ${user.last_name}
    * email: necesita un string, y se recibió ${user.email}`;
}

module.exports = {
    generateProductErrorInfo,
    generateUserErrorInfo
}

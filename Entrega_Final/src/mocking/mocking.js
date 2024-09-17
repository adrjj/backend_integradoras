const { faker } = require('@faker-js/faker');

function generateMockProducts() {
  const products = [];
  for (let i = 0; i < 100; i++) {
    const product = {
      _id: faker.datatype.uuid(),
      name: faker.commerce.productName(),
      price: faker.commerce.price(),
      description: faker.commerce.productDescription(),
      category: faker.commerce.department(),
      image: faker.image.imageUrl(),
    };
    products.push(product);
  }
  return products;
}

module.exports =  generateMockProducts;


const socket = io();


// Escuchar el evento 'productAdded' y actualizar la lista de productos en tiempo real
socket.on('productAdded', (newProduct) => {
    console.log('Evento productAdded recibido viene desde el servidor', newProduct); // Agregamos este console.log para verificar los datos del producto
    const productList = document.getElementById('realTimeProductList');
    const listItem = document.createElement('li');
    listItem.textContent = `ID: ${newProduct.id} - ${newProduct.title}`;
    productList.appendChild(listItem);
});

// Escuchar el evento 'productDeleted' y actualizar la lista de productos en tiempo real
socket.on('productDeleted', (deletedProductId) => {
    console.log('Evento productDeleted recibido');
    const productList = document.getElementById('realTimeProductList');
    const items = productList.getElementsByTagName('li');
    for (let i = 0; i < items.length; i++) {
        if (items[i].textContent.includes(deletedProductId)) {
            productList.removeChild(items[i]);
            break;
        }
    }
});

// Manejar el envío del formulario para agregar un nuevo producto
document.getElementById('productForm').addEventListener('submit', async (event) => {
    console.log('Evento submit detectado');
    event.preventDefault();
    const formData = new FormData(event.target);
    const newProduct = {};

    // Recopilar los datos del formulario en newProduct
    formData.forEach((value, key) => {
        newProduct[key] = value;
    });

    // Imprimir los datos del nuevo producto en la consola
    console.log('Datos del nuevo producto:', newProduct);

    // Enviar datos del nuevo producto al servidor API
    await fetch('/api/products', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(newProduct),
    });

    // Emitir evento al servidor Socket.IO después de enviar los datos al servidor API
    socket.emit('productAdded', newProduct);

    // Limpiar los campos del formulario
    document.getElementById('productForm').reset();
});

// Manejar el clic del botón para eliminar un producto
document.getElementById('deleteProductBtn').addEventListener('click', async (event) => {
    event.preventDefault();
    const productId = document.getElementById('productId').value;

    console.log('ID del producto a eliminar:', productId);

    // Enviar el ID del producto al servidor para eliminarlo
    await fetch(`/api/products/${productId}`, {
        method: 'DELETE',
    });

    console.log("id para eleiminar", productId)

    // Emitir evento al servidor Socket.IO después de eliminar el producto
    socket.emit('productDeleted', productId);

    console.log("id para eleiminar", productId)

    // Limpiar el campo del formulario
    document.getElementById('deleteForm').reset();
});

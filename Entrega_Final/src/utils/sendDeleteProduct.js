const nodemailer = require('nodemailer');

async function sendDeleteProduct(userEmail, productName, productId) {
    const transporter = nodemailer.createTransport({
        service: process.env.EMAIL_SERVICE,
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
        }
    });

    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: userEmail,
        subject: 'Producto eliminado',
        html: `<p>El administrador eliminó tu producto porque infringe las políticas de la empresa</p>
               <h2>Producto eliminado: ${productName} (ID: ${productId})</h2>`
    };

    await transporter.sendMail(mailOptions);
}

module.exports = sendDeleteProduct;

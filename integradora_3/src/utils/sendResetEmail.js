
const nodemailer = require('nodemailer');

async function sendResetEmail(userEmail, token) {
    const transporter = nodemailer.createTransport({
        service:  process.env.EMAIL_SERVICE,
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
        }
    });

    const resetUrl = `https://yourdomain.com/reset-password?token=${token}`;

    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: userEmail,
        subject: 'Recuperación de contraseña',
        html: `<p>Haz clic en el siguiente enlace para restablecer tu contraseña:</p>
               <a href="${resetUrl}">Restablecer contraseña</a>`
    };

    await transporter.sendMail(mailOptions);
}

module.exports = sendResetEmail;

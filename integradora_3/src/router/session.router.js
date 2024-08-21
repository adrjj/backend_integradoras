const express = require("express");
const router = express.Router();
const sessionModel = require("../models/user.model.js")
const authenticatedMiddleware = require("../middleware/authenticated.js");
const { createHash, isValidPassword } = require('../utils/utils.js');
const passport = require("passport");
const generateResetToken = require("../utils/generateResetToken.js");
const token = generateResetToken();

const sendResetEmail =require("../utils/sendResetEmail.js")

const CustomError = require("../services/custom.Error")
const EErrors = require("../services/enum.js")
const generateUserErrorInfo = require("../services/info.js")

const isAuthenticated = authenticatedMiddleware.isAuthenticated;
const isNotAuthenticated = authenticatedMiddleware.isNotAuthenticated;



router.get("/github", passport.authenticate("github", { scope: "user.email" }), async (req, res) => { })

router.get("/githubCallback", passport.authenticate("github", { failureRedirect: "/login" }), async (req, res) => {
  req.session.user = req.user
  res.redirect("/products?welcome=1")
});

router.get("/register", isNotAuthenticated, (req, res) => {
  res.render("register"); // Renderiza la vista de registro
});

router.get("/login", isNotAuthenticated, (req, res) => {
  res.render("login"); // Renderiza la vista de registro
});

router.get("/profile", isAuthenticated, (req, res) => {
  res.render("profile", { user: req.session.user }); // Renderiza la vista de registro
  console.log("2// session.router", req.session.user)
});



router.post("/register", passport.authenticate("register", { failureRedirect: "failRegister" }), async (req, res) => {
  //res.send({status:"sucess",message:"usuario regsitrado"})
  res.redirect("login")

});


router.get("/failRegister", (req, res) => {
  // El mensaje de error se pasa en la query de la URL
  const errorMessage = req.query.message || "Fallo en el registro";
  console.log("Estrategia fallida:", errorMessage);
  res.send({ status: "error", message: errorMessage });
});



router.post("/login", passport.authenticate("login", { failureRedirect: "faillogin" }), async (req, res, next) => {
  // if (!req.user) return res.status(400).send({ status: "error", error: "datos incompletos" })
  if (!req.user) {
    CustomError.createError({
      name: "LoginError",
      cause: generateUserErrorInfo(req.body),
      message: "Datos incompletos",
      code: EErrors.INVALID_TYPES_ERROR
    });
  }

  try {
    req.session.user = {
      first_name: req.user.first_name,
      last_name: req.user.last_name,
      email: req.user.email,
      role: req.user.role,

    }
    console.log(req.session.user)

    // Verificar si el usuario es un administrador
    if (req.user.role === "admin") {
      // Si es un administrador, redirigir a la página de productos en tiempo real para administradores
      return res.redirect("/realtimeproducts");
    } else {
      // Si no es un administrador, redirigir a la página de productos regulares
      return res.redirect("/products?welcome=1");
    }
  } catch (error) {
    next(error); // Asegúrate de pasar el error al middleware de manejo de errores
  }
});

router.get("/faillogin", async (req, res) => {
  console.log("login fallido")

  res.send({ status: "error", message: "Login fallido" });

});

router.get("/reset-password", async (req, res) => {
  res.render("resetPassword")
});

router.post("/logout", async (req, res) => {

  req.session.destroy((err) => {

    if (err) return res.status(500).send("Error al cerrar session", error);
    res.redirect("login");


  })

});

router.post('/forgot-password', async (req, res) => {
  const { email } = req.body;
  console.log ("email",req.body)
  try {
      // Buscar al usuario en la base de datos por correo electrónico
      const user = await sessionModel.findOne({ email });

      if (!user) {
          return res.status(400).send('No se encontró una cuenta con ese correo electrónico.');
      }

      // Generar el token y la fecha de expiración
      const usetoken = token;
      const expirationTime = Date.now() + 3600000; // 1 hora
      console.log("token", token)
      // Guardar el token y la expiración en la base de datos
      user.resetPasswordToken = usetoken;
      user.resetPasswordExpires = expirationTime;
      await user.save();
  
      // Enviar el correo de recuperación
      await sendResetEmail(email, token);

      res.status(200).send('Correo de recuperación enviado.');
  } catch (error) {
      res.status(500).send('Error al enviar el correo de recuperación.');
  }
});

router.post('/reset-password/:token', async (req, res) => {
  const { token } = req.params;
  const { newPassword } = req.body;
  console.log(token, newPassword)
  try {
      // Verifica que el token sea válido y no haya expirado
      const user = await sessionModel.findOne({ resetPasswordToken: token, resetPasswordExpires: { $gt: Date.now() } });
      if (!user) {
          return res.status(400).send('El token es inválido o ha expirado.');
      }
            // Cifra la nueva contraseña
      newPasswordHash = createHash(newPassword)

      user.password = newPasswordHash;
      user.resetPasswordToken = undefined; // Elimina el token
      user.resetPasswordExpires = undefined; // Elimina la expiración
      await user.save();

      //res.send('La contraseña ha sido actualizada con éxito.');
      req.flash('success_msg', 'La contraseña ha sido cambiada con éxito.');
      res.redirect("/api/sessions/login");

  } catch (error) {
      res.status(500).send('Hubo un error al restablecer la contraseña.');
  }
  
});


router.get('/cambiarPassword', async (req, res) => {
  const { token } = req.query;

  // Verificar si el token existe y es válido
  const user = await sessionModel.findOne({ resetPasswordToken: token, resetPasswordExpires: { $gt: Date.now() } });
  
  if (!user) {
      return res.status(400).send('El token es inválido o ha expirado.');
  }

  // Renderiza la vista del formulario de cambio de contraseña y pasa el token
  res.render('cambiarPassword', { token });

});

module.exports = router;
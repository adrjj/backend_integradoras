const express = require("express");
const router = express.Router();
const ChatManager = require("../dao/chatManagerdb.js")

router.get("/", async (req, res) => {
  try {
      // Obtener los mensajes desde tu ChatManager
      //const messages = await ChatManager.getMessages();
      
      // Renderizar la vista 'chat' y pasar los mensajes
    //res.render('chat', { messages });

     res.render('chat',{});
  } catch (error) {
      res.status(500).json({ error: "6//Error al cargar los datos", message: error.message });
  }
});



module.exports = router;
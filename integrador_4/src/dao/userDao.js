

const User = require('../models/user.model'); // Asegúrate de tener el modelo de usuario adecuado

exports.updateUserStatus = async (userId, role) => {
  try {
    await User.findByIdAndUpdate(userId, { role });
  } catch (error) {
    throw new Error('Error al actualizar el estado del usuario');
  }
};

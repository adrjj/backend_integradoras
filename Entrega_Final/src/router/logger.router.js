const express = require('express');
const router = express.Router();
const logger = require('../utils/logger'); 


router.get('/', (req, res) => {
    logger.debug('Este es un mensaje de debug');
    logger.info('Este es un mensaje de info');
    logger.warning('Este es un mensaje de warning');
    logger.error('Este es un mensaje de error');
    logger.fatal('Este es un mensaje de fatal');
  
    res.send('Logs generados. Revisa la consola y el archivo de logs.');
});

module.exports = router;

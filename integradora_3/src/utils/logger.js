const winston = require('winston');

// Definir los niveles personalizados
const customLevels = {
    levels: {
        debug: 0,
        http: 1,
        info: 2,
        warning: 3,
        error: 4,
        fatal: 5
    },
    colors: {
        debug: 'blue',
        http: 'magenta',
        info: 'green',
        warning: 'yellow',
        error: 'red',
        fatal: 'red bold'
    }
};

// Configuración común para ambos loggers
const commonFormat = winston.format.combine(
    winston.format.timestamp(),
    winston.format.printf(({ timestamp, level, message }) => {
        return `${timestamp} [${level}]: ${message}`;
    })
);

// Crear el logger para desarrollo
const developmentLogger = winston.createLogger({
    levels: customLevels.levels,
    level: 'debug',
    format: commonFormat,
    transports: [
        new winston.transports.Console({
            format: winston.format.combine(
                winston.format.colorize({ all: true }), // Colorizar todos los niveles
                commonFormat
            )
        })
    ]
});

// Crear el logger para producción
const productionLogger = winston.createLogger({
    levels: customLevels.levels,
    level: 'info',
    format: commonFormat,
    transports: [
        new winston.transports.Console({
            format: winston.format.combine(
                winston.format.colorize({ all: true }), // Colorizar todos los niveles
                commonFormat
            )
        }),
        new winston.transports.File({
            filename: 'errors.log',
            level: 'error',
            format: commonFormat
        })
    ]
});

// Seleccionar el logger basado en el entorno
const logger = process.env.NODE_ENV === 'production' ? productionLogger : developmentLogger;

// Exportar el logger
module.exports = logger;

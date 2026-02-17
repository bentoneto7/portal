/**
 * WINSTON LOGGER
 *
 * Sistema de logging estruturado para o Bola na Rede
 * - Logs separados por nível (error, warn, info, debug)
 * - Rotação automática de arquivos
 * - Console colorido para desenvolvimento
 * - JSON estruturado para produção
 */

const winston = require('winston');
const path = require('path');
const fs = require('fs');

// Garante que diretório de logs existe
const logsDir = path.join(__dirname, '../../logs');
if (!fs.existsSync(logsDir)) {
    fs.mkdirSync(logsDir, { recursive: true });
}

// Formato customizado para console
const consoleFormat = winston.format.combine(
    winston.format.colorize(),
    winston.format.timestamp({ format: 'HH:mm:ss' }),
    winston.format.printf(({ timestamp, level, message, ...metadata }) => {
        let msg = `${timestamp} [${level}] ${message}`;

        // Adiciona metadata se existir
        if (Object.keys(metadata).length > 0) {
            msg += ` ${JSON.stringify(metadata)}`;
        }

        return msg;
    })
);

// Formato para arquivos (JSON)
const fileFormat = winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
);

// Cria logger
const logger = winston.createLogger({
    level: process.env.LOG_LEVEL || 'info',
    format: fileFormat,
    defaultMeta: { service: 'bola-na-rede' },
    transports: [
        // Erros em arquivo separado
        new winston.transports.File({
            filename: path.join(logsDir, 'error.log'),
            level: 'error',
            maxsize: 5242880, // 5MB
            maxFiles: 5,
            tailable: true
        }),

        // Warnings em arquivo separado
        new winston.transports.File({
            filename: path.join(logsDir, 'warn.log'),
            level: 'warn',
            maxsize: 5242880,
            maxFiles: 3,
            tailable: true
        }),

        // Todos os logs
        new winston.transports.File({
            filename: path.join(logsDir, 'combined.log'),
            maxsize: 10485760, // 10MB
            maxFiles: 5,
            tailable: true
        })
    ]
});

// Adiciona console em desenvolvimento
if (process.env.NODE_ENV !== 'production') {
    logger.add(new winston.transports.Console({
        format: consoleFormat
    }));
}

// Métodos auxiliares para logging contextual
logger.scraping = (message, metadata = {}) => {
    logger.info(`[SCRAPING] ${message}`, metadata);
};

logger.api = (message, metadata = {}) => {
    logger.info(`[API] ${message}`, metadata);
};

logger.article = (message, metadata = {}) => {
    logger.info(`[ARTICLE] ${message}`, metadata);
};

logger.cache = (message, metadata = {}) => {
    logger.debug(`[CACHE] ${message}`, metadata);
};

logger.health = (message, metadata = {}) => {
    logger.info(`[HEALTH] ${message}`, metadata);
};

module.exports = logger;

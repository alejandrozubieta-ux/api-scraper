const express = require('express');
const { extraerTextoLimpio } = require('./scraper');

const app = express();
app.use(express.json());

// Esta función revisa si el usuario tiene la llave correcta
const verificarApiKey = (req, res, next) => {
    const llaveRecibida = req.headers['x-api-key'];
    
    
    // Si no estamos en la nube, se usa 'mi_llave_secreta_123' para pruebas locales
    const llaveSecreta = process.env.MI_API_KEY || 'mi_llave_secreta_123';

    // Si no enviaron llave, o si es incorrecta, bloqueamos el acceso (Error 401)
    if (!llaveRecibida || llaveRecibida !== llaveSecreta) {
        console.warn('⚠️ Intento de acceso bloqueado. API Key inválida.');
        return res.status(401).json({ error: 'Acceso no autorizado.' });
    }

    // Si la llave es correcta continua con la peticion
    next();
};

// ENDPOINT PRINCIPAL- verifica la api key
app.post('/api/limpiar-web', verificarApiKey, async (req, res) => {
    const { url } = req.body;

    if (!url) {
        return res.status(400).json({ error: 'Debes enviar una URL.' });
    }

    console.log(`📡 Limpiando: ${url}`);
    
    try {
        const markdown = await extraerTextoLimpio(url);

        if (!markdown) {
            return res.status(500).json({ error: 'No se pudo procesar la página.' });
        }

        res.json({ exito: true, contenido: markdown });

    } catch (error) {
        console.error('Error interno:', error);
        res.status(500).json({ error: 'Ocurrió un error interno.' });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`🚀 API protegida corriendo en el puerto ${PORT}`);
});
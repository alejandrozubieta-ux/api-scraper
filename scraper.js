// scraper.js
const axios = require('axios');
const cheerio = require('cheerio');
const TurndownService = require('turndown');

async function extraerTextoLimpio(url) {
    try {
        const respuesta = await axios.get(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
                'Accept-Language': 'es-CO,es;q=0.9,en-US;q=0.8,en;q=0.7',
                'Cache-Control': 'no-cache',
                'Pragma': 'no-cache',
            },
            // Le damos un máximo de 15 segundos para responder, si no, aborta rápido
            timeout: 15000 
        });
        const $ = cheerio.load(respuesta.data);

        // Limpieza de ruido
        $('script, style, nav, footer, aside, header, iframe, svg, button, form').remove();
        
        const htmlLimpio = $('body').html();

        // Conversión a Markdown
        const turndownService = new TurndownService({
            headingStyle: 'atx',
            codeBlockStyle: 'fenced'
        });
        
        return turndownService.turndown(htmlLimpio);

    } catch (error) {
        console.error('Error al extraer texto de la URL:', error.message);
        return null;
    }
}

// Exportamos la función para poder importarla en nuestro agente
module.exports = { extraerTextoLimpio };
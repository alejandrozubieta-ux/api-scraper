// scraper.js
const axios = require('axios');
const cheerio = require('cheerio');
const TurndownService = require('turndown');

async function extraerTextoLimpio(url) {
    try {
        const respuesta = await axios.get(url);
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
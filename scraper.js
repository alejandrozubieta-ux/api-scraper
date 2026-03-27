const axios = require('axios');
const cheerio = require('cheerio');
const TurndownService = require('turndown');

async function extraerTextoLimpio(url) {
    try {
        const respuesta = await axios.get(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
                'Accept-Language': 'es-CO,es;q=0.9,en-US;q=0.8,en;q=0.7',
                'Cache-Control': 'no-cache',
                'Pragma': 'no-cache',
            },
            timeout: 15000 
        });

        const $ = cheerio.load(respuesta.data);

        // 1. LIMPIEZA AGRESIVA CON CHEERIO
        // Añadimos 'img', 'picture', 'figure' y 'sup' (esto último borra las referencias [1], [2] de Wikipedia)
        $('script, style, nav, footer, aside, header, iframe, svg, button, form, noscript, img, picture, figure, sup').remove();
        
        // Eliminamos elementos de accesibilidad ocultos que los lectores de pantalla usan pero el LLM no necesita
        $('[aria-hidden="true"], .visually-hidden, .sr-only').remove();

        const htmlLimpio = $('body').html();

        if (!htmlLimpio) {
            throw new Error("No se pudo encontrar el contenido principal de la página.");
        }

        const turndownService = new TurndownService({
            headingStyle: 'atx',
            codeBlockStyle: 'fenced'
        });

        // 2. REGLA MÁGICA PARA ENLACES (¡El mayor ahorro de tokens!)
        // Toma algo como <a href="https://ruta.com">Texto</a> y devuelve solo "Texto"
        turndownService.addRule('quitarUrls', {
            filter: 'a',
            replacement: function (content) {
                return content; 
            }
        });

        // 3. REGLA PARA IMÁGENES RESIDUALES
        turndownService.addRule('quitarImagenes', {
            filter: 'img',
            replacement: function () {
                return ''; // Reemplaza cualquier imagen que haya sobrevivido por vacío
            }
        });
        
        let markdown = turndownService.turndown(htmlLimpio);

        // 4. LIMPIEZA FINAL DE TEXTO (Quitar saltos de línea excesivos)
        // Si hay 3 o más saltos de línea seguidos, los reduce a solo 2.
        markdown = markdown.replace(/\n{3,}/g, '\n\n').trim();

        return markdown;

    } catch (error) {
        console.error(`❌ Error al extraer texto de la URL (${url}):`, error.message);
        return null;
    }
}

module.exports = { extraerTextoLimpio };
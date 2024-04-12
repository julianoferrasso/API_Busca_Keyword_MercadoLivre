const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

// Define o nome do arquivo onde as sugestões serão gravadas incrementalmente
const fileName = path.join(__dirname, 'consulta_sugestao_produtos_ml.txt');

// Define suas consultas base aqui
// const searchQueries = [
//     'marmita eletrica',
//     'caixinha de som karaoke',
//     'mini impressora',
//     'camera de segurança'
// ];

const searchQueries = [
    'camera de seguranda'
];


async function fetchSuggestions(query) {
    try {

        // Inicia o Puppeteer
        const browser = await puppeteer.launch({ headless: false }); // {headless: false} para ver o navegador
        const page = await browser.newPage();

        // tratar caracteres especiais coomo ç
        await page.setExtraHTTPHeaders({
            'Accept-Charset': 'utf-8'
        });

        // Vai até a página de interesse
        await page.goto('https://www.mercadolivre.com.br/');

        // Encontra o elemento de input e digita o texto de busca
        await page.type('input[name="as_word"]', query, { delay: 100 });

        // await page.evaluate((query) => {
        //     document.querySelector('input[name="as_word"]').value = query;
        // }, query);

        // Espera por um tempo ou até que o elemento com as sugestões seja carregado
        await page.waitForSelector('.sb-suggestions', { visible: true });

        // Captura as sugestões
        const suggestions = await page.evaluate(() => {
            const items = Array.from(document.querySelectorAll('.sb-suggestions__item'));
            return items.map(item => item.innerText);
        });

        console.log(`Sugestões para "${query}":`, suggestions);
        // Grava a consulta atual e suas sugestões no arquivo, de forma incremental
        const contentToAppend = `Sugestões para "${query}":\n${suggestions.join('\n')}\n\n`;
        fs.appendFileSync(fileName, contentToAppend, 'utf8');

        // Fecha o navegador
        await browser.close();
    } catch (error) {
        console.log(error)
    }
}

// runSearches();
async function runSearchesWithAlphabet(searchQueries) {
    const alphabet = 'abcdefghijklmnopqrstuvwxyz'.split('');

    for (const baseQuery of searchQueries) {
        for (const letter of alphabet) {
            const query = `${baseQuery} ${letter}`;
            console.log(`query::: ${query}`)
            await fetchSuggestions(query);
        }
    }
}

runSearchesWithAlphabet(searchQueries);

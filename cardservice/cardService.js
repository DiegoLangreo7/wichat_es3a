const express = require('express');
const axios = require('axios');
const app = express();
const port = 8008;

// Middleware to parse JSON in request body
app.use(express.json());

const urlApiWikidata = 'https://query.wikidata.org/sparql';


const queries = {
    "country":
        `SELECT ?image
        WHERE {
            ?city wdt:P31 wd:Q515;   # Es una ciudad (Q515)
            wdt:P18 ?image.     # Tiene una imagen (P18)
        }
        LIMIT 100`,
    "flags":
        `SELECT ?image
        WHERE {
                ?country wdt:P31 wd:Q6256;
                wdt:P41 ?image.
        }
        LIMIT 100`,
    "science":
        `SELECT ?image
        WHERE {
            ?scientist wdt:P106 wd:Q901. # Científico (Q901)
            FILTER NOT EXISTS { ?scientist wdt:P31/wdt:P279* wd:Q15632617. } # Excluir personajes ficticios
            ?scientist wdt:P18 ?image.
        }
        LIMIT 100`,
    "sports":
        `SELECT ?athlete ?athleteLabel ?image 
        WHERE {
            ?athlete wdt:P106 wd:Q937857;
                wdt:P18 ?image.
        }
        LIMIT 100`,
    "cine":
        `SELECT ?image
        WHERE 
        {
            VALUES ?occupation {wd:Q10800557 }
            ?person wdt:P106 ?occupation.
            ?person wdt:P18 ?image. 
        }
        LIMIT 100`,
    "animals":
        `SELECT DISTINCT ?image
        WHERE {
            ?animal wdt:P31 wd:Q16521.        # Taxón biológico
            ?animal wdt:P105 wd:Q7432.        # Nivel taxonómico = especie
            ?animal wdt:P1843 ?commonName.    # Nombre común
            ?animal wdt:P18 ?image.           # Imagen obligatoria
        }
        LIMIT 100`,
}

app.get('/cardValues', (req, res) => {
    console.log(`Card Service - Solicitando valores de tarjetas`);
    const categories = Object.keys(queries);
    const randomCategory = categories[Math.floor(Math.random() * categories.length)];
    getImages(randomCategory)
        .then(images => {
            const duplicatedImages = [...images, ...images]; // Duplicate the images
            res.json({images: duplicatedImages });
        })
        .catch(error => {
            console.error('Error fetching images:', error);
            res.status(500).json({ error: 'Error fetching images' });
        });
});

async function getImages(category) {
    const query = queries[category];
    console.log(`Consulta: ${query}`)
    try {
        const response = await axios.get(urlApiWikidata, {
            params: { query: query, format: 'json' },
            headers: { 'User-Agent': 'QuestionGeneration/1.0' }
        });
        const data = response.data.results.bindings;
        const images = data.map(item => item.image.value);
        const shuffledImages = images.sort(() => Math.random() - 0.5);

        // Seleccionar las primeras 8 imágenes
        const randomImages = shuffledImages.slice(0, 8);
        return randomImages;
    } catch (error) {
        console.error('Error fetching data from Wikidata:', error);
        throw new Error('Error fetching data from Wikidata');
    }
}

const server = app.listen(port, () => {
    console.log(`Card Service listening at http://localhost:${port}`);
});

module.exports = server;
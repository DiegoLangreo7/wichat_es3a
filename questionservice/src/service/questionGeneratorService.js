const axios = require('axios');
const dataService = require('./questionSaverService');

const generating = new Set(); 

const labelKeys = {
    country: "countryLabel",
    sports: "athleteLabel",
    science: "scientistLabel",
    flags: "countryLabel",
    cine: "personLabel",
    animals: "animalLabel",
};

const wikidataCategoriesQueries = {   
    "country": {  
        query: `
        SELECT ?city ?cityLabel ?country ?countryLabel ?image
        WHERE {
            ?city wdt:P31 wd:Q515.  # Ciudad
            ?city wdt:P17 ?country.  # País de la ciudad
            OPTIONAL { ?city wdt:P18 ?image. }  # Imagen de la ciudad (opcional)
            SERVICE wikibase:label {
                bd:serviceParam wikibase:language "[AUTO_LANGUAGE],es".
            }
        }
        LIMIT 500
        `,
    },
    "flags": {
        query: `
        SELECT ?country ?countryLabel ?image
        WHERE {
        ?country wdt:P31 wd:Q6256;
                wdt:P41 ?image.
        SERVICE wikibase:label { bd:serviceParam wikibase:language "es". }
        }
        LIMIT 200
        `,
    },
    "science": {
        query: `
        SELECT ?scientist ?scientistLabel ?image
        WHERE {
            ?scientist wdt:P106 wd:Q901. # Científico
            FILTER NOT EXISTS { ?scientist wdt:P31 wd:Q15632617. }       
            OPTIONAL { ?scientist wdt:P18 ?image. }  # Imagen del científico (opcional)
            SERVICE wikibase:label {
                bd:serviceParam wikibase:language "[AUTO_LANGUAGE],es".
            }
        }
        LIMIT 150
        `,
    },
    "sports": {
        query: `
        SELECT ?athlete ?athleteLabel ?image 
        WHERE {
        ?athlete wdt:P106 wd:Q937857

        
        # Datos adicionales
        OPTIONAL { 
            ?athlete wdt:P18 ?image.  # Imagen
        }
        
        # Etiquetas en español con fallback a inglés
        SERVICE wikibase:label {
            bd:serviceParam wikibase:language "es,en".
        }
        }
        LIMIT 180
        `,
    },
    "cine": {
        query: `
        SELECT ?person ?personLabel ?image
        WHERE {
        {
            # Buscar actores (Q33999) y actrices (Q10800557)
            VALUES ?occupation {wd:Q10800557 }
            ?person wdt:P106 ?occupation.
        }
        
        # Obtener imagen (opcional)
        OPTIONAL { ?person wdt:P18 ?image. }
        
        # Obtener etiquetas en español o inglés
        SERVICE wikibase:label {bd:serviceParam wikibase:language "[AUTO_LANGUAGE],es,en".}
        } LIMIT 500
        `,
    }, 
    "animals": {
        query: `
        SELECT ?animal ?animalLabel ?image
        WHERE {
        ?animal wdt:P31 wd:Q16521;    # Instancia de animal
                wdt:P18 ?image;       # Tiene imagen
                wdt:P171* wd:Q7377.   # Descendiente taxonómico de Mamíferos (Q7377)

        SERVICE wikibase:label { bd:serviceParam wikibase:language "[AUTO_LANGUAGE],es,en". }
        } LIMIT 500
        `,
    },

};

const titlesQuestionsCategories = {
    "country": "¿A qué país pertenece esta imagen?",
    "sports": "¿Quién es el futbolista de la imagen?",
    "science": "¿Quién es el científico en la imagen?",
    "flags": "¿A que país pertenece esta bandera?",
    "cine": "¿Quién es el actor de esta imagen?",
    "animals": "¿Qué animal se muestra en la imagen?"
};

const urlApiWikidata = 'https://query.wikidata.org/sparql';

// Obtener imágenes de una categoría en Wikidata
async function getImagesFromWikidata(category, numImages) {
    const categoryQueries = wikidataCategoriesQueries[category];
    console.log(`sparqlQuery: ${categoryQueries.query}`);
    try {
        const response = await axios.get(urlApiWikidata, {
            params: { query: categoryQueries.query, format: 'json' },
            headers: { 'User-Agent': 'QuestionGeneration/1.0' }
        });

        const labelKey = labelKeys[category];
        const data = response.data.results.bindings;
        const filteredImages = data
            .filter(item => item.image && item[labelKey])  
            .map(item => ({
                imageUrl: item.image.value,
                label: item[labelKey].value
            }));
        return filteredImages;

    } catch (error) {
        console.error(`Error retrieving images: ${error.message}`);
        return [];
    }
}


async function processQuestions(images, category) {
    console.log(`Processing ${images.length} images for category ${category}`);
    const incorrectPool = await fetchIncorrectOptionsForCategory(category);
    console.log(`Incorrect options for ${category}: ${incorrectPool.length}`);
    if (incorrectPool.length < 3) return;

    const allQuestions = [];

    for (const image of images) {
        const incorrectAnswers = incorrectPool
            .filter(opt => opt !== image.label)
            .sort(() => 0.5 - Math.random())
            .slice(0, 3);

        if (incorrectAnswers.length < 3) return;

        const options = [image.label, ...incorrectAnswers].sort(() => 0.5 - Math.random());

        allQuestions.push({
            question: titlesQuestionsCategories[category],
            options,
            correctAnswer: image.label,
            category,
            imageUrl: image.imageUrl
          });

    }
    await dataService.saveQuestionsBatch(allQuestions);
}


async function fetchIncorrectOptionsForCategory(category) {
    const queries = {
        "country": `
            SELECT DISTINCT ?countryLabel WHERE {
                ?country wdt:P31 wd:Q6256.
                SERVICE wikibase:label { bd:serviceParam wikibase:language "es". }
            } LIMIT 500
        `,
        "sports": `
            SELECT DISTINCT ?athleteLabel 
        WHERE {
            ?athlete wdt:P106 wd:Q937857
            SERVICE wikibase:label {bd:serviceParam wikibase:language "es,en".}
        } LIMIT 180
        `,
        "science": `
            SELECT distinct ?scientistLabel
        WHERE {
            ?scientist wdt:P106 wd:Q901. # Científico
            FILTER NOT EXISTS { ?scientist wdt:P31 wd:Q15632617. }       
            SERVICE wikibase:label {bd:serviceParam wikibase:language "[AUTO_LANGUAGE],es".}
        }LIMIT 150
        `,
        "flags": `
            SELECT DISTINCT ?countryLabel WHERE {
                ?country wdt:P31 wd:Q6256.
                SERVICE wikibase:label { bd:serviceParam wikibase:language "es". }
            } LIMIT 500
        `,
        "cine": `
            SELECT DISTINCT ?personLabel
            WHERE {
            {
                # Buscar actores (Q33999) y actrices (Q10800557)
                VALUES ?occupation {wd:Q10800557 }
                ?person wdt:P106 ?occupation.
            }  
                SERVICE wikibase:label {bd:serviceParam wikibase:language "[AUTO_LANGUAGE],es,en".}
            } LIMIT 500
        `,
        "animals": `
            SELECT DISTINCT ?animalLabel 
            WHERE {
            ?animal wdt:P31 wd:Q16521;    # Instancia de animal
                    wdt:P171* wd:Q7377.   # Descendiente taxonómico de Mamíferos (Q7377)

            SERVICE wikibase:label { bd:serviceParam wikibase:language "[AUTO_LANGUAGE],es,en". }
            }LIMIT 500
        `,
    };

    const query = queries[category];
    const labelKey = labelKeys[category];

    try {
        const response = await axios.get(urlApiWikidata, {
            params: { query, format: 'json' },
            headers: {
                'User-Agent': 'QuestionGeneration/1.0',
                'Accept': 'application/json'
            }
        });

        const options = response.data.results.bindings
            .map(item => item[labelKey]?.value)
            .filter(label => {
                if (!label) return false;
                const isQId = /^Q\d+$/i.test(label);
                return !isQId; // Filtrar QIDs
            });
        return [...new Set(options)]; // eliminar duplicados
    } catch (error) {
        console.error(`Error al obtener opciones incorrectas para ${category}:`, error.message);
        return [];
    }
}


// Generate questions
async function generateQuestionsByCategory(category, quantity) {
    if (generating.has(category)) return;
    generating.add(category);

    try {
        await getImagesFromWikidata(category, quantity)
            .then(images => processQuestions(images, category));
    } finally {
        generating.delete(category);
    }
}

module.exports = {
    generateQuestionsByCategory
};
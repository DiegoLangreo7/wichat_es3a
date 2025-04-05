const axios = require('axios');
const dataService = require('./questionSaverService');

const generating = new Set(); 

const labelKeys = {
    country: "countryLabel",
    sports: "sportLabel",
    science: "scientistLabel",
    history: "personLabel",
    art: "artistLabel",
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
        ORDER BY RAND()
        LIMIT ?limit
        `,
    },
    "sports": {
        query: `
        SELECT ?sport ?sportLabel ?image
        WHERE {
            ?sport wdt:P31 wd:Q349.  # Deporte
            OPTIONAL { ?sport wdt:P18 ?image. }  # Imagen del deporte (opcional)
            SERVICE wikibase:label {
                bd:serviceParam wikibase:language "[AUTO_LANGUAGE],es".
            }
        }
        ORDER BY RAND()
        LIMIT ?limit
        `,
    },
    "science": {
        query: `
        SELECT ?scientist ?scientistLabel ?image
        WHERE {
            ?scientist wdt:P31 wd:Q5.  # Científico
            OPTIONAL { ?scientist wdt:P18 ?image. }  # Imagen del científico (opcional)
            SERVICE wikibase:label {
                bd:serviceParam wikibase:language "[AUTO_LANGUAGE],es".
            }
        }
        ORDER BY RAND()
        LIMIT ?limit
        `,
    },
    "history": {
        query: `
        SELECT ?person ?personLabel ?image
        WHERE {
            ?person wdt:P31 wd:Q5.  # Persona
            OPTIONAL { ?person wdt:P18 ?image. }  # Imagen de la persona (opcional)
            SERVICE wikibase:label {
                bd:serviceParam wikibase:language "[AUTO_LANGUAGE],es".
            }
        }
        ORDER BY RAND()
        LIMIT ?limit
        `,
    },
    "art": {
        query: `
       SELECT ?painting ?artistLabel ?image
        WHERE {
            ?painting wdt:P31 wd:Q3305213.  # Elemento que sea una pintura
            ?painting wdt:P170 ?artist.  # Relación con el artista
            ?artist rdfs:label "NOMBRE_DEL_ARTISTA"@es.  # Filtrar por el nombre del artista (ajústalo según sea necesario)
            
            OPTIONAL { ?painting wdt:P18 ?image. }  # Imagen de la pintura (opcional)
            
            SERVICE wikibase:label {
                bd:serviceParam wikibase:language "[AUTO_LANGUAGE],es".
            }
        }
        ORDER BY RAND()
        LIMIT ?limit
        `,
    }, 
    "animals": {
        query: `
        SELECT ?animal ?animalLabel ?image
        WHERE {
            ?animal wdt:P31 wd:Q729.  # Animal
            OPTIONAL { ?animal wdt:P18 ?image. }  # Imagen del animal (opcional)
            SERVICE wikibase:label {
                bd:serviceParam wikibase:language "[AUTO_LANGUAGE],es".
            }
        }
        ORDER BY RAND()
        LIMIT ?limit
        `,
    },

};

const titlesQuestionsCategories = {
    "country": "¿A qué país pertenece esta imagen?",
    "sports": "¿Qué deporte se muestra en la imagen?",
    "science": "¿Quién es la persona en la imagen?",
    "history": "¿Quién es la persona en la imagen?",
    "art": "¿Quién es el artista de esta pintura?",
    "animals": "¿Qué animal se muestra en la imagen?"
};

const urlApiWikidata = 'https://query.wikidata.org/sparql';

// Obtener imágenes de una categoría en Wikidata
async function getImagesFromWikidata(category, numImages) {
    // Acceder directamente a la consulta correspondiente a la categoría dada
    const categoryQueries = wikidataCategoriesQueries[category];

    
    // Obtención de la consulta directamente de la categoría dada
    const sparqlQuery = categoryQueries.query.replace('?limit', numImages);

    try {
        const response = await axios.get(urlApiWikidata, {
            params: {
                query: sparqlQuery,
                format: 'json'
            },
            headers: {
                'User-Agent': 'QuestionGeneration/1.0',
                'Accept': 'application/json'
            }
        });

        const labelKey = labelKeys[category];

        const data = response.data.results.bindings;
        console.log(`data: ${JSON.stringify(data, null, 2)}`);
        if (data.length > 0) {
            const filteredImages = data
                .filter(item => item.image && item[labelKey])  // Filtrar solo los elementos con ciudad e imagen
                .slice(0, numImages)  // Limitar la cantidad de imágenes a `numImages`
                .map(item => ({
                    imageUrl: item.image.value,
                    label: item[labelKey].value
                }));
            console.log(`filter: ${filteredImages}`);
            return filteredImages;
        }

    } catch (error) {
        console.error(`Error retrieving images: ${error.message}`);
        return [];
    }
}


async function getIncorrect(correctOption, category) {
    const queryIncorrectCountry = `
        SELECT DISTINCT ?countryLabel
        WHERE {
            ?country wdt:P31 wd:Q6256.  # Q6256 = país
            SERVICE wikibase:label { bd:serviceParam wikibase:language "es". }
        }
        LIMIT 100
    `;
    const queryIncorretcSport = `
        SELECT DISTINCT ?sportLabel
        WHERE {
            ?sport wdt:P31 wd:Q349.  # Q349 = deporte
            SERVICE wikibase:label { bd:serviceParam wikibase:language "es". }
        }
        LIMIT 100
    `;
    const queryIncorrectScience = `
        SELECT DISTINCT ?scientistLabel
        WHERE {
            ?scientist wdt:P31 wd:Q5.  # Q5 = persona
            SERVICE wikibase:label { bd:serviceParam wikibase:language "es". }
        }
        LIMIT 100
    `;
    const queryIncorrectHistory = `
        SELECT DISTINCT ?personLabel
        WHERE {
            ?person wdt:P31 wd:Q5.  # Q5 = persona
            SERVICE wikibase:label { bd:serviceParam wikibase:language "es". }
        }
        LIMIT 100
    `;
    const queryIncorrectArt = `
        SELECT DISTINCT ?artistLabel
        WHERE {
            ?artist wdt:P31 wd:Q5.  # Q5 = persona
            SERVICE wikibase:label { bd:serviceParam wikibase:language "es". }
        }
        LIMIT 100
    `;
    const queryIncorrectAnimals = `
        SELECT DISTINCT ?animalLabel
        WHERE {
            ?animal wdt:P31 wd:Q5.  # Q5 = persona
            SERVICE wikibase:label { bd:serviceParam wikibase:language "es". }
        }
        LIMIT 100
    `;

    const queries = {
        "country": queryIncorrectCountry,
        "sports": queryIncorretcSport,
        "science": queryIncorrectScience,
        "history": queryIncorrectHistory,
        "art": queryIncorrectArt,
        "animals": queryIncorrectAnimals,
    };

    const incorrectQuery = queries[category];
    const labelKey = labelKeys[category];

    try {
        const response = await axios.get(urlApiWikidata, {
            params: {
                query: incorrectQuery,
                format: 'json'
            },
            headers: {
                'User-Agent': 'QuestionGeneration/1.0',
                'Accept': 'application/json'
            }
        });

        const data = response.data.results.bindings.map(item => item[labelKey].value);
        const incorrectOptions = data.filter(topic => topic !== correctOption);
        
        // Seleccionamos aleatoriamente 3 opciones incorrectas
        return incorrectOptions.sort(() => 0.5 - Math.random()).slice(0, 3);
    } catch (error) {
        console.error(`Error retrieving countries: ${error.message}`);
        return [];
    }
}

async function processQuestions(images, category) {
    const tasks = images.map(async (image) => {
        const incorrectAnswers = await getIncorrect(image.label, category);
        if (incorrectAnswers.length < 3) return;

        const options = [image.label, ...incorrectAnswers].sort(() => 0.5 - Math.random());
        const questionText = titlesQuestionsCategories[category]; 

        const newQuestion = {
            question: questionText,
            options,
            correctAnswer: image.label,
            category,
            imageUrl: image.imageUrl
        };

        await dataService.saveQuestion(newQuestion);
    });

    await Promise.all(tasks); // ejecuta en paralelo
}
// Generate questions
async function generateQuestionsByCategory(category, quantity) {
    if (generating.has(category)) {
        console.log(`Ya se está generando para la categoría ${category}`);
        return;
    }

    try {
        generating.add(category);
        const images = await getImagesFromWikidata(category, quantity);
        await processQuestions(images, category);
    } finally {
        generating.delete(category);
    }
}

module.exports = {
    generateQuestionsByCategory
};
const axios = require('axios');
const dataService = require('./questionSaverService');

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
       SELECT ?painting ?paintingLabel ?image
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

        const data = response.data.results.bindings;
        if (data.length > 0) {
            const filteredImages = data
                .filter(item => item.cityLabel && item.image)  // Filtrar solo los elementos con ciudad e imagen
                .slice(0, numImages)  // Limitar la cantidad de imágenes a `numImages`
                .map(item => ({
                    label: item.cityLabel.value,
                    imageUrl: item.image.value,
                    country: item.countryLabel.value
                }));
            
            console.log("imagenes de paises");
            return filteredImages;
        }

    } catch (error) {
        console.error(`Error retrieving images: ${error.message}`);
        return [];
    }
}


// Obtener 3 países incorrectos aleatorios
async function getIncorrectCountries(correctCountry) {
    const sparqlQuery = `
        SELECT DISTINCT ?countryLabel
        WHERE {
            ?country wdt:P31 wd:Q6256.  # Q6256 = país
            SERVICE wikibase:label { bd:serviceParam wikibase:language "es". }
        }
        LIMIT 100
    `;

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

        const data = response.data.results.bindings.map(item => item.countryLabel.value);
        const incorrectOptions = data.filter(country => country !== correctCountry);
        
        // Seleccionamos aleatoriamente 3 opciones incorrectas
        return incorrectOptions.sort(() => 0.5 - Math.random()).slice(0, 3);
    } catch (error) {
        console.error(`Error retrieving countries: ${error.message}`);
        return [];
    }
}

async function processQuestionsCountry(images,category) {
    for (const image of images) {
        const incorrectAnswers = await getIncorrectCountries(image.country);
        if (incorrectAnswers.length < 3) continue; // Si no hay suficientes respuestas incorrectas, saltamos

        // Crear opciones y mezclarlas
        const options = [image.country, ...incorrectAnswers].sort(() => 0.5 - Math.random());

        // Generar pregunta
        const questionText = titlesQuestionsCategories[category]; 
        
        const newQuestion = {
            question: questionText,
            options: options,
            correctAnswer: image.country,
            category: category,
            imageUrl: image.imageUrl
        };
        console.log(newQuestion);
        await dataService.saveQuestion(newQuestion);
    }

}
// Generate questions
async function generateQuestionsByCategory(category, numImages) {
    const images = await getImagesFromWikidata(category, numImages);
 
    if(category === 'country'){
       await processQuestionsCountry(images, category);
    }
}

module.exports = {
    generateQuestionsByCategory
};
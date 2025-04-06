const axios = require('axios');
const dataService = require('./questionSaverService');

// Set para rastrear categorías en proceso de generación
const generating = new Set();

// Consultas SPARQL para cada categoría
const wikidataCategoriesQueries = {   
    "country": {  
        query: `
        SELECT ?city ?cityLabel ?country ?countryLabel ?image
        WHERE {
            ?city wdt:P31 wd:Q515.  # Ciudad
            ?city wdt:P17 ?country.  # País de la ciudad
            ?city wdt:P18 ?image.    # Imagen de la ciudad
            ?country wdt:P31 wd:Q6256. # Es un país
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
            ?sport wdt:P18 ?image.    # Imagen del deporte
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
        SELECT ?instrument ?instrumentLabel ?image
        WHERE {
            ?instrument wdt:P31/wdt:P279* wd:Q33070.  # Instrumento científico
            ?instrument wdt:P18 ?image.  # Imagen
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
        SELECT ?event ?eventLabel ?image
        WHERE {
            ?event wdt:P31/wdt:P279* wd:Q178561.  # Evento histórico
            ?event wdt:P18 ?image.  # Imagen del evento
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
            ?painting wdt:P31 wd:Q3305213.  # Pintura
            ?painting wdt:P18 ?image.  # Imagen de la pintura
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
            ?animal wdt:P31/wdt:P279* wd:Q729.  # Animal
            ?animal wdt:P18 ?image.  # Imagen del animal
            SERVICE wikibase:label {
                bd:serviceParam wikibase:language "[AUTO_LANGUAGE],es".
            }
        }
        ORDER BY RAND()
        LIMIT ?limit
        `,
    },
};

// Textos de las preguntas para cada categoría
const titlesQuestionsCategories = {
    "country": "¿A qué país pertenece esta imagen?",
    "sports": "¿Qué deporte se muestra en la imagen?",
    "science": "¿Qué instrumento científico se muestra en la imagen?",
    "history": "¿Qué evento histórico representa esta imagen?",
    "art": "¿Qué obra de arte se muestra en la imagen?",
    "animals": "¿Qué animal se muestra en la imagen?"
};

const urlApiWikidata = 'https://query.wikidata.org/sparql';

// Obtener imágenes de Wikidata para country (categoría principal)
async function getImagesForCountry(numImages) {
    try {
        const sparqlQuery = wikidataCategoriesQueries.country.query.replace('?limit', numImages * 2);
        
        console.log("Consultando Wikidata para obtener ciudades y países...");
        
        const response = await axios.get(urlApiWikidata, {
            params: {
                query: sparqlQuery,
                format: 'json'
            },
            headers: {
                'User-Agent': 'QuestionGeneration/1.0',
                'Accept': 'application/json'
            },
            timeout: 15000
        });

        const data = response.data.results.bindings;
        console.log(`Se obtuvieron ${data.length} resultados`);
        
        if (data.length === 0) {
            console.error("No se obtuvieron datos");
            return [];
        }

        const filteredImages = data
            .filter(item => 
                item.cityLabel && 
                item.cityLabel.value && 
                item.countryLabel && 
                item.countryLabel.value && 
                item.image && 
                item.image.value
            )
            .slice(0, numImages)
            .map(item => ({
                city: item.cityLabel.value,
                country: item.countryLabel.value,
                imageUrl: item.image.value
            }));
        
        console.log(`Filtrados ${filteredImages.length} elementos con datos completos`);
        return filteredImages;
    } catch (error) {
        console.error(`Error en getImagesForCountry: ${error.message}`);
        return [];
    }
}

// Obtener imágenes para otras categorías
async function getImagesForCategory(category, numImages) {
    try {
        if (!wikidataCategoriesQueries[category]) {
            console.error(`Categoría no soportada: ${category}`);
            return [];
        }
        
        const sparqlQuery = wikidataCategoriesQueries[category].query.replace('?limit', numImages * 2);
        
        console.log(`Consultando Wikidata para categoría: ${category}`);
        
        const response = await axios.get(urlApiWikidata, {
            params: {
                query: sparqlQuery,
                format: 'json'
            },
            headers: {
                'User-Agent': 'QuestionGeneration/1.0',
                'Accept': 'application/json'
            },
            timeout: 15000
        });

        const data = response.data.results.bindings;
        console.log(`Se obtuvieron ${data.length} resultados para ${category}`);
        
        if (data.length === 0) {
            console.error(`No se obtuvieron datos para ${category}`);
            return [];
        }

        // Determinar qué clave usar para cada categoría
        let labelKey;
        switch(category) {
            case "sports": labelKey = "sportLabel"; break;
            case "science": labelKey = "instrumentLabel"; break;
            case "history": labelKey = "eventLabel"; break;
            case "art": labelKey = "paintingLabel"; break;
            case "animals": labelKey = "animalLabel"; break;
            default: labelKey = "label";
        }

        const filteredImages = data
            .filter(item => {
                // Verificar que tenemos la etiqueta y la imagen
                return item[labelKey] && 
                       item[labelKey].value && 
                       item.image && 
                       item.image.value &&
                       !item[labelKey].value.startsWith("Q") && // Filtrar etiquetas que empiezan con Q
                       !item[labelKey].value.includes("Q");     // Filtrar etiquetas que contienen Q
            })
            .slice(0, numImages)
            .map(item => ({
                label: item[labelKey].value,
                imageUrl: item.image.value
            }));
        
        console.log(`Filtrados ${filteredImages.length} elementos con datos completos para ${category}`);
        return filteredImages;
    } catch (error) {
        console.error(`Error en getImagesForCategory para ${category}: ${error.message}`);
        return [];
    }
}

// Obtener países incorrectos para country
async function getIncorrectCountries(correctCountry) {
    const sparqlQuery = `
        SELECT DISTINCT ?countryLabel
        WHERE {
            ?country wdt:P31 wd:Q6256.  # País
            SERVICE wikibase:label { bd:serviceParam wikibase:language "es". }
            FILTER(LANG(?countryLabel) = "es")
            FILTER (!REGEX(?countryLabel, "^Q[0-9]"))
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
            },
            timeout: 10000
        });

        const countries = response.data.results.bindings
            .map(item => item.countryLabel.value)
            .filter(country => 
                country !== correctCountry && 
                !country.startsWith("Q") && 
                !country.includes("Q")
            );
        
        // Seleccionamos aleatoriamente 3 opciones incorrectas
        return countries.sort(() => 0.5 - Math.random()).slice(0, 3);
    } catch (error) {
        console.error(`Error obteniendo países incorrectos: ${error.message}`);
        return getFallbackOptions("country", correctCountry);
    }
}

// Obtener opciones incorrectas para otras categorías
async function getIncorrectOptions(category, correctOption) {
    let entityType;
    
    switch(category) {
        case "sports": entityType = "wd:Q349"; break;        // Deporte
        case "science": entityType = "wd:Q33070"; break;      // Instrumento científico
        case "history": entityType = "wd:Q178561"; break;     // Evento histórico
        case "art": entityType = "wd:Q3305213"; break;        // Pintura
        case "animals": entityType = "wd:Q729"; break;        // Animal
        default: return [];
    }
    
    const sparqlQuery = `
        SELECT DISTINCT ?itemLabel
        WHERE {
            ?item wdt:P31/wdt:P279* ${entityType}.
            SERVICE wikibase:label { bd:serviceParam wikibase:language "es". }
            FILTER(LANG(?itemLabel) = "es")
            FILTER (!REGEX(?itemLabel, "^Q[0-9]"))
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
            },
            timeout: 10000
        });

        const options = response.data.results.bindings
            .map(item => item.itemLabel.value)
            .filter(option => 
                option !== correctOption && 
                !option.startsWith("Q") && 
                !option.includes("Q") &&
                option.length > 2
            );
        
        if (options.length < 3) {
            console.log(`Opciones insuficientes para ${category}, usando respaldo`);
            return getFallbackOptions(category, correctOption);
        }
        
        // Seleccionamos aleatoriamente 3 opciones incorrectas
        return options.sort(() => 0.5 - Math.random()).slice(0, 3);
    } catch (error) {
        console.error(`Error obteniendo opciones incorrectas para ${category}: ${error.message}`);
        return getFallbackOptions(category, correctOption);
    }
}

// Opciones de respaldo predefinidas
function getFallbackOptions(category, correctOption) {
    const fallbackOptions = {
        "country": ["España", "Francia", "Italia", "Alemania", "Portugal", "Reino Unido", "Estados Unidos", "Brasil", "China", "Japón", "Australia", "India", "México", "Canadá", "Argentina"],
        "sports": ["Fútbol", "Baloncesto", "Tenis", "Golf", "Natación", "Atletismo", "Ciclismo", "Voleibol", "Rugby", "Boxeo", "Gimnasia", "Esquí", "Hockey", "Béisbol", "Ajedrez"],
        "science": ["Microscopio", "Telescopio", "Balanza", "Termómetro", "Barómetro", "Voltímetro", "Amperímetro", "Espectroscopio", "Centrífuga", "Pipeta", "Probeta", "Matraz", "Tubo de ensayo", "Calorímetro"],
        "history": ["Primera Guerra Mundial", "Segunda Guerra Mundial", "Revolución Francesa", "Revolución Industrial", "Descubrimiento de América", "Caída del Muro de Berlín", "Guerra Civil Española", "Imperio Romano", "Revolución Rusa", "Independencia de Estados Unidos"],
        "art": ["La Gioconda", "La noche estrellada", "El grito", "Las meninas", "Guernica", "La última cena", "El nacimiento de Venus", "La creación de Adán", "La joven de la perla", "El jardín de las delicias"],
        "animals": ["León", "Tigre", "Elefante", "Jirafa", "Leopardo", "Gorila", "Delfín", "Ballena", "Águila", "Cocodrilo", "Pingüino", "Oso polar", "Koala", "Canguro", "Panda"]
    };
    
    const options = fallbackOptions[category] || fallbackOptions.country;
    return options
        .filter(option => option !== correctOption)
        .sort(() => 0.5 - Math.random())
        .slice(0, 3);
}

// Procesar preguntas para la categoría country
async function processQuestionsCountry(images, category) {
    let successCount = 0;
    let failedCount = 0;
    
    for (const image of images) {
        try {
            if (!image.country || !image.imageUrl) {
                console.log("Imagen con datos incompletos, saltando...");
                failedCount++;
                continue;
            }
            
            // Obtener opciones incorrectas
            const incorrectAnswers = await getIncorrectCountries(image.country);
            
            if (incorrectAnswers.length < 3) {
                console.log(`Opciones incorrectas insuficientes para ${image.city || "ciudad desconocida"}`);
                failedCount++;
                continue;
            }

            // Crear opciones y mezclarlas aleatoriamente
            const options = [image.country, ...incorrectAnswers].sort(() => 0.5 - Math.random());
            
            // Obtener texto de la pregunta
            const questionText = titlesQuestionsCategories[category];
            
            // Crear objeto de pregunta
            const newQuestion = {
                question: questionText,
                options: options,
                correctAnswer: image.country,
                category: category,
                imageUrl: image.imageUrl
            };
            
            // Guardar en la base de datos
            await dataService.saveQuestion(newQuestion);
            successCount++;
            
            console.log(`Pregunta #${successCount} creada: ${image.city} (${image.country})`);
        } catch (error) {
            console.error(`Error procesando imagen: ${error.message}`);
            failedCount++;
        }
    }
    
    console.log(`Categoría ${category}: ${successCount} preguntas creadas, ${failedCount} fallidas`);
    return successCount;
}

// Procesar preguntas para otras categorías
async function processQuestions(images, category) {
    let successCount = 0;
    let failedCount = 0;
    
    for (const image of images) {
        try {
            if (!image.label || !image.imageUrl) {
                console.log("Imagen con datos incompletos, saltando...");
                failedCount++;
                continue;
            }
            
            // Obtener opciones incorrectas
            const incorrectAnswers = await getIncorrectOptions(category, image.label);
            
            if (incorrectAnswers.length < 3) {
                console.log(`Opciones incorrectas insuficientes para ${image.label}`);
                failedCount++;
                continue;
            }

            // Crear opciones y mezclarlas aleatoriamente
            const options = [image.label, ...incorrectAnswers].sort(() => 0.5 - Math.random());
            
            // Obtener texto de la pregunta
            const questionText = titlesQuestionsCategories[category];
            
            // Crear objeto de pregunta
            const newQuestion = {
                question: questionText,
                options: options,
                correctAnswer: image.label,
                category: category,
                imageUrl: image.imageUrl
            };
            
            // Guardar en la base de datos
            await dataService.saveQuestion(newQuestion);
            successCount++;
            
            console.log(`Pregunta #${successCount} creada: ${image.label}`);
        } catch (error) {
            console.error(`Error procesando imagen: ${error.message}`);
            failedCount++;
        }
    }
    
    console.log(`Categoría ${category}: ${successCount} preguntas creadas, ${failedCount} fallidas`);
    return successCount;
}

// Función principal para generar preguntas
async function generateQuestionsByCategory(category, numQuestions) {
    if (generating.has(category)) {
        console.log(`Ya se está generando para categoría: ${category}`);
        return 0;
    }
    
    try {
        generating.add(category);
        console.log(`Iniciando generación para categoría: ${category}`);
        
        let images = [];
        let questionsCreated = 0;
        
        // Obtener imágenes según la categoría
        if (category === 'country') {
            images = await getImagesForCountry(numQuestions);
            if (images.length > 0) {
                questionsCreated = await processQuestionsCountry(images, category);
            }
        } else {
            images = await getImagesForCategory(category, numQuestions);
            if (images.length > 0) {
                questionsCreated = await processQuestions(images, category);
            }
        }
        
        if (images.length === 0) {
            console.error(`No se pudieron obtener imágenes para categoría: ${category}`);
            return 0;
        }
        
        return questionsCreated;
    } catch (error) {
        console.error(`Error generando preguntas para ${category}: ${error.message}`);
        return 0;
    } finally {
        generating.delete(category);
        console.log(`Generación para ${category} completada`);
    }
}

// Función para verificar si una categoría está en proceso de generación
function isGenerating(category) {
    return generating.has(category);
}

module.exports = {
    generateQuestionsByCategory,
    isGenerating
};
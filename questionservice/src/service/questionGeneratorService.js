const axios = require('axios');
const dataService = require('./questionSaverService');

const generating = new Set(); 

const labelKeys = {
    country: "countryLabel",
    sports: "sportLabel",
    science: "instrumentLabel", // Cambiado para instrumentos científicos
    history: "eventLabel", // Cambiado para eventos históricos
    art: "paintingLabel", // Cambiado para pinturas
    animals: "animalLabel",
};

const wikidataCategoriesQueries = {   
    "country": {  
        query: `
        SELECT ?country ?countryLabel ?image
        WHERE {
            ?country wdt:P31 wd:Q6256.  # País
            ?country wdt:P41 ?image.     # Bandera del país
            SERVICE wikibase:label { bd:serviceParam wikibase:language "es". }
            FILTER(LANG(?countryLabel) = "es")
            FILTER (!REGEX(?countryLabel, "^Q[0-9]"))
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
            SERVICE wikibase:label { bd:serviceParam wikibase:language "es". }
            FILTER(LANG(?sportLabel) = "es")
            FILTER (!REGEX(?sportLabel, "^Q[0-9]"))
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
            SERVICE wikibase:label { bd:serviceParam wikibase:language "es". }
            FILTER(LANG(?instrumentLabel) = "es")
            FILTER (!REGEX(?instrumentLabel, "^Q[0-9]"))
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
            SERVICE wikibase:label { bd:serviceParam wikibase:language "es". }
            FILTER(LANG(?eventLabel) = "es")
            FILTER (!REGEX(?eventLabel, "^Q[0-9]"))
            FILTER(STRLEN(?eventLabel) > 5)
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
            SERVICE wikibase:label { bd:serviceParam wikibase:language "es". }
            FILTER(LANG(?paintingLabel) = "es")
            FILTER (!REGEX(?paintingLabel, "^Q[0-9]"))
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
            SERVICE wikibase:label { bd:serviceParam wikibase:language "es". }
            FILTER(LANG(?animalLabel) = "es")
            FILTER (!REGEX(?animalLabel, "^Q[0-9]"))
        }
        ORDER BY RAND()
        LIMIT ?limit
        `,
    },
};

// Consultas fallback para cuando las principales no obtienen suficientes resultados
const fallbackQueries = {
    "science": `
        SELECT ?discovery ?discoveryLabel ?image
        WHERE {
            ?discovery wdt:P31/wdt:P279* wd:Q336.  # Descubrimiento científico
            ?discovery wdt:P18 ?image.  # Imagen
            SERVICE wikibase:label { bd:serviceParam wikibase:language "es". }
            FILTER(LANG(?discoveryLabel) = "es")
            FILTER (!REGEX(?discoveryLabel, "^Q[0-9]"))
        }
        ORDER BY RAND()
        LIMIT 20
    `,
    "history": `
        SELECT ?event ?eventLabel ?image
        WHERE {
            ?event wdt:P31/wdt:P279* wd:Q13418847.  # Batalla
            ?event wdt:P18 ?image.  # Imagen
            SERVICE wikibase:label { bd:serviceParam wikibase:language "es". }
            FILTER(LANG(?eventLabel) = "es")
            FILTER (!REGEX(?eventLabel, "^Q[0-9]"))
        }
        ORDER BY RAND()
        LIMIT 20
    `,
    "art": `
        SELECT ?artwork ?artworkLabel ?image
        WHERE {
            ?artwork wdt:P31/wdt:P279* wd:Q838948.  # Obra de arte
            ?artwork wdt:P18 ?image.  # Imagen
            SERVICE wikibase:label { bd:serviceParam wikibase:language "es". }
            FILTER(LANG(?artworkLabel) = "es")
            FILTER (!REGEX(?artworkLabel, "^Q[0-9]"))
        }
        ORDER BY RAND()
        LIMIT 20
    `
};

const titlesQuestionsCategories = {
    "country": "¿A qué país pertenece esta imagen?",
    "sports": "¿Qué deporte se muestra en la imagen?",
    "science": "¿Qué instrumento científico se muestra en la imagen?",
    "history": "¿Qué evento histórico representa esta imagen?",
    "art": "¿Qué obra de arte se muestra en la imagen?",
    "animals": "¿Qué animal se muestra en la imagen?"
};

const urlApiWikidata = 'https://query.wikidata.org/sparql';

// Función para verificar si una etiqueta es válida (sin códigos Q)
function isValidLabel(label) {
    if (!label) return false;
    if (label.match(/^Q\d+$/)) return false;
    if (label.includes("Q")) return false;
    if (label.length < 3 || label.length > 100) return false;
    return true;
}

// Obtener imágenes de Wikidata para crear preguntas
async function getImagesFromWikidata(category, numImages) {
    const categoryQueries = wikidataCategoriesQueries[category];
    if (!categoryQueries) {
        console.error(`Categoría no válida: ${category}`);
        return [];
    }
    
    const sparqlQuery = categoryQueries.query.replace('?limit', numImages * 3);

    try {
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

        const labelKey = labelKeys[category];
        if (!labelKey) {
            console.error(`No se encontró labelKey para ${category}`);
            return [];
        }

        const data = response.data.results.bindings;
        console.log(`Recibidos ${data.length} resultados para ${category}`);
        
        if (data.length === 0 || data.length < 5) {
            console.log(`Pocos resultados para ${category}, intentando consulta alternativa`);
            return await tryFallbackQuery(category, numImages);
        }

        // Filtrar para asegurarnos de que tenemos imágenes válidas y etiquetas sin códigos Q
        const filteredImages = data
            .filter(item => {
                return item.image && 
                       item.image.value && 
                       item[labelKey] && 
                       item[labelKey].value &&
                       isValidLabel(item[labelKey].value);
            })
            .slice(0, numImages)
            .map(item => ({
                imageUrl: item.image.value,
                label: item[labelKey].value
            }));
        
        console.log(`Filtradas ${filteredImages.length} imágenes válidas para ${category}`);
        
        if (filteredImages.length < 5) {
            console.log(`Insuficientes imágenes válidas para ${category}, probando alternativa`);
            return await tryFallbackQuery(category, numImages);
        }
        
        return filteredImages;
    } catch (error) {
        console.error(`Error obteniendo imágenes para ${category}: ${error.message}`);
        return await tryFallbackQuery(category, numImages);
    }
}

// Intentar consulta fallback si la consulta principal falla
async function tryFallbackQuery(category, numImages) {
    if (!fallbackQueries[category]) {
        console.log(`No hay consulta fallback para ${category}`);
        return [];
    }
    
    try {
        console.log(`Ejecutando consulta fallback para ${category}`);
        const response = await axios.get(urlApiWikidata, {
            params: {
                query: fallbackQueries[category],
                format: 'json'
            },
            headers: {
                'User-Agent': 'QuestionGeneration/1.0',
                'Accept': 'application/json'
            },
            timeout: 15000
        });
        
        // Determinar la clave correcta basada en la consulta fallback
        let fallbackLabelKey;
        if (category === "science") fallbackLabelKey = "discoveryLabel";
        else if (category === "history") fallbackLabelKey = "eventLabel";
        else if (category === "art") fallbackLabelKey = "artworkLabel";
        else fallbackLabelKey = labelKeys[category];
        
        const data = response.data.results.bindings;
        console.log(`Consulta fallback: ${data.length} resultados para ${category}`);
        
        if (data.length === 0) {
            return [];
        }
        
        const filteredImages = data
            .filter(item => {
                return item.image && 
                       item.image.value && 
                       item[fallbackLabelKey] && 
                       item[fallbackLabelKey].value &&
                       isValidLabel(item[fallbackLabelKey].value);
            })
            .slice(0, numImages)
            .map(item => ({
                imageUrl: item.image.value,
                label: item[fallbackLabelKey].value
            }));
            
        console.log(`Fallback: ${filteredImages.length} imágenes válidas para ${category}`);
        return filteredImages;
    } catch (error) {
        console.error(`Error en consulta fallback para ${category}: ${error.message}`);
        return [];
    }
}

// Obtener opciones incorrectas para una pregunta
async function getIncorrectOptions(correctOption, category) {
    if (!isValidLabel(correctOption)) {
        console.error(`Opción correcta inválida: ${correctOption}`);
        return [];
    }

    // Adaptar consultas según la categoría
    let query;
    
    switch(category) {
        case "country":
            query = `
                SELECT DISTINCT ?label
                WHERE {
                    ?country wdt:P31 wd:Q6256.  # País
                    ?country rdfs:label ?label.
                    FILTER(LANG(?label) = "es")
                    FILTER (!REGEX(?label, "^Q[0-9]"))
                    FILTER(STRLEN(?label) > 2)
                }
                LIMIT 100
            `;
            break;
        case "sports":
            query = `
                SELECT DISTINCT ?label
                WHERE {
                    ?sport wdt:P31 wd:Q349.  # Deporte
                    ?sport rdfs:label ?label.
                    FILTER(LANG(?label) = "es")
                    FILTER (!REGEX(?label, "^Q[0-9]"))
                    FILTER(STRLEN(?label) > 2)
                }
                LIMIT 100
            `;
            break;
        case "science":
            query = `
                SELECT DISTINCT ?label
                WHERE {
                    ?instrument wdt:P31/wdt:P279* wd:Q33070.  # Instrumento científico
                    ?instrument rdfs:label ?label.
                    FILTER(LANG(?label) = "es")
                    FILTER (!REGEX(?label, "^Q[0-9]"))
                    FILTER(STRLEN(?label) > 2)
                }
                LIMIT 100
            `;
            break;
        case "history":
            query = `
                SELECT DISTINCT ?label
                WHERE {
                    ?event wdt:P31/wdt:P279* wd:Q178561.  # Evento histórico
                    ?event rdfs:label ?label.
                    FILTER(LANG(?label) = "es")
                    FILTER (!REGEX(?label, "^Q[0-9]"))
                    FILTER(STRLEN(?label) > 5)
                }
                LIMIT 100
            `;
            break;
        case "art":
            query = `
                SELECT DISTINCT ?label
                WHERE {
                    ?painting wdt:P31 wd:Q3305213.  # Pintura
                    ?painting rdfs:label ?label.
                    FILTER(LANG(?label) = "es")
                    FILTER (!REGEX(?label, "^Q[0-9]"))
                    FILTER(STRLEN(?label) > 2)
                }
                LIMIT 100
            `;
            break;
        case "animals":
            query = `
                SELECT DISTINCT ?label
                WHERE {
                    ?animal wdt:P31/wdt:P279* wd:Q729.  # Animal
                    ?animal rdfs:label ?label.
                    FILTER(LANG(?label) = "es")
                    FILTER (!REGEX(?label, "^Q[0-9]"))
                    FILTER(STRLEN(?label) > 2)
                }
                LIMIT 100
            `;
            break;
        default:
            console.error(`Categoría no reconocida: ${category}`);
            return [];
    }

    try {
        const response = await axios.get(urlApiWikidata, {
            params: {
                query: query,
                format: 'json'
            },
            headers: {
                'User-Agent': 'QuestionGeneration/1.0',
                'Accept': 'application/json'
            },
            timeout: 10000
        });

        const options = response.data.results.bindings
            .map(item => item.label?.value)
            .filter(label => isValidLabel(label) && label !== correctOption);
        
        // Si no hay suficientes opciones, usar lista de respaldo
        if (options.length < 3) {
            console.log(`Opciones insuficientes para ${category}, usando respaldo`);
            return getBackupOptions(category, correctOption);
        }
        
        // Seleccionar 3 opciones aleatorias
        return options.sort(() => 0.5 - Math.random()).slice(0, 3);
    } catch (error) {
        console.error(`Error obteniendo opciones incorrectas: ${error.message}`);
        return getBackupOptions(category, correctOption);
    }
}

// Opciones de respaldo para cuando la consulta de Wikidata falla
function getBackupOptions(category, correctOption) {
    const backupOptions = {
        "country": ["España", "Francia", "Italia", "Alemania", "Portugal", "Reino Unido", "Estados Unidos", "Canadá", "Brasil", "Argentina", "México", "Japón", "China", "India", "Australia"],
        "sports": ["Fútbol", "Baloncesto", "Tenis", "Voleibol", "Natación", "Atletismo", "Ciclismo", "Golf", "Rugby", "Boxeo", "Béisbol", "Hockey", "Gimnasia", "Esquí", "Patinaje"],
        "science": ["Microscopio", "Telescopio", "Balanza", "Termómetro", "Barómetro", "Voltímetro", "Amperímetro", "Espectroscopio", "Centrífuga", "Pipeta", "Probeta", "Matraz", "Tubo de ensayo", "Calorímetro"],
        "history": ["Primera Guerra Mundial", "Segunda Guerra Mundial", "Revolución Francesa", "Revolución Industrial", "Descubrimiento de América", "Caída del Muro de Berlín", "Revolución Rusa", "Guerra Civil Española", "Imperio Romano", "Edad Media"],
        "art": ["La Gioconda", "La noche estrellada", "El grito", "Las meninas", "La persistencia de la memoria", "Guernica", "La última cena", "El nacimiento de Venus", "La creación de Adán", "La joven de la perla"],
        "animals": ["León", "Tigre", "Elefante", "Jirafa", "Leopardo", "Gorila", "Delfín", "Ballena", "Águila", "Cocodrilo", "Pingüino", "Oso polar", "Koala", "Canguro", "Panda"]
    };
    
    const options = backupOptions[category] || backupOptions.country;
    return options
        .filter(option => option !== correctOption)
        .sort(() => 0.5 - Math.random())
        .slice(0, 3);
}

// Procesar las imágenes y crear preguntas
async function processQuestions(images, category) {
    if (!images || images.length === 0) {
        console.error(`No hay imágenes para procesar en categoría: ${category}`);
        return;
    }

    let successCount = 0;
    const failedItems = [];
    
    const tasks = images.map(async (image, index) => {
        try {
            if (!image || !image.label || !image.imageUrl) {
                failedItems.push(`Imagen #${index}: datos incompletos`);
                return;
            }
            
            // Obtener opciones incorrectas
            const incorrectAnswers = await getIncorrectOptions(image.label, category);
            if (incorrectAnswers.length < 3) {
                failedItems.push(`${image.label}: opciones insuficientes`);
                return;
            }

            // Crear pregunta
            const options = [image.label, ...incorrectAnswers].sort(() => 0.5 - Math.random());
            const questionText = titlesQuestionsCategories[category]; 

            const newQuestion = {
                question: questionText,
                options,
                correctAnswer: image.label,
                category,
                imageUrl: image.imageUrl
            };

            // Guardar en base de datos
            await dataService.saveQuestion(newQuestion);
            successCount++;
            console.log(`Pregunta ${successCount} creada: ${image.label}`);
        } catch (error) {
            console.error(`Error procesando pregunta: ${error.message}`);
            failedItems.push(`${image?.label || 'desconocida'}: ${error.message}`);
        }
    });

    await Promise.all(tasks);
    console.log(`Categoría ${category}: ${successCount} preguntas creadas, ${failedItems.length} fallidas`);
}

// Función principal para generar preguntas por categoría
async function generateQuestionsByCategory(category, quantity) {
    if (generating.has(category)) {
        console.log(`Ya se está generando para categoría: ${category}`);
        return;
    }

    try {
        generating.add(category);
        console.log(`Iniciando generación para categoría: ${category}, cantidad: ${quantity}`);
        
        // Obtener imágenes de Wikidata
        const images = await getImagesFromWikidata(category, quantity);
        
        if (images.length === 0) {
            console.error(`No se pudieron obtener imágenes para categoría: ${category}`);
            return;
        }
        
        // Procesar imágenes y crear preguntas
        await processQuestions(images, category);
        console.log(`Preguntas generadas para categoría: ${category}`);
    } catch (error) {
        console.error(`Error en generación para categoría ${category}: ${error.message}`);
    } finally {
        generating.delete(category);
    }
}

// Verificar si una categoría está en proceso de generación
function isGenerating(category) {
    return generating.has(category);
}

module.exports = {
    generateQuestionsByCategory,
    isGenerating
};
const express = require('express');
const dataService = require('./questionSaverService');
const generateService = require('./questionGeneratorService');
const app = express();
const port = 8004;

const MIN_QUESTIONS = 5; // Reducido para facilitar el inicio rápido
const GENERATE_BATCH = 15;

// Middleware to parse JSON in request body
app.use(express.json());

app.get('/questions/:category', async (req, res) => {
    try {
        console.log(`Question service - Solicitud para categoría: ${req.params.category}`);
        const category = req.params.category;
        
        // Validar que la categoría sea válida
        const validCategories = ["country", "history", "science", "sports", "animals", "art"];
        if (!validCategories.includes(category)) {
            console.error(`Categoría no válida solicitada: ${category}`);
            return res.status(400).json({ message: `Categoría no válida: ${category}` });
        }
        
        // Verificar si la generación está en progreso
        if (generateService.isGenerating && generateService.isGenerating(category)) {
            console.log(`Generación en progreso para ${category}, verificando si hay preguntas disponibles...`);
            
            // Intentar obtener una pregunta aunque esté generando
            const numberQuestions = await dataService.getNumberQuestionsByCategory(category);
            
            if (numberQuestions > 0) {
                console.log(`Se encontraron ${numberQuestions} preguntas disponibles para ${category} mientras se generan más`);
                const question = await dataService.getRandomQuestionByCategory(category);
                
                if (question) {
                    await dataService.deleteQuestionById(question._id);
                    return res.json(question);
                }
            }
            
            // Si no hay preguntas disponibles mientras se generan, informar al usuario
            return res.status(503).json({ 
                message: `Generando preguntas para ${category}, intente nuevamente en unos momentos` 
            });
        }
        
        // Verificar cuántas preguntas tenemos disponibles
        const numberQuestions = await dataService.getNumberQuestionsByCategory(category);
        console.log(`Número de preguntas para ${category}: ${numberQuestions}`);
        
        // Si hay preguntas disponibles, devolver una aleatoria
        if (numberQuestions > 0) {
            const question = await dataService.getRandomQuestionByCategory(category);
            
            if (question) {
                console.log(`Pregunta encontrada para ${category}, ID: ${question._id}`);
                await dataService.deleteQuestionById(question._id);
                return res.json(question);
            }
        }
        
        // Si no hay preguntas disponibles o son insuficientes, generar nuevas
        console.log(`Generando preguntas para categoría: ${category}`);
        
        try {
            // Iniciar y esperar la generación
            generating.add(category);
            console.log(`Generando ${GENERATE_BATCH} preguntas para ${category}...`);
            
            // Generar preguntas de forma asíncrona
            generateService.generateQuestionsByCategory(category, GENERATE_BATCH)
                .then(() => {
                    console.log(`Generación completada para ${category}`);
                    generating.delete(category);
                })
                .catch(error => {
                    console.error(`Error en generación para ${category}:`, error);
                    generating.delete(category);
                });
            
            // Informar al cliente que debe intentar nuevamente en unos momentos
            return res.status(503).json({
                message: `Generando preguntas para ${category}, por favor intente nuevamente en unos momentos`
            });
            
        } catch (genError) {
            console.error(`Error iniciando generación para ${category}:`, genError);
            return res.status(500).json({ 
                message: `Error generando preguntas para ${category}, por favor intente más tarde` 
            });
        }
    } catch (error) {
        console.error("Error en la petición:", error);
        res.status(500).json({ 
            error: error.message,
            stack: process.env.NODE_ENV === 'development' ? error.stack : undefined 
        });
    }
});

// Set to track categories being generated
const generating = new Set();

// Endpoint para obtener todas las preguntas (para depuración)
app.get('/getDBQuestions', async (req, res) => {
    try {
        const questions = await dataService.getAllQuestions();
        res.json(questions);
    } catch (error) {
        console.log("Error en la petición:", error);
        res.status(500).json({ error: error.message });
    }
});

// Endpoint para obtener preguntas por categoría (sin eliminarlas)
app.get('/viewQuestions/:category', async (req, res) => {
    try {
        const category = req.params.category;
        const questions = await dataService.getQuestionsByCategory(category);
        res.json({
            category,
            count: questions.length,
            questions
        });
    } catch (error) {
        console.log("Error en la petición:", error);
        res.status(500).json({ error: error.message });
    }
});

// Endpoint para forzar la generación de preguntas para una categoría
app.post('/generateQuestions/:category', async (req, res) => {
    try {
        const category = req.params.category;
        const quantity = req.body.quantity || GENERATE_BATCH;
        
        // Validar categoría
        const validCategories = ["country", "history", "science", "sports", "animals", "art"];
        if (!validCategories.includes(category)) {
            return res.status(400).json({ message: `Categoría no válida: ${category}` });
        }
        
        // Verificar si ya está generando
        if (generating.has(category)) {
            return res.status(202).json({
                message: `Ya se está generando para categoría: ${category}`
            });
        }
        
        // Iniciar generación asíncrona
        generating.add(category);
        
        generateService.generateQuestionsByCategory(category, quantity)
            .then(() => {
                console.log(`Generación completada para: ${category}`);
                generating.delete(category);
            })
            .catch(error => {
                console.error(`Error en generación para: ${category}`, error);
                generating.delete(category);
            });
        
        res.status(202).json({ 
            message: `Generación de preguntas iniciada para: ${category}`,
            quantity
        });
    } catch (error) {
        console.log("Error en la petición:", error);
        res.status(500).json({ error: error.message });
    }
});

// Endpoint para inicializar la base de datos con algunas preguntas iniciales
app.post('/initializeDB', async (req, res) => {
    try {
        const categories = ["country", "history", "science", "sports", "animals", "art"];
        const results = {};
        
        for (const category of categories) {
            if (!generating.has(category)) {
                generating.add(category);
                
                // Iniciar generación
                console.log(`Inicializando categoría: ${category}`);
                
                try {
                    await generateService.generateQuestionsByCategory(category, 10);
                    results[category] = "success";
                } catch (error) {
                    console.error(`Error inicializando ${category}:`, error);
                    results[category] = `error: ${error.message}`;
                } finally {
                    generating.delete(category);
                }
            } else {
                results[category] = "already generating";
            }
        }
        
        res.status(200).json({
            message: "Inicialización de base de datos completada",
            results
        });
    } catch (error) {
        console.error("Error inicializando DB:", error);
        res.status(500).json({ error: error.message });
    }
});

// Endpoint para verificar el estado del servicio
app.get('/health', (req, res) => {
    const generatingCategories = Array.from(generating);
    
    res.json({ 
        status: 'ok',
        service: 'question-service',
        generating: generatingCategories,
        timestamp: new Date().toISOString()
    });
});

const server = app.listen(port, () => {
    console.log(`Question Service listening at http://localhost:${port}`);
    
    // Inicializar BD al iniciar si está vacía
    setTimeout(async () => {
        try {
            const totalQuestions = await dataService.getTotalQuestions();
            console.log(`Total de preguntas en BD: ${totalQuestions}`);
            
            if (totalQuestions === 0) {
                console.log("Base de datos vacía, inicializando con preguntas...");
                const categories = ["country", "history", "science", "sports", "animals", "art"];
                
                for (const category of categories) {
                    if (!generating.has(category)) {
                        generating.add(category);
                        
                        generateService.generateQuestionsByCategory(category, 10)
                            .then(() => {
                                console.log(`Inicialización completada para: ${category}`);
                                generating.delete(category);
                            })
                            .catch(error => {
                                console.error(`Error inicializando: ${category}`, error);
                                generating.delete(category);
                            });
                    }
                }
            }
        } catch (error) {
            console.error("Error verificando/inicializando la BD:", error);
        }
    }, 5000); // Esperar 5 segundos para que MongoDB se conecte adecuadamente
});

module.exports = server;
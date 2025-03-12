import { Schema, model } from 'mongoose';

// Verbosing due to TS and Mongoose!!
// Check https://dev.to/lioness100/youre-integrating-typescript-and-mongoose-wrong-1cdo
// Perhaps adding that to NPM

interface QuestionType {
    name: string;
    query: string;
    entities: string[];
    typeName: string;
}

const questionTypeSchema = new Schema<QuestionType>({
    name: { type: String, required: true },
    query: { type: String, required: true },
    entities: { type: [String], required: false },
    typeName: { type: String, required: true },
});

interface Question {
    questionTemplate: string;
    question_type: QuestionType;
}

// _id ALREADY ADDED BY MONGOOSE!!
const templateSchema = new Schema<Question>({
    questionTemplate: { type: String, required: true },
    question_type: questionTypeSchema,
});

const TemplateModel = model<Question>('Template', templateSchema);

const addQuestionTemplate = (questionTemplate: any) => {
    let aQuestion = new TemplateModel(questionTemplate);

    aQuestion.save();
}

const generateSampleTest = () => {

    // Capital of a place
    addQuestionTemplate({
        questionTemplate: '¿Cuál es la capital de $$$ ?', // $$$ is a placeholder, we will substitute it with the country name
        questionType: {
            name: 'Capitals',
            query: `SELECT ?templateLabel ?answerLabel
              WHERE {
                ?template wdt:P31 wd:$$$; # Entity
                        wdt:P36 ?answer.  # Capital
                SERVICE wikibase:label { bd:serviceParam wikibase:language "es"}
              }
              ORDER BY UUID() # Add randomness to the results
              LIMIT 10`,
            entities: [
                'Q6256', // Country (any)
                'Q10742', // Autonomous Community of Spain
            ],
            typeName: 'geography',
        },
    });
};

export { TemplateModel, generateSampleTest };
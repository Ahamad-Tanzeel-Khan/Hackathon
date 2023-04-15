const express = require('express');
const app = express();

app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

const questions = [
    {
        question: "What is the capital of India?",
        options: ["New Delhi", "Mumbai", "Kolkata", "Chennai"],
        answer: "New Delhi"
    },
    {
        question: "What is the currency of Japan?",
        options: ["Dollar", "Yen", "Euro", "Pound"],
        answer: "Yen"
    },
    {
        question: "Who is the CEO of Amazon?",
        options: ["Bill Gates", "Mark Zuckerberg", "Jeff Bezos", "Sundar Pichai"],
        answer: "Jeff Bezos"
    }
];

app.get('/', (req, res) => {
    res.render('index', { questions: questions });
});

app.post('/submit', (req, res) => {
    let score = 0;
    for (let i = 0; i < questions.length; i++) {
        let userAnswer = req.body[`q${i+1}`];
        if (userAnswer === questions[i].answer) {
            score++;
        }
    }
    res.render('score', { score: score, total: questions.length });
});

app.listen(3000, () => {
    console.log('Server started on port 3000');
});

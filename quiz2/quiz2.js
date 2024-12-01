
const questions = [
    {
        question: "Which keyword is used to declare a constant in Java?",
        answers: [
            {text: "static", correct: false},
            {text: "final", correct: true},
            {text: "const", correct: false},
            {text: "constant", correct: false}
        ]
    },
    {
        question: "What is the correct way to declare a constant variable in Java?",
        answers: [
            {text: "final int MAX_VALUE = 100;", correct: true},
            {text: "const int MAX_VALUE = 100;", correct: false},
            {text: "static int MAX_VALUE = 100;", correct: false},
            {text: "constant int MAX_VALUE = 100;", correct: false}
        ] 
    },
    {
        question: "Which of the following statements about constants in Java is true?",
        answers: [
            {text: "Constants can be changed after they are initialized.", correct: false},
            {text: "Constants must be initialized at the time of declaration.", correct: true},
            {text: "Constants do not need to be initialized.", correct: false},
            {text: "Constants can be declared using the const keyword.", correct: false}
        ] 
    },
    {
        question:" What will happen if you try to change the value of a constant in Java?",
        answers: [
            {text: "The value will change without any issues.", correct: false},
            {text: "The program will compile but throw a runtime exception.", correct: false},
            {text: "The program will not compile and will show an error.", correct: true},
            {text: "The value will change only if the constant is declared as static.", correct: false}
        ] 
    }
];

const questionElement = document.getElementById("question");
const answerButtons = document.getElementById("answer-buttons");
const nextButton = document.getElementById("next-btn");

let currentQuestionIndex = 0;
let score = 0;

function startQuiz(){
    currentQuestionIndex = 0;
    score = 0;
    nextButton.innerHTML = "Next";
    showQuestion();
}

function showQuestion(){
    resetState();
    let currentQuestion = questions[currentQuestionIndex];
    let questionNo = currentQuestionIndex + 1;
    questionElement.innerHTML = questionNo + ". " + currentQuestion.question;

    currentQuestion.answers.forEach(answer => {
        const button = document.createElement("button");
        button.innerHTML = answer.text;
        button.classList.add("btn");
        answerButtons.appendChild(button);
        if(answer.correct){
            button.dataset.correct = answer.correct;
        }
        button.addEventListener("click", selectAnswer)
    });
}

function resetState(){
    nextButton.style.display = "none";
    while(answerButtons.firstChild){
        answerButtons.removeChild(answerButtons.firstChild);
    }
}

function selectAnswer(e){
    const selectedBtn = e.target;
    const isCorrect = selectedBtn.dataset.correct === "true";
    if(isCorrect){
        selectedBtn.classList.add("correct");
        score++;
    }else{
        selectedBtn.classList.add("incorrect");
    }
    Array.from(answerButtons.children).forEach(button =>{
        if(button.dataset.correct === "true"){
            button.classList.add("correct");
        }
        button.disabled = true; 
    });
    nextButton.style.display = "block";
}

function showScore(){
    resetState();
    questionElement.innerHTML = `You scored ${score} out of ${questions.length}!`;
    nextButton.innerHTML = "Play Again";
    nextButton.style.display = "block";

    const doneButton = document.createElement("button");
    doneButton.innerHTML = "Done";
    doneButton.id = "done-btn";
    doneButton.classList.add("btn");
    doneButton.addEventListener("click", () => {
        localStorage.setItem('quiz2-score', score); // Corrected key
        window.location.href = 'quiz.html'; // Redirect to quiz.html
    });
    answerButtons.appendChild(doneButton);
}

function handleNextButton(){
    currentQuestionIndex++;
    if(currentQuestionIndex < questions.length){
        showQuestion();
    }else{
        showScore();
    }
}

nextButton.addEventListener("click", () => {
    if(currentQuestionIndex < questions.length){
        handleNextButton();
    }else{
        startQuiz(); // Restart the quiz
    }
});

startQuiz();
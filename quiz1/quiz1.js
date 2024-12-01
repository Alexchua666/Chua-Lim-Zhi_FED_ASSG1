const questions = [
    {
        question: "which of the following is a correct naming convention in programming?",
        answers: [
            {text: "_variable", correct: false},
            {text: "$name$", correct: false},
            {text: "variableName", correct: true},
            {text: "shark_ _", correct: false},
        ]
    },
    {
        question: "Class names must use the UpperCamelCase style to provide clarity, which is correct?",
        answers: [
            {text: "UserDO(Data Object)", correct: true},
            {text: "Userdo", correct: false},
            {text: "HtmlDto", correct: false},
            {text: "XMLservice", correct: false},
        ] 
    },
    {
        question: "Which of the following is correct practice when defining methods in an interface?",
        answers: [
            {text: "Public final static String COMPANY = 'alibba'", correct: false},
            {text: "String COMPANY = 'alibaba'", correct: true},
            {text: "Company = 'alibaba'", correct: false},
            {text: "Private String Company = 'alibaba'", correct: false},
        ] 
    },
    {
        question: "Which practice should be avoided to reduce complexity in code?",
        answers: [
            {text: "Using the same name for member variables in parent and child classes", correct: true},
            {text: "Using distinct names for local variables", correct: false},
            {text: "Defining getter/setter methods with unique parameter names.", correct: false},
            {text: "Using internationalized naming conventions", correct: false},
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
        localStorage.setItem('quiz1-score', score);
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

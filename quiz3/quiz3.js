
const questions = [
    {
        question: "Which of the following is not a principle of Object-Oriented Programming?",
        answers: [
            {text: "Encapsulation", correct: false},
            {text: "Abstraction", correct: false},
            {text: "Inheritance", correct: false},
            {text: "Compilation", correct: true}
        ]
    },
    {
        question: "What is the purpose of the super keyword in Java?",
        answers: [
            {text: "To create a new instance of a class", correct: false},
            {text: "To refer to the current object", correct: false},
            {text: "To refer to the parent class", correct: true},
            {text: "To define a constant", correct: false}
        ] 
    },
    {
        question: "Which of the following statements about polymorphism in Java is true?",
        answers: [
            {text: "Polymorphism allows methods to have the same name but different parameters.", correct: true},
            {text: "Polymorphism is the ability of a class to inherit from multiple classes.", correct: false},
            {text: "Polymorphism is the process of hiding the implementation details.", correct: false},
            {text: "Polymorphism is the ability to create objects without using the `new` keyword.", correct: false}
        ]
    },
    {
        question:" Which of the following is true about interfaces in Java?",
        answers: [
            {text: "Interfaces can have instance variables.", correct: false},
            {text: "Interfaces can have method implementations.", correct: true},
            {text: "Interfaces cannot be implemented by classes.", correct: false},
            {text: "Interfaces can extend multiple classes.", correct: false}
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
        localStorage.setItem('quiz3-score', score); // Corrected key
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
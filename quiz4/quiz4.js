
const questions = [
    {
        question: "Which of the following classes implements the List interface?",
        answers: [
            {text: "HashSet", correct: false},
            {text: "TreeMap", correct: false},
            {text: "ArrayList", correct: true},
            {text: "LinkedHashMap", correct: false}
        ]
    },
    {
        question: "Which of the following is true about the HashSet class in Java?",
        answers: [
            {text: "HashSet allows duplicate elements.", correct: false},
            {text: "HashSet maintains the insertion order.", correct: false},
            {text: "HashSet is synchronized.", correct: false},
            {text: "HashSet does not allow duplicate elements.", correct: true}
        ]
    },
    {
        question: "Which of the following methods is used to add an element to a List in Java?",
        answers: [
            {text: "addElement()", correct: false},
            {text: "insert()", correct: false},
            {text: "add()", correct: true},
            {text: "put()", correct: false}
        ]
    },
    {
        question:"What is the main difference between a HashMap and a TreeMap in Java?",
        answers: [
            {text: "HashMap maintains the insertion order, while TreeMap does not.", correct: false},
            {text: "TreeMap maintains a sorted order of keys, while HashMap does not.", correct: true},
            {text: "HashMap allows duplicate keys, while TreeMap does not.", correct: false},
            {text: "TreeMap is synchronized, while HashMap is not.", correct: false}
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
        localStorage.setItem('quiz4-score', score); // Corrected key
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
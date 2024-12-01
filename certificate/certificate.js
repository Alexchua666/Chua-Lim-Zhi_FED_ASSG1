const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

const image = new Image();
image.src = "images/WhatsApp Image 2024-11-30 at 19.11.44.jpeg";
image.onload = function() {
    checkUserStatus();
}

function checkUserStatus() {
    const user = JSON.parse(localStorage.getItem('user'));
    if (!user || !user.username) {
        alert("Please register your account.");
        window.location.href = 'login.html';
    } else if (!checkQuizCompletion()) {
        alert("You have to pass your quizzes in order to get this certificate.");
        window.location.href = 'quiz.html';
    } else {
        drawImage();
    }
}

function checkQuizCompletion() {
    const quizzes = ['quiz1', 'quiz2', 'quiz3', 'quiz4'];
    return quizzes.every(quiz => localStorage.getItem(`${quiz}-score`) == 4);
}

function drawImage() {
    ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
    drawUserName();
}

function drawUserName() {
    const user = JSON.parse(localStorage.getItem('user'));
    if (user && user.username) {
        const userName = user.username;

        // Set text properties
        ctx.font = '30px Poppins';
        ctx.fillStyle = 'black';
        ctx.textAlign = 'center';

        // Calculate position
        const x = canvas.width / 2;
        const y = canvas.height - 150; // Adjust this value to position the text

        // Draw text
        ctx.fillText(userName, x, y);
    }
}

const downloadBtn = document.getElementById('download-btn');
downloadBtn.addEventListener('click', function() {
    const link = document.createElement('a');
    link.download = 'canvas-image.png';
    link.href = canvas.toDataURL();
    link.click();
});
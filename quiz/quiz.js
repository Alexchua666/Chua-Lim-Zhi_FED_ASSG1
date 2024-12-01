document.addEventListener('DOMContentLoaded', function() {
    const quizStatuses = {
      quiz1: document.getElementById('quiz1-status'),
      quiz2: document.getElementById('quiz2-status'),
      quiz3: document.getElementById('quiz3-status'),
      quiz4: document.getElementById('quiz4-status')
    };
  
    const quizCards = {
      quiz1: document.querySelector('.quiz1-card'),
      quiz2: document.querySelector('.quiz2-card'),
      quiz3: document.querySelector('.quiz3-card'),
      quiz4: document.querySelector('.quiz4-card')
    };
  
    // Function to update quiz status
    function updateQuizStatus() {
      const quizzes = ['quiz1', 'quiz2', 'quiz3', 'quiz4'];
  
      quizzes.forEach(quiz => {
        const score = localStorage.getItem(`${quiz}-score`);
        if (score !== null) {
          quizStatuses[quiz].textContent = `${score}/4`;
          if (score == 4) {
            quizStatuses[quiz].textContent = 'Completed';
            quizCards[quiz].classList.add('completed');
          } else {
            quizStatuses[quiz].textContent = `${score}/4 - Failed`;
          }
        } else {
          quizStatuses[quiz].textContent = 'Not Attempted';
        }
      });
    }
  
    updateQuizStatus();
  });
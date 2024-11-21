const quizQuestions = [
    {
        question: "What is the capital of France?",
        options: ["Berlin", "Madrid", "Paris", "Lisbon"],
        answer: 2
    },
    {
        question: "What is 2 + 2?",
        options: ["3", "4", "5", "6"],
        answer: 1
    },
    {
        question: "Which programming language is used for web development?",
        options: ["Python", "JavaScript", "C++", "Java"],
        answer: 1
    },
    {
        question: "What is the capital of Japan?",
        options: ["Seoul", "Tokyo", "Beijing", "Bangkok"],
        answer: 1
    },
    {
        question: "Which planet is known as the Red Planet?",
        options: ["Earth", "Mars", "Jupiter", "Saturn"],
        answer: 1
    }
];

let currentQuestionIndex = 0;
let timer;
let timeLeft = 30; // Default time per question is 30 seconds
const userSelections = Array(quizQuestions.length).fill(null);
const answeredQuestions = Array(quizQuestions.length).fill(false); // Track answered questions

const nextButton = document.getElementById("next-btn");
const backButton = document.getElementById("back-btn");
const questionContainer = document.getElementById("question");
const optionsContainer = document.getElementById("options");
const timeLeftContainer = document.getElementById("time-left");
const scoreContainer = document.getElementById("score-container");
const scoreText = document.getElementById("score");
const notificationBox = document.getElementById("notification-box");

const progressBar = document.getElementById("progress");
const progress = document.getElementById("progress");

const webcamElement = document.getElementById("webcam");
const startWebcamButton = document.getElementById("start-webcam");

const startTestContainer = document.getElementById("start-test-container");
const startTestButton = document.getElementById("start-test-btn");

let webcamStream = null;
let webcamStarted = false; // To track if webcam is started

// Start the webcam and display it in the video element
async function startWebcam() {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        webcamElement.srcObject = stream;
        webcamStream = stream; // Keep a reference to the stream to stop it later
        webcamStarted = true;
        startWebcamButton.disabled = true; // Disable button after starting webcam

        // Show the "Start Test" button once the camera is enabled
        startTestContainer.classList.remove("hidden");
    } catch (err) {
        console.error("Error accessing webcam: ", err);
        alert('Camera access is required to start the quiz.');
    }
}

// Start the quiz once the user clicks "Start Test"
function startQuiz() {
    startTestContainer.classList.add("hidden");  // Hide the Start Test button section
    document.getElementById("quiz-container").classList.remove("hidden");  // Show the quiz section
    loadQuestion(currentQuestionIndex);  // Load the first question
    resetTimer();  // Start the timer
}

// Load a question and its options
function loadQuestion(index) {
    if (index < 0 || index >= quizQuestions.length) return;

    // Load the question and options
    const question = quizQuestions[index];
    questionContainer.textContent = question.question;
    optionsContainer.innerHTML = "";
    question.options.forEach((option, i) => {
        const optionElement = document.createElement("div");
        optionElement.classList.add("option");
        optionElement.textContent = option;
        optionElement.onclick = () => handleOptionClick(i);
        optionsContainer.appendChild(optionElement);

        // Highlight previously selected option
        if (userSelections[index] === i) {
            optionElement.classList.add("selected");
        }
    });

    // Update progress bar
    updateProgress(index);

    // Update time left
    // updateTimeLeft();

    // Enable or disable buttons
    if (answeredQuestions[index]) {
        nextButton.disabled = false;
    } else {
        nextButton.disabled = true;
    }

    // Disable the "back" button on subsequent questions or after timer reaches zero
    backButton.disabled = expiredTimes[index];  // If the timer expired, disable the "back" button
}

function handleOptionClick(optionIndex) {
    userSelections[currentQuestionIndex] = optionIndex;

    // Mark question as answered
    answeredQuestions[currentQuestionIndex] = true;

    // Highlight selected option
    const options = document.querySelectorAll(".option");
    options.forEach((option, index) => {
        if (index === optionIndex) {
            option.classList.add("selected");
        } else {
            option.classList.remove("selected");
        }
    });

    nextButton.disabled = false; // Enable next button when an option is selected
}

function loadNextQuestion() {
    if (timeLeft > 0) {
        // Save the remaining time for the current question
        remainingTimes[currentQuestionIndex] = timeLeft;

        if (currentQuestionIndex < quizQuestions.length - 1) {
            currentQuestionIndex++;
            loadQuestion(currentQuestionIndex);
            resetTimer();
        } else {
            finishQuiz();
        }
    } else {
        alert("Time's up! You cannot move to the next question.");
    }
}

function updateProgress(index) {
    const progressPercentage = ((index + 1) / quizQuestions.length) * 100;
    progress.style.width = progressPercentage + "%";
}

function updateTimeLeft() {
    const timeLeftSpan = document.getElementById("time-left");
    timeLeftSpan.textContent = `${timeLeft} second`; // Display only the remaining time in seconds (with "s")
}


// function updateTimeLeft() {
//     const timeLeftSpan = document.getElementById("time-left");
//     if (timeLeft !== null) {
//         timeLeftSpan.textContent = `${timeLeft}s`; 
//     }
// }


let remainingTimes = Array(quizQuestions.length).fill(30); // Initialize all questions with 30 seconds
let expiredTimes = Array(quizQuestions.length).fill(false); // Track if time expired for each question

function resetTimer() {
    clearInterval(timer); // Clear any existing timer

    // If there's saved time for the current question, use it; otherwise, default to 30 seconds
    timeLeft = remainingTimes[currentQuestionIndex] !== null ? remainingTimes[currentQuestionIndex] : 30;

    updateTimeLeft(); // Update the display immediately

    timer = setInterval(() => {
        timeLeft--;
        updateTimeLeft();

        if (timeLeft === 0) {
            clearInterval(timer);
            expiredTimes[currentQuestionIndex] = true; // Mark this question as expired
            remainingTimes[currentQuestionIndex] = 0; // Ensure no time is left for this question
            if (currentQuestionIndex < quizQuestions.length - 1) {
                currentQuestionIndex++; // Automatically move to next question
                loadQuestion(currentQuestionIndex);
                resetTimer(); // Start timer for the next question
            } else {
                finishQuiz();
            }
        }
    }, 1000); // Update every second
}

function goBack() {
    if (expiredTimes[currentQuestionIndex]) {
        alert("You cannot go back to a question with expired time.");
        return;
    }

    // Save the remaining time for the current question
    remainingTimes[currentQuestionIndex] = timeLeft;

    // Check if the current question's timer has expired
    if (timeLeft === 0) {
        alert("Time for the current question has expired. You cannot go back.");
        return;
    }

    // Check if there is a previous question
    if (currentQuestionIndex > 0) {
        // Check if the previous question's timer has remaining time
        if (remainingTimes[currentQuestionIndex - 1] > 0) {
            // Move to the previous question
            currentQuestionIndex--;
            loadQuestion(currentQuestionIndex);

            // Restore and start the timer for the previous question
            resetTimer();
        } else {
            alert("Time for the previous question has expired. You cannot go back.");
        }
    } else {
        alert("This is the first question. You cannot go back further.");
    }
}

function finishQuiz() {
    clearInterval(timer); // Clear the timer

    // Calculate the number of correct answers
    const correctAnswers = quizQuestions.filter((q, i) => userSelections[i] === q.answer).length;
    const totalQuestions = quizQuestions.length;

    // Calculate the percentage
    const percentage = ((correctAnswers / totalQuestions) * 100).toFixed(2); // Rounded to 2 decimal places

    // Display the score and percentage
    scoreText.textContent = `You scored ${correctAnswers} out of ${totalQuestions} (${percentage}%)`;

    // Check if the user got full marks and only then display the appreciation message
    if (correctAnswers === totalQuestions) {
        // Display appreciation message with emojis
        const appreciationMessage = document.createElement("p");
        appreciationMessage.textContent = "🌟 Wow! Full Marks! 🌟\nYou're a Quiz Master! 💯🎉 Keep it up! 👏👏";
        appreciationMessage.style.color = "green";  // Optional: style the message to make it stand out
        appreciationMessage.style.fontSize = "20px";
        appreciationMessage.style.fontWeight = "bold";
        appreciationMessage.style.textAlign = "center";
        appreciationMessage.style.marginTop = "10px";
        scoreContainer.appendChild(appreciationMessage);
    }

    // Show the score container
    scoreContainer.classList.remove("hidden");

    // Hide the quiz container
    document.getElementById("quiz-container").classList.add("hidden");
}





function restartQuiz() {
    userSelections.fill(null);
    answeredQuestions.fill(false);
    currentQuestionIndex = 0;
    scoreContainer.classList.add("hidden");
    document.getElementById("quiz-container").classList.remove("hidden");
    loadQuestion(currentQuestionIndex);
    resetTimer();
}

document.addEventListener("DOMContentLoaded", () => {
    // Initially, hide the quiz container and start-test button until webcam access is granted
    document.getElementById("quiz-container").classList.add("hidden");
    startTestContainer.classList.add("hidden");
});

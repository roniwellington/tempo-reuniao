let agenda = [];
let currentIndex = 0;
let timer;
let totalTimeSpent = 0;
let isPaused = false;
let remainingTime;

const agendaBody = document.getElementById('agenda-body');
const addButton = document.getElementById('addButton');
const clearButton = document.getElementById('clearButton');
const startButton = document.getElementById('startButton');
const pauseButton = document.getElementById('pauseButton');
const nextButton = document.getElementById('nextButton');
const totalTimeElement = document.getElementById('totalTime');

// Modal elements
const modal = document.getElementById('modal');
const closeBtn = document.getElementsByClassName('close')[0];
const saveButton = document.getElementById('saveButton');
const timeInput = document.getElementById('time');
const durationInput = document.getElementById('duration');
const subjectInput = document.getElementById('subject');

// Load state from localStorage
const savedState = JSON.parse(localStorage.getItem('agendaState'));
if (savedState) {
    currentIndex = savedState.currentIndex;
    totalTimeSpent = savedState.totalTimeSpent;
    agenda = savedState.agenda;
    renderAgenda();
    updateTotalTime();
    if (currentIndex < agenda.length) {
        highlightRow(currentIndex);
        updateDuration(currentIndex);
        nextButton.disabled = false;
        pauseButton.disabled = false;
        startButton.disabled = true;
    }
}

function saveState() {
    localStorage.setItem('agendaState', JSON.stringify({
        currentIndex,
        totalTimeSpent,
        agenda
    }));
}

function renderAgenda() {
    agendaBody.innerHTML = '';
    agenda.forEach((item, index) => {
        const row = document.createElement('tr');
        if (index < currentIndex) {
            row.classList.add('completed');
        }
        const timeCell = document.createElement('td');
        const durationCell = document.createElement('td');
        const subjectCell = document.createElement('td');
        timeCell.textContent = item.time;
        durationCell.textContent = formatDuration(item.duration);
        subjectCell.textContent = item.subject;
        row.appendChild(timeCell);
        row.appendChild(durationCell);
        row.appendChild(subjectCell);
        agendaBody.appendChild(row);
    });
}

function formatDuration(duration) {
    const hours = Math.floor(duration / 3600);
    const minutes = Math.floor((duration % 3600) / 60);
    const seconds = duration % 60;
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

function highlightRow(index) {
    const rows = agendaBody.getElementsByTagName('tr');
    for (let i = 0; i < rows.length; i++) {
        rows[i].classList.remove('active');
    }
    if (index < rows.length) {
        rows[index].classList.add('active');
    }
}

function updateDuration(index) {
    const rows = agendaBody.getElementsByTagName('tr');
    const durationCell = rows[index].getElementsByTagName('td')[1];
    const duration = agenda[index].duration;
    durationCell.textContent = formatDuration(duration);
}

function updateTotalTime() {
    totalTimeElement.textContent = formatDuration(totalTimeSpent);
}

function startAgenda() {
    if (currentIndex < agenda.length) {
        highlightRow(currentIndex);
        updateDuration(currentIndex);
        remainingTime = agenda[currentIndex].duration;
        timer = setInterval(() => {
            if (!isPaused) {
                remainingTime--;
                agenda[currentIndex].duration = remainingTime;
                totalTimeSpent++;
                updateDuration(currentIndex);
                updateTotalTime();
                saveState();
                if (remainingTime <= 0) {
                    clearInterval(timer);
                    document.getElementsByTagName('tbody')[0].getElementsByTagName('tr')[currentIndex].classList.add('completed');
                    currentIndex++;
                    startAgenda();
                }
            }
        }, 1000);
        pauseButton.disabled = false;
        nextButton.disabled = false;
    } else {
        clearInterval(timer);
        pauseButton.disabled = true;
        nextButton.disabled = true;
    }
}

function nextAgenda() {
    clearInterval(timer);
    totalTimeSpent += agenda[currentIndex].duration - remainingTime; // Add the remaining time of the current topic
    document.getElementsByTagName('tbody')[0].getElementsByTagName('tr')[currentIndex].classList.add('completed');
    currentIndex++;
    startAgenda();
}

function pauseAgenda() {
    isPaused = !isPaused;
    pauseButton.textContent = isPaused ? "Resume" : "Pause";
}

addButton.addEventListener('click', () => {
    modal.style.display = "block";
});

closeBtn.addEventListener('click', () => {
    modal.style.display = "none";
});

saveButton.addEventListener('click', () => {
    const time = timeInput.value;
    const duration = parseInt(durationInput.value) * 60;
    const subject = subjectInput.value;
    agenda.push({ time, duration, subject });
    renderAgenda();
    saveState();
    modal.style.display = "none";
});

clearButton.addEventListener('click', () => {
    localStorage.removeItem('agendaState');
    agenda = [];
    currentIndex = 0;
    totalTimeSpent = 0;
    isPaused = false;
    clearInterval(timer);
    renderAgenda();
    updateTotalTime();
    startButton.disabled = false;
    pauseButton.disabled = true;
    nextButton.disabled = true;
    pauseButton.textContent = "Pause";
});

startButton.addEventListener('click', () => {
    startButton.disabled = true;
    startAgenda();
});

pauseButton.addEventListener('click', () => {
    pauseAgenda();
});

nextButton.addEventListener('click', () => {
    nextAgenda();
});

window.addEventListener('beforeunload', saveState);

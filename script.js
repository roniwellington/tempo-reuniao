const agenda = [
    { time: "08:30", duration: 15 * 60, subject: "Recados" }, // duração em segundos
    { time: "08:45", duration: 25 * 60, subject: "Propósito Vale, Safety & Behavior Share" },
    { time: "09:10", duration: 10 * 60, subject: "Pendências da reunião anterior" },
    { time: "09:20", duration: 15 * 60, subject: "OPEX" },
    { time: "09:35", duration: 10 * 60, subject: "Pausa" },
    { time: "09:45", duration: 30 * 60, subject: "Resumo Executivo" },
    { time: "10:15", duration: 25 * 60, subject: "Plano de Ação" },
    { time: "10:35", duration: 20 * 60, subject: "Painel de Indicadores" },
    { time: "10:55", duration: 5 * 60, subject: "Painel AIP" },
    { time: "11:00", duration: 10 * 60, subject: "Pauta VPS - Você sabia?" },
    { time: "11:10", duration: 10 * 60, subject: "Dinâmica" },
    { time: "11:15", duration: 5 * 60, subject: "Avaliação de Maturidade das Reuniões de Performance" }
];

let currentIndex = 0;
let timer;
let totalTimeSpent = 0;
let isPaused = false;
let remainingTime;

const agendaBody = document.getElementById('agenda-body');
const startButton = document.getElementById('startButton');
const pauseButton = document.getElementById('pauseButton');
const nextButton = document.getElementById('nextButton');
const totalTimeElement = document.getElementById('totalTime');

// Load state from localStorage
const savedState = JSON.parse(localStorage.getItem('agendaState'));
if (savedState) {
    currentIndex = savedState.currentIndex;
    totalTimeSpent = savedState.totalTimeSpent;
    agenda.forEach((item, index) => {
        item.duration = savedState.agenda[index].duration;
        if (index < currentIndex) {
            document.getElementsByTagName('tbody')[0].getElementsByTagName('tr')[index].classList.add('completed');
        }
    });
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
    const hours = Math.floor(duration / 3600);
    const minutes = Math.floor((duration % 3600) / 60);
    const seconds = duration % 60;
    durationCell.textContent = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

function updateTotalTime() {
    const hours = Math.floor(totalTimeSpent / 3600);
    const minutes = Math.floor((totalTimeSpent % 3600) / 60);
    const seconds = totalTimeSpent % 60;
    totalTimeElement.textContent = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
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

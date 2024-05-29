let agenda = [];
let currentIndex = 0;
let timer;
let totalTimeSpent = 0;
let isPaused = false;
let remainingTime;
let isEditing = false;
let editingIndex = null;

const agendaBody = document.getElementById('agenda-body');
const addButton = document.getElementById('addButton');
const clearButton = document.getElementById('clearButton');
const startButton = document.getElementById('startButton');
const pauseButton = document.getElementById('pauseButton');
const nextButton = document.getElementById('nextButton');
const totalTimeElement = document.getElementById('totalTime');
const downloadButton = document.getElementById('downloadButton');

// Modal elements
const modal = document.getElementById('modal');
const closeBtn = document.getElementsByClassName('close')[0];
const saveButton = document.getElementById('saveButton');
const timeInput = document.getElementById('time');
const durationInput = document.getElementById('duration');
const subjectInput = document.getElementById('subject');
const dateInput = document.getElementById('date'); // Novo campo de data
const modalTitle = document.getElementById('modalTitle');

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
        const dateCell = document.createElement('td'); // Novo campo de data
        const actionsCell = document.createElement('td');
        
        timeCell.textContent = item.time;
        durationCell.textContent = formatDuration(item.duration);
        subjectCell.textContent = item.subject;
        dateCell.textContent = item.date; // Novo campo de data
        
        // Add edit button
        const editButton = document.createElement('button');
        editButton.textContent = 'Editar';
        editButton.onclick = () => editItem(index);

        actionsCell.appendChild(editButton);
        actionsCell.classList.add('actions');
        
        row.appendChild(timeCell);
        row.appendChild(durationCell);
        row.appendChild(subjectCell);
        row.appendChild(dateCell); // Novo campo de data
        row.appendChild(actionsCell);
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

function addItem() {
    isEditing = false;
    modalTitle.textContent = 'Adicionar Item à Agenda';
    timeInput.value = '';
    durationInput.value = '';
    subjectInput.value = '';
    dateInput.value = ''; // Novo campo de data
    modal.style.display = "block";
}

function editItem(index) {
    isEditing = true;
    editingIndex = index;
    modalTitle.textContent = 'Editar Item da Agenda';
    const item = agenda[index];
    timeInput.value = item.time;
    durationInput.value = item.duration / 60; // Convert seconds to minutes
    subjectInput.value = item.subject;
    dateInput.value = item.date; // Novo campo de data
    modal.style.display = "block";
}

function saveItem() {
    const time = timeInput.value;
    const duration = parseInt(durationInput.value) * 60; // Convert minutes to seconds
    const subject = subjectInput.value;
    const date = dateInput.value; // Novo campo de data
    
    if (isEditing) {
        agenda[editingIndex] = { time, duration, subject, date };
    } else {
        agenda.push({ time, duration, subject, date });
    }
    
    renderAgenda();
    saveState();
    modal.style.display = "none";
    
    // Reativar botões caso a agenda tenha novos itens
    startButton.disabled = false;
    pauseButton.disabled = true;
    nextButton.disabled = true;
    pauseButton.textContent = "Pause";
}

function downloadCSV() {
    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += "Tempo,Duração,Assunto,Data\n"; // Header row
    agenda.forEach(item => {
        const duration = formatDuration(item.duration);
        const row = `${item.time},${duration},${item.subject},${item.date}`; // Novo campo de data
        csvContent += row + "\n";
    });
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "agenda.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

addButton.addEventListener('click', addItem);

closeBtn.addEventListener('click', () => {
    modal.style.display = "none";
});

saveButton.addEventListener('click', saveItem);

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

downloadButton.addEventListener('click', () => {
    downloadCSV();
});

window.addEventListener('beforeunload', saveState);

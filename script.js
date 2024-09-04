<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Journal App</title>
    <link rel="stylesheet" href="styles.css">
</head>
<body>
    <div class="container">
        <h1>My Journal</h1>

        <!-- Add this line near the top of the body -->
        <div id="notification" class="notification"></div>

        <div id="foodLog" class="module">
            <h2>Food Log</h2>
            <input type="text" id="foodInput" placeholder="Enter food">
            <input type="text" id="symbolInput" placeholder="Enter symbol">
            <button onclick="addFood()">Add Food</button>
            <ul id="foodList"></ul>
        </div>

        <div id="moodTracker" class="module">
            <h2>Mood Tracker</h2>
            <select id="moodSelect">
                <option value="😊">😊 Happy</option>
                <option value="😐">😐 Neutral</option>
                <option value="😢">😢 Sad</option>
            </select>
            <button onclick="logMood()">Log Mood</button>
            <p id="currentMood"></p>
        </div>

        <div id="notes" class="module">
            <h2>Notes</h2>
            <textarea id="notesArea" rows="4" cols="50"></textarea>
            <button onclick="saveNotes()">Save Notes</button>
        </div>

        <div id="calendar" class="module">
            <h2>Calendar</h2>
            <input type="date" id="calendarDate">
            <button onclick="addEvent()">Add Event</button>
            <ul id="eventList"></ul>
        </div>

        <div id="weeklyGoals" class="module">
            <h2>Weekly Goals</h2>
            <input type="text" id="goalInput" placeholder="Enter goal">
            <button onclick="addGoal()">Add Goal</button>
            <ul id="goalList"></ul>
        </div>

        <div id="dragModules" class="module">
            <h2>Drag New Modules</h2>
            <div class="draggable" draggable="true" ondragstart="drag(event)" id="timerModule">Timer</div>
            <div class="draggable" draggable="true" ondragstart="drag(event)" id="imageModule">Image</div>
            <div class="draggable" draggable="true" ondragstart="drag(event)" id="stickerModule">Sticker</div>
        </div>
    </div>

    <script src="script.js"></script>
</body>
</html>

// styles.css
body {
    font-family: Arial, sans-serif;
    line-height: 1.6;
    margin: 0;
    padding: 20px;
}
.container {
    max-width: 800px;
    margin: 0 auto;
}
.module {
    border: 1px solid #ccc;
    padding: 10px;
    margin-bottom: 10px;
}
.draggable {
    cursor: move;
}

// script.js
function addFood() {
    const foodInput = document.getElementById('foodInput');
    const symbolInput = document.getElementById('symbolInput');
    const foodList = document.getElementById('foodList');

    if (foodInput.value && symbolInput.value) {
        const li = document.createElement('li');
        li.textContent = `${symbolInput.value} ${foodInput.value}`;
        foodList.appendChild(li);
        foodInput.value = '';
        symbolInput.value = '';
        saveData('foodLog', foodList.innerHTML);
    }
}

function logMood() {
    const moodSelect = document.getElementById('moodSelect');
    const currentMood = document.getElementById('currentMood');
    currentMood.textContent = `Current Mood: ${moodSelect.value}`;
    saveData('currentMood', currentMood.textContent);
}

function saveNotes() {
    const notesArea = document.getElementById('notesArea');
    saveData('notes', notesArea.value);
}

function addEvent() {
    const calendarDate = document.getElementById('calendarDate');
    const eventList = document.getElementById('eventList');

    if (calendarDate.value) {
        const li = document.createElement('li');
        li.textContent = calendarDate.value;
        eventList.appendChild(li);
        saveData('eventList', eventList.innerHTML);
    }
}

function addGoal() {
    const goalInput = document.getElementById('goalInput');
    const goalList = document.getElementById('goalList');

    if (goalInput.value) {
        const li = document.createElement('li');
        li.textContent = goalInput.value;
        goalList.appendChild(li);
        goalInput.value = '';
        saveData('goalList', goalList.innerHTML);
    }
}

function drag(ev) {
    ev.dataTransfer.setData("text", ev.target.id);
}

// Allow dropping
document.body.addEventListener('dragover', function(ev) {
    ev.preventDefault();
});

document.body.addEventListener('drop', function(ev) {
    ev.preventDefault();
    var data = ev.dataTransfer.getData("text");
    var nodeCopy = document.getElementById(data).cloneNode(true);
    nodeCopy.id = data + Math.floor(Math.random() * 1000);
    ev.target.appendChild(nodeCopy);
});

// Save and load data
function saveData(key, value) {
    localStorage.setItem(key, value);
}

function loadData(key) {
    return localStorage.getItem(key);
}

// Load saved data on page load
window.onload = function() {
    document.getElementById('foodList').innerHTML = loadData('foodLog') || '';
    document.getElementById('currentMood').textContent = loadData('currentMood') || '';
    document.getElementById('notesArea').value = loadData('notes') || '';
    document.getElementById('eventList').innerHTML = loadData('eventList') || '';
    document.getElementById('goalList').innerHTML = loadData('goalList') || '';
};

// server.js
const express = require('express');
const app = express();
const port = 3000;

app.use(express.static('.')); // Serve static files from the current directory

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});

// package.json
{
  "name": "journal-app",
  "version": "1.0.0",
  "description": "A JavaScript journal app",
  "main": "server.js",
  "scripts": {
    "start": "node server.js"
  },
  "dependencies": {
    "express": "^4.17.1"
  }
}

// .replit
language = "nodejs"
run = "npm start"


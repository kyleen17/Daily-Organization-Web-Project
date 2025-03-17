document.addEventListener("DOMContentLoaded", function () {
    loadTasks();
    scheduleTasks();
    displayRandomQuote();
    setupTimer();
    updateDateTime();
    setInterval(updateDateTime, 1000); // Update time every second
    setupNavScroll();
    setupNavLinks();
});


const blockedTimes = [
    { time: 8 * 60, duration: 30, label: "Charlotte's Feeding & Changing" },
    { time: 10 * 60, duration: 30, label: "Charlotte's Feeding & Changing" },
    { time: 12 * 60 + 15, duration: 30, label: "Charlotte's Feeding & Changing" },
    { time: 15 * 60, duration: 30, label: "Charlotte's Feeding & Changing" },
    { time: 17 * 60, duration: 30, label: "Charlotte's Feeding & Changing" }
];

const quotes = [
    "Believe you can and you're halfway there.",
    "Don't watch the clock; do what it does. Keep going.",
    "The future depends on what you do today.",
    "Success is the sum of small efforts, repeated day in and day out.",
    "Act as if what you do makes a difference. It does.",
    "Quality means doing it right when no one is looking.",
    "Every moment is a fresh beginning.",
    "You don't have to be great to start, but you have to start to be great.",
    "Believe you can and you're halfway there.",
    "Success is not final, failure is not fatal: it is the courage to continue that counts.",
    "The best time to plant a tree was 20 years ago. The second best time is now."


];

function displayRandomQuote() {
    const quoteElement = document.getElementById("quote");
    if (quoteElement) {
        const randomIndex = Math.floor(Math.random() * quotes.length);
        quoteElement.textContent = quotes[randomIndex];
    }
}

function addTask() {
    const taskName = document.getElementById("taskName").value.trim();
    const taskCategory = document.getElementById("taskCategory").value;
    const taskPriority = document.getElementById("taskPriority").value;
    const taskEnergy = document.getElementById("taskEnergy").value;
    const taskTime = document.getElementById("taskTime").value;
    
    if (taskName === "") {
        alert("Please enter a task name.");
        return;
    }
    
    const task = {
        name: taskName,
        category: taskCategory,
        priority: taskPriority,
        energy: taskEnergy,
        time: parseInt(taskTime, 10) || 0
    };
    
    let tasks = JSON.parse(localStorage.getItem("tasks")) || [];
    tasks.push(task);
    localStorage.setItem("tasks", JSON.stringify(tasks));
    
    document.getElementById("taskName").value = "";
    document.getElementById("taskTime").value = "";
    loadTasks();
    scheduleTasks();
}

function loadTasks() {
    const taskList = document.getElementById("taskList");
    taskList.innerHTML = "";
    
    let tasks = JSON.parse(localStorage.getItem("tasks")) || [];
    
    tasks.forEach((task, index) => {
        const taskItem = document.createElement("div");
        taskItem.classList.add("task-item");
        taskItem.innerHTML = `
            <span><strong>${task.name}</strong> - ${task.category} - ${task.priority} - ${task.energy} - ${task.time} min</span>
            <button class="delete-btn" onclick="deleteTask(${index})">Delete</button>
        `;
        taskList.appendChild(taskItem);
    });
}

function deleteTask(index) {
    let tasks = JSON.parse(localStorage.getItem("tasks")) || [];
    tasks.splice(index, 1);
    localStorage.setItem("tasks", JSON.stringify(tasks));
    loadTasks();
    scheduleTasks();
}

function scheduleTasks() {
    let tasks = JSON.parse(localStorage.getItem("tasks")) || [];
    tasks.sort((a, b) => {
        const priorityOrder = { high: 1, medium: 2, low: 3 };
        return priorityOrder[a.priority] - priorityOrder[b.priority] || a.time - b.time;
    });
    
    let schedule = "<div class='schedule-container'>";
    let currentTime = 8 * 60; // Start scheduling at 8:00 AM
    
    let allEvents = [...blockedTimes];
    tasks.forEach(task => {
        while (blockedTimes.some(b => currentTime >= b.time && currentTime < b.time + b.duration)) {
            let blockingEvent = blockedTimes.find(b => currentTime >= b.time && currentTime < b.time + b.duration);
            currentTime = blockingEvent.time + blockingEvent.duration;
        }
        
        allEvents.push({ time: currentTime, duration: task.time, label: task.name });
        currentTime += task.time;
    });
    
    allEvents.sort((a, b) => a.time - b.time);
    
    allEvents.forEach(event => {
        let hours = Math.floor(event.time / 60);
        let minutes = event.time % 60;
        let period = hours >= 12 ? "PM" : "AM";
        hours = hours > 12 ? hours - 12 : hours;
        hours = hours === 0 ? 12 : hours;
        let formattedTime = `${hours}:${minutes.toString().padStart(2, '0')} ${period}`;
        schedule += `<div class='schedule-item'><strong>${formattedTime}</strong> - ${event.label} (${event.duration} min)</div>`;
    });
    
    schedule += "</div>";
    document.getElementById("schedule").innerHTML = schedule;
}

function setupTimer() {
    const timerContainer = document.createElement("div");
    timerContainer.classList.add("timer-container");
    timerContainer.innerHTML = `
        <h2>Set Timer</h2>
        <input type="number" id="timerInput" placeholder="Minutes" min="1">
        <button onclick="startTimer()">Start Timer</button>
        <p id="timerDisplay">00:00</p>
    `;
    
    // Append to the main container instead of the nav
    document.querySelector(".main-container").appendChild(timerContainer);
}

function startTimer() {
    let minutes = parseInt(document.getElementById("timerInput").value, 10);
    if (isNaN(minutes) || minutes <= 0) {
        alert("Please enter a valid number of minutes.");
        return;
    }
    
    let timeLeft = minutes * 60;
    const timerDisplay = document.getElementById("timerDisplay");
    
    const countdown = setInterval(() => {
        let min = Math.floor(timeLeft / 60);
        let sec = timeLeft % 60;
        timerDisplay.textContent = `${min}:${sec.toString().padStart(2, '0')}`;
        
        if (timeLeft === 0) {
            clearInterval(countdown);
            timerDisplay.textContent = "Time's up!";
            alert("Time's up!");
        }
        
        timeLeft--;
    }, 1000);
}

function updateDateTime() {
    const now = new Date();
    const dateString = now.toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
    const timeString = now.toLocaleTimeString();
    
    let dateTimeElement = document.getElementById("dateTime");
    if (!dateTimeElement) {
        dateTimeElement = document.createElement("div");
        dateTimeElement.id = "dateTime";
        document.querySelector("nav").prepend(dateTimeElement);
    }
    
    dateTimeElement.innerHTML = `<strong>${dateString}</strong><br>${timeString}`;
}

function setupNavScroll() {
    let prevScrollpos = window.pageYOffset;
    const nav = document.querySelector("header");
    window.onscroll = function () {
        let currentScrollPos = window.pageYOffset;
        if (prevScrollpos > currentScrollPos) {
            nav.style.top = "0";
        } else {
            nav.style.top = "-80px"; // Adjust this based on nav height
        }
        prevScrollpos = currentScrollPos;
    };
}

const treatYourselfIdeas = [
    "Take a warm bath with candles.",
    "Read a book for 30 minutes.",
    "Go for a peaceful walk outside.",
    "Enjoy a fancy cup of tea or coffee.",
    "Do a face mask or skincare routine.",
    "Listen to your favorite music and relax.",
    "Watch an episode of your favorite show.",
    "Buy yourself a little treat!",
    "Write in a journal about something positive.",
    "Try a new hobby or creative activity.",
    "Practice piano or guitar for 30 minutes.",
    "Try a new recipe from a cookbook.",
];

function treatYourself() {
    const treatElement = document.getElementById("treatDisplay");
    if (treatElement) {
        const randomIndex = Math.floor(Math.random() * treatYourselfIdeas.length);
        treatElement.textContent = treatYourselfIdeas[randomIndex];
    }
}

window.onload = function() {
    document.body.style.overflow = "auto";
    document.querySelector(".container").style.marginTop = "120px";
};
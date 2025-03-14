document.addEventListener("DOMContentLoaded", function () {
    loadTasks();
    scheduleTasks();
});

const blockedTimes = [
    { time: 8 * 60, duration: 30, label: "Charlotte's Feeding & Changing" },
    { time: 10 * 60, duration: 30, label: "Charlotte's Feeding & Changing" },
    { time: 12 * 60 + 15, duration: 30, label: "Charlotte's Feeding & Changing" },
    { time: 15 * 60, duration: 30, label: "Charlotte's Feeding & Changing" },
    { time: 17 * 60, duration: 30, label: "Charlotte's Feeding & Changing" }
];

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
    
    let schedule = "";
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
    
    document.getElementById("schedule").innerHTML = schedule;
}

window.onload = function() {
    document.body.style.overflow = "auto";
    document.querySelector(".container").style.marginTop = "120px";
};

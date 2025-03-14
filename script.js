document.addEventListener("DOMContentLoaded", function () {
    loadTasks();
    scheduleTasks();
});

const blockedTimes = [
    { time: 8 * 60, duration: 30, label: "Charlotte's Feeding & Changing" },
    { time: 10 * 60, duration: 30, label: "Charlotte's Feeding & Changing" },
    { time: 12.5 * 60, duration: 30, label: "Charlotte's Feeding & Changing" },
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
    
    tasks.forEach(task => {
        while (blockedTimes.some(block => currentTime >= block.time && currentTime < block.time + block.duration)) {
            let block = blockedTimes.find(b => currentTime >= b.time && currentTime < b.time + b.duration);
            let hours = Math.floor(block.time / 60);
            let minutes = block.time % 60;
            let formattedTime = `${hours}:${minutes.toString().padStart(2, '0')} AM`;
            schedule += `<div class='schedule-item'><strong>${formattedTime}</strong> - ${block.label} (${block.duration} min)</div>`;
            currentTime = block.time + block.duration;
        }
        
        let hours = Math.floor(currentTime / 60);
        let minutes = currentTime % 60;
        let formattedTime = `${hours}:${minutes.toString().padStart(2, '0')} AM`;
        
        schedule += `<div class='schedule-item'><strong>${formattedTime}</strong> - ${task.name} (${task.time} min)</div>`;
        
        currentTime += task.time;
    });
    
    document.getElementById("schedule").innerHTML = schedule;
}

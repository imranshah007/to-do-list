// Load tasks from localStorage on startup
document.addEventListener("DOMContentLoaded", loadTasks);

const taskInput = document.getElementById("taskInput");
const taskList = document.getElementById("taskList");
const noTasksMessage = document.getElementById("noTasksMessage");
const searchInput = document.getElementById("searchInput");

let tasks = JSON.parse(localStorage.getItem("tasks")) || [];

function saveTasks() {
    localStorage.setItem("tasks", JSON.stringify(tasks));
}

function loadTasks() {
    tasks.forEach(task => createTaskElement(task));
    updateNoTasksMessage();
}

function addTask() {
    const taskName = taskInput.value.trim();
    if (taskName) {
        const task = { id: Date.now(), name: taskName, completed: false };
        tasks.push(task);
        createTaskElement(task);
        saveTasks();
        taskInput.value = "";
    }
    updateNoTasksMessage();
}

function createTaskElement(task) {
    const li = document.createElement("li");
    li.className = "task-item";
    li.dataset.id = task.id;
    li.draggable = true;

    const taskNameSpan = document.createElement("span");
    taskNameSpan.textContent = task.name;
    taskNameSpan.className = task.completed ? "completed" : "";
    taskNameSpan.addEventListener("click", () => toggleCompleteTask(task.id));
    li.appendChild(taskNameSpan);

    const editButton = document.createElement("button");
    editButton.textContent = "Edit";
    editButton.addEventListener("click", () => editTask(task.id));
    li.appendChild(editButton);

    const deleteButton = document.createElement("button");
    deleteButton.textContent = "Delete";
    deleteButton.addEventListener("click", () => deleteTask(task.id));
    li.appendChild(deleteButton);

    taskList.appendChild(li);

    li.addEventListener("dragstart", dragStart);
    li.addEventListener("dragover", dragOver);
    li.addEventListener("drop", drop);
}

function toggleCompleteTask(id) {
    const task = tasks.find(task => task.id === id);
    task.completed = !task.completed;
    saveTasks();
    updateTaskList();
}

function editTask(id) {
    const task = tasks.find(task => task.id === id);
    const li = document.querySelector(`[data-id="${id}"]`);
    const taskNameSpan = li.querySelector("span");
    const editButton = li.querySelector("button");

    taskNameSpan.contentEditable = true;
    taskNameSpan.focus();

    editButton.textContent = "Save";
    editButton.onclick = () => saveEdit(id);
}

function saveEdit(id) {
    const task = tasks.find(task => task.id === id);
    const li = document.querySelector(`[data-id="${id}"]`);
    const taskNameSpan = li.querySelector("span");
    const editButton = li.querySelector("button");

    task.name = taskNameSpan.textContent.trim();
    taskNameSpan.contentEditable = false;
    editButton.textContent = "Edit";
    editButton.onclick = () => editTask(id);

    saveTasks();
    updateTaskList();
}

function deleteTask(id) {
    tasks = tasks.filter(task => task.id !== id);
    saveTasks();
    updateTaskList();
}

function showAllTasks() {
    updateTaskList();
}

function showCompletedTasks() {
    updateTaskList(task => task.completed);
}

function showPendingTasks() {
    updateTaskList(task => !task.completed);
}

function searchTasks() {
    const searchTerm = searchInput.value.toLowerCase();
    updateTaskList(task => task.name.toLowerCase().includes(searchTerm));
}

function updateTaskList(filterFn = () => true) {
    taskList.innerHTML = "";
    tasks.filter(filterFn).forEach(task => createTaskElement(task));
    updateNoTasksMessage();
}

function updateNoTasksMessage() {
    noTasksMessage.style.display = tasks.length === 0 || taskList.childElementCount === 0 ? "block" : "none";
}

function dragStart(event) {
    event.dataTransfer.setData("text/plain", event.target.dataset.id);
}

function dragOver(event) {
    event.preventDefault();
}

function drop(event) {
    const draggedId = event.dataTransfer.getData("text/plain");
    const droppedId = event.target.dataset.id;

    const draggedIndex = tasks.findIndex(task => task.id == draggedId);
    const droppedIndex = tasks.findIndex(task => task.id == droppedId);

    if (draggedIndex > -1 && droppedIndex > -1) {
        const [draggedTask] = tasks.splice(draggedIndex, 1);
        tasks.splice(droppedIndex, 0, draggedTask);

        saveTasks();
        updateTaskList();
    }
}

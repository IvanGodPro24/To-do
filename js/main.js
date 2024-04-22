const form = document.querySelector("#form")
const taskInput = document.querySelector("#taskInput")
const tasksList = document.querySelector("#tasksList")
const removeTasks = document.querySelector('#removeDoneTasks')
const editElement = document.querySelector('#edit')
const completedTasksList = document.querySelector('#completedTasksList')

let tasks = []

if (localStorage.getItem('tasks')) {
    tasks = JSON.parse(localStorage.getItem('tasks'))

    whatToRender()
}

const popoverTriggerList = document.querySelectorAll('[data-bs-toggle="popover"]')
const popoverList = [...popoverTriggerList].map(popoverTriggerEl => new bootstrap.Popover(popoverTriggerEl))

checkEmptyList()

taskInput.oninput = () => {
    if (taskInput.value.charAt(0) === ' ') {
        taskInput.value = ''
    }
}

form.addEventListener("submit", addTask)

tasksList.addEventListener('click', deleteTask)

tasksList.addEventListener('click', doneTask)

removeTasks.addEventListener('click', removeDoneTasks)

editElement.addEventListener('click', editTask)

completedTasksList.addEventListener('click', deleteTask)

completedTasksList.addEventListener('click', doneTask)

tasksList.addEventListener('click', starredTask)


function addTask(event) {
        event.preventDefault()

        const taskText = taskInput.value

        const newTask = {
            id: Date.now(),
            text: taskText,
            done: false,
            starred: false
        }

        tasks.push(newTask)

        renderTask(newTask)

        taskInput.value = ''

        taskInput.focus()

        checkEmptyList()

        saveToLocalStorage()
}

function deleteTask(event) {
    if (event.target.dataset.action !== 'delete') return

    const li = event.target.closest('li')

    const id = Number(li.id)

    tasks = tasks.filter(task => task.id !== id)

    li.remove()

    checkEmptyList()

    saveToLocalStorage()
}

function doneTask(event) {
    if (event.target.dataset.action !== 'done') return

    const closestLi = event.target.closest('li')

    const id = Number(closestLi.id)

    const taskIndex = tasks.findIndex(task => task.id === id)

    tasks[taskIndex].done = !tasks[taskIndex].done

    const taskTitle = closestLi.querySelector('span')
    taskTitle.classList.toggle('task-title--done')

    if (tasks[taskIndex].done) {
        const priorityButton = closestLi.querySelector('[data-action="starred"]')
        if (priorityButton) {
            priorityButton.remove()
            tasks[taskIndex].starred = false
        }
        completedTasksList.appendChild(closestLi)
    } else {
            const priorityButtonHTML = `
                <button type="button" data-action="starred" class="btn-action">
                    <img src="./img/star.svg" alt="Priority" id="img">
                </button>`
            closestLi.querySelector('.task-item__buttons').insertAdjacentHTML('afterbegin', priorityButtonHTML)
        tasksList.appendChild(closestLi)
    }

    checkEmptyList()

    saveToLocalStorage()
}

function starredTask(event) {
    if (event.target.dataset.action !== 'starred') return

    const taskId = event.target.closest('li').id
    const taskIndex = tasks.findIndex(task => task.id === Number(taskId))

    tasks[taskIndex].starred = !tasks[taskIndex].starred

    saveToLocalStorage()

    tasksList.innerHTML = ''
    completedTasksList.innerHTML = ''

    whatToRender()
}

function removeDoneTasks() {

    tasks = tasks.filter(task => !task.done)

    tasksList.innerHTML = ''
    completedTasksList.innerHTML = ''

    whatToRender()

    checkEmptyList()

    saveToLocalStorage()
}

function checkEmptyList() {
    const emptyListEl = document.querySelector('#emptyList')

    const emptyListExists = emptyListEl !== null

    if (tasks.length === 0 || tasks.every(task => task.done)) {
        if (!emptyListExists) {
            const emptyListElement = `
                <li id="emptyList" class="list-group-item empty-list">
                    <img src="./img/to-do.svg" alt="to-do" id="big-img" class="mt-3">
                    <div class="empty-list__title">to-do is empty</div>
                </li>`
            tasksList.insertAdjacentHTML('afterbegin', emptyListElement)
        }
    } else {
        if (emptyListExists) {
            emptyListEl.remove()
        }
    }
}

function saveToLocalStorage()  {
    localStorage.setItem('tasks', JSON.stringify(tasks))
}

function renderTask(task) {
    const cssClass = task.done ? 'task-title task-title--done' : 'task-title'
    const priorityButton = task.starred ?
        `<button type="button" data-action="starred" class="btn-action">
            <img src="./img/star-black.svg" alt="Priority" id="img">
        </button>` :
        `<button type="button" data-action="starred" class="btn-action">
            <img src="./img/star.svg" alt="Priority" id="img" ">
        </button>`

    const taskHTML = `
				<li id="${task.id}" class="list-group-item d-flex justify-content-between task-item">
					<span class="${cssClass}" contenteditable="true">${task.text}</span>
					<div class="task-item__buttons">
					    ${priorityButton}
						<button type="button" data-action="done" class="btn-action">
							<img src="./img/tick.svg" alt="Done" id="img">
						</button>
						<button type="button" data-action="delete" class="btn-action">
							<img src="./img/cross.svg" alt="Delete" id="img" ">
						</button>
					</div>
				</li>`

    tasksList.insertAdjacentHTML("beforeend", taskHTML)
}

function editTask() {
    const taskElements = document.querySelectorAll('#tasksList .task-title')
    const completedTaskElements = document.querySelectorAll('#completedTasksList .task-title')

    taskElements.forEach(taskElement => {
        taskElement.addEventListener('blur', forEdit)
    })

    completedTaskElements.forEach(completedTaskElement => {
        completedTaskElement.addEventListener('blur', forEdit)
    })
}

function forEdit() {
    const newValue = this.textContent
    const taskId = this.parentElement.id
    const taskIndex = tasks.findIndex(task => task.id === Number(taskId))
    tasks[taskIndex].text = newValue
    saveToLocalStorage()
}

function renderCompletedTask(task) {
    const cssClass = 'task-title task-title--done'

    const taskHTML = `
        <li id="${task.id}" class="list-group-item d-flex justify-content-between task-item">
            <span class="${cssClass}" contenteditable="true">${task.text}</span>
            <div class="task-item__buttons">
                <button type="button" data-action="done" class="btn-action">
                    <img src="./img/tick.svg" alt="Done" id="img">
                </button>
                <button type="button" data-action="delete" class="btn-action">
                    <img src="./img/cross.svg" alt="Done" id="img">
                </button>
            </div>
        </li>`

    completedTasksList.insertAdjacentHTML("beforeend", taskHTML)
}

function whatToRender() {
    const sortedTasks = tasks.slice().sort((a, b) => {
        if (a.starred && !b.starred) return -1
        if (!a.starred && b.starred) return 1

        if (a.done && !b.done) return 1
        if (!a.done && b.done) return -1

        return a.id - b.id
    })

    sortedTasks.forEach(task => {
        if (task.done) {
            renderCompletedTask(task)
        } else {
            renderTask(task)
        }
    })
}


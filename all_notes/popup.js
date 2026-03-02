const taskInput = document.querySelector(".task-input input"),
    filters = document.querySelectorAll(".filters span"),
    clearAll = document.querySelector(".clear-btn"),
    taskBox = document.querySelector(".task-box");

let editId,
    isEditTask = false,
    todos = [];

// Cargar datos desde chrome.storage
chrome.storage.local.get(['todo-list'], function(result) {
    if (result['todo-list']) {
        todos = result['todo-list'];
    }
    showTodo("all");
});

filters.forEach(btn => {
    btn.addEventListener("click", () => {
        document.querySelector("span.active").classList.remove("active");
        btn.classList.add("active");
        showTodo(btn.id);
    });
});

function showTodo(filter) {
    let liTag = "";
    if (todos && todos.length > 0) {
        todos.forEach((todo, id) => {
            let completed = todo.status == "completed" ? "checked" : "";
            let checkedClass = todo.status == "completed" ? "checked" : "";
            if (filter == todo.status || filter == "all") {
                liTag += `<li class="task">
                    <label for="${id}">
                        <input type="checkbox" id="${id}" ${completed} data-id="${id}">
                        <p class="${checkedClass}">${todo.name}</p>
                    </label>
                    <div class="settings">
                        <i class="uil uil-ellipsis-h menu-btn" data-id="${id}"></i>
                        <ul class="task-menu">
                            <li class="edit-btn" data-id="${id}" data-name="${todo.name}"><i class="uil uil-pen"></i>Editar</li>
                            <li class="delete-btn" data-id="${id}" data-filter="${filter}"><i class="uil uil-trash"></i>Eliminar</li>
                        </ul>
                    </div>
                </li>`;
            }
        });
    }

    taskBox.innerHTML = liTag || `<span>No tienes ninguna tarea aquí</span>`;
    
    // Agregar event listeners después de crear el HTML
    addEventListeners();
    
    let checkTask = taskBox.querySelectorAll(".task");
    !checkTask.length ? clearAll.classList.remove("active") : clearAll.classList.add("active");
}

function addEventListeners() {
    // Checkboxes
    document.querySelectorAll('.task-box input[type="checkbox"]').forEach(checkbox => {
        checkbox.addEventListener('change', function() {
            updateStatus(this);
        });
    });
    
    // Botones de menú
    document.querySelectorAll('.menu-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            showMenu(this);
        });
    });
    
    // Botones de editar
    document.querySelectorAll('.edit-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            editTask(this.dataset.id, this.dataset.name);
        });
    });
    
    // Botones de eliminar
    document.querySelectorAll('.delete-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            deleteTask(this.dataset.id, this.dataset.filter);
        });
    });
}

function showMenu(selectedTask) {
    let menuDiv = selectedTask.parentElement.lastElementChild;
    menuDiv.classList.add("show");
    document.addEventListener("click", e => {
        if (e.target.tagName != "I" || e.target != selectedTask) {
            menuDiv.classList.remove("show");
        }
    });
}

function updateStatus(selectedTask) {
    let taskName = selectedTask.parentElement.querySelector('p');
    let taskId = selectedTask.dataset.id;
    if (selectedTask.checked) {
        taskName.classList.add("checked");
        todos[taskId].status = "completed";
    } else {
        taskName.classList.remove("checked");
        todos[taskId].status = "pending";
    }
    chrome.storage.local.set({'todo-list': todos});
}

function editTask(taskId, textName) {
    editId = taskId;
    isEditTask = true;
    taskInput.value = textName;
    taskInput.focus();
    taskInput.classList.add("active");
}

function deleteTask(deleteId, filter) {
    isEditTask = false;
    todos.splice(deleteId, 1);
    chrome.storage.local.set({'todo-list': todos});
    showTodo(filter);
}

clearAll.addEventListener("click", () => {
    showConfirmModal();
});

function showConfirmModal() {
    const modal = document.getElementById('confirmModal');
    modal.style.display = 'flex';
    
    // Botón cancelar
    document.querySelector('.btn-cancel').onclick = () => {
        modal.style.display = 'none';
    };
    
    // Botón confirmar
    document.querySelector('.btn-confirm').onclick = () => {
        isEditTask = false;
        todos.splice(0, todos.length);
        chrome.storage.local.set({'todo-list': todos});
        showTodo(document.querySelector("span.active").id);
        modal.style.display = 'none';
    };
    
    // Cerrar al hacer clic fuera del modal
    modal.onclick = (e) => {
        if (e.target === modal) {
            modal.style.display = 'none';
        }
    };
}

taskInput.addEventListener("keyup", e => {
    let userTask = taskInput.value.trim();
    if (e.key == "Enter" && userTask) {
        if (!isEditTask) {
            todos = !todos ? [] : todos;
            let taskInfo = { name: userTask, status: "pending" };
            todos.push(taskInfo);
        } else {
            isEditTask = false;
            todos[editId].name = userTask;
        }
        taskInput.value = "";
        chrome.storage.local.set({'todo-list': todos});
        showTodo(document.querySelector("span.active").id);
    }
});
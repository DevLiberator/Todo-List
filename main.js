const btn = document.getElementById("addTask");

let tasks = [];

const columns = ["backlog", "in-progress", "review", "done"];

/* =========================
   ELEMENTOS DO MODAL DETALHE
========================= */
const modal = document.getElementById("taskModal");
const overlay = document.getElementById("modalOverlay");
const closeModalBtn = document.getElementById("closeModal");
const modalTitle = document.getElementById("modalTitle");
const modalDescription = document.getElementById("modalDescription");
const modalActions = document.getElementById("modalActions");

let currentTask = null;

/* =========================
   ELEMENTOS DO MODAL CRIAÇÃO
========================= */
const createModal = document.getElementById("createTaskModal");
const createOverlay = document.getElementById("createOverlay");
const closeCreateModalBtn = document.getElementById("closeCreateModal");
const createForm = document.getElementById("createTaskForm");

const newTitle = document.getElementById("newTitle");
const newDescription = document.getElementById("newDescription");
const newPriority = document.getElementById("newPriority");

/* =========================
   Atualizar tarefa
========================= */
function updateTask(updatedTask) {
  const index = tasks.findIndex((t) => t.id === updatedTask.id);

  if (index > -1) {
    tasks[index] = {
      ...updatedTask,
      updatedAt: new Date(),
    };

    saveLocalStorage();
    render();
  }
}

/* =========================
   Deletar tarefa
========================= */
function deleteTask(id) {
  tasks = tasks.filter((t) => t.id !== id);
  saveLocalStorage();
  render();
}

/* =========================
   MODAL CRIAR TAREFA
========================= */

btn.addEventListener("click", () => {
  createModal.classList.add("active");
});

function closeCreateModal() {
  createModal.classList.remove("active");
  createForm.reset();
}

createOverlay.addEventListener("click", closeCreateModal);
closeCreateModalBtn.addEventListener("click", closeCreateModal);

createForm.addEventListener("submit", (e) => {
  e.preventDefault();

  const newTask = {
    id: Date.now(),
    title: newTitle.value,
    description: newDescription.value,
    status: "backlog",
    priority: newPriority.value,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  tasks.push(newTask);
  saveLocalStorage();
  render();
  closeCreateModal();
});

/* =========================
   MODAL DETALHES
========================= */

function openModal(task) {
  currentTask = task;

  modalTitle.innerText = task.title;
  modalDescription.innerText = task.description || "Sem descrição";

  renderModalActions(task);
  modal.classList.add("active");
}

function closeModal() {
  modal.classList.remove("active");
}

overlay.addEventListener("click", closeModal);
closeModalBtn.addEventListener("click", closeModal);

function changeStatus(newStatus) {
  updateTask({
    ...currentTask,
    status: newStatus,
  });

  closeModal();
}

function renderModalActions(task) {
  modalActions.innerHTML = "";

  if (task.status === "backlog") {
    modalActions.innerHTML = `
      <button class="btn-kanban btn-progress">
        Iniciar tarefa
      </button>
    `;
    modalActions
      .querySelector("button")
      .addEventListener("click", () => changeStatus("in-progress"));
  } else if (task.status === "in-progress") {
    modalActions.innerHTML = `
      <button class="btn-kanban btn-review">
        Enviar para revisão
      </button>
    `;
    modalActions
      .querySelector("button")
      .addEventListener("click", () => changeStatus("review"));
  } else if (task.status === "review") {
    modalActions.innerHTML = `
      <button class="btn-kanban btn-back">
        Voltar
      </button>
      <button class="btn-kanban btn-done">
        Concluir
      </button>
    `;

    const buttons = modalActions.querySelectorAll("button");

    buttons[0].addEventListener("click", () => changeStatus("in-progress"));
    buttons[1].addEventListener("click", () => changeStatus("done"));
  } else if (task.status === "done") {
    modalActions.innerHTML = `
      <button class="btn-kanban btn-back">
        Reabrir tarefa
      </button>
    `;
    modalActions
      .querySelector("button")
      .addEventListener("click", () => changeStatus("backlog"));
  }
}

/* =========================
   LocalStorage
========================= */
function loadFromLocalStorage() {
  const saved = localStorage.getItem("tasks");
  tasks = saved ? JSON.parse(saved) : [];
}

function saveLocalStorage() {
  localStorage.setItem("tasks", JSON.stringify(tasks));
}

/* =========================
   Renderização
========================= */
function render() {
  columns.forEach((column) => {
    const columnList = document.getElementById(`${column}-list`);
    if (!columnList) return;

    columnList.innerHTML = "";

    const tasksInColumn = tasks.filter((task) => task.status === column);

    const countEl = document.querySelector(
      `.tasklist__column[data-column="${column}"] .tasklist__count`,
    );

    if (countEl) countEl.textContent = tasksInColumn.length;

    tasksInColumn.forEach((task) => {
      const card = document.createElement("div");
      card.className = `card card--${task.priority}`;
      card.style.cursor = "pointer";

      card.innerHTML = `
        <div class="card__title">${task.title}</div>
        <div class="card__description">${task.description || ""}</div>
        
        <div class="card__actions">
          <button class="btn-delete">🗑 Deletar</button>
        </div>
      `;

      /* Abrir modal ao clicar no card */
      card.addEventListener("click", (e) => {
        if (!e.target.classList.contains("btn-delete")) {
          openModal(task);
        }
      });

      /* Deletar */
      card.querySelector(".btn-delete").addEventListener("click", (e) => {
        e.stopPropagation();

        if (confirm("Tem certeza que deseja deletar essa tarefa?")) {
          deleteTask(task.id);
        }
      });

      columnList.appendChild(card);
    });
  });
}

/* =========================
   Inicialização
========================= */
loadFromLocalStorage();
render();

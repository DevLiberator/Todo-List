const btn = document.getElementById("addTask");

let tasks = [];

const columns = ["backlog", "in-progress", "review", "done"];

/* =========================
   Atualizar tarefa
========================= */
function updateTask(updatedTask) {
  const index = tasks.findIndex(t => t.id === updatedTask.id);

  if (index > -1) {
    tasks[index] = {
      ...updatedTask,
      updatedAt: new Date()
    };

    saveLocalStorage();
    render();
  }
}

/* =========================
   Deletar tarefa
========================= */
function deleteTask(id) {
  tasks = tasks.filter(t => t.id !== id);
  saveLocalStorage();
  render();
}

/* =========================
   Criar nova tarefa
========================= */
btn.addEventListener("click", () => {
  const title = prompt("Digite o título da tarefa:");
  if (!title) return;

  const description = prompt("Digite a descrição da tarefa:");

  const newTask = {
    id: Date.now(),
    title,
    description,
    column: columns[0],
    status: "backlog",
    priority: "medium",
    createdAt: new Date(),
    updatedAt: new Date()
  };

  tasks.push(newTask);
  saveLocalStorage();
  render();
});

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
  columns.forEach(column => {
    const columnList = document.getElementById(`${column}-list`);
    if (!columnList) return;

    columnList.innerHTML = "";

    const tasksInColumn = tasks.filter(task => task.status === column);

    const countEl = document.querySelector(
      `.tasklist__column[data-column="${column}"] .tasklist__count`
    );

    if (countEl) countEl.textContent = tasksInColumn.length;

    tasksInColumn.forEach(task => {
      const card = document.createElement("div");
      card.className = `card card--${task.priority}`;

      const isDone = task.status === "done";

      card.innerHTML = `
        <div class="card__title">${task.title}</div>
        <div class="card__description">${task.description || ""}</div>
        
        <div class="card__actions">
          <button class="btn-toggle">
            ${isDone ? "↩ Voltar" : "✔ Concluir"}
          </button>
          <button class="btn-delete">🗑 Deletar</button>
        </div>
      `;

      /* Botão concluir / voltar */
      card.querySelector(".btn-toggle").addEventListener("click", () => {
        updateTask({
          ...task,
          status: isDone ? "backlog" : "done"
        });
      });

      /* Botão deletar */
      card.querySelector(".btn-delete").addEventListener("click", () => {
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
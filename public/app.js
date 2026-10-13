const form = document.querySelector("#task-form");
const titleInput = document.querySelector("#task-title");
const descriptionInput = document.querySelector("#task-description");
const list = document.querySelector("#task-list");
const filter = document.querySelector("#filter");
const message = document.querySelector("#form-message");
let tasks = [];

async function api(url, options = {}) {
  const response = await fetch(url, {
    ...options,
    headers: { "Content-Type": "application/json", ...(options.headers || {}) }
  });
  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    throw new Error(body.error || `Request failed (${response.status})`);
  }
  return response.status === 204 ? null : response.json();
}

function updateStats() {
  document.querySelector("#total-count").textContent = tasks.length;
  document.querySelector("#open-count").textContent = tasks.filter(t => !t.completed).length;
  document.querySelector("#done-count").textContent = tasks.filter(t => t.completed).length;
}

function render() {
  updateStats();
  const visible = tasks.filter(t => filter.value === "all" ||
    (filter.value === "open" && !t.completed) || (filter.value === "done" && t.completed));
  list.replaceChildren();
  if (!visible.length) {
    const empty = document.createElement("p");
    empty.className = "empty";
    empty.textContent = tasks.length ? "No tasks match this filter." : "No tasks yet. Add one above to get started.";
    list.append(empty);
    return;
  }

  for (const task of visible) {
    const card = document.createElement("article");
    card.className = `task${task.completed ? " completed" : ""}`;
    const checkbox = document.createElement("input");
    checkbox.type = "checkbox"; checkbox.className = "task-check";
    checkbox.checked = task.completed; checkbox.setAttribute("aria-label", `Mark ${task.title} complete`);
    checkbox.addEventListener("change", () => updateTask(task.id, { completed: checkbox.checked }));

    const main = document.createElement("div"); main.className = "task-main";
    const title = document.createElement("div"); title.className = "task-title"; title.textContent = task.title;
    main.append(title);
    if (task.description) {
      const desc = document.createElement("p"); desc.className = "task-description";
      desc.textContent = task.description; main.append(desc);
    }
    const meta = document.createElement("div"); meta.className = "task-meta";
    meta.textContent = `Task #${task.id} · ${task.completed ? "Completed" : "In progress"}`;
    main.append(meta);

    const del = document.createElement("button"); del.className = "delete";
    del.type = "button"; del.textContent = "Delete"; del.setAttribute("aria-label", `Delete ${task.title}`);
    del.addEventListener("click", () => deleteTask(task.id));
    card.append(checkbox, main, del); list.append(card);
  }
}

async function loadTasks() {
  try { tasks = await api("/api/tasks"); render(); }
  catch (error) { list.innerHTML = ""; const p = document.createElement("p"); p.className = "empty"; p.textContent = error.message; list.append(p); }
}

form.addEventListener("submit", async event => {
  event.preventDefault(); message.textContent = "";
  try {
    await api("/api/tasks", { method: "POST", body: JSON.stringify({
      title: titleInput.value, description: descriptionInput.value
    }) });
    form.reset(); titleInput.focus(); await loadTasks();
  } catch (error) { message.textContent = error.message; }
});

async function updateTask(id, changes) {
  try { await api(`/api/tasks/${id}`, { method: "PATCH", body: JSON.stringify(changes) }); await loadTasks(); }
  catch (error) { message.textContent = error.message; }
}
async function deleteTask(id) {
  try { await api(`/api/tasks/${id}`, { method: "DELETE" }); await loadTasks(); }
  catch (error) { message.textContent = error.message; }
}
filter.addEventListener("change", render);
loadTasks();

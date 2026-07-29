import { useEffect, useMemo, useState } from "react";

type TaskStatus = "Não iniciada" | "Em andamento" | "Concluída" | "Atrasada";

type Task = {
  id: number;
  code: string;
  name: string;
  discipline: string;
  start: string;
  end: string;
  progress: number;
  predecessor: string;
  status: TaskStatus;
};

const initialTasks: Task[] = [
  { id: 1, code: "1.1", name: "Mobilização e instalações provisórias", discipline: "Gestão", start: "2025-09-08", end: "2025-09-12", progress: 100, predecessor: "-", status: "Concluída" },
  { id: 2, code: "1.2", name: "Demolições e remoções", discipline: "Civil", start: "2025-09-15", end: "2025-09-26", progress: 100, predecessor: "1.1", status: "Concluída" },
  { id: 3, code: "2.1", name: "Infraestrutura elétrica", discipline: "Elétrica", start: "2025-09-29", end: "2025-10-17", progress: 100, predecessor: "1.2", status: "Concluída" },
  { id: 4, code: "2.2", name: "Instalações hidráulicas", discipline: "Hidráulica", start: "2025-09-29", end: "2025-10-17", progress: 100, predecessor: "1.2", status: "Concluída" },
  { id: 5, code: "3.1", name: "Forros e divisórias", discipline: "Arquitetura", start: "2025-10-20", end: "2025-11-07", progress: 100, predecessor: "2.1, 2.2", status: "Concluída" },
  { id: 6, code: "3.2", name: "Pisos e revestimentos", discipline: "Arquitetura", start: "2025-11-03", end: "2025-11-21", progress: 100, predecessor: "3.1", status: "Concluída" },
  { id: 7, code: "4.1", name: "Instalação do ar-condicionado UE01", discipline: "Climatização", start: "2025-11-17", end: "2025-12-12", progress: 92, predecessor: "3.1", status: "Atrasada" },
  { id: 8, code: "4.2", name: "Comunicação visual", discipline: "Comunicação visual", start: "2025-12-01", end: "2025-12-10", progress: 100, predecessor: "3.2", status: "Concluída" },
  { id: 9, code: "5.1", name: "Testes integrados e comissionamento", discipline: "Comissionamento", start: "2025-12-08", end: "2025-12-15", progress: 90, predecessor: "4.1, 4.2", status: "Em andamento" },
  { id: 10, code: "5.2", name: "Punch list e entrega", discipline: "Gestão", start: "2025-12-12", end: "2025-12-16", progress: 85, predecessor: "5.1", status: "Em andamento" },
];

const emptyTask: Omit<Task, "id"> = {
  code: "",
  name: "",
  discipline: "Civil",
  start: "",
  end: "",
  progress: 0,
  predecessor: "",
  status: "Não iniciada",
};

function formatDate(value: string) {
  if (!value) return "-";
  return new Intl.DateTimeFormat("pt-BR", { timeZone: "UTC" }).format(new Date(`${value}T00:00:00Z`));
}

function csvEscape(value: string | number) {
  const text = String(value ?? "");
  return `"${text.replaceAll('"', '""')}"`;
}

export function ScheduleModule() {
  const [tasks, setTasks] = useState<Task[]>(() => {
    const saved = localStorage.getItem("cmsplan.schedule.tasks");
    return saved ? JSON.parse(saved) : initialTasks;
  });
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("Todos");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState<Omit<Task, "id">>(emptyTask);

  useEffect(() => {
    localStorage.setItem("cmsplan.schedule.tasks", JSON.stringify(tasks));
  }, [tasks]);

  const filteredTasks = useMemo(() => {
    const term = search.trim().toLowerCase();
    return tasks.filter((task) => {
      const matchesSearch =
        !term ||
        task.code.toLowerCase().includes(term) ||
        task.name.toLowerCase().includes(term) ||
        task.discipline.toLowerCase().includes(term);
      const matchesStatus = statusFilter === "Todos" || task.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [tasks, search, statusFilter]);

  const summary = useMemo(() => {
    const total = tasks.length;
    const completed = tasks.filter((task) => task.status === "Concluída").length;
    const delayed = tasks.filter((task) => task.status === "Atrasada").length;
    const average = total
      ? Math.round(tasks.reduce((acc, task) => acc + task.progress, 0) / total)
      : 0;
    return { total, completed, delayed, average };
  }, [tasks]);

  function openNewTask() {
    setEditingId(null);
    setForm(emptyTask);
    setIsFormOpen(true);
  }

  function openEditTask(task: Task) {
    const { id, ...rest } = task;
    setEditingId(id);
    setForm(rest);
    setIsFormOpen(true);
  }

  function saveTask(event: React.FormEvent) {
    event.preventDefault();

    if (!form.code.trim() || !form.name.trim() || !form.start || !form.end) {
      alert("Preencha código, atividade, início e término.");
      return;
    }

    if (new Date(form.end) < new Date(form.start)) {
      alert("A data de término não pode ser anterior ao início.");
      return;
    }

    if (editingId !== null) {
      setTasks((current) =>
        current.map((task) => (task.id === editingId ? { ...form, id: editingId } : task))
      );
    } else {
      const nextId = tasks.length ? Math.max(...tasks.map((task) => task.id)) + 1 : 1;
      setTasks((current) => [...current, { ...form, id: nextId }]);
    }

    setIsFormOpen(false);
  }

  function deleteTask(id: number) {
    if (window.confirm("Excluir esta atividade do cronograma?")) {
      setTasks((current) => current.filter((task) => task.id !== id));
    }
  }

  function resetSchedule() {
    if (window.confirm("Restaurar o cronograma demonstrativo original?")) {
      setTasks(initialTasks);
    }
  }

  function exportCsv() {
    const header = ["Código", "Atividade", "Disciplina", "Início", "Término", "Progresso", "Predecessora", "Status"];
    const rows = tasks.map((task) => [
      task.code,
      task.name,
      task.discipline,
      task.start,
      task.end,
      `${task.progress}%`,
      task.predecessor,
      task.status,
    ]);

    const csv = [header, ...rows]
      .map((row) => row.map(csvEscape).join(";"))
      .join("\n");

    const blob = new Blob(["\ufeff" + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "CMSPlan_Cronograma.csv";
    link.click();
    URL.revokeObjectURL(url);
  }

  return (
    <section className="schedule-module">
      <div className="module-header schedule-module-header">
        <div>
          <span>CMSPLAN · PLANEJAMENTO</span>
          <h1>Cronograma executivo</h1>
          <p>Cadastro, edição, filtro e exportação das atividades da obra.</p>
        </div>

        <div className="module-actions">
          <button type="button" className="secondary-button" onClick={resetSchedule}>
            <i className="fa-solid fa-rotate-left" />
            Restaurar
          </button>
          <button type="button" className="secondary-button" onClick={exportCsv}>
            <i className="fa-solid fa-file-csv" />
            Exportar CSV
          </button>
          <button type="button" className="primary-button" onClick={openNewTask}>
            <i className="fa-solid fa-plus" />
            Nova atividade
          </button>
        </div>
      </div>

      <div className="schedule-summary">
        <article>
          <span>Total de atividades</span>
          <strong>{summary.total}</strong>
        </article>
        <article>
          <span>Concluídas</span>
          <strong>{summary.completed}</strong>
        </article>
        <article>
          <span>Progresso médio</span>
          <strong>{summary.average}%</strong>
        </article>
        <article className={summary.delayed > 0 ? "danger" : ""}>
          <span>Atividades atrasadas</span>
          <strong>{summary.delayed}</strong>
        </article>
      </div>

      <div className="schedule-toolbar">
        <label className="schedule-search">
          <i className="fa-solid fa-magnifying-glass" />
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Buscar por código, atividade ou disciplina"
          />
        </label>

        <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}>
          <option>Todos</option>
          <option>Não iniciada</option>
          <option>Em andamento</option>
          <option>Concluída</option>
          <option>Atrasada</option>
        </select>

        <span className="results-count">{filteredTasks.length} atividade(s)</span>
      </div>

      <div className="schedule-table-shell">
        <table className="schedule-table">
          <thead>
            <tr>
              <th>Código</th>
              <th>Atividade</th>
              <th>Disciplina</th>
              <th>Início</th>
              <th>Término</th>
              <th>Progresso</th>
              <th>Status</th>
              <th aria-label="Ações" />
            </tr>
          </thead>
          <tbody>
            {filteredTasks.map((task) => (
              <tr key={task.id}>
                <td><b>{task.code}</b></td>
                <td>
                  <strong>{task.name}</strong>
                  <small>Predecessora: {task.predecessor || "-"}</small>
                </td>
                <td>{task.discipline}</td>
                <td>{formatDate(task.start)}</td>
                <td>{formatDate(task.end)}</td>
                <td>
                  <div className="table-progress">
                    <span style={{ width: `${task.progress}%` }} />
                  </div>
                  <small>{task.progress}%</small>
                </td>
                <td>
                  <span className={`task-status ${task.status.toLowerCase().replaceAll(" ", "-").normalize("NFD").replace(/[\u0300-\u036f]/g, "")}`}>
                    {task.status}
                  </span>
                </td>
                <td>
                  <div className="row-actions">
                    <button type="button" title="Editar" onClick={() => openEditTask(task)}>
                      <i className="fa-solid fa-pen" />
                    </button>
                    <button type="button" title="Excluir" onClick={() => deleteTask(task.id)}>
                      <i className="fa-solid fa-trash" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}

            {filteredTasks.length === 0 && (
              <tr>
                <td colSpan={8} className="empty-table">
                  Nenhuma atividade encontrada.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {isFormOpen && (
        <div className="modal-backdrop" onMouseDown={() => setIsFormOpen(false)}>
          <form
            className="task-modal"
            onSubmit={saveTask}
            onMouseDown={(event) => event.stopPropagation()}
          >
            <div className="task-modal-header">
              <div>
                <span>CRONOGRAMA</span>
                <h2>{editingId !== null ? "Editar atividade" : "Nova atividade"}</h2>
              </div>
              <button type="button" onClick={() => setIsFormOpen(false)}>
                <i className="fa-solid fa-xmark" />
              </button>
            </div>

            <div className="task-form-grid">
              <label>
                Código
                <input value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} placeholder="Ex.: 2.3" />
              </label>

              <label className="span-2">
                Atividade
                <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Descrição da atividade" />
              </label>

              <label>
                Disciplina
                <select value={form.discipline} onChange={(e) => setForm({ ...form, discipline: e.target.value })}>
                  <option>Gestão</option>
                  <option>Civil</option>
                  <option>Arquitetura</option>
                  <option>Elétrica</option>
                  <option>Hidráulica</option>
                  <option>Climatização</option>
                  <option>Comunicação visual</option>
                  <option>Comissionamento</option>
                </select>
              </label>

              <label>
                Início
                <input type="date" value={form.start} onChange={(e) => setForm({ ...form, start: e.target.value })} />
              </label>

              <label>
                Término
                <input type="date" value={form.end} onChange={(e) => setForm({ ...form, end: e.target.value })} />
              </label>

              <label>
                Progresso
                <input type="number" min="0" max="100" value={form.progress} onChange={(e) => setForm({ ...form, progress: Number(e.target.value) })} />
              </label>

              <label>
                Predecessora
                <input value={form.predecessor} onChange={(e) => setForm({ ...form, predecessor: e.target.value })} placeholder="Ex.: 2.1" />
              </label>

              <label>
                Status
                <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value as TaskStatus })}>
                  <option>Não iniciada</option>
                  <option>Em andamento</option>
                  <option>Concluída</option>
                  <option>Atrasada</option>
                </select>
              </label>
            </div>

            <div className="task-modal-footer">
              <button type="button" className="secondary-button" onClick={() => setIsFormOpen(false)}>
                Cancelar
              </button>
              <button type="submit" className="primary-button">
                <i className="fa-solid fa-check" />
                Salvar atividade
              </button>
            </div>
          </form>
        </div>
      )}
    </section>
  );
}

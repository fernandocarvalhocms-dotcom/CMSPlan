import { useState } from "react";
import { Sidebar } from "./components/Sidebar";
import { KpiCard } from "./components/KpiCard";
import { CurveChart } from "./components/CurveChart";
import { DisciplineBars } from "./components/DisciplineBars";
import { Timeline } from "./components/Timeline";
import { Alerts } from "./components/Alerts";
import { AIPanel } from "./components/AIPanel";
import { PrintReport } from "./components/PrintReport";
import { ScheduleModule } from "./components/ScheduleModule";
import { project } from "./data/project";

const labels: Record<string, string> = {
  dashboard: "Visão executiva",
  projects: "Obras",
  schedule: "Cronograma",
  balance: "Linha de balanço",
  lean: "Lean / Lookahead",
  cost: "Custos e valor agregado",
  risk: "Riscos",
  report: "Relatórios",
  ai: "CMS Intelligence",
};

function Placeholder({ title }: { title: string }) {
  return (
    <section className="module-shell">
      <span>CMSPLAN</span>
      <h2>{title}</h2>
      <p>
        Módulo preparado para receber os dados e recursos funcionais nas próximas versões.
      </p>
    </section>
  );
}

export default function App() {
  const [active, setActive] = useState("dashboard");

  return (
    <>
      <div className="app">
        <Sidebar active={active} onChange={setActive} />

        <main className="main-area">
          <header className="topbar">
            <div className="breadcrumb">
              <span>Portfólio</span>
              <i className="fa-solid fa-chevron-right" />
              <b>
                {project.code} · {project.name}
              </b>
            </div>

            <div className="topbar-actions">
              <label className="global-search">
                <i className="fa-solid fa-magnifying-glass" />
                <input placeholder="Buscar obra, relatório ou pendência" />
              </label>

              <button type="button" className="project-selector">
                <span>
                  <small>OBRA ATUAL</small>
                  <strong>{project.name}</strong>
                </span>
                <i className="fa-solid fa-chevron-down" />
              </button>

              <button type="button" className="notification-button" aria-label="Notificações">
                <i className="fa-regular fa-bell" />
                <span>2</span>
              </button>

              <button type="button" className="print-button" onClick={() => window.print()}>
                <i className="fa-solid fa-print" />
                Relatório A4
              </button>
            </div>
          </header>

          {active === "dashboard" ? (
            <div className="content">
              <section className="hero">
                <div>
                  <span>{project.client} · Semana 14</span>
                  <h1>
                    {project.code} · {project.name}
                  </h1>
                  <p>Centro de comando executivo · {project.period}</p>

                  <div className="hero-meta">
                    <span><i className="fa-solid fa-location-dot" /> Boituva, SP</span>
                    <span><i className="fa-solid fa-user-tie" /> Gerente responsável</span>
                    <span><i className="fa-solid fa-calendar-check" /> Inauguração {project.inauguration}</span>
                  </div>
                </div>

                <div className="hero-status">
                  <span>STATUS GERAL</span>
                  <b><i className="fa-solid fa-circle-check" /> LOJA PRONTA</b>
                  <small>Operação liberada para inauguração</small>
                </div>
              </section>

              <div className="section-heading">
                <div>
                  <span>INDICADORES DA SEMANA</span>
                  <h2>Desempenho consolidado</h2>
                </div>
                <button type="button"><i className="fa-solid fa-sliders" /> Personalizar</button>
              </div>

              <section className="kpi-grid">
                <KpiCard label="AVANÇO FÍSICO" value="100%" caption="Planejado 100%" status="good" delta="Concluído" />
                <KpiCard label="PPC" value="100%" caption="Meta ≥ 85%" status="good" delta="+8 p.p." />
                <KpiCard label="IRR" value="100%" caption="Restrições removidas" status="good" />
                <KpiCard label="EFETIVO" value="43" caption="colaboradores no período" />
                <KpiCard label="SPI" value="1,00" caption="Desempenho de prazo" status="good" />
                <KpiCard label="RISCO PRINCIPAL" value="UE01" caption="Ar-condicionado" status="warn" delta="Ação aberta" />
              </section>

              <section className="layout">
                <CurveChart />
                <AIPanel />
              </section>

              <section className="layout equal">
                <DisciplineBars />
                <Alerts />
              </section>

              <Timeline />

              <div className="source-note">
                Base do protótipo: Relatório Semanal nº 14 · RNR-00579 Boituva.
              </div>
            </div>
          ) : active === "schedule" ? (
            <div className="content">
              <ScheduleModule />
            </div>
          ) : (
            <div className="content">
              <div className="module-title">
                <span>CMSPLAN</span>
                <h1>{labels[active]}</h1>
              </div>
              <Placeholder title={labels[active]} />
            </div>
          )}
        </main>
      </div>

      <PrintReport />
    </>
  );
}

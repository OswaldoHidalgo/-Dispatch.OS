'use client';

import { useState, useEffect } from 'react';

interface Application {
  id: string;
  company_name: string;
  job_title: string;
  recipient_email: string;
  created_at: string;
  contract_type?: string;
  duration?: string;
  role_category?: string;
}

interface Opportunity {
  companyName: string;
  jobTitle: string;
  recipientEmail: string;
  contactName: string;
  contractType: string;
  duration: string;
  roleCategory: string;
  seniority: string;
  languageMode: string;
  templateType: string;
}

export default function Home() {
  const [templateType, setTemplateType] = useState('design-systems');
  const [companyName, setCompanyName] = useState('');
  const [jobTitle, setJobTitle] = useState('');
  const [recipientEmail, setRecipientEmail] = useState('');
  const [contactName, setContactName] = useState('');
  const [portfolioUrl, setPortfolioUrl] = useState('https://oswaldohidalgo.com');
  
  const [terminalLogs, setTerminalLogs] = useState<string[]>([]);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [applications, setApplications] = useState<Application[]>([]);
  const [radarOpportunities, setRadarOpportunities] = useState<Opportunity[]>([]);
  const [loadingRadar, setLoadingRadar] = useState(false);

  const addLog = (msg: string) => {
    const timestamp = new Date().toTimeString().split(' ')[0];
    setTerminalLogs((prev) => [...prev, `[${timestamp}] ${msg}`]);
  };

  const fetchApplications = async () => {
    try {
      const res = await fetch('/api/applications');
      const data = await res.json();
      if (data.applications) {
        setApplications(data.applications);
      }
    } catch (e) {
      console.error('Error fetching applications', e);
    }
  };

  const fetchRadar = async () => {
    setLoadingRadar(true);
    addLog('ESCANEANDO RED GLOBAL DE EMPLEO (REMOTO / ESPAÑOL / INGLÉS A2)...');
    try {
      const res = await fetch('/api/radar/scan');
      const data = await res.json();
      if (data.opportunities) {
        setRadarOpportunities(data.opportunities);
        addLog(`RADAR ACTUALIZADO: ${data.opportunities.length} OPORTUNIDADES ENCONTRADAS.`);
      }
    } catch (e) {
      addLog('ERROR AL ESCANEAR EL RADAR GLOBAL.');
    } finally {
      setLoadingRadar(false);
    }
  };

  useEffect(() => {
    fetchApplications();
    fetchRadar();
  }, []);

  const handleDispatch = async (e?: React.FormEvent, customData?: Opportunity) => {
    if (e) e.preventDefault();

    const targetCompany = customData ? customData.companyName : companyName;
    const targetRole = customData ? customData.jobTitle : jobTitle;
    const targetEmail = customData ? customData.recipientEmail : recipientEmail;
    const targetContact = customData ? customData.contactName : contactName;
    const targetTemplate = customData ? customData.templateType : templateType;

    if (!targetEmail || !targetCompany || !targetRole) {
      alert('Por favor complete los campos obligatorios de la postulación.');
      return;
    }

    setStatusMessage(`INICIANDO DISPACH: ${targetCompany.toUpperCase()}`);
    addLog('INICIANDO PROTOCOLO DE DESPACHO...');
    addLog(`OBJETIVO: ${targetCompany}`);
    addLog(`PLANTILLA: ${targetTemplate.toUpperCase()}`);
    addLog('CONECTANDO A GMAIL API OAUTH2...');

    try {
      const res = await fetch('/api/apply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          recipientEmail: targetEmail,
          companyName: targetCompany,
          jobTitle: targetRole,
          contactName: targetContact,
          portfolioUrl,
          templateType: targetTemplate,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        addLog(`RESPUESTA SERVIDOR: ${res.status} OK`);
        addLog(`MESSAGE_ID: ${data.messageId || 'SENT'}`);
        addLog('PERSISTIENDO REGISTRO EN SUPABASE CLOUD DB...');
        setStatusMessage(`POSTULACION DESPACHADA Y REGISTRADA: ${targetCompany.toUpperCase()}`);
        fetchApplications();
      } else {
        addLog(`ERROR SERVIDOR: ${data.error || 'Falla en despacho'}`);
        setStatusMessage(`ERROR: ${data.error}`);
      }
    } catch (err: any) {
      addLog(`EXCEPCIÓN: ${err.message}`);
      setStatusMessage('ERROR DE CONEXIÓN CON EL SERVIDOR');
    }
  };

  const purgeLogs = async () => {
    setApplications([]);
    addLog('REGISTROS LOCALES LIMPIADOS.');
  };

  return (
    <main className="min-h-screen bg-[#0a0a0a] text-[#ededed] p-6 font-mono selection:bg-[#00ffd5] selection:text-black">
      {/* HEADER */}
      <header className="max-w-7xl mx-auto mb-8 flex flex-col md:flex-row justify-between items-start md:items-center border-b border-[#222] pb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-widest flex items-center gap-2">
            <span className="inline-block w-3 h-3 bg-[#00ffd5] rounded-full animate-pulse"></span>
            DISPATCH.OS
          </h1>
          <p className="text-xs text-[#777] tracking-wider mt-1">
            AUTOMATED OUTREACH, CONSULTING & PROSPECTION PROTOCOL // GMAIL + SUPABASE ENGINE
          </p>
        </div>
        <div className="flex items-center gap-3 bg-[#141414] border border-[#262626] px-4 py-2 rounded-lg text-xs">
          <span className="text-[#888]">DATABASE:</span>
          <span className="text-[#00ffd5] font-semibold flex items-center gap-1">
            SUPABASE POSTGRESQL (CLOUD) ✓
          </span>
        </div>
      </header>

      {/* GRID LAYOUT PRINCIPAL */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* COLUMNA [01] MANUAL LAUNCH PARAMETERS */}
        <section className="bg-[#111] border border-[#222] rounded-xl p-6 flex flex-col justify-between shadow-2xl relative overflow-hidden">
          <div>
            <div className="flex justify-between items-center mb-6 border-b border-[#222] pb-3">
              <span className="text-xs tracking-widest text-[#00ffd5] font-bold">[01] MANUAL LAUNCH PARAMETERS</span>
              <span className="text-[10px] bg-[#1a1a1a] text-[#888] px-2 py-1 rounded border border-[#333]">POST /API/APPLY</span>
            </div>

            {statusMessage && (
              <div className="mb-6 p-3 bg-[#0d1f1a] border border-[#00ffd5]/40 text-[#00ffd5] text-xs rounded-lg tracking-wide">
                ● {statusMessage}
              </div>
            )}

            <form onSubmit={(e) => handleDispatch(e)} className="space-y-4">
              <div>
                <label className="block text-[10px] text-[#888] uppercase tracking-widest mb-2">Template Narrative Profile</label>
                <select
                  value={templateType}
                  onChange={(e) => setTemplateType(e.target.value)}
                  className="w-full bg-[#161616] border border-[#2a2a2a] rounded-lg px-3 py-2 text-xs text-[#ededed] focus:border-[#00ffd5] outline-none transition"
                >
                  <option value="design-systems">Senior Product Designer & Design Systems (SaaS Focus)</option>
                  <option value="frontend">Frontend Engineer (Next.js, React, Tailwind, TypeScript)</option>
                  <option value="consulting">Consultor de Producto & Arquitectura Digital (Retainer/Project)</option>
                </select>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] text-[#888] uppercase tracking-widest mb-2">Company Target *</label>
                  <input
                    type="text"
                    required
                    placeholder="Stripe, Vercel, Banesco..."
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    className="w-full bg-[#161616] border border-[#2a2a2a] rounded-lg px-3 py-2 text-xs text-[#ededed] focus:border-[#00ffd5] outline-none transition"
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-[#888] uppercase tracking-widest mb-2">Target Role *</label>
                  <input
                    type="text"
                    required
                    placeholder="Senior Product Designer / Consultor"
                    value={jobTitle}
                    onChange={(e) => setJobTitle(e.target.value)}
                    className="w-full bg-[#161616] border border-[#2a2a2a] rounded-lg px-3 py-2 text-xs text-[#ededed] focus:border-[#00ffd5] outline-none transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] text-[#888] uppercase tracking-widest mb-2">Destination Email *</label>
                <input
                  type="email"
                  required
                  placeholder="careers@company.com"
                  value={recipientEmail}
                  onChange={(e) => setRecipientEmail(e.target.value)}
                  className="w-full bg-[#161616] border border-[#2a2a2a] rounded-lg px-3 py-2 text-xs text-[#ededed] focus:border-[#00ffd5] outline-none transition"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] text-[#888] uppercase tracking-widest mb-2">Contact Name</label>
                  <input
                    type="text"
                    placeholder="Sarah o Recruiter"
                    value={contactName}
                    onChange={(e) => setContactName(e.target.value)}
                    className="w-full bg-[#161616] border border-[#2a2a2a] rounded-lg px-3 py-2 text-xs text-[#ededed] focus:border-[#00ffd5] outline-none transition"
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-[#888] uppercase tracking-widest mb-2">Portfolio Endpoint</label>
                  <input
                    type="text"
                    value={portfolioUrl}
                    onChange={(e) => setPortfolioUrl(e.target.value)}
                    className="w-full bg-[#161616] border border-[#2a2a2a] rounded-lg px-3 py-2 text-xs text-[#ededed] focus:border-[#00ffd5] outline-none transition"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full mt-4 bg-[#00ffd5] hover:bg-[#00cca8] text-black font-bold tracking-wider py-3 rounded-lg text-xs transition duration-200 shadow-lg shadow-[#00ffd5]/10 cursor-pointer"
              >
                SEND APPLICATION // DISPATCH →
              </button>
            </form>
          </div>

          {/* TERMINAL FEED */}
          <div className="mt-6 bg-[#070707] border border-[#222] rounded-lg p-3 h-36 overflow-y-auto text-[11px] font-mono text-[#00ffd5] flex flex-col justify-end">
            <div className="text-[#555] mb-1">LIVE TERMINAL FEED</div>
            {terminalLogs.map((log, index) => (
              <div key={index} className="leading-tight py-0.5">{log}</div>
            ))}
          </div>
        </section>

        {/* COLUMNA [02] SUPABASE CLOUD LOG & [03] GLOBAL RADAR */}
        <div className="space-y-8">
          
          {/* [03] GLOBAL TALENT & CONSULTING RADAR */}
          <section className="bg-[#111] border border-[#222] rounded-xl p-6 shadow-2xl">
            <div className="flex justify-between items-center mb-4 border-b border-[#222] pb-3">
              <span className="text-xs tracking-widest text-[#00ffd5] font-bold">[03] GLOBAL TALENT & CONSULTING RADAR</span>
              <button 
                onClick={fetchRadar}
                className="text-[10px] bg-[#1a1a1a] hover:bg-[#222] text-[#00ffd5] px-3 py-1 rounded border border-[#333] cursor-pointer"
              >
                {loadingRadar ? 'SCANNING...' : 'REFRESH RADAR'}
              </button>
            </div>
            <p className="text-[11px] text-[#777] mb-4">
              Búsqueda automatizada (Remoto Global, Latam, España, Inglés A2 / Español) • Todo nivel y contrato.
            </p>

            <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
              {radarOpportunities.length === 0 ? (
                <div className="text-center py-6 text-xs text-[#666]">No hay oportunidades cargadas en este momento.</div>
              ) : (
                radarOpportunities.map((op, idx) => (
                  <div key={idx} className="bg-[#161616] border border-[#262626] p-3 rounded-lg hover:border-[#00ffd5]/50 transition flex flex-col gap-2">
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="text-xs font-bold text-[#ededed]">{op.companyName}</span>
                        <div className="text-[11px] text-[#00ffd5]">{op.jobTitle}</div>
                      </div>
                      <div className="flex gap-1">
                        <span className="text-[9px] bg-[#222] text-[#aaa] px-2 py-0.5 rounded uppercase">{op.contractType}</span>
                        <span className="text-[9px] bg-[#0d1f1a] text-[#00ffd5] px-2 py-0.5 rounded uppercase">{op.languageMode}</span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center text-[10px] text-[#888] pt-2 border-t border-[#222]">
                      <span>Duración: {op.duration} | Seniority: {op.seniority}</span>
                      <button
                        onClick={() => handleDispatch(undefined, op)}
                        className="bg-[#00ffd5]/10 hover:bg-[#00ffd5] text-[#00ffd5] hover:text-black font-bold px-3 py-1 rounded transition cursor-pointer"
                      >
                        DISPATCH →
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </section>

          {/* [02] SUPABASE CLOUD LOG */}
          <section className="bg-[#111] border border-[#222] rounded-xl p-6 shadow-2xl">
            <div className="flex justify-between items-center mb-4 border-b border-[#222] pb-3">
              <span className="text-xs tracking-widest text-[#00ffd5] font-bold">
                [02] SUPABASE CLOUD LOG ({applications.length})
              </span>
              <button
                onClick={purgeLogs}
                className="text-[10px] text-[#888] hover:text-[#ff5555] uppercase tracking-wider cursor-pointer"
              >
                Purge Logs
              </button>
            </div>

            <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
              {applications.length === 0 ? (
                <div className="text-center py-8 text-xs text-[#555] border border-dashed border-[#222] rounded-lg">
                  NO ACTIVE TRANSMISSIONS IN DB
                </div>
              ) : (
                applications.map((app) => (
                  <div
                    key={app.id}
                    className="bg-[#161616] border border-[#262626] p-3 rounded-lg flex justify-between items-center text-xs"
                  >
                    <div>
                      <div className="font-bold text-[#ededed]">{app.company_name}</div>
                      <div className="text-[11px] text-[#aaa]">{app.job_title}</div>
                      <div className="text-[10px] text-[#666] mt-1">{app.recipient_email}</div>
                    </div>
                    <div className="text-right flex flex-col items-end gap-1">
                      <span className="bg-[#0d1f1a] text-[#00ffd5] text-[9px] px-2 py-0.5 rounded font-bold border border-[#00ffd5]/20">
                        DELIVERED
                      </span>
                      <span className="text-[10px] text-[#666]">
                        {new Date(app.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </section>

        </div>
      </div>

      {/* FOOTER */}
      <footer className="max-w-7xl mx-auto mt-12 border-t border-[#222] pt-4 flex justify-between items-center text-[11px] text-[#555]">
        <div>UX/UI SYSTEM // OSWALDO HIDALGO</div>
        <div>DATABASE: SUPABASE POSTGRESQL (CLOUD SYNC)</div>
      </footer>
    </main>
  );
}
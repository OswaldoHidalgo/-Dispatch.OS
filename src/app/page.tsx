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
  const [targetUrl, setTargetUrl] = useState('');
  
  const [terminalLogs, setTerminalLogs] = useState<string[]>([]);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [applications, setApplications] = useState<Application[]>([]);
  const [radarOpportunities, setRadarOpportunities] = useState<Opportunity[]>([]);
  const [loadingRadar, setLoadingRadar] = useState(false);
  const [loadingUrl, setLoadingUrl] = useState(false);

  const addLog = (msg: string) => {
    const timestamp = new Date().toTimeString().split(' ')[0];
    setTerminalLogs((prev) => [...prev, `[${timestamp}] ${msg}`]);
  };

  const fetchApplications = async () => {
    try {
      const res = await fetch('/api/applications');
      const data = await res.json();
      if (data.applications) setApplications(data.applications);
    } catch (e) {
      console.error(e);
    }
  };

  const fetchRadar = async () => {
    setLoadingRadar(true);
    addLog('ESCANEANDO RADAR GLOBAL EN TIEMPO REAL...');
    try {
      const res = await fetch('/api/radar/scan');
      const data = await res.json();
      if (data.opportunities) {
        setRadarOpportunities(data.opportunities);
        addLog(`RADAR ACTUALIZADO: ${data.opportunities.length} OPORTUNIDADES.`);
      }
    } catch (e) {
      addLog('ERROR AL ESCANEAR EL RADAR.');
    } finally {
      setLoadingRadar(false);
    }
  };

  useEffect(() => {
    fetchApplications();
    fetchRadar();
  }, []);

  const handleScrapeUrl = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetUrl) return;
    setLoadingUrl(true);
    addLog(`ANALIZANDO ENLACE DE OFERTA: ${targetUrl}`);

    try {
      const res = await fetch('/api/radar/scrape-url', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: targetUrl }),
      });
      const data = await res.json();
      if (res.ok && data.data) {
        setCompanyName(data.data.companyName);
        setJobTitle(data.data.jobTitle);
        setRecipientEmail(data.data.recipientEmail);
        setContactName(data.data.contactName);
        setTemplateType(data.data.templateType);
        addLog('¡ENLACE PROCESADO! DATOS CARGADOS EN EL FORMULARIO MANUAL.');
        setStatusMessage('OFERTA EXTRAÍDA Y LISTA PARA DESPACHO');
      }
    } catch (err) {
      addLog('ERROR AL PROCESAR EL ENLACE.');
    } finally {
      setLoadingUrl(false);
    }
  };

  const handleDispatch = async (e?: React.FormEvent, customData?: Opportunity) => {
    if (e) e.preventDefault();

    const targetCompany = customData ? customData.companyName : companyName;
    const targetRole = customData ? customData.jobTitle : jobTitle;
    const targetEmail = customData ? customData.recipientEmail : recipientEmail;
    const targetContact = customData ? customData.contactName : contactName;
    const targetTemplate = customData ? customData.templateType : templateType;

    if (!targetEmail || !targetCompany || !targetRole) {
      alert('Complete los campos obligatorios.');
      return;
    }

    setStatusMessage(`DESPACHANDO A: ${targetCompany.toUpperCase()}`);
    addLog('INICIANDO PROTOCOLO DE DESPACHO & CV PDF ADJUNTO...');
    addLog(`OBJETIVO: ${targetCompany}`);

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
        addLog(`RESPUESTA 200 OK — ID: ${data.messageId}`);
        addLog('CV ADAPTADO Y REGISTRADO EN SUPABASE CLOUD.');
        setStatusMessage(`POSTULACIÓN ENVIADA CON ÉXITO: ${targetCompany}`);
        fetchApplications();
      } else {
        addLog(`ERROR: ${data.error}`);
        setStatusMessage(`ERROR: ${data.error}`);
      }
    } catch (err: any) {
      addLog(`EXCEPCIÓN: ${err.message}`);
    }
  };

  return (
    <main className="min-h-screen bg-[#0a0a0a] text-[#ededed] p-6 font-mono selection:bg-[#00ffd5] selection:text-black">
      {/* HEADER */}
      <header className="max-w-7xl mx-auto mb-8 flex flex-col md:flex-row justify-between items-start md:items-center border-b border-[#222] pb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-widest flex items-center gap-2">
            <span className="inline-block w-3 h-3 bg-[#00ffd5] rounded-full animate-pulse"></span>
            DISPATCH.OS // MASTER AGENT
          </h1>
          <p className="text-xs text-[#777] tracking-wider mt-1">
            AUTONOMOUS PROSPECTION & DYNAMIC CV PDF ADAPTER // GMAIL + SUPABASE
          </p>
        </div>
        <div className="flex items-center gap-3 bg-[#141414] border border-[#262626] px-4 py-2 rounded-lg text-xs">
          <span className="text-[#888]">DATABASE:</span>
          <span className="text-[#00ffd5] font-semibold">SUPABASE CLOUD SYNC ✓</span>
        </div>
      </header>

      {/* SCRAPER DE URLS BAJO DEMANDA */}
      <div className="max-w-7xl mx-auto mb-8 bg-[#111] border border-[#222] rounded-xl p-4 shadow-xl">
        <form onSubmit={handleScrapeUrl} className="flex flex-col md:flex-row gap-3 items-center">
          <div className="flex-1 w-full">
            <label className="block text-[10px] text-[#00ffd5] uppercase tracking-widest mb-1">Scraper de Enlaces (Pegar URL de oferta LinkedIn / Web)</label>
            <input
              type="url"
              placeholder="https://www.linkedin.com/jobs/view/..."
              value={targetUrl}
              onChange={(e) => setTargetUrl(e.target.value)}
              className="w-full bg-[#161616] border border-[#2a2a2a] rounded-lg px-3 py-2 text-xs text-[#ededed] focus:border-[#00ffd5] outline-none"
            />
          </div>
          <button
            type="submit"
            className="w-full md:w-auto mt-5 bg-[#222] hover:bg-[#333] text-[#00ffd5] border border-[#00ffd5]/30 font-bold px-6 py-2 rounded-lg text-xs transition cursor-pointer"
          >
            {loadingUrl ? 'ANALIZANDO...' : 'EXTRAER & AUTO-LLENAR →'}
          </button>
        </form>
      </div>

      {/* GRID PRINCIPAL */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* COLUMNA [01] LAUNCH PARAMETERS */}
        <section className="bg-[#111] border border-[#222] rounded-xl p-6 flex flex-col justify-between shadow-2xl">
          <div>
            <div className="flex justify-between items-center mb-6 border-b border-[#222] pb-3">
              <span className="text-xs tracking-widest text-[#00ffd5] font-bold">[01] LAUNCH PARAMETERS & CV ADAPTER</span>
              <span className="text-[10px] bg-[#1a1a1a] text-[#888] px-2 py-1 rounded border border-[#333]">CV MAESTRO ACTIVO</span>
            </div>

            {statusMessage && (
              <div className="mb-6 p-3 bg-[#0d1f1a] border border-[#00ffd5]/40 text-[#00ffd5] text-xs rounded-lg">
                ● {statusMessage}
              </div>
            )}

            <form onSubmit={(e) => handleDispatch(e)} className="space-y-4">
              <div>
                <label className="block text-[10px] text-[#888] uppercase tracking-widest mb-2">Plantilla & Enfoque CV</label>
                <select
                  value={templateType}
                  onChange={(e) => setTemplateType(e.target.value)}
                  className="w-full bg-[#161616] border border-[#2a2a2a] rounded-lg px-3 py-2 text-xs text-[#ededed] focus:border-[#00ffd5] outline-none"
                >
                  <option value="design-systems">Design Systems & Product Design (OneMeta / Stripe Focus)</option>
                  <option value="frontend">Frontend Architecture & UI Engineer (React / Next.js)</option>
                  <option value="consulting">Consultoría Estratégica & Producción (Retainer / Multi-moneda)</option>
                </select>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] text-[#888] uppercase tracking-widest mb-2">Company Target *</label>
                  <input
                    type="text"
                    required
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    placeholder="Nubank, Vercel..."
                    className="w-full bg-[#161616] border border-[#2a2a2a] rounded-lg px-3 py-2 text-xs text-[#ededed] focus:border-[#00ffd5] outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-[#888] uppercase tracking-widest mb-2">Target Role *</label>
                  <input
                    type="text"
                    required
                    value={jobTitle}
                    onChange={(e) => setJobTitle(e.target.value)}
                    placeholder="Senior Product Designer"
                    className="w-full bg-[#161616] border border-[#2a2a2a] rounded-lg px-3 py-2 text-xs text-[#ededed] focus:border-[#00ffd5] outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] text-[#888] uppercase tracking-widest mb-2">Destination Email *</label>
                <input
                  type="email"
                  required
                  value={recipientEmail}
                  onChange={(e) => setRecipientEmail(e.target.value)}
                  placeholder="talent@company.com"
                  className="w-full bg-[#161616] border border-[#2a2a2a] rounded-lg px-3 py-2 text-xs text-[#ededed] focus:border-[#00ffd5] outline-none"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] text-[#888] uppercase tracking-widest mb-2">Contact Name</label>
                  <input
                    type="text"
                    value={contactName}
                    onChange={(e) => setContactName(e.target.value)}
                    placeholder="Camila / Recruiter"
                    className="w-full bg-[#161616] border border-[#2a2a2a] rounded-lg px-3 py-2 text-xs text-[#ededed] focus:border-[#00ffd5] outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-[#888] uppercase tracking-widest mb-2">Portfolio Endpoint</label>
                  <input
                    type="text"
                    value={portfolioUrl}
                    onChange={(e) => setPortfolioUrl(e.target.value)}
                    className="w-full bg-[#161616] border border-[#2a2a2a] rounded-lg px-3 py-2 text-xs text-[#ededed] focus:border-[#00ffd5] outline-none"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full mt-4 bg-[#00ffd5] hover:bg-[#00cca8] text-black font-bold tracking-wider py-3 rounded-lg text-xs transition duration-200 shadow-lg shadow-[#00ffd5]/10 cursor-pointer"
              >
                DISPATCH APPLICATION & ADAPTED CV PDF →
              </button>
            </form>
          </div>

          {/* TERMINAL FEED */}
          <div className="mt-6 bg-[#070707] border border-[#222] rounded-lg p-3 h-32 overflow-y-auto text-[11px] font-mono text-[#00ffd5] flex flex-col justify-end">
            <div className="text-[#555] mb-1">LIVE TERMINAL FEED</div>
            {terminalLogs.map((log, index) => (
              <div key={index} className="leading-tight py-0.5">{log}</div>
            ))}
          </div>
        </section>

        {/* COLUMNA [02] & [03] */}
        <div className="space-y-8">
          
          {/* [03] GLOBAL RADAR */}
          <section className="bg-[#111] border border-[#222] rounded-xl p-6 shadow-2xl">
            <div className="flex justify-between items-center mb-4 border-b border-[#222] pb-3">
              <span className="text-xs tracking-widest text-[#00ffd5] font-bold">[03] GLOBAL PROSPECTION RADAR</span>
              <button 
                onClick={fetchRadar}
                className="text-[10px] bg-[#1a1a1a] hover:bg-[#222] text-[#00ffd5] px-3 py-1 rounded border border-[#333] cursor-pointer"
              >
                {loadingRadar ? 'SCANNING...' : 'REFRESH RADAR'}
              </button>
            </div>
            <p className="text-[11px] text-[#777] mb-4">
              Vacantes en español e inglés A2 (Remoto Global, Contratos, Freelance, Consultorías).
            </p>

            <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
              {radarOpportunities.map((op, idx) => (
                <div key={idx} className="bg-[#161616] border border-[#262626] p-3 rounded-lg hover:border-[#00ffd5]/50 transition flex flex-col gap-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="text-xs font-bold text-[#ededed]">{op.companyName}</span>
                      <div className="text-[11px] text-[#00ffd5]">{op.jobTitle}</div>
                    </div>
                    <span className="text-[9px] bg-[#0d1f1a] text-[#00ffd5] px-2 py-0.5 rounded uppercase">{op.contractType}</span>
                  </div>
                  <div className="flex justify-between items-center text-[10px] text-[#888] pt-2 border-t border-[#222]">
                    <span>Duración: {op.duration}</span>
                    <button
                      onClick={() => handleDispatch(undefined, op)}
                      className="bg-[#00ffd5]/10 hover:bg-[#00ffd5] text-[#00ffd5] hover:text-black font-bold px-3 py-1 rounded transition cursor-pointer"
                    >
                      DISPATCH + CV →
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* [02] SUPABASE CLOUD LOG */}
          <section className="bg-[#111] border border-[#222] rounded-xl p-6 shadow-2xl">
            <div className="flex justify-between items-center mb-4 border-b border-[#222] pb-3">
              <span className="text-xs tracking-widest text-[#00ffd5] font-bold">
                [02] SUPABASE CLOUD LOG ({applications.length})
              </span>
            </div>

            <div className="space-y-3 max-h-56 overflow-y-auto pr-1">
              {applications.length === 0 ? (
                <div className="text-center py-6 text-xs text-[#555] border border-dashed border-[#222] rounded-lg">
                  NO ACTIVE TRANSMISSIONS IN DB
                </div>
              ) : (
                applications.map((app) => (
                  <div key={app.id} className="bg-[#161616] border border-[#262626] p-3 rounded-lg flex justify-between items-center text-xs">
                    <div>
                      <div className="font-bold text-[#ededed]">{app.company_name}</div>
                      <div className="text-[11px] text-[#aaa]">{app.job_title}</div>
                    </div>
                    <div className="text-right">
                      <span className="bg-[#0d1f1a] text-[#00ffd5] text-[9px] px-2 py-0.5 rounded font-bold border border-[#00ffd5]/20">
                        DELIVERED + CV
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </section>

        </div>
      </div>
    </main>
  );
}
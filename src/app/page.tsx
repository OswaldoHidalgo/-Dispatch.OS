'use client';

import { useState, useEffect } from 'react';

interface Application {
  id: string;
  company_name: string;
  job_title: string;
  recipient_email: string;
  created_at: string;
  status?: string;
}

interface Opportunity {
  companyName: string;
  jobTitle: string;
  recipientEmail: string;
  contactName: string;
  contractType: string;
  duration: string;
  matchScore: number;
  templateType: string;
}

export default function Home() {
  const [templateType, setTemplateType] = useState('design-systems');
  const [companyName, setCompanyName] = useState('');
  const [jobTitle, setJobTitle] = useState('');
  const [recipientEmail, setRecipientEmail] = useState('');
  const [contactName, setContactName] = useState('');
  const [portfolioUrl, setPortfolioUrl] = useState('https://www.behance.net/oswaldohidalgo');
  const [targetUrl, setTargetUrl] = useState('');
  
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [applications, setApplications]  = useState<Application[]>([]);
  const [radarOpportunities, setRadarOpportunities] = useState<Opportunity[]>([]);
  const [loadingRadar, setLoadingRadar] = useState(false);
  const [processingAi, setProcessingAi] = useState(false);
  const [activeTab, setActiveTab] = useState<'radar' | 'form' | 'logs'>('radar');

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
    try {
      const res = await fetch('/api/radar/scan');
      const data = await res.json();
      if (data.opportunities) setRadarOpportunities(data.opportunities);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingRadar(false);
    }
  };

  useEffect(() => {
    fetchApplications();
    fetchRadar();
  }, []);

  // Borrado persistente real en Supabase mediante backend
  const handleClearHistory = async () => {
    try {
      const res = await fetch('/api/applications', { method: 'DELETE' });
      if (res.ok) {
        setApplications([]);
        setStatusMessage('Historial de enviados limpiado correctamente de la base de datos.');
      } else {
        setStatusMessage('Error al limpiar el historial en el servidor.');
      }
    } catch (e) {
      setStatusMessage('Error de conexión al limpiar historial.');
    }
  };

  const handleAiAutoFill = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetUrl) return;
    setProcessingAi(true);

    try {
      const res = await fetch('/api/radar/analyze-job', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: targetUrl }),
      });
      const data = await res.json();
      if (res.ok && data.analysis) {
        setJobTitle(data.analysis.jobTitle);
        setTemplateType(data.analysis.templateType);
        setCompanyName('Empresa Externa Global');
        setRecipientEmail('careers@target-company.com');
        setContactName(data.analysis.contactName);
        setStatusMessage(`Match de IA exitoso (${data.analysis.matchScore}% afín).`);
        setActiveTab('form');
      }
    } catch (err) {
      setStatusMessage('Error en el análisis de IA.');
    } finally {
      setProcessingAi(false);
    }
  };

  const handleSelectOpportunity = async (op: Opportunity) => {
    setProcessingAi(true);
    try {
      const res = await fetch('/api/radar/analyze-job', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rawText: op.jobTitle + ' ' + op.companyName }),
      });
      const data = await res.json();
      if (res.ok && data.analysis) {
        setCompanyName(op.companyName);
        setJobTitle(op.jobTitle);
        setRecipientEmail(op.recipientEmail);
        setContactName(op.contactName);
        setTemplateType(data.analysis.templateType);
        setStatusMessage(`Configurado (${data.analysis.matchScore}% Match) para: ${op.companyName}`);
        setActiveTab('form');
      }
    } catch (e) {
      setCompanyName(op.companyName);
      setJobTitle(op.jobTitle);
      setRecipientEmail(op.recipientEmail);
      setContactName(op.contactName);
      setTemplateType(op.templateType);
      setActiveTab('form');
    } finally {
      setProcessingAi(false);
    }
  };

  const handleDispatch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!recipientEmail || !companyName || !jobTitle) return;

    setStatusMessage(`Despachando a ${companyName}...`);

    try {
      const res = await fetch('/api/apply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          recipientEmail,
          companyName,
          jobTitle,
          contactName,
          portfolioUrl,
          templateType,
        }),
      });

      if (res.ok) {
        setStatusMessage(`Enviado con éxito a ${companyName}. CV adjunto entregado.`);
        fetchApplications();
        setActiveTab('logs');
      } else {
        setStatusMessage('Error al despachar el correo.');
      }
    } catch (err: any) {
      setStatusMessage('Error de conexión.');
    }
  };

  const handleFollowUp = async (app: Application) => {
    setStatusMessage(`Enviando follow-up a ${app.company_name}...`);
    try {
      const res = await fetch('/api/apply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          recipientEmail: app.recipient_email,
          companyName: app.company_name,
          jobTitle: `Follow-up: ${app.job_title}`,
          contactName: 'Equipo de Selección',
          portfolioUrl,
          templateType: 'design-systems',
        }),
      });
      if (res.ok) {
        setStatusMessage(`Follow-up enviado a ${app.company_name}.`);
        fetchApplications();
      }
    } catch (e) {
      setStatusMessage('Error al enviar follow-up.');
    }
  };

  return (
    <main className="min-h-screen bg-[#0a0a0a] text-[#ededed] p-3 sm:p-5 md:p-8 font-mono selection:bg-[#00ffd5] selection:text-black overflow-x-hidden">
      
      {/* HEADER RESPONSIVE */}
      <header className="max-w-4xl mx-auto mb-5 flex flex-col sm:flex-row justify-between items-stretch sm:items-center border-b border-[#222] pb-4 gap-3">
        <div>
          <h1 className="text-base sm:text-xl font-bold tracking-widest flex items-center gap-2 break-all">
            <span className="inline-block w-2.5 h-2.5 bg-[#00ffd5] rounded-full animate-pulse shrink-0"></span>
            DISPATCH.OS // MOBILE AGENT
          </h1>
          <p className="text-[9px] sm:text-[10px] text-[#777] tracking-wider mt-0.5">GLOBAL PROSPECTION & 1-PAGE CV ADAPTER</p>
        </div>
        <div className="text-[10px] bg-[#141414] border border-[#262626] px-3 py-2 sm:py-1.5 rounded-md text-[#00ffd5] text-center shrink-0">
          SUPABASE CLOUD SYNC ✓
        </div>
      </header>

      {/* CONTENEDOR PRINCIPAL */}
      <div className="max-w-4xl mx-auto space-y-4 sm:space-y-5">
        
        {/* MÉTRICAS */}
        <div className="grid grid-cols-3 gap-2 sm:gap-3">
          <div className="bg-[#111] border border-[#222] p-2.5 sm:p-3 rounded-xl text-center">
            <div className="text-[9px] sm:text-[10px] text-[#777] uppercase truncate">Enviadas</div>
            <div className="text-sm sm:text-lg font-bold text-[#00ffd5] mt-1">{applications.length}</div>
          </div>
          <div className="bg-[#111] border border-[#222] p-2.5 sm:p-3 rounded-xl text-center">
            <div className="text-[9px] sm:text-[10px] text-[#777] uppercase truncate">Radar Activo</div>
            <div className="text-sm sm:text-lg font-bold text-[#ededed] mt-1">{radarOpportunities.length}</div>
          </div>
          <div className="bg-[#111] border border-[#222] p-2.5 sm:p-3 rounded-xl text-center">
            <div className="text-[9px] sm:text-[10px] text-[#777] uppercase truncate">Match IA</div>
            <div className="text-sm sm:text-lg font-bold text-[#00ffd5] mt-1">98%</div>
          </div>
        </div>

        {/* INPUT URL IA */}
        <div className="bg-[#111] border border-[#222] rounded-xl p-3 sm:p-4 shadow-xl">
          <form onSubmit={handleAiAutoFill} className="flex flex-col sm:flex-row gap-2">
            <input
              type="url"
              placeholder="Pega la URL de la oferta..."
              value={targetUrl}
              onChange={(e) => setTargetUrl(e.target.value)}
              className="w-full bg-[#161616] border border-[#2a2a2a] rounded-lg px-3 py-2.5 text-xs text-[#ededed] focus:border-[#00ffd5] outline-none truncate"
            />
            <button
              type="submit"
              className="w-full sm:w-auto bg-[#00ffd5]/10 hover:bg-[#00ffd5] text-[#00ffd5] hover:text-black border border-[#00ffd5]/30 font-bold px-4 py-2.5 rounded-lg text-xs transition cursor-pointer whitespace-nowrap text-center shrink-0"
            >
              {processingAi ? 'Analizando...' : 'Analizar & Match IA'}
            </button>
          </form>
        </div>

        {/* TABS NAVEGACIÓN */}
        <div className="flex border-b border-[#222] gap-3 sm:gap-6 text-xs overflow-x-auto pb-1 scrollbar-none">
          <button
            onClick={() => setActiveTab('radar')}
            className={`pb-3 border-b-2 font-bold cursor-pointer transition whitespace-nowrap shrink-0 ${activeTab === 'radar' ? 'border-[#00ffd5] text-[#00ffd5]' : 'border-transparent text-[#777] hover:text-[#aaa]'}`}
          >
            [01] Radar ({radarOpportunities.length})
          </button>
          <button
            onClick={() => setActiveTab('form')}
            className={`pb-3 border-b-2 font-bold cursor-pointer transition whitespace-nowrap shrink-0 ${activeTab === 'form' ? 'border-[#00ffd5] text-[#00ffd5]' : 'border-transparent text-[#777] hover:text-[#aaa]'}`}
          >
            [02] Formulario & CV
          </button>
          <button
            onClick={() => setActiveTab('logs')}
            className={`pb-3 border-b-2 font-bold cursor-pointer transition whitespace-nowrap shrink-0 ${activeTab === 'logs' ? 'border-[#00ffd5] text-[#00ffd5]' : 'border-transparent text-[#777] hover:text-[#aaa]'}`}
          >
            [03] Historial & Follow-up ({applications.length})
          </button>
        </div>

        {statusMessage && (
          <div className="p-3 bg-[#0d1f1a] border border-[#00ffd5]/40 text-[#00ffd5] text-xs rounded-lg break-all">
            ● {statusMessage}
          </div>
        )}

        {/* VISTA 1: RADAR */}
        {activeTab === 'radar' && (
          <div className="space-y-3">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center text-xs text-[#777] mb-1 gap-2">
              <span className="truncate">Búsqueda global (Remoto / Español / Global)</span>
              <button 
                onClick={async () => {
                  setLoadingRadar(true);
                  try {
                    const res = await fetch('/api/radar/sync');
                    const data = await res.json();
                    if (data.opportunities) {
                      setRadarOpportunities(data.opportunities);
                      setStatusMessage(`Radar sincronizado: ${data.opportunities.length} ofertas cargadas.`);
                    }
                  } catch (e) {
                    setStatusMessage('Error al sincronizar el radar.');
                  } finally {
                    setLoadingRadar(false);
                  }
                }} 
                className="w-full sm:w-auto bg-[#00ffd5]/10 hover:bg-[#00ffd5] text-[#00ffd5] hover:text-black font-bold px-3 py-2 sm:py-1 rounded transition cursor-pointer text-center"
              >
                {loadingRadar ? 'Sincronizando...' : '⚡ Sincronización Masiva'}
              </button>
            </div>
            {radarOpportunities.length === 0 ? (
              <div className="text-center py-8 text-xs text-[#555] border border-dashed border-[#222] rounded-xl">
                No hay resultados disponibles en este momento.
              </div>
            ) : (
              radarOpportunities.map((op, idx) => (
                <div key={idx} className="bg-[#111] border border-[#222] p-3.5 sm:p-4 rounded-xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 hover:border-[#00ffd5]/40 transition">
                  <div className="w-full sm:w-3/4 overflow-hidden">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-xs font-bold text-[#ededed] truncate max-w-[200px] sm:max-w-xs">{op.companyName}</span>
                      <span className="text-[9px] bg-[#0d1f1a] text-[#00ffd5] px-2 py-0.5 rounded font-bold border border-[#00ffd5]/20 shrink-0">
                        Match: {op.matchScore}%
                      </span>
                    </div>
                    <div className="text-xs text-[#00ffd5] mt-1 break-words">{op.jobTitle}</div>
                    <div className="text-[10px] text-[#777] mt-1">Modalidad: {op.contractType}</div>
                  </div>
                  <button
                    onClick={() => handleSelectOpportunity(op)}
                    className="w-full sm:w-auto bg-[#00ffd5]/10 hover:bg-[#00ffd5] text-[#00ffd5] hover:text-black font-bold px-4 py-2.5 rounded-lg text-xs transition cursor-pointer text-center shrink-0"
                  >
                    Seleccionar →
                  </button>
                </div>
              ))
            )}
          </div>
        )}

        {/* VISTA 2: FORMULARIO */}
        {activeTab === 'form' && (
          <form onSubmit={handleDispatch} className="bg-[#111] border border-[#222] rounded-xl p-4 sm:p-5 space-y-4 shadow-xl">
            <div className="text-xs font-bold text-[#00ffd5] mb-1">CONFIGURACIÓN DE ENVÍO & CV MAESTRO (1 PÁGINA)</div>
            
            <div>
              <label className="block text-[10px] text-[#888] uppercase mb-1">Estrategia CV Asignada por IA</label>
              <select
                value={templateType}
                onChange={(e) => setTemplateType(e.target.value)}
                className="w-full bg-[#161616] border border-[#2a2a2a] rounded-lg px-3 py-2.5 text-xs text-[#ededed] focus:border-[#00ffd5] outline-none cursor-pointer appearance-none truncate"
              >
                <option value="design-systems">Design Systems & Product Design</option>
                <option value="frontend">Frontend Architecture (React / Next.js)</option>
                <option value="consulting">Consultoría Estratégica & Producción</option>
              </select>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] text-[#888] uppercase mb-1">Empresa *</label>
                <input
                  type="text"
                  required
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  className="w-full bg-[#161616] border border-[#2a2a2a] rounded-lg px-3 py-2.5 text-xs text-[#ededed] outline-none"
                />
              </div>
              <div>
                <label className="block text-[10px] text-[#888] uppercase mb-1">Rol *</label>
                <input
                  type="text"
                  required
                  value={jobTitle}
                  onChange={(e) => setJobTitle(e.target.value)}
                  className="w-full bg-[#161616] border border-[#2a2a2a] rounded-lg px-3 py-2.5 text-xs text-[#ededed] outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] text-[#888] uppercase mb-1">Correo Destino *</label>
              <input
                type="email"
                required
                value={recipientEmail}
                onChange={(e) => setRecipientEmail(e.target.value)}
                className="w-full bg-[#161616] border border-[#2a2a2a] rounded-lg px-3 py-2.5 text-xs text-[#ededed] outline-none truncate"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] text-[#888] uppercase mb-1">Nombre Reclutador</label>
                <input
                  type="text"
                  value={contactName}
                  onChange={(e) => setContactName(e.target.value)}
                  className="w-full bg-[#161616] border border-[#2a2a2a] rounded-lg px-3 py-2.5 text-xs text-[#ededed] outline-none"
                />
              </div>
              <div>
                <label className="block text-[10px] text-[#888] uppercase mb-1">Portafolio (Behance)</label>
                <input
                  type="text"
                  value={portfolioUrl}
                  onChange={(e) => setPortfolioUrl(e.target.value)}
                  className="w-full bg-[#161616] border border-[#2a2a2a] rounded-lg px-3 py-2.5 text-xs text-[#ededed] outline-none truncate"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full mt-3 bg-[#00ffd5] hover:bg-[#00cca8] text-black font-bold py-3.5 rounded-lg text-xs transition cursor-pointer text-center shadow-lg shadow-[#00ffd5]/10"
            >
              DESPACHAR CORREO + PDF ADJUNTO (1 PÁGINA) →
            </button>
          </form>
        )}

        {/* VISTA 3: HISTORIAL & FOLLOW-UPS */}
        {activeTab === 'logs' && (
          <div className="space-y-3">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center text-xs text-[#777] mb-1 gap-2">
              <span className="truncate">Historial de envíos en Supabase:</span>
              {applications.length > 0 && (
                <button
                  onClick={handleClearHistory}
                  className="w-full sm:w-auto bg-red-500/10 hover:bg-red-500 text-red-400 hover:text-black font-bold px-3 py-2 sm:py-1 rounded transition cursor-pointer border border-red-500/20 text-[10px] text-center"
                >
                  Limpiar Historial ✕
                </button>
              )}
            </div>
            {applications.length === 0 ? (
              <div className="text-center py-8 text-xs text-[#555] border border-dashed border-[#222] rounded-xl">
                No hay transmisiones registradas en Supabase.
              </div>
            ) : (
              applications.map((app) => (
                <div key={app.id} className="bg-[#111] border border-[#222] p-3.5 sm:p-4 rounded-xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                  <div className="w-full sm:w-3/4 overflow-hidden">
                    <div className="font-bold text-[#ededed] truncate">{app.company_name}</div>
                    <div className="text-xs text-[#00ffd5] mt-0.5 break-words">{app.job_title}</div>
                    <div className="text-[10px] text-[#777] mt-1 truncate">{app.recipient_email}</div>
                  </div>
                  <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end shrink-0">
                    <span className="bg-[#0d1f1a] text-[#00ffd5] text-[9px] px-2.5 py-1 rounded-md font-bold border border-[#00ffd5]/20">
                      DELIVERED + PDF
                    </span>
                    <button
                      onClick={() => handleFollowUp(app)}
                      className="bg-[#222] hover:bg-[#333] text-[#00ffd5] border border-[#00ffd5]/30 text-[10px] font-bold px-3 py-1.5 rounded-lg transition cursor-pointer"
                    >
                      Follow-up ↺
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

      </div>
    </main>
  );
}
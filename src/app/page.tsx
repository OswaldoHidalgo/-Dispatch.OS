'use client';

import { useState, useEffect } from 'react';

interface Application {
  id: string;
  company_name: string;
  job_title: string;
  recipient_email: string;
  created_at: string;
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
  const [portfolioUrl, setPortfolioUrl] = useState('https://oswaldohidalgo.com');
  const [targetUrl, setTargetUrl] = useState('');
  
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [applications, setApplications] = useState<Application[]>([]);
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
        setStatusMessage(`¡Match de IA exitoso (${data.analysis.matchScore}% afín)!`);
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
        setStatusMessage(`Configurado y validado (${data.analysis.matchScore}% Match) para: ${op.companyName}`);
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

    setStatusMessage(`Despachando postulación y CV adaptado a ${companyName}...`);

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
        setStatusMessage(`¡Enviado con éxito a ${companyName}! CV adjunto entregado.`);
        fetchApplications();
        setActiveTab('logs');
      } else {
        setStatusMessage('Error al despachar el correo.');
      }
    } catch (err: any) {
      setStatusMessage('Error de conexión.');
    }
  };

  return (
    <main className="min-h-screen bg-[#0a0a0a] text-[#ededed] p-4 md:p-8 font-mono selection:bg-[#00ffd5] selection:text-black">
      {/* HEADER */}
      <header className="max-w-4xl mx-auto mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-[#222] pb-4 gap-3">
        <div>
          <h1 className="text-xl font-bold tracking-widest flex items-center gap-2">
            <span className="inline-block w-2.5 h-2.5 bg-[#00ffd5] rounded-full animate-pulse"></span>
            DISPATCH.OS // UNSTOPPABLE AGENT
          </h1>
          <p className="text-[10px] text-[#777] tracking-wider">GLOBAL PROSPECTION & 1-PAGE DYNAMIC CV ADAPTER</p>
        </div>
        <div className="text-[10px] bg-[#141414] border border-[#262626] px-3 py-1.5 rounded-md text-[#00ffd5]">
          SUPABASE CLOUD SYNC ✓
        </div>
      </header>

      {/* CONTENEDOR PRINCIPAL */}
      <div className="max-w-4xl mx-auto space-y-6">
        
        {/* BARRA DE URL / IA ANALYZER */}
        <div className="bg-[#111] border border-[#222] rounded-xl p-4 shadow-xl">
          <form onSubmit={handleAiAutoFill} className="flex flex-col sm:flex-row gap-2">
            <input
              type="url"
              placeholder="Pega la URL de cualquier oferta (LinkedIn, Web corporativa)..."
              value={targetUrl}
              onChange={(e) => setTargetUrl(e.target.value)}
              className="flex-1 bg-[#161616] border border-[#2a2a2a] rounded-lg px-3 py-2 text-xs text-[#ededed] focus:border-[#00ffd5] outline-none"
            />
            <button
              type="submit"
              className="bg-[#00ffd5]/10 hover:bg-[#00ffd5] text-[#00ffd5] hover:text-black border border-[#00ffd5]/30 font-bold px-4 py-2 rounded-lg text-xs transition cursor-pointer whitespace-nowrap"
            >
              {processingAi ? 'Analizando...' : 'Analizar con IA & Match'}
            </button>
          </form>
        </div>

        {/* NAVEGACIÓN POR PESTAÑAS */}
        <div className="flex border-b border-[#222] gap-6 text-xs">
          <button
            onClick={() => setActiveTab('radar')}
            className={`pb-3 border-b-2 font-bold cursor-pointer transition ${activeTab === 'radar' ? 'border-[#00ffd5] text-[#00ffd5]' : 'border-transparent text-[#777] hover:text-[#aaa]'}`}
          >
            [01] Radar Global Masivo ({radarOpportunities.length})
          </button>
          <button
            onClick={() => setActiveTab('form')}
            className={`pb-3 border-b-2 font-bold cursor-pointer transition ${activeTab === 'form' ? 'border-[#00ffd5] text-[#00ffd5]' : 'border-transparent text-[#777] hover:text-[#aaa]'}`}
          >
            [02] Formulario & CV Adaptado
          </button>
          <button
            onClick={() => setActiveTab('logs')}
            className={`pb-3 border-b-2 font-bold cursor-pointer transition ${activeTab === 'logs' ? 'border-[#00ffd5] text-[#00ffd5]' : 'border-transparent text-[#777] hover:text-[#aaa]'}`}
          >
            [03] Historial Cloud ({applications.length})
          </button>
        </div>

        {statusMessage && (
          <div className="p-3 bg-[#0d1f1a] border border-[#00ffd5]/40 text-[#00ffd5] text-xs rounded-lg">
            ● {statusMessage}
          </div>
        )}

        {/* VISTA 1: RADAR GLOBAL */}
        {activeTab === 'radar' && (
          <div className="space-y-3">
            <div className="flex justify-between items-center text-xs text-[#777] mb-2">
              <span>Búsqueda global automatizada (Remoto, Español / Inglés A2)</span>
              <button onClick={fetchRadar} className="text-[#00ffd5] hover:underline cursor-pointer">
                {loadingRadar ? 'Escaneando...' : 'Actualizar Radar'}
              </button>
            </div>
            {radarOpportunities.map((op, idx) => (
              <div key={idx} className="bg-[#111] border border-[#222] p-4 rounded-xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 hover:border-[#00ffd5]/40 transition">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-[#ededed]">{op.companyName}</span>
                    <span className="text-[9px] bg-[#0d1f1a] text-[#00ffd5] px-2 py-0.5 rounded font-bold border border-[#00ffd5]/20">
                      Match: {op.matchScore}%
                    </span>
                  </div>
                  <div className="text-xs text-[#00ffd5] mt-0.5">{op.jobTitle}</div>
                  <div className="text-[10px] text-[#777] mt-1">Modalidad: {op.contractType} | Duración: {op.duration}</div>
                </div>
                <button
                  onClick={() => handleSelectOpportunity(op)}
                  className="w-full sm:w-auto bg-[#00ffd5]/10 hover:bg-[#00ffd5] text-[#00ffd5] hover:text-black font-bold px-4 py-2 rounded-lg text-xs transition cursor-pointer"
                >
                  Seleccionar y Adaptar CV →
                </button>
              </div>
            ))}
          </div>
        )}

        {/* VISTA 2: FORMULARIO */}
        {activeTab === 'form' && (
          <form onSubmit={handleDispatch} className="bg-[#111] border border-[#222] rounded-xl p-5 space-y-4 shadow-xl">
            <div className="text-xs font-bold text-[#00ffd5] mb-2">CONFIGURACIÓN DE ENVÍO & CV MAESTRO (1 PÁGINA)</div>
            
            <div>
              <label className="block text-[10px] text-[#888] uppercase mb-1">Estrategia CV Asignada por IA</label>
              <select
                value={templateType}
                onChange={(e) => setTemplateType(e.target.value)}
                className="w-full bg-[#161616] border border-[#2a2a2a] rounded-lg px-3 py-2 text-xs text-[#ededed] focus:border-[#00ffd5] outline-none cursor-pointer appearance-none bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%2300ffd5%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2svg%3E')] bg-[length:9px_9px] bg-[right_12px_center] bg-no-repeat"
              >
                <option value="design-systems" className="bg-[#161616] text-[#ededed]">Design Systems & Product Design</option>
                <option value="frontend" className="bg-[#161616] text-[#ededed]">Frontend Architecture (React / Next.js)</option>
                <option value="consulting" className="bg-[#161616] text-[#ededed]">Consultoría Estratégica & Producción</option>
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
                  className="w-full bg-[#161616] border border-[#2a2a2a] rounded-lg px-3 py-2 text-xs text-[#ededed] outline-none"
                />
              </div>
              <div>
                <label className="block text-[10px] text-[#888] uppercase mb-1">Rol *</label>
                <input
                  type="text"
                  required
                  value={jobTitle}
                  onChange={(e) => setJobTitle(e.target.value)}
                  className="w-full bg-[#161616] border border-[#2a2a2a] rounded-lg px-3 py-2 text-xs text-[#ededed] outline-none"
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
                className="w-full bg-[#161616] border border-[#2a2a2a] rounded-lg px-3 py-2 text-xs text-[#ededed] outline-none"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] text-[#888] uppercase mb-1">Nombre Reclutador</label>
                <input
                  type="text"
                  value={contactName}
                  onChange={(e) => setContactName(e.target.value)}
                  className="w-full bg-[#161616] border border-[#2a2a2a] rounded-lg px-3 py-2 text-xs text-[#ededed] outline-none"
                />
              </div>
              <div>
                <label className="block text-[10px] text-[#888] uppercase mb-1">Portafolio</label>
                <input
                  type="text"
                  value={portfolioUrl}
                  onChange={(e) => setPortfolioUrl(e.target.value)}
                  className="w-full bg-[#161616] border border-[#2a2a2a] rounded-lg px-3 py-2 text-xs text-[#ededed] outline-none"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full mt-3 bg-[#00ffd5] hover:bg-[#00cca8] text-black font-bold py-3 rounded-lg text-xs transition cursor-pointer"
            >
              DESPACHAR CORREO + PDF ADJUNTO (1 PÁGINA) →
            </button>
          </form>
        )}

        {/* VISTA 3: HISTORIAL */}
        {activeTab === 'logs' && (
          <div className="space-y-3">
            {applications.length === 0 ? (
              <div className="text-center py-8 text-xs text-[#555] border border-dashed border-[#222] rounded-xl">
                No hay transmisiones registradas en Supabase.
              </div>
            ) : (
              applications.map((app) => (
                <div key={app.id} className="bg-[#111] border border-[#222] p-4 rounded-xl flex justify-between items-center text-xs">
                  <div>
                    <div className="font-bold text-[#ededed]">{app.company_name}</div>
                    <div className="text-[#00ffd5] mt-0.5">{app.job_title}</div>
                    <div className="text-[10px] text-[#777] mt-1">{app.recipient_email}</div>
                  </div>
                  <span className="bg-[#0d1f1a] text-[#00ffd5] text-[9px] px-2.5 py-1 rounded-md font-bold border border-[#00ffd5]/20">
                    DELIVERED + 1-PAGE PDF
                  </span>
                </div>
              ))
            )}
          </div>
        )}

      </div>
    </main>
  );
}
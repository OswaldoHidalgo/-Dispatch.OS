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
        setCompanyName('Empresa Externa');
        setRecipientEmail('careers@target-company.com');
        setContactName('Hiring Manager');
        setStatusMessage('¡Oferta analizada y autoconfigurada por IA!');
        setActiveTab('form'); // Salta al formulario listo para enviar
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
        setStatusMessage(`Configurado para: ${op.companyName}`);
        setActiveTab('form'); // Salta al formulario listo
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
        setStatusMessage(`¡Postulación enviada con éxito a ${companyName}!`);
        fetchApplications();
        setActiveTab('logs');
      } else {
        setStatusMessage('Error al despachar la postulación.');
      }
    } catch (err: any) {
      setStatusMessage('Error de conexión.');
    }
  };

  return (
    <main className="min-h-screen bg-[#0a0a0a] text-[#ededed] p-4 md:p-8 font-mono selection:bg-[#00ffd5] selection:text-black">
      {/* HEADER SIMPLIFICADO */}
      <header className="max-w-4xl mx-auto mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-[#222] pb-4 gap-3">
        <div>
          <h1 className="text-xl font-bold tracking-widest flex items-center gap-2">
            <span className="inline-block w-2.5 h-2.5 bg-[#00ffd5] rounded-full animate-pulse"></span>
            DISPATCH.OS
          </h1>
          <p className="text-[10px] text-[#777] tracking-wider">AI AGENT & DYNAMIC CV ADAPTER</p>
        </div>
        <div className="text-[10px] bg-[#141414] border border-[#262626] px-3 py-1.5 rounded-md text-[#00ffd5]">
          SUPABASE CLOUD ✓
        </div>
      </header>

      {/* CONTENEDOR PRINCIPAL MINIMALISTA */}
      <div className="max-w-4xl mx-auto space-y-6">
        
        {/* BARRA DE URL / IA */}
        <div className="bg-[#111] border border-[#222] rounded-xl p-4 shadow-xl">
          <form onSubmit={handleAiAutoFill} className="flex flex-col sm:flex-row gap-2">
            <input
              type="url"
              placeholder="Pega la URL de una oferta (LinkedIn, Web)..."
              value={targetUrl}
              onChange={(e) => setTargetUrl(e.target.value)}
              className="flex-1 bg-[#161616] border border-[#2a2a2a] rounded-lg px-3 py-2 text-xs text-[#ededed] focus:border-[#00ffd5] outline-none"
            />
            <button
              type="submit"
              className="bg-[#00ffd5]/10 hover:bg-[#00ffd5] text-[#00ffd5] hover:text-black border border-[#00ffd5]/30 font-bold px-4 py-2 rounded-lg text-xs transition cursor-pointer whitespace-nowrap"
            >
              {processingAi ? 'Analizando...' : 'Auto-llenar con IA'}
            </button>
          </form>
        </div>

        {/* NAVEGACIÓN POR PESTAÑAS (Móvil y Escritorio sin desorden) */}
        <div className="flex border-b border-[#222] gap-6 text-xs">
          <button
            onClick={() => setActiveTab('radar')}
            className={`pb-3 border-b-2 font-bold cursor-pointer transition ${activeTab === 'radar' ? 'border-[#00ffd5] text-[#00ffd5]' : 'border-transparent text-[#777] hover:text-[#aaa]'}`}
          >
            [01] Radar Activo ({radarOpportunities.length})
          </button>
          <button
            onClick={() => setActiveTab('form')}
            className={`pb-3 border-b-2 font-bold cursor-pointer transition ${activeTab === 'form' ? 'border-[#00ffd5] text-[#00ffd5]' : 'border-transparent text-[#777] hover:text-[#aaa]'}`}
          >
            [02] Formulario & CV
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

        {/* VISTA 1: RADAR */}
        {activeTab === 'radar' && (
          <div className="space-y-3">
            <div className="flex justify-between items-center text-xs text-[#777] mb-2">
              <span>Oportunidades remotas y en español / A2</span>
              <button onClick={fetchRadar} className="text-[#00ffd5] hover:underline cursor-pointer">
                {loadingRadar ? 'Actualizando...' : 'Refrescar'}
              </button>
            </div>
            {radarOpportunities.map((op, idx) => (
              <div key={idx} className="bg-[#111] border border-[#222] p-4 rounded-xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 hover:border-[#00ffd5]/40 transition">
                <div>
                  <div className="text-xs font-bold text-[#ededed]">{op.companyName}</div>
                  <div className="text-xs text-[#00ffd5] mt-0.5">{op.jobTitle}</div>
                  <div className="text-[10px] text-[#777] mt-1">Contrato: {op.contractType} | Duración: {op.duration}</div>
                </div>
                <button
                  onClick={() => handleSelectOpportunity(op)}
                  className="w-full sm:w-auto bg-[#00ffd5]/10 hover:bg-[#00ffd5] text-[#00ffd5] hover:text-black font-bold px-4 py-2 rounded-lg text-xs transition cursor-pointer"
                >
                  Seleccionar →
                </button>
              </div>
            ))}
          </div>
        )}

        {/* VISTA 2: FORMULARIO Y CV MAESTRO */}
        {activeTab === 'form' && (
          <form onSubmit={handleDispatch} className="bg-[#111] border border-[#222] rounded-xl p-5 space-y-4 shadow-xl">
            <div className="text-xs font-bold text-[#00ffd5] mb-2">CONFIGURACIÓN DE ENVÍO & CV ADAPTADO</div>
            
            <div>
              <label className="block text-[10px] text-[#888] uppercase mb-1">Estrategia CV Maestro</label>
              <select
                value={templateType}
                onChange={(e) => setTemplateType(e.target.value)}
                className="w-full bg-[#161616] border border-[#2a2a2a] rounded-lg px-3 py-2 text-xs text-[#ededed] outline-none"
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
              DESPACHAR CORREO + CV PDF ADJUNTO →
            </button>
          </form>
        )}

        {/* VISTA 3: HISTORIAL CLOUD */}
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
                    DELIVERED + PDF
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
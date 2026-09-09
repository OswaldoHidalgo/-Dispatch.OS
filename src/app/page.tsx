// src/app/page.tsx
'use client';

import { useState, useEffect } from 'react';

interface ApplicationRecord {
  id: string;
  companyName: string;
  jobTitle: string;
  recipientEmail: string;
  contactName: string;
  sentAt: string;
  templateType: string;
  status: 'sent' | 'failed';
}

export default function Dashboard() {
  const [formData, setFormData] = useState({
    companyName: '',
    jobTitle: '',
    recipientEmail: '',
    contactName: '',
    portfolioUrl: 'https://oswaldohidalgo.com',
    templateType: 'product-design',
  });

  const [loading, setLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [history, setHistory] = useState<ApplicationRecord[]>([]);
  const [consoleLogs, setConsoleLogs] = useState<string[]>([]);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePos({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  useEffect(() => {
    const saved = localStorage.getItem('job_applications_history');
    if (saved) {
      try {
        setHistory(JSON.parse(saved));
      } catch (e) {
        console.error('Error cargando historial:', e);
      }
    }
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const addLog = (msg: string) => {
    setConsoleLogs((prev) => [...prev, `[${new Date().toLocaleTimeString()}] ${msg}`]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setStatusMessage(null);
    setConsoleLogs([]);

    addLog('INICIANDO PROTOCOLO DE DESPACHO...');
    addLog(`OBJETIVO: ${formData.companyName.toUpperCase()}`);
    addLog(`PLANTILLA: ${formData.templateType.toUpperCase()}`);

    try {
      await new Promise((r) => setTimeout(r, 300));
      addLog('CONECTANDO A GMAIL API OAUTH2...');

      const res = await fetch('/api/apply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        addLog('RESPUESTA SERVIDOR: 200 OK');
        addLog(`MESSAGE_ID: ${data.messageId}`);

        setStatusMessage({ type: 'success', text: `POSTULACION DESPACHADA: ${formData.companyName.toUpperCase()}` });

        const newRecord: ApplicationRecord = {
          id: data.messageId || Date.now().toString(),
          companyName: formData.companyName,
          jobTitle: formData.jobTitle,
          recipientEmail: formData.recipientEmail,
          contactName: formData.contactName,
          templateType: formData.templateType,
          sentAt: new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }),
          status: 'sent',
        };

        const updatedHistory = [newRecord, ...history];
        setHistory(updatedHistory);
        localStorage.setItem('job_applications_history', JSON.stringify(updatedHistory));

        setFormData({
          companyName: '',
          jobTitle: '',
          recipientEmail: '',
          contactName: '',
          portfolioUrl: formData.portfolioUrl,
          templateType: formData.templateType,
        });
      } else {
        throw new Error(data.error || 'ERROR_ENVIO');
      }
    } catch (err: any) {
      addLog(`ERROR: ${err.message}`);
      setStatusMessage({ type: 'error', text: err.message || 'CONEXION_RECHAZADA' });
    } finally {
      setLoading(false);
    }
  };

  const clearHistory = () => {
    if (confirm('¿Purgar registros de transmisión?')) {
      localStorage.removeItem('job_applications_history');
      setHistory([]);
    }
  };

  return (
    <main className="min-h-screen bg-[#030305] text-neutral-100 font-sans selection:bg-cyan-500 selection:text-black relative overflow-hidden flex flex-col justify-between p-6 md:p-12">
      
      {/* Spotlight */}
      <div
        className="pointer-events-none fixed inset-0 z-30 transition-opacity duration-300"
        style={{
          background: `radial-gradient(600px circle at ${mousePos.x}px ${mousePos.y}px, rgba(34, 211, 238, 0.08), transparent 80%)`,
        }}
      />

      {/* Grid Pattern */}
      <div
        className="absolute inset-0 opacity-[0.025] pointer-events-none"
        style={{
          backgroundImage: `linear-gradient(to right, #ffffff 1px, transparent 1px), linear-gradient(to bottom, #ffffff 1px, transparent 1px)`,
          backgroundSize: '40px 40px',
        }}
      />

      <div className="max-w-6xl mx-auto w-full space-y-10 relative z-10">
        
        {/* Header */}
        <header className="flex flex-col md:flex-row md:items-center justify-between border-b border-white/10 pb-6 gap-4">
          <div>
            <div className="flex items-center gap-3">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-cyan-500"></span>
              </span>
              <h1 className="text-2xl md:text-3xl font-black tracking-wider uppercase bg-gradient-to-r from-white via-neutral-200 to-neutral-500 bg-clip-text text-transparent">
                Dispatch<span className="text-cyan-400">.OS</span>
              </h1>
            </div>
            <p className="text-[11px] font-mono text-neutral-500 uppercase tracking-widest mt-1">
              Automated Outreach Protocol // Gmail Engine v1.0
            </p>
          </div>

          <div className="flex items-center gap-3 font-mono text-xs text-neutral-400 bg-white/5 border border-white/10 px-4 py-2 rounded-full backdrop-blur-md">
            <span className="text-neutral-500">OPERATOR:</span>
            <span className="text-neutral-200 font-semibold">Oswaldo Hidalgo</span>
            <span className="text-cyan-400 font-bold ml-1 animate-pulse">✓ ONLINE</span>
          </div>
        </header>

        {/* Dashboard Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Form */}
          <section className="lg:col-span-7 bg-neutral-900/40 border border-white/10 backdrop-blur-2xl rounded-2xl p-6 md:p-8 shadow-2xl relative hover:border-cyan-500/30 transition-all duration-500">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-2">
                <div className="w-1 h-4 bg-cyan-400 rounded-full animate-pulse" />
                <h2 className="text-xs font-mono font-bold tracking-widest text-neutral-200 uppercase">
                  [01] Launch Parameters
                </h2>
              </div>
              <span className="text-[10px] font-mono text-cyan-400/80 bg-cyan-950/40 border border-cyan-800/40 px-2.5 py-1 rounded-full uppercase">
                POST /api/apply
              </span>
            </div>

            {statusMessage && (
              <div
                className={`p-4 rounded-xl mb-6 text-xs font-mono tracking-wide border flex items-center gap-3 ${
                  statusMessage.type === 'success'
                    ? 'bg-emerald-950/50 border-emerald-500/50 text-emerald-300'
                    : 'bg-rose-950/50 border-rose-500/50 text-rose-300'
                }`}
              >
                <span className={`w-2 h-2 rounded-full ${statusMessage.type === 'success' ? 'bg-emerald-400' : 'bg-rose-400'}`} />
                {statusMessage.text}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5 font-mono">
              <div>
                <label className="block text-[10px] text-neutral-400 uppercase tracking-widest mb-2">
                  Template Narrative Profile
                </label>
                <select
                  name="templateType"
                  value={formData.templateType}
                  onChange={handleChange}
                  className="w-full bg-black/60 border border-white/10 rounded-xl px-4 py-3 text-xs text-cyan-300 focus:outline-none focus:border-cyan-400"
                >
                  <option value="product-design">Senior Product Designer (SaaS Focus)</option>
                  <option value="design-systems">Design Systems & Scalability Specialist</option>
                  <option value="frontend">UX/UI + Frontend Engineer (Next.js / React)</option>
                </select>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-[10px] text-neutral-400 uppercase tracking-widest mb-2">
                    Company Target <span className="text-cyan-400">*</span>
                  </label>
                  <input
                    type="text"
                    name="companyName"
                    required
                    value={formData.companyName}
                    onChange={handleChange}
                    placeholder="Stripe"
                    className="w-full bg-black/60 border border-white/10 rounded-xl px-4 py-3 text-xs text-white placeholder-neutral-600 focus:outline-none focus:border-cyan-400"
                  />
                </div>

                <div>
                  <label className="block text-[10px] text-neutral-400 uppercase tracking-widest mb-2">
                    Target Role <span className="text-cyan-400">*</span>
                  </label>
                  <input
                    type="text"
                    name="jobTitle"
                    required
                    value={formData.jobTitle}
                    onChange={handleChange}
                    placeholder="Senior Product Designer"
                    className="w-full bg-black/60 border border-white/10 rounded-xl px-4 py-3 text-xs text-white placeholder-neutral-600 focus:outline-none focus:border-cyan-400"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] text-neutral-400 uppercase tracking-widest mb-2">
                  Destination Email <span className="text-cyan-400">*</span>
                </label>
                <input
                  type="email"
                  name="recipientEmail"
                  required
                  value={formData.recipientEmail}
                  onChange={handleChange}
                  placeholder="careers@company.com"
                  className="w-full bg-black/60 border border-white/10 rounded-xl px-4 py-3 text-xs text-white placeholder-neutral-600 focus:outline-none focus:border-cyan-400"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-[10px] text-neutral-400 uppercase tracking-widest mb-2">
                    Contact Name
                  </label>
                  <input
                    type="text"
                    name="contactName"
                    value={formData.contactName}
                    onChange={handleChange}
                    placeholder="Sarah"
                    className="w-full bg-black/60 border border-white/10 rounded-xl px-4 py-3 text-xs text-white placeholder-neutral-600 focus:outline-none focus:border-cyan-400"
                  />
                </div>

                <div>
                  <label className="block text-[10px] text-neutral-400 uppercase tracking-widest mb-2">
                    Portfolio Endpoint
                  </label>
                  <input
                    type="url"
                    name="portfolioUrl"
                    value={formData.portfolioUrl}
                    onChange={handleChange}
                    className="w-full bg-black/60 border border-white/10 rounded-xl px-4 py-3 text-xs text-white placeholder-neutral-600 focus:outline-none focus:border-cyan-400"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full mt-4 bg-gradient-to-r from-cyan-500 via-teal-400 to-emerald-400 text-black font-extrabold py-4 rounded-xl text-xs uppercase tracking-widest shadow-[0_0_30px_rgba(34,211,238,0.25)] hover:shadow-[0_0_45px_rgba(34,211,238,0.5)] disabled:opacity-30 flex items-center justify-center gap-2"
              >
                {loading ? 'Executing Protocol...' : 'Send Application // Dispatch →'}
              </button>
            </form>

            {consoleLogs.length > 0 && (
              <div className="mt-6 p-4 bg-black/80 border border-cyan-500/30 rounded-xl font-mono text-[11px] space-y-1 text-cyan-400/90 max-h-36 overflow-y-auto">
                <div className="text-[9px] text-neutral-500 uppercase tracking-wider mb-2 border-b border-white/10 pb-1">
                  Live Terminal Feed
                </div>
                {consoleLogs.map((log, i) => (
                  <div key={i}>{log}</div>
                ))}
              </div>
            )}
          </section>

          {/* History */}
          <section className="lg:col-span-5 bg-neutral-900/40 border border-white/10 backdrop-blur-2xl rounded-2xl p-6 md:p-8 shadow-2xl flex flex-col hover:border-indigo-500/30 transition-all duration-500">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-2">
                <div className="w-1 h-4 bg-indigo-500 rounded-full animate-pulse" />
                <h2 className="text-xs font-mono font-bold tracking-widest text-neutral-200 uppercase">
                  [02] Transmission Log ({history.length})
                </h2>
              </div>
              {history.length > 0 && (
                <button
                  onClick={clearHistory}
                  className="text-[10px] font-mono text-rose-400 hover:text-rose-300 uppercase"
                >
                  Purge Logs
                </button>
              )}
            </div>

            <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
              {history.length === 0 ? (
                <div className="text-center py-20 border border-dashed border-white/10 rounded-2xl">
                  <p className="text-xs font-mono text-neutral-600 uppercase tracking-widest">
                    No Active Transmissions
                  </p>
                </div>
              ) : (
                history.map((item) => (
                  <div
                    key={item.id}
                    className="bg-black/50 border border-white/5 hover:border-cyan-500/40 rounded-xl p-4 transition-all space-y-2"
                  >
                    <div className="flex justify-between items-start">
                      <span className="font-semibold text-white text-sm">
                        {item.companyName}
                      </span>
                      <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-2 py-0.5 rounded-full">
                        DELIVERED
                      </span>
                    </div>

                    <div className="text-xs text-neutral-300 font-mono">{item.jobTitle}</div>

                    <div className="flex justify-between items-center text-[10px] font-mono text-neutral-500 pt-2 border-t border-white/5">
                      <span className="truncate max-w-[180px]">{item.recipientEmail}</span>
                      <span>{item.sentAt}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </section>

        </div>
      </div>

      {/* Footer */}
      <footer className="max-w-6xl mx-auto w-full mt-12 pt-6 border-t border-white/5 flex justify-between items-center text-[10px] font-mono text-neutral-600">
        <span>UX/UI SYSTEM // OSWALDO HIDALGO</span>
        <span>LATENCY: OPTIMAL (GMAIL API v1)</span>
      </footer>
    </main>
  );
}
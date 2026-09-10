'use client';

import { useState, useEffect } from 'react';
import { Job, JobStatus } from '@/types/job';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Search, Bookmark, CheckCircle2, Loader2, RefreshCw, Send, Building2 } from 'lucide-react';

export default function JobDashboard() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState<string>('all');

  const fetchJobs = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/jobs');
      const data = await res.json();
      if (data.jobs) {
        setJobs(data.jobs);
      }
    } catch (error) {
      console.error('Error cargando vacantes:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  const updateStatus = (id: string, newStatus: JobStatus) => {
    setJobs((prev) =>
      prev.map((job) => (job.id === id ? { ...job, status: newStatus } : job))
    );
  };

  const handleApplyByEmail = (job: Job) => {
    const targetEmail = job.contactEmail || `careers@${job.company.toLowerCase().replace(/[^a-z0-9]/g, '')}.com`;
    const subject = encodeURIComponent(`Postulación: ${job.title} - Oswaldo Hidalgo`);
    const body = encodeURIComponent(
      `Hola equipo de ${job.company},\n\n` +
      `Les escribo para presentar mi candidatura a la posición de ${job.title}.\n\n` +
      `Tengo experiencia en diseño de productos digitales, sistemas de diseño (Design Systems), prototipado y estándares de accesibilidad (WCAG).\n\n` +
      `Pueden revisar mi portafolio aquí:\n` +
      `https://oswaldohidalgo.com\n\n` +
      `Adjunto mi CV en PDF de una página.\n\n` +
      `Saludos cordiales,\n` +
      `Oswaldo Hidalgo\n` +
      `Senior UX/UI & Product Designer`
    );

    const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${targetEmail}&su=${subject}&body=${body}`;
    window.open(gmailUrl, '_blank');
    updateStatus(job.id, 'applied');
  };

  const filteredJobs = jobs.filter((job) => {
    const matchesSearch =
      job.title.toLowerCase().includes(search.toLowerCase()) ||
      job.company.toLowerCase().includes(search.toLowerCase()) ||
      job.tags.some((tag) => String(tag).toLowerCase().includes(search.toLowerCase()));

    if (activeTab === 'saved') return matchesSearch && job.status === 'saved';
    if (activeTab === 'applied') return matchesSearch && job.status === 'applied';
    return matchesSearch;
  });

  return (
    <main className="min-h-screen bg-[#F3F3F4] text-neutral-900 p-6 md:p-12 max-w-7xl mx-auto space-y-8 font-sans antialiased">
      {/* Header Minimalista */}
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-neutral-900">UX/UI Job Board</h1>
          <p className="text-sm text-neutral-500 font-medium">
            Vacantes 100% remotas y en español para Diseñadores UX/UI & Product Designers
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Badge className="bg-white text-neutral-700 hover:bg-white border-none shadow-sm text-xs font-semibold px-3 py-1.5 rounded-full">
            {jobs.length} ofertas
          </Badge>
          <Button size="icon" variant="ghost" onClick={fetchJobs} className="rounded-full hover:bg-white/80 shadow-sm cursor-pointer">
            <RefreshCw className={`h-4 w-4 text-neutral-600 ${loading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </header>

      {/* Controles de Búsqueda y Filtros */}
      <section className="flex flex-col md:flex-row gap-4 justify-between items-center">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
          <Input
            placeholder="Buscar rol, empresa o tag..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-11 pr-4 py-2.5 h-11 bg-white border-none rounded-2xl shadow-sm text-sm focus-visible:ring-2 focus-visible:ring-neutral-900"
          />
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full md:w-auto">
          <TabsList className="bg-white/70 p-1 rounded-2xl shadow-sm h-11 border-none">
            <TabsTrigger value="all" className="rounded-xl px-5 text-xs font-semibold data-[state=active]:bg-neutral-900 data-[state=active]:text-white cursor-pointer">
              Todas ({jobs.length})
            </TabsTrigger>
            <TabsTrigger value="saved" className="rounded-xl px-5 text-xs font-semibold data-[state=active]:bg-neutral-900 data-[state=active]:text-white cursor-pointer">
              Guardadas ({jobs.filter((j) => j.status === 'saved').length})
            </TabsTrigger>
            <TabsTrigger value="applied" className="rounded-xl px-5 text-xs font-semibold data-[state=active]:bg-neutral-900 data-[state=active]:text-white cursor-pointer">
              Postuladas ({jobs.filter((j) => j.status === 'applied').length})
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </section>

      {/* Grid estilo Dribbble */}
      <section>
        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 gap-3">
            <Loader2 className="h-8 w-8 animate-spin text-neutral-400" />
            <p className="text-xs font-medium text-neutral-500">Buscando ofertas en la web...</p>
          </div>
        ) : filteredJobs.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-3xl shadow-sm border border-neutral-100">
            <p className="text-sm font-medium text-neutral-500">No se encontraron vacantes con los criterios seleccionados.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredJobs.map((job) => {
              const isSaved = job.status === 'saved';
              const isApplied = job.status === 'applied';

              return (
                <div
                  key={job.id}
                  className="bg-white rounded-3xl p-6 shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-neutral-100/80 flex flex-col justify-between hover:shadow-[0_10px_30px_rgba(0,0,0,0.06)] transition-all duration-300"
                >
                  {/* Fila Superior: Logo + Empresa + Botón Guardar */}
                  <div className="space-y-4">
                    <div className="flex justify-between items-start">
                      <div className="flex items-center gap-3">
                        <div className="w-11 h-11 rounded-2xl bg-neutral-100 flex items-center justify-center text-neutral-900 font-bold text-base shadow-inner overflow-hidden">
                          {job.logoUrl ? (
                            <img src={job.logoUrl} alt={job.company} className="w-full h-full object-cover" />
                          ) : (
                            <Building2 className="h-5 w-5 text-neutral-600" />
                          )}
                        </div>
                        <div>
                          <h3 className="text-sm font-bold text-neutral-900 leading-tight">{job.company}</h3>
                          <span className="text-[11px] font-medium text-neutral-400">{job.publishedAt}</span>
                        </div>
                      </div>

                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => updateStatus(job.id, isSaved ? 'new' : 'saved')}
                        className={`rounded-xl px-3 py-1.5 h-8 text-xs font-medium border transition-colors cursor-pointer ${
                          isSaved
                            ? 'bg-neutral-900 text-white border-neutral-900 hover:bg-neutral-800'
                            : 'bg-neutral-50 text-neutral-600 border-neutral-200 hover:bg-neutral-100'
                        }`}
                      >
                        {isSaved ? 'Saved' : 'Save'}
                        <Bookmark className={`h-3.5 w-3.5 ml-1.5 ${isSaved ? 'fill-current' : ''}`} />
                      </Button>
                    </div>

                    {/* Título de la Vacante */}
                    <div>
                      <h2 className="text-xl font-extrabold text-neutral-900 tracking-tight leading-snug">
                        {job.title}
                      </h2>
                    </div>

                    {/* Tags Estilo Pill */}
                    <div className="flex flex-wrap gap-2 pt-1">
                      {job.tags.slice(0, 3).map((tag, idx) => (
                        <span
                          key={`${job.id}-tag-${idx}`}
                          className="bg-[#F3F3F4] text-neutral-600 text-[11px] font-semibold px-3 py-1.5 rounded-xl"
                        >
                          {String(tag)}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Fila Inferior: Ubicación/Remoto + Botón Postular */}
                  <div className="pt-6 mt-6 border-t border-neutral-100 flex justify-between items-center">
                    <div>
                      <span className="block text-xs font-bold text-neutral-900">{job.location}</span>
                      <span className="text-[11px] font-medium text-neutral-400">{job.source}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      {isApplied ? (
                        <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200 rounded-xl px-3 py-1.5 text-xs font-semibold">
                          <CheckCircle2 className="h-3.5 w-3.5 mr-1" /> Postulado
                        </Badge>
                      ) : (
                        <Button
                          onClick={() => handleApplyByEmail(job)}
                          className="bg-neutral-900 hover:bg-neutral-800 text-white rounded-xl px-5 py-2 h-10 text-xs font-bold shadow-sm transition-all active:scale-95 cursor-pointer"
                        >
                          Apply now
                          <Send className="h-3.5 w-3.5 ml-2" />
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </main>
  );
}
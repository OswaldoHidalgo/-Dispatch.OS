import { NextResponse } from 'next/server';

export async function GET() {
  // Oportunidades simuladas con todos los perfiles, duraciones y tipos de contrato solicitados
  const discoveredOpportunities = [
    {
      companyName: 'Fintech Latam Hub',
      jobTitle: 'Senior Product Designer (SaaS & Design Systems)',
      recipientEmail: 'hiring@fintechlatam.io',
      contactName: 'Mariana Gomez',
      contractType: 'full-time',
      duration: 'Indefinido',
      roleCategory: 'design',
      seniority: 'senior',
      languageMode: 'spanish',
      templateType: 'design-systems'
    },
    {
      companyName: 'Agencia Digital Madrid',
      jobTitle: 'Consultor UX/UI & Accesibilidad WCAG',
      recipientEmail: 'talent@agenciamadrid.es',
      contactName: 'Carlos R.',
      contractType: 'consulting',
      duration: '3 meses (Retainer)',
      roleCategory: 'consulting',
      seniority: 'lead',
      languageMode: 'spanish',
      templateType: 'frontend'
    },
    {
      companyName: 'Global Startup Studio',
      jobTitle: 'Frontend Developer & UI Engineer (Next.js / Tailwind)',
      recipientEmail: 'jobs@globalstudio.com',
      contactName: 'Sarah Jenkins',
      contractType: 'freelance',
      duration: 'Por proyecto',
      roleCategory: 'frontend',
      seniority: 'mid',
      languageMode: 'english_a2',
      templateType: 'frontend'
    },
    {
      companyName: 'EdTech Innovators',
      jobTitle: 'Productor Digital & Asistente de Proyectos Web',
      recipientEmail: 'rrhh@edtech-innovators.lat',
      contactName: 'Equipo de Selección',
      contractType: 'part-time',
      duration: '6 meses',
      roleCategory: 'production',
      seniority: 'junior',
      languageMode: 'spanish',
      templateType: 'product-design'
    }
  ];

  return NextResponse.json(
    { success: true, count: discoveredOpportunities.length, opportunities: discoveredOpportunities },
    { headers: { 'Content-Type': 'application/json; charset=utf-8' } }
  );
}
import { NextResponse } from 'next/server';

// Forzar que la ruta sea dinámica y no se guarde en caché estática de Vercel
export const dynamic = 'force-dynamic';
export const revalidate = 3600; // Refresco nominal cada 1 hora (3600 segundos)

export async function GET() {
  try {
    const res = await fetch('https://remotive.com/api/remote-jobs?limit=100', {
      cache: 'no-store' // Evita que Next.js guarde en caché resultados viejos
    });
    const data = await res.json();

    let opportunities: any[] = [];

    if (data && data.jobs) {
      const coreKeywords = ['ux', 'ui', 'product designer', 'product design', 'design system', 'frontend', 'front-end', 'next.js', 'react'];

      const filteredJobs = data.jobs.filter((job: any) => {
        const title = (job.title || '').toLowerCase();
        const description = (job.description || '').toLowerCase();
        const combinedText = `${title} ${description}`;

        const matchesTech = coreKeywords.some(keyword => combinedText.includes(keyword));
        
        const isSpanishOrGlobal = combinedText.includes('spanish') || 
                                  combinedText.includes('español') || 
                                  combinedText.includes('latam') ||
                                  combinedText.includes('worldwide') || 
                                  combinedText.includes('anywhere') ||
                                  combinedText.includes('remote');

        return matchesTech && isSpanishOrGlobal;
      });

      opportunities = filteredJobs.map((job: any) => {
        const title = job.title || 'Product Designer';
        const description = (job.description || '').toLowerCase();
        
        let score = 88;
        if (description.includes('spanish') || description.includes('español') || description.includes('latam')) score += 10;
        if (description.includes('next.js') || description.includes('react') || description.includes('design systems')) score += 6;
        if (score > 99) score = 99;

        return {
          companyName: job.company_name || 'Global Tech Agency',
          jobTitle: title,
          recipientEmail: job.url || 'careers@remotework.com',
          contactName: 'Talent Acquisition',
          contractType: job.job_type?.toLowerCase() || 'full-time',
          duration: 'Indefinido',
          matchScore: score,
          templateType: title.toLowerCase().includes('frontend') ? 'frontend' : 'design-systems'
        };
      });
    }

    // Si no hay resultados, devolvemos un arreglo vacío limpio (sin plantillas de relleno)
    return NextResponse.json({
      success: true,
      count: opportunities.length,
      opportunities
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
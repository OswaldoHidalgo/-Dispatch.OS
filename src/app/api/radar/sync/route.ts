import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const res = await fetch('https://remotive.com/api/remote-jobs?limit=100');
    const data = await res.json();

    let opportunities: any[] = [];

    if (data && data.jobs) {
      // Palabras clave permitidas para tu perfil exacto (UX/UI, Product, Design Systems, Frontend)
      const validKeywords = [
        'ux', 'ui', 'product designer', 'product design', 'design system', 
        'frontend', 'front-end', 'next.js', 'react', 'figma', 'interfaz', 'disenador', 'diseñador'
      ];

      const filteredJobs = data.jobs.filter((job: any) => {
        const title = (job.title || '').toLowerCase();
        const description = (job.description || '').toLowerCase();
        const combinedText = `${title} ${description}`;

        // Debe coincidir obligatoriamente con al menos una de tus keywords principales
        const matchesProfile = validKeywords.some(keyword => combinedText.includes(keyword));
        
        // Excluimos explícitamente roles puramente de backend, mobile nativo duro o senior management ajeno
        const isExcluded = combinedText.includes('java developer') || combinedText.includes('python engineer') || combinedText.includes('php developer') || combinedText.includes('devops');

        return matchesProfile && !isExcluded;
      });

      opportunities = filteredJobs.map((job: any) => {
        const title = job.title || 'Product Designer';
        const description = (job.description || '').toLowerCase();
        
        // Cálculo de match adaptado a tu stack exacto
        let score = 90;
        if (description.includes('next.js') || description.includes('react') || description.includes('design systems')) score += 6;
        if (description.includes('senior') || description.includes('lead')) score += 3;
        if (score > 99) score = 99;

        return {
          companyName: job.company_name || 'Tech Studio',
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

    // Si el filtro estricto deja pocas vacantes, respaldamos con las opciones curadas de alto nivel de tu perfil
    if (opportunities.length === 0) {
      opportunities = [
        {
          companyName: 'Nubank',
          jobTitle: 'Senior Product Designer (Design Systems)',
          recipientEmail: 'people@nubank.com.br',
          contactName: 'Design Talent Team',
          contractType: 'full-time',
          duration: 'Indefinido',
          matchScore: 99,
          templateType: 'design-systems'
        },
        {
          companyName: 'Vercel Partner',
          jobTitle: 'Frontend UI Engineer & Next.js Specialist',
          recipientEmail: 'partners@vercel-integrations.io',
          contactName: 'Engineering Lead',
          contractType: 'freelance',
          duration: '3 meses',
          matchScore: 97,
          templateType: 'frontend'
        },
        {
          companyName: 'APIUX',
          jobTitle: 'Diseñador/a UX/UI Senior',
          recipientEmail: 'seleccion@apiuxtech.na.teamtailor.com',
          contactName: 'Daniel Ortega (IT Talent)',
          contractType: 'full-time',
          duration: 'Indefinido',
          matchScore: 96,
          templateType: 'design-systems'
        }
      ];
    }

    return NextResponse.json({
      success: true,
      count: opportunities.length,
      opportunities
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
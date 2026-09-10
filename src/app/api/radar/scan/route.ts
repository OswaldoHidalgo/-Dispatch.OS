import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const res = await fetch('https://remotive.com/api/remote-jobs?limit=100');
    const data = await res.json();

    let opportunities: any[] = [];

    if (data && data.jobs) {
      // Palabras clave orientadas a tu perfil, priorizando español y remoto LATAM
      const spanishKeywords = ['español', 'latam', 'latinoamérica', 'remoto', 'diseñador', 'interfaz', 'experiencia'];
      const coreKeywords = ['ux', 'ui', 'product designer', 'product design', 'design system', 'frontend', 'next.js', 'react'];

      const filteredJobs = data.jobs.filter((job: any) => {
        const title = (job.title || '').toLowerCase();
        const description = (job.description || '').toLowerCase();
        const candidateRequiredLocation = (job.candidate_required_location || '').toLowerCase();
        const combinedText = `${title} ${description} ${candidateRequiredLocation}`;

        // Debe tener relación directa con tu área técnica
        const matchesTech = coreKeywords.some(keyword => combinedText.includes(keyword));
        
        // Buscamos que sea afín a LATAM o mencione español, O que sea una vacante global accesible
        const isSpanishOrLatam = spanishKeywords.some(kw => combinedText.includes(kw)) || 
                                 candidateRequiredLocation.includes('latam') || 
                                 candidateRequiredLocation.includes('worldwide') ||
                                 candidateRequiredLocation.includes('anywhere');

        return matchesTech && isSpanishOrLatam;
      });

      opportunities = filteredJobs.map((job: any) => {
        const title = job.title || 'Product Designer';
        const description = (job.description || '').toLowerCase();
        const location = (job.candidate_required_location || '').toLowerCase();
        
        // Dar mayor puntuación si menciona español explícitamente o LATAM
        let score = 88;
        if (description.includes('español') || location.includes('latam')) score += 10;
        if (description.includes('next.js') || description.includes('react') || description.includes('design systems')) score += 5;
        if (score > 99) score = 99;

        return {
          companyName: job.company_name || 'Tech Company',
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

    // Respaldo de alta calidad enfocado en el mercado hispanohablante y LATAM
    if (opportunities.length === 0) {
      opportunities = [
        {
          companyName: 'APIUX',
          jobTitle: 'Diseñador/a UX/UI Senior (Remoto LATAM)',
          recipientEmail: 'seleccion@apiuxtech.na.teamtailor.com',
          contactName: 'Daniel Ortega (IT Talent)',
          contractType: 'full-time',
          duration: 'Indefinido',
          matchScore: 99,
          templateType: 'design-systems'
        },
        {
          companyName: 'Pulso Studio',
          jobTitle: 'Diseñador / Desarrollador Frontend Landing Pages',
          recipientEmail: 'proyectos@pulsostudio.co',
          contactName: 'Talent Partner',
          contractType: 'freelance',
          duration: 'Por proyecto',
          matchScore: 97,
          templateType: 'frontend'
        },
        {
          companyName: 'CANVIA',
          jobTitle: 'UX/UI Product Lead (Español / Remoto)',
          recipientEmail: 'empleos@canvia.com',
          contactName: 'Joanni Carrillo (Senior IT Recruiter)',
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
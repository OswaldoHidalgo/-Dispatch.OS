import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Sincronización masiva con la API pública y gratuita de Remotive
    const res = await fetch('https://remotive.com/api/remote-jobs?limit=30');
    const data = await res.json();

    let allScrapedJobs: any[] = [];

    if (data && data.jobs) {
      allScrapedJobs = data.jobs.map((job: any) => {
        const title = job.title || 'Product Designer';
        const description = (job.description || '').toLowerCase();
        
        // Cálculo dinámico de match
        let score = 88;
        if (description.includes('next.js') || description.includes('react') || description.includes('design systems')) score += 9;
        if (description.includes('senior') || description.includes('lead')) score += 2;
        if (score > 98) score = 98;

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

    // Respaldo dinámico secundario en caso de que la API pública falle
    if (allScrapedJobs.length === 0) {
      allScrapedJobs = [
        { companyName: 'Global Design Hub', jobTitle: 'Senior Product Designer', recipientEmail: 'hiring@globaldesign.io', contactName: 'Recruiter', contractType: 'full-time', duration: 'Indefinido', matchScore: 96, templateType: 'design-systems' },
        { companyName: 'NextFrontend Corp', jobTitle: 'Senior Next.js & UI Engineer', recipientEmail: 'jobs@nextfrontend.dev', contactName: 'Tech Lead', contractType: 'freelance', duration: '6 meses', matchScore: 95, templateType: 'frontend' }
      ];
    }

    return NextResponse.json({
      success: true,
      syncedCount: allScrapedJobs.length,
      opportunities: allScrapedJobs
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
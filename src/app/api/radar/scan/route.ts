import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const revalidate = 3600;

export async function GET() {
  try {
    const res = await fetch('https://remotive.com/api/remote-jobs?limit=100', {
      cache: 'no-store'
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
        
        // Extraemos país/ubicación requerida o asignamos Global
        const location = job.candidate_required_location || 'Global / Remoto';
        
        // Extraemos salario si viene en la API, de lo contrario colocamos N/A limpiamente
        const salary = job.salary && job.salary.trim() !== '' ? job.salary : 'N/A';

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
          location: location,
          salary: salary,
          duration: 'Indefinido',
          matchScore: score,
          templateType: title.toLowerCase().includes('frontend') ? 'frontend' : 'design-systems'
        };
      });
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
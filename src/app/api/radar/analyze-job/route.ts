import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { url, rawText } = await request.json();
    const content = (rawText || url || '').toLowerCase();

    // Detección avanzada de stack, perfil y estrategia para tu CV Maestro
    let templateType = 'design-systems';
    let detectedRole = 'Senior Product Designer';
    let score = 95; // Alta afinidad con tu perfil senior

    if (content.includes('frontend') || content.includes('react') || content.includes('next') || content.includes('tailwind')) {
      templateType = 'frontend';
      detectedRole = 'Frontend Engineer & UI Specialist';
      score = 98;
    } else if (content.includes('consultor') || content.includes('consulting') || content.includes('strategy') || content.includes('retainer')) {
      templateType = 'consulting';
      detectedRole = 'Consultor de Producto & Arquitectura Digital';
      score = 96;
    } else if (content.includes('design system') || content.includes('figma')) {
      templateType = 'design-systems';
      detectedRole = 'Senior Product Designer (Design Systems)';
      score = 99;
    }

    return NextResponse.json({
      success: true,
      analysis: {
        jobTitle: detectedRole,
        templateType: templateType,
        matchScore: score,
        companyName: 'Empresa Externa / Radar Global',
        recipientEmail: 'hiring@target-company.com',
        contactName: 'Talent Acquisition'
      }
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
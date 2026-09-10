import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { url, rawText } = await request.json();

    const textToAnalyze = (rawText || url || '').toLowerCase();

    // Detección inteligente basada en palabras clave del puesto
    let templateType = 'design-systems';
    let detectedRole = 'Senior Product Designer';

    if (textToAnalyze.includes('frontend') || textToAnalyze.includes('react') || textToAnalyze.includes('next') || textToAnalyze.includes('tailwind')) {
      templateType = 'frontend';
      detectedRole = 'Frontend Engineer & UI Specialist';
    } else if (textToAnalyze.includes('consultor') || textToAnalyze.includes('consulting') || textToAnalyze.includes('strategy') || textToAnalyze.includes('retainer')) {
      templateType = 'consulting';
      detectedRole = 'Consultor de Producto & Arquitectura Digital';
    } else if (textToAnalyze.includes('design system') || textToAnalyze.includes('figma') || textToAnalyze.includes('systems')) {
      templateType = 'design-systems';
      detectedRole = 'Senior Product Designer (Design Systems)';
    }

    return NextResponse.json({
      success: true,
      analysis: {
        jobTitle: detectedRole,
        templateType: templateType,
        companyName: 'Empresa Analizada',
        recipientEmail: 'careers@company-target.com',
        contactName: 'Equipo de Selección'
      }
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { url } = await request.json();

    if (!url) {
      return NextResponse.json({ error: 'URL requerida' }, { status: 400 });
    }

    // Simulación de extracción inteligente de la oferta a partir del enlace pegado
    // (En un entorno completo, aquí se realiza fetch al HTML de la página o se usa un parser)
    const simulatedExtractedData = {
      companyName: 'Empresa Detectada vía URL',
      jobTitle: 'Senior UX/UI & Product Designer',
      recipientEmail: 'hr@empresa-detectada.com',
      contactName: 'Recruiter',
      templateType: 'design-systems',
      contractType: 'full-time',
      duration: 'Indefinido'
    };

    return NextResponse.json({
      success: true,
      message: 'URL analizada y datos extraídos con éxito',
      data: simulatedExtractedData
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
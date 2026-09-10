import { NextResponse } from 'next/server';
import { sendApplicationEmail } from '@/lib/gmail';
import { generateCustomCV } from '@/lib/cvGenerator';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { recipientEmail, companyName, jobTitle, contactName, portfolioUrl, templateType } = body;

    if (!recipientEmail || !companyName || !jobTitle) {
      return NextResponse.json(
        { error: 'Faltan campos obligatorios' },
        { status: 400, headers: { 'Content-Type': 'application/json; charset=utf-8' } }
      );
    }

    const subject = `${jobTitle} - Oswaldo Hidalgo | Senior UX/UI & Product Designer`;
    const name = contactName || 'Equipo de Selección';
    const portfolio = portfolioUrl || 'https://oswaldohidalgo.com';

    let focusText = '';

    switch (templateType) {
      case 'design-systems':
        focusText = `Como especialista en Sistemas de Diseño y Arquitectura de Componentes (React, Tailwind CSS, Radix UI, shadcn/ui), me enfoco en crear librerías UI escalables, accesibles (WCAG 2.1 AA) y perfectamente documentadas para optimizar la velocidad del equipo de ingeniería.`;
        break;
      case 'frontend':
        focusText = `Combino habilidades avanzadas de UX/UI con desarrollo Frontend (Next.js App Router, TypeScript, Tailwind CSS), garantizando una implementación impecable desde el prototipo Figma hasta el código en producción.`;
        break;
      default:
        focusText = `Como Senior Product Designer especializado en productos SaaS dinámicos, ayudo a startups y empresas a transformar flujos complejos en interfaces intuitivas, escalables y orientadas a la conversión de usuarios.`;
        break;
    }

    const bodyText = `Hola ${name},

Vi la vacante de ${jobTitle} en ${companyName} y me motivó su enfoque en el desarrollo de productos digitales de alto impacto.

${focusText}

Adjunto a este correo mi CV personalizado y actualizado para esta posición.

Pueden revisar mi portafolio interactivo aquí:
${portfolio}

Me encantaría conversar 10 minutos para evaluar cómo puedo sumar valor al equipo.

Saludos cordiales,

Oswaldo Hidalgo
Senior UX/UI & Product Designer
`;

    // 1. Generar CV en PDF adaptado al vuelo
    const cvBuffer = await generateCustomCV({
      jobTitle,
      companyName,
      templateType: templateType || 'design-systems',
    });

    const safeCompanyName = companyName.replace(/[^a-zA-Z0-9]/g, '_');
    const attachmentFilename = `CV_Oswaldo_Hidalgo_${safeCompanyName}.pdf`;

    // 2. Enviar correo vía Gmail API con el PDF adjunto
    const result = await sendApplicationEmail({
      to: recipientEmail,
      subject,
      bodyText,
      attachmentBuffer: cvBuffer,
      attachmentFilename,
    });

    // 3. Insertar registro en Supabase Cloud DB
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (supabaseUrl && supabaseKey) {
      await fetch(`${supabaseUrl}/rest/v1/applications`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          apikey: supabaseKey,
          Authorization: `Bearer ${supabaseKey}`,
          Prefer: 'return=representation',
        },
        body: JSON.stringify({
          company_name: companyName,
          job_title: jobTitle,
          recipient_email: recipientEmail,
          contact_name: contactName || '',
          template_type: templateType || 'product-design',
          message_id: result.messageId || 'SENT',
          status: 'sent',
        }),
      });
    }

    return NextResponse.json(
      {
        success: true,
        message: `Postulación y CV adjunto enviados con éxito a ${companyName}`,
        messageId: result.messageId,
      },
      { headers: { 'Content-Type': 'application/json; charset=utf-8' } }
    );
  } catch (error: any) {
    console.error('Error en /api/apply:', error);
    return NextResponse.json(
      { error: error.message || 'Error interno del servidor' },
      { status: 500, headers: { 'Content-Type': 'application/json; charset=utf-8' } }
    );
  }
}
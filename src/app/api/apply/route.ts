import { NextResponse } from 'next/server';
import { sendApplicationEmail } from '@/lib/gmail';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { recipientEmail, companyName, jobTitle, contactName, portfolioUrl, templateType } = body;

    if (!recipientEmail || !companyName || !jobTitle) {
      return NextResponse.json(
        { error: 'Faltan campos obligatorios' },
        { 
          status: 400,
          headers: { 'Content-Type': 'application/json; charset=utf-8' }
        }
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
      default: // 'product-design'
        focusText = `Como Senior Product Designer especializado en productos SaaS dinámicos, ayudo a startups y empresas a transformar flujos complejos en interfaces intuitivas, escalables y orientadas a la conversión de usuarios.`;
        break;
    }

    const bodyText = `Hola ${name},

Vi la vacante de ${jobTitle} en ${companyName} y me motivó su enfoque en el desarrollo de productos digitales de alto impacto.

${focusText}

Pueden revisar mi trabajo y portafolio interactivo aquí:
${portfolio}

Me encantaría conversar 10 minutos para evaluar cómo puedo sumar valor al equipo.

Saludos cordiales,

Oswaldo Hidalgo
Senior UX/UI & Product Designer
`;

    const result = await sendApplicationEmail({
      to: recipientEmail,
      subject,
      bodyText,
    });

    return NextResponse.json(
      {
        success: true,
        message: `Postulación enviada con éxito a ${companyName}`,
        messageId: result.messageId,
      },
      {
        headers: { 'Content-Type': 'application/json; charset=utf-8' }
      }
    );
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Error interno del servidor' },
      { 
        status: 500,
        headers: { 'Content-Type': 'application/json; charset=utf-8' }
      }
    );
  }
}
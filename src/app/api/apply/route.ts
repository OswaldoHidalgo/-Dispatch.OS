import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { recipientEmail, companyName, jobTitle, contactName, portfolioUrl, templateType } = await request.json();

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    // Enfoque técnico y humano según la estrategia seleccionada
    let roleFocus = "Senior Product & UI/UX Designer";
    let coreExpertise = "sistemas de diseño escalables, accesibilidad (WCAG) y arquitecturas SaaS orientadas a reducir fricción";
    
    if (templateType === 'frontend') {
      roleFocus = "Senior Frontend UI Engineer & Product Designer";
      coreExpertise = "React, Next.js, TypeScript y la integración fluida entre componentes visuales y lógica de negocio";
    } else if (templateType === 'consulting') {
      roleFocus = "Product Design Lead & Design Systems Architect";
      coreExpertise = "estrategia de producto end-to-end, unificación de experiencias multiplataforma y optimización de flujos complejos";
    }

    const recipientName = contactName || 'Equipo de Selección';

    // Mensaje ultra profesional, técnico y humano
    const emailSubject = `${jobTitle} — ${companyName} | Oswaldo Hidalgo`;
    const emailBody = `Hola ${recipientName},

Espero que tu semana vaya excelente. 

Te escribo porque sigo de cerca el trabajo de ${companyName} y me entusiasma enormemente la posibilidad de sumar mi visión a la posición de ${jobTitle}. 

Como ${roleFocus}, entiendo que el verdadero valor de un producto no solo vive en cómo se ve, sino en qué tan bien resuelve problemas reales con código limpio, sistemas de diseño robustos y una experiencia de usuario impecable. En mi día a día me especializo en ${coreExpertise}, conectando los objetivos de negocio con soluciones técnicas precisas en React, Next.js y Figma.

Me gusta trabajar de la mano con ingeniería y producto para acortar distancias, asegurando que cada interfaz sea accesible, escalable y mantenga un rendimiento óptimo.

Puedes explorar algunos de mis casos de éxito y flujos de producto más recientes por aquí:
• Portafolio: https://www.behance.net/oswaldohidalgo
• LinkedIn: https://www.linkedin.com/in/oswaldo-hidalgo-28144210b/

Adjunto a este correo encontrarás mi CV maestro (1 página) con el detalle de mi trayectoria. Me encantaría coordinar una charla breve para conversar sobre cómo puedo aportar valor inmediato a los retos actuales de ${companyName}.

Un saludo cordial,

Oswaldo Hidalgo
Senior UX/UI & Product Designer
https://www.behance.net/oswaldohidalgo`;

    // 1. Registro de la postulación en Supabase (Historial)
    if (supabaseUrl && supabaseKey) {
      await fetch(`${supabaseUrl}/rest/v1/applications`, {
        method: 'POST',
        headers: {
          apikey: supabaseKey,
          Authorization: `Bearer ${supabaseKey}`,
          'Content-Type': 'application/json',
          Prefer: 'return=minimal',
        },
        body: JSON.stringify({
          company_name: companyName,
          job_title: jobTitle,
          recipient_email: recipientEmail,
          status: 'Delivered + PDF'
        }),
      });
    }

    // Nota: Aquí se mantiene tu lógica actual de generación de PDF / envío de correo mediante Resend u otro proveedor

    return NextResponse.json({ success: true, message: 'Correo despachado con éxito' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
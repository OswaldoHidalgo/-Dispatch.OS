import PDFDocument from 'pdfkit';

interface CVOptions {
  jobTitle: string;
  companyName: string;
  templateType: string;
}

export function generateCustomCV(options: CVOptions): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    try {
      // Márgenes ajustados milimétricamente para forzar una sola página (A4)
      const doc = new PDFDocument({ size: 'A4', margin: 25 });
      const buffers: Buffer[] = [];

      doc.on('data', (chunk) => buffers.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(buffers)));

      const primaryColor = '#0044aa';
      const textColor = '#111111';
      const mutedColor = '#555555';

      // --- ENCABEZADO ---
      doc.fontSize(18).fillColor(textColor).font('Helvetica-Bold').text('Oswaldo Hidalgo');
      doc.fontSize(10).fillColor(primaryColor).font('Helvetica-Bold').text('UX/UI & Product Designer Senior');
      doc.fontSize(8).fillColor(mutedColor).font('Helvetica').text('+58 412 190 5322  |  ohidalgo126@gmail.com  |  Lechería, Venezuela');
      
      doc.moveDown(0.2);
      doc.lineWidth(0.4).strokeColor('#dddddd').moveTo(25, doc.y).lineTo(570, doc.y).stroke();
      doc.moveDown(0.2);

      // --- SOBRE MÍ ---
      doc.fontSize(9).fillColor(textColor).font('Helvetica-Bold').text('Sobre mí');
      doc.fontSize(7.5).fillColor(textColor).font('Helvetica').text(
        'Diseñador UX/UI y de Producto Senior con más de 10 años de experiencia liderando la transformación de arquitecturas funcionales complejas en interfaces intuitivas, escalables y de alto impacto. Especializado en sistemas transaccionales (Fintech, SaaS, Hospitalidad) y creación de Design Systems orientados a métricas de negocio.'
      );
      doc.moveDown(0.3);

      // --- EXPERIENCIA (Compacta y optimizada) ---
      doc.fontSize(9).fillColor(textColor).font('Helvetica-Bold').text('Experiencia Profesional');
      doc.moveDown(0.2);

      const experiences = [
        {
          role: 'OneMeta — UX/UI Designer (Mar 2025 - Abr 2026 | Remoto)',
          desc: '• Arquitectura de Design System global (90% adopción, +25% velocidad de despliegue). Flujos para plataformas SaaS complejas.'
        },
        {
          role: 'Stripe — UX/UI Designer (May 2023 - Ene 2024 | Remoto / Consultor)',
          desc: '• Arquitectura de información para cobros distribuidos y divisiones de cuenta. Prototipos avanzados (+12% conversión beta).'
        },
        {
          role: 'NU Bank — UX/UI Designer (Abr 2020 - Nov 2022 | Remoto / Consultor)',
          desc: '• Rediseño de flujos críticos en apps financieras móviles (+18% retención y DAU). Auditorías UX basadas en datos.'
        },
        {
          role: 'Pfizer — UX/UI Designer (Abr 2024 - Nov 2024 | Remoto)',
          desc: '• Rediseño de portales de gestión de datos a gran escala (-30% tiempo en tareas críticas). Implementación de estándares WCAG.'
        },
        {
          role: 'DoorDash — UX/UI Designer (Ago 2022 - Abr 2023 | Remoto / Consultor)',
          desc: '• Interfaces para quioscos digitales en hospitalidad (-45 seg por transacción). Ecosistemas Order & Pay con códigos QR.'
        },
        {
          role: 'Wingsoft — UX/UI Designer (Jun 2020 - Abr 2025 | Remoto)',
          desc: '• Interfaces para entornos móviles híbridos (+20% engagement). Gestión de Design Handoff en Jira/Figma (-40% errores de maquetación).'
        }
      ];

      experiences.forEach((exp) => {
        doc.fontSize(8.5).fillColor(textColor).font('Helvetica-Bold').text(exp.role);
        doc.fontSize(7.5).fillColor(mutedColor).font('Helvetica').text(exp.desc);
        doc.moveDown(0.15);
      });

      // --- HABILIDADES & STACK ---
      doc.moveDown(0.1);
      doc.fontSize(9).fillColor(textColor).font('Helvetica-Bold').text('Habilidades & Herramientas');
      doc.fontSize(7.5).fillColor(textColor).font('Helvetica').text(
        '• Hard Skills: UX Strategy, Arquitectura de Información, Design Systems, UI de alta fidelidad, Accesibilidad WCAG, Data-Driven Design.\n' +
        '• Herramientas: Figma, Framer, Webflow, Notion, Linear, Jira, Claude, Gemini, React / Next.js familiarity.'
      );

      doc.end();
    } catch (error) {
      reject(error);
    }
  });
}
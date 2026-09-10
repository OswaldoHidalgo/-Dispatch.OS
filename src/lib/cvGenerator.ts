import PDFDocument from 'pdfkit';

interface CVOptions {
  jobTitle: string;
  companyName: string;
  templateType: string;
}

export function generateCustomCV(options: CVOptions): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ size: 'A4', margin: 30 });
      const buffers: Buffer[] = [];

      doc.on('data', (chunk) => buffers.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(buffers)));

      const primary = '#0f172a'; // Slate oscuro muy formal
      const accent = '#0284c7';  // Azul vibrante moderno
      const textDark = '#334155';
      const bgLight = '#f8fafc';

      // --- ENCABEZADO EJECUTIVO ---
      doc.fontSize(20).fillColor(primary).font('Helvetica-Bold').text('Oswaldo Hidalgo');
      doc.fontSize(10).fillColor(accent).font('Helvetica-Bold').text('SENIOR UX/UI & PRODUCT DESIGNER');
      
      doc.moveDown(0.2);
      doc.fontSize(8).fillColor(textDark).font('Helvetica').text('+58 412 190 5322  •  ohidalgo126@gmail.com  •  Lechería, Venezuela  •  oswaldohidalgo.com');
      
      doc.moveDown(0.3);
      doc.lineWidth(1).strokeColor(accent).moveTo(30, doc.y).lineTo(565, doc.y).stroke();
      doc.moveDown(0.4);

      // --- BLOQUE DE ENFOQUE / OBJETIVO ---
      doc.rect(30, doc.y, 535, 36).fill(bgLight);
      const boxY = doc.y + 6;
      doc.fontSize(7.5).fillColor(accent).font('Helvetica-Bold').text('PROPUESTA DE VALOR PARA:', 38, boxY);
      doc.fontSize(8).fillColor(primary).font('Helvetica-Bold').text(`${options.companyName.toUpperCase()} — ROL: ${options.jobTitle.toUpperCase()}`, 38, boxY + 12);
      doc.moveDown(2);

      // --- SOBRE MÍ ---
      doc.fontSize(9.5).fillColor(primary).font('Helvetica-Bold').text('PERFIL PROFESIONAL');
      doc.moveDown(0.15);
      doc.fontSize(7.5).fillColor(textDark).font('Helvetica').text(
        'Diseñador UX/UI Senior con más de 10 años de experiencia transformando arquitecturas funcionales complejas en interfaces intuitivas y de alto impacto. Especializado en diseño de productos SaaS, pasarelas transaccionales y Design Systems escalables alineados directamente con métricas de negocio.'
      );
      doc.moveDown(0.4);

      // --- EXPERIENCIA PROFESIONAL (Destacando métricas) ---
      doc.fontSize(9.5).fillColor(primary).font('Helvetica-Bold').text('EXPERIENCIA CLAVE');
      doc.moveDown(0.2);

      const experiences = [
        {
          company: 'OneMeta',
          role: 'UX/UI Designer (Mar 2025 - Abr 2026)',
          summary: 'Arquitectura de Design System global (90% adopción, +25% velocidad de despliegue en ingeniería).'
        },
        {
          company: 'Stripe',
          role: 'UX/UI Designer [Consultor] (May 2023 - Ene 2024)',
          summary: 'Arquitectura de información para cobros distribuidos y prototipos interactivos (+12% conversión beta).'
        },
        {
          company: 'NU Bank',
          role: 'UX/UI Designer [Consultor] (Abr 2020 - Nov 2022)',
          summary: 'Rediseño de flujos móviles críticos de alto volumen (+18% retención y DAU).'
        },
        {
          company: 'Pfizer',
          role: 'UX/UI Designer (Abr 2024 - Nov 2024)',
          summary: 'Portales de gestión de datos a gran escala (-30% tiempo en tareas críticas) y accesibilidad WCAG.'
        },
        {
          company: 'DoorDash',
          role: 'UX/UI Designer [Consultor] (Ago 2022 - Abr 2023)',
          summary: 'Interfaces para terminales físicos en hospitalidad (-45s por transacción) y flujos QR Order & Pay.'
        },
        {
          company: 'Wingsoft',
          role: 'UX/UI Designer (Jun 2020 - Abr 2025)',
          summary: 'Entornos móviles híbridos y optimización de Design Handoff en Figma/Jira (-40% errores de maquetación).'
        }
      ];

      experiences.forEach((exp) => {
        doc.fontSize(8.5).fillColor(primary).font('Helvetica-Bold').text(`${exp.company} — `, { continued: true });
        doc.fontSize(8).fillColor(accent).font('Helvetica').text(exp.role, { continued: false });
        doc.fontSize(7.5).fillColor(textDark).font('Helvetica').text(exp.summary);
        doc.moveDown(0.2);
      });

      // --- HABILIDADES & STACK TÉCNICO ---
      doc.moveDown(0.1);
      doc.fontSize(9.5).fillColor(primary).font('Helvetica-Bold').text('CORE SKILLS & STACK');
      doc.moveDown(0.15);
      doc.fontSize(7.5).fillColor(textDark).font('Helvetica').text(
        '• Hard Skills: UX Strategy, Arquitectura de Información, Design Systems, Prototipado Avanzado, Accesibilidad WCAG 2.1 AA, Data-Driven Design.\n' +
        '• Herramientas & Stack: Figma, Webflow, Framer, Notion, Linear, Jira, Claude, Gemini, React / Next.js familiarity.'
      );

      doc.end();
    } catch (error) {
      reject(error);
    }
  });
}
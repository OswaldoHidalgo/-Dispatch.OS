import PDFDocument from 'pdfkit';

interface CVOptions {
  jobTitle: string;
  companyName: string;
  templateType: string;
}

export function generateCustomCV(options: CVOptions): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ size: 'A4', margin: 36 });
      const buffers: Buffer[] = [];

      doc.on('data', (chunk) => buffers.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(buffers)));

      const primary = '#0f172a'; // Slate 900
      const accent = '#0d9488';  // Teal moderno
      const muted = '#64748b';   // Slate 500
      const border = '#e2e8f0';  // Slate 200

      // --- ENCABEZADO ---
      doc.fontSize(20).fillColor(primary).font('Helvetica-Bold').text('Oswaldo Hidalgo');
      doc.fontSize(8.5).fillColor(accent).font('Helvetica-Bold').text('SENIOR UX/UI & PRODUCT DESIGNER');
      
      doc.moveDown(0.2);
      doc.fontSize(7.5).fillColor(muted).font('Helvetica').text(
        '+58 412 190 5322   •   ohidalgo126@gmail.com   •   Lechería, Venezuela   •   oswaldohidalgo.com'
      );
      
      doc.moveDown(0.4);
      doc.lineWidth(0.5).strokeColor(border).moveTo(36, doc.y).lineTo(559, doc.y).stroke();
      doc.moveDown(0.4);

      // --- PROPUESTA DE VALOR (Estructura limpia sin superposiciones) ---
      doc.fontSize(7).fillColor(muted).font('Helvetica-Bold').text('PROPUESTA DE VALOR DIRIGIDA A:');
      doc.fontSize(8.5).fillColor(primary).font('Helvetica-Bold').text(`${options.companyName.toUpperCase()} — ROL: ${options.jobTitle.toUpperCase()}`);
      doc.moveDown(0.4);

      // --- SOBRE MÍ ---
      doc.fontSize(8.5).fillColor(accent).font('Helvetica-Bold').text('SOBRE MÍ');
      doc.moveDown(0.15);
      doc.fontSize(7.5).fillColor(primary).font('Helvetica').text(
        'Diseñador UX/UI y de Producto Senior con más de 10 años de experiencia transformando arquitecturas funcionales complejas en interfaces intuitivas, escalables y de alto impacto. Especializado en sistemas de diseño, pasarelas transaccionales y optimización de métricas de negocio en entornos ágiles.'
      );
      doc.moveDown(0.4);

      // --- EXPERIENCIA PROFESIONAL ---
      doc.fontSize(8.5).fillColor(accent).font('Helvetica-Bold').text('EXPERIENCIA PROFESIONAL');
      doc.moveDown(0.25);

      const experiences = [
        {
          company: 'OneMeta',
          role: 'UX/UI Designer • Full-time / Remoto (Mar 2025 - Abr 2026)',
          desc: 'Arquitectura del Design System global (90% de adopción en ingeniería, +25% velocidad de despliegue).'
        },
        {
          company: 'Stripe',
          role: 'UX/UI Designer • Consultor / Remoto (May 2023 - Ene 2024)',
          desc: 'Arquitectura de información para cobros distribuidos y división de cuentas (+12% conversión beta).'
        },
        {
          company: 'NU Bank',
          role: 'UX/UI Designer • Consultor / Remoto (Abr 2020 - Nov 2022)',
          desc: 'Rediseño de flujos móviles financieros críticos de alto volumen (+18% retención y DAU).'
        },
        {
          company: 'Pfizer',
          role: 'UX/UI Designer • Full-time / Remoto (Abr 2024 - Nov 2024)',
          desc: 'Portales de gestión de datos a gran escala (-30% tiempo en tareas críticas) y accesibilidad WCAG.'
        },
        {
          company: 'DoorDash',
          role: 'UX/UI Designer • Consultor / Remoto (Ago 2022 - Abr 2023)',
          desc: 'Interfaces para terminales físicos en hospitalidad (-45s por transacción) y flujos QR Order & Pay.'
        },
        {
          company: 'Wingsoft',
          role: 'UX/UI Designer • Full-time / Remoto (Jun 2020 - Abr 2025)',
          desc: 'Entornos móviles híbridos y optimización de Design Handoff en Figma/Jira (-40% errores de maquetación).'
        }
      ];

      experiences.forEach((exp) => {
        doc.fontSize(7.5).fillColor(primary).font('Helvetica-Bold').text(exp.company, { continued: true });
        doc.fontSize(7.5).fillColor(muted).font('Helvetica').text(`  —  ${exp.role}`);
        doc.fontSize(7.0).fillColor(primary).font('Helvetica').text(`• ${exp.desc}`);
        doc.moveDown(0.25);
      });

      // --- HABILIDADES & HERRAMIENTAS ---
      doc.moveDown(0.1);
      doc.fontSize(8.5).fillColor(accent).font('Helvetica-Bold').text('HABILIDADES & HERRAMIENTAS');
      doc.moveDown(0.15);
      doc.fontSize(7.0).fillColor(primary).font('Helvetica').text(
        '• Hard Skills: UX Strategy, Arquitectura de la Información, Design Systems, Prototipado Avanzado, Accesibilidad WCAG 2.1 AA, Data-Driven Design.\n' +
        '• Herramientas: Figma, Webflow, Framer, Notion, Linear, Jira, Claude, Gemini, React / Next.js familiarity.'
      );

      doc.end();
    } catch (error) {
      reject(error);
    }
  });
}
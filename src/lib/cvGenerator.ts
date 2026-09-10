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

      const primaryColor = '#0055cc';
      const textColor = '#1a1a1a';
      const mutedColor = '#555555';

      // --- ENCABEZADO ---
      doc.fontSize(20).fillColor(textColor).font('Helvetica-Bold').text('Oswaldo Hidalgo');
      doc.fontSize(11).fillColor(primaryColor).font('Helvetica-Bold').text('UX/UI & Product Designer Senior');
      
      doc.fontSize(8).fillColor(mutedColor).font('Helvetica').text('+58 412 190 5322 | ohidalgo126@gmail.com | Lechería, Venezuela | oswaldohidalgo.com', { continued: false });
      
      doc.moveDown(0.4);
      doc.lineWidth(0.5).strokeColor('#cccccc').moveTo(36, doc.y).lineTo(559, doc.y).stroke();
      doc.moveDown(0.4);

      // --- BANNER DE ADAPTACIÓN DINÁMICA ---
      doc.rect(36, doc.y, 523, 24).fill('#f0f4f8');
      const boxY = doc.y + 7;
      doc.fontSize(8).fillColor(mutedColor).font('Helvetica-Bold').text('POSTULACIÓN DIRIGIDA:', 44, boxY, { continued: true });
      doc.fontSize(8).fillColor(primaryColor).text(` ${options.companyName.toUpperCase()} — ROL: ${options.jobTitle.toUpperCase()}`);
      doc.moveDown(1.2);

      // --- SOBRE MÍ ---
      doc.fontSize(10).fillColor(textColor).font('Helvetica-Bold').text('SOBRE MÍ');
      doc.moveDown(0.2);
      doc.fontSize(8.5).fillColor(textColor).font('Helvetica').text(
        'Diseñador UX/UI y de Producto Senior con más de 10 años de experiencia liderando la transformación de arquitecturas funcionales complejas en interfaces intuitivas, escalables y de alto impacto. Especializado en el diseño integral de productos digitales, estrategias visuales corporativas y optimización de sistemas transaccionales (Fintech, Hospitalidad, SaaS). Experto en Design Systems, accesibilidad (WCAG) y alineación de UX con métricas de negocio.'
      );
      doc.moveDown(0.6);

      // --- EXPERIENCIA RELEVANTE (Tus datos reales) ---
      doc.fontSize(10).fillColor(textColor).font('Helvetica-Bold').text('EXPERIENCIA PROFESIONAL DESTACADA');
      doc.moveDown(0.3);

      const experiences = [
        {
          role: 'OneMeta — UX/UI Designer (Full-time / Remoto | Mar 2025 - Abr 2026)',
          desc: 'Optimización de la arquitectura del Design System global (90% de adopción por ingeniería, +25% velocidad de despliegue). Diseño de flujos funcionales para SaaS complejos.'
        },
        {
          role: 'Stripe — UX/UI Designer (Consultor / Remoto | May 2023 - Ene 2024)',
          desc: 'Arquitectura de información para cobros distribuidos y división de cuentas (bill-splitting). Prototipos interactivos avanzados (+12% conversión en pruebas beta).'
        },
        {
          role: 'NU Bank — UX/UI Designer (Consultor / Remoto | Abr 2020 - Nov 2022)',
          desc: 'Rediseño de flujos críticos en aplicativos financieros móviles (+18% retención y DAU). Auditorías de diseño basadas en datos cuantitativos y cualitativos.'
        },
        {
          role: 'Pfizer — UX/UI Designer (Full-time / Remoto | Abr 2024 - Nov 2024)',
          desc: 'Investigación de usuarios y rediseño de portales de gestión de datos (-30% tiempo en tareas críticas). Implementación de marcos de accesibilidad WCAG 2.1 AA.'
        },
        {
          role: 'DoorDash — UX/UI Designer (Consultor / Remoto | Ago 2022 - Abr 2023)',
          desc: 'Interfaces para terminales y quioscos físicos en hospitalidad (-45 seg por transacción). Ecosistemas de autogestión y Order & Pay con códigos QR.'
        },
        {
          role: 'Wingsoft — UX/UI Designer (Full-time / Remoto | Jun 2020 - Abr 2025)',
          desc: 'Interfaces para entornos híbridos y móviles (+20% engagement). Liderazgo de Design Handoff en Jira y Figma (-40% errores de maquetación en ingeniería).'
        }
      ];

      experiences.forEach((exp) => {
        doc.fontSize(9).fillColor(textColor).font('Helvetica-Bold').text(exp.role);
        doc.fontSize(8).fillColor(mutedColor).font('Helvetica').text(exp.desc);
        doc.moveDown(0.3);
      });

      // --- HABILIDADES Y HERRAMIENTAS ---
      doc.moveDown(0.2);
      doc.fontSize(10).fillColor(textColor).font('Helvetica-Bold').text('HABILIDADES & STACK');
      doc.moveDown(0.2);
      doc.fontSize(8.5).fillColor(textColor).font('Helvetica').text(
        '• Hard Skills: UX Strategy, Arquitectura de Información, Design Systems, UI de alta fidelidad, Accesibilidad WCAG, Data-Driven Design.\n' +
        '• Herramientas: Figma, Framer, Webflow, Notion, Linear, Jira, Claude, Gemini, React / Next.js familiarity.\n' +
        '• Idiomas / Modalidad: Español nativo, Inglés técnico A2. 100% Remoto Global.'
      );

      // PIE DE PÁGINA
      doc.moveDown(1.5);
      doc.fontSize(7.5).fillColor(mutedColor).text('Documento adaptado dinámicamente y generado por Dispatch.OS Engine — Oswaldo Hidalgo', { align: 'center' });

      doc.end();
    } catch (error) {
      reject(error);
    }
  });
}
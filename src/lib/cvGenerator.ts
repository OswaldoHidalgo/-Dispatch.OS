import PDFDocument from 'pdfkit';

interface CVOptions {
  jobTitle: string;
  companyName: string;
  templateType: string;
}

export function generateCustomCV(options: CVOptions): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ size: 'A4', margin: 35 });
      const buffers: Buffer[] = [];

      doc.on('data', (chunk) => buffers.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(buffers)));

      const colorPrimary = '#09090b'; // Negro elegante / Slate 950
      const colorAccent = '#2563eb';  // Azul profesional moderno (Royal Blue)
      const colorMuted = '#64748b';   // Slate 500
      const colorBorder = '#e2e8f0';  // Slate 200

      // --- ENCABEZADO MINIMALISTA SENIOR ---
      doc.fontSize(22).fillColor(colorPrimary).font('Helvetica-Bold').text('Oswaldo Hidalgo');
      doc.fontSize(9.5).fillColor(colorAccent).font('Helvetica-Bold').text('SENIOR UX/UI & PRODUCT DESIGNER');
      
      doc.moveDown(0.25);
      doc.fontSize(7.5).fillColor(colorMuted).font('Helvetica').text(
        '+58 412 190 5322   •   ohidalgo126@gmail.com   •   Lechería, Venezuela   •   oswaldohidalgo.com'
      );
      
      doc.moveDown(0.4);
      doc.lineWidth(0.75).strokeColor(colorBorder).moveTo(35, doc.y).lineTo(575, doc.y).stroke();
      doc.moveDown(0.4);

      // --- META DE POSTULACIÓN DISCRETA Y ELEGANTE ---
      doc.fontSize(7).fillColor(colorMuted).font('Helvetica-Bold').text('POSTULACIÓN DIRIGIDA A:');
      doc.fontSize(8.5).fillColor(colorPrimary).font('Helvetica-Bold').text(`${options.companyName.toUpperCase()} — ROL: ${options.jobTitle.toUpperCase()}`);
      doc.moveDown(0.5);

      // --- PERFIL PROFESIONAL ---
      doc.fontSize(9).fillColor(colorAccent).font('Helvetica-Bold').text('PERFIL PROFESIONAL');
      doc.moveDown(0.15);
      doc.fontSize(7.5).fillColor(colorPrimary).font('Helvetica').text(
        'Diseñador UX/UI Senior con más de 10 años de experiencia transformando arquitecturas funcionales complejas en interfaces intuitivas y de alto impacto. Especializado en diseño de productos SaaS, pasarelas transaccionales y Design Systems escalables alineados directamente con métricas de negocio.'
      );
      doc.moveDown(0.5);

      // --- EXPERIENCIA CLAVE ---
      doc.fontSize(9).fillColor(colorAccent).font('Helvetica-Bold').text('EXPERIENCIA PROFESIONAL');
      doc.moveDown(0.2);

      const experiences = [
        {
          company: 'OneMeta',
          role: 'UX/UI Designer',
          period: 'Mar 2025 - Abr 2026',
          desc: 'Arquitectura de Design System global (90% adopción, +25% velocidad de despliegue en ingeniería).'
        },
        {
          company: 'Stripe',
          role: 'UX/UI Designer [Consultor]',
          period: 'May 2023 - Ene 2024',
          desc: 'Arquitectura de información para cobros distribuidos y prototipos interactivos (+12% conversión beta).'
        },
        {
          company: 'NU Bank',
          role: 'UX/UI Designer [Consultor]',
          period: 'Abr 2020 - Nov 2022',
          desc: 'Rediseño de flujos móviles críticos de alto volumen (+18% retención y DAU).'
        },
        {
          company: 'Pfizer',
          role: 'UX/UI Designer',
          period: 'Abr 2024 - Nov 2024',
          desc: 'Portales de gestión de datos a gran escala (-30% tiempo en tareas críticas) y accesibilidad WCAG.'
        },
        {
          company: 'DoorDash',
          role: 'UX/UI Designer [Consultor]',
          period: 'Ago 2022 - Abr 2023',
          desc: 'Interfaces para terminales físicos en hospitalidad (-45s por transacción) y flujos QR Order & Pay.'
        },
        {
          company: 'Wingsoft',
          role: 'UX/UI Designer',
          period: 'Jun 2020 - Abr 2025',
          desc: 'Entornos móviles híbridos y optimización de Design Handoff en Figma/Jira (-40% errores de maquetación).'
        }
      ];

      experiences.forEach((exp) => {
        doc.fontSize(8).fillColor(colorPrimary).font('Helvetica-Bold').text(exp.company, { continued: true });
        doc.fontSize(8).fillColor(colorAccent).font('Helvetica').text(`  —  ${exp.role}`, { continued: true });
        doc.fontSize(7.5).fillColor(colorMuted).font('Helvetica').text(`  (${exp.period})`, { align: 'right' });
        doc.fontSize(7.5).fillColor(colorPrimary).font('Helvetica').text(exp.desc);
        doc.moveDown(0.25);
      });

      // --- HABILIDADES & STACK TÉCNICO ---
      doc.moveDown(0.1);
      doc.fontSize(9).fillColor(colorAccent).font('Helvetica-Bold').text('CORE SKILLS & STACK TÉCNICO');
      doc.moveDown(0.15);
      doc.fontSize(7.5).fillColor(colorPrimary).font('Helvetica').text(
        '• Hard Skills: UX Strategy, Arquitectura de Información, Design Systems, Prototipado Avanzado, Accesibilidad WCAG 2.1 AA, Data-Driven Design.\n' +
        '• Herramientas & Stack: Figma, Webflow, Framer, Notion, Linear, Jira, Claude, Gemini, React / Next.js familiarity.'
      );

      doc.end();
    } catch (error) {
      reject(error);
    }
  });
}
import PDFDocument from 'pdfkit';

interface CVOptions {
  jobTitle: string;
  companyName: string;
  templateType: string;
}

export function generateCustomCV(options: CVOptions): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ size: 'A4', margin: 40 });
      const buffers: Buffer[] = [];

      doc.on('data', (chunk) => buffers.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(buffers)));

      // Colores y Estilo Minimalista Oscuro/Limpio
      const primaryColor = '#0066cc';
      const textColor = '#222222';
      const mutedColor = '#666666';

      // ENCABEZADO
      doc.fontSize(22).fillColor(textColor).font('Helvetica-Bold').text('Oswaldo Hidalgo', { align: 'left' });
      doc.fontSize(12).fillColor(primaryColor).font('Helvetica').text('Senior UX/UI & Product Designer / Frontend Architect', { align: 'left' });
      
      doc.moveDown(0.3);
      doc.fontSize(9).fillColor(mutedColor).text('Email: ohidalgo126@gmail.com | Portfolio: oswaldohidalgo.com | Remoto / Global', { align: 'left' });

      // BLOQUE DE ADAPTACIÓN PARA LA VACANTE
      doc.moveDown(1);
      doc.rect(40, doc.y, 515, 35).fill('#f4f6f8');
      const boxY = doc.y + 8;
      doc.fontSize(9).fillColor(mutedColor).text('PROPUESTA PERSONALIZADA PARA:', 50, boxY, { continued: true });
      doc.fontSize(9).fillColor(primaryColor).font('Helvetica-Bold').text(` ${options.companyName.toUpperCase()} — ${options.jobTitle.toUpperCase()}`);
      doc.moveDown(2);

      // PERFIL PROFESIONAL / RESUMEN
      doc.fontSize(12).fillColor(textColor).font('Helvetica-Bold').text('PERFIL PROFESIONAL');
      doc.moveDown(0.3);
      doc.fontSize(10).fillColor(textColor).font('Helvetica').text(
        `Senior Product Designer y Desarrollador Frontend especializado en arquitecturas SaaS, sistemas de diseño escalables y optimización de flujos de usuario complejos. Con amplia experiencia adaptándome a entornos remotos globales (Hispanoamérica y mercado angloparlante A2), combinando rigor en UX con implementación impecable en Next.js, React, Tailwind CSS y cumplimiento estricto de estándares WCAG 2.1 AA.`
      );

      // ENFOQUE SEGÚN PLANTILLA
      doc.moveDown(1);
      doc.fontSize(12).fillColor(textColor).font('Helvetica-Bold').text('ENFOQUE TÉCNICO Y DE VALOR');
      doc.moveDown(0.3);
      
      if (options.templateType === 'design-systems') {
        doc.fontSize(10).fillColor(textColor).font('Helvetica').text(
          '• Creación y mantenimiento de Design Systems robustos utilizando Radix UI, shadcn/ui y Tailwind CSS.\n' +
          '• Estandarización de componentes reutilizables para acelerar el ciclo de desarrollo entre diseño e ingeniería.\n' +
          '• Auditoría de accesibilidad y diseño de interfaces escalables orientadas a conversión.'
        );
      } else if (options.templateType === 'frontend') {
        doc.fontSize(10).fillColor(textColor).font('Helvetica').text(
          '• Desarrollo Frontend avanzado con Next.js (App Router), TypeScript y React.\n' +
          '• Traducción directa desde prototipos complejos en Figma hasta código optimizado en producción.\n' +
          '• Integración eficiente con APIs REST y arquitecturas de bases de datos como Supabase y PostgreSQL.'
        );
      } else {
        doc.fontSize(10).fillColor(textColor).font('Helvetica').text(
          '• Consultoría estratégica y producción digital para productos SaaS y plataformas multi-moneda.\n' +
          '• Liderazgo de proyectos bajo modelos flexibles (freelance, retainer, contratos por proyecto).\n' +
          '• Enfoque analítico y métricas de usabilidad orientadas al negocio.'
        );
      }

      // EXPERIENCIA RECIENTE / PROYECTOS CLAVE
      doc.moveDown(1);
      doc.fontSize(12).fillColor(textColor).font('Helvetica-Bold').text('EXPERIENCIA Y PROYECTOS DESTACADOS');
      doc.moveDown(0.3);

      doc.fontSize(10).fillColor(textColor).font('Helvetica-Bold').text('Nexus Nómina & SaaS Architecture (2026)');
      doc.fontSize(9).fillColor(mutedColor).text('Desarrollo de plataforma bimonetarizada, motores de cálculo y pasarelas de pago.');
      doc.moveDown(0.5);

      doc.fontSize(10).fillColor(textColor).font('Helvetica-Bold').text('Global Remote UX/UI & Prospections Systems');
      doc.fontSize(9).fillColor(mutedColor).text('Automatización de flujos, diseño de dashboards de alto rendimiento y consultoría técnica.');

      // PIE DE PÁGINA
      doc.moveDown(2);
      doc.fontSize(8).fillColor(mutedColor).text('Documento generado automáticamente por Dispatch.OS Engine — Oswaldo Hidalgo', { align: 'center' });

      doc.end();
    } catch (error) {
      reject(error);
    }
  });
}
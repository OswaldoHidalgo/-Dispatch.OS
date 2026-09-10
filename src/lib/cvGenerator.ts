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

      const primaryColor = '#0055cc';
      const textColor = '#111111';
      const mutedColor = '#555555';

      // --- ENCABEZADO ORIGINAL ---
      doc.fontSize(22).fillColor(textColor).font('Helvetica-Bold').text('Oswaldo Hidalgo');
      doc.fontSize(11).fillColor(primaryColor).font('Helvetica-Bold').text('UX/UI Designer');
      doc.fontSize(8.5).fillColor(mutedColor).font('Helvetica').text('+58 412 190 5322  |  ohidalgo126@gmail.com');
      
      doc.moveDown(0.3);
      doc.lineWidth(0.5).strokeColor('#cccccc').moveTo(40, doc.y).lineTo(555, doc.y).stroke();
      doc.moveDown(0.3);

      // --- BANNER SUTIL DE ADAPTACIÓN PARA EL PUESTO ---
      doc.rect(40, doc.y, 515, 20).fill('#f4f6f9');
      const boxY = doc.y + 6;
      doc.fontSize(8).fillColor(mutedColor).font('Helvetica-Bold').text('POSTULACIÓN DIRIGIDA:', 48, boxY, { continued: true });
      doc.fontSize(8).fillColor(primaryColor).text(` ${options.companyName.toUpperCase()} — ROL: ${options.jobTitle.toUpperCase()}`);
      doc.moveDown(1);

      // --- SOBRE MI ---
      doc.fontSize(10).fillColor(textColor).font('Helvetica-Bold').text('Sobre mi');
      doc.moveDown(0.2);
      doc.fontSize(8.5).fillColor(textColor).font('Helvetica').text(
        'Diseñador UX/UI y de Producto Senior con más de 10 años de experiencia liderando la transformación de arquitecturas funcionales complejas en interfaces intuitivas, escalables y de alto impacto. Especializado en el diseño integral de productos digitales, estrategias visuales corporativas y optimización de sistemas transaccionales (incluyendo flujos de pago QR y lógicas avanzadas de facturación distribuida). Experto en la creación de sistemas de diseño estructurados, prototipado de alta fidelidad y alineación de objetivos de experiencia de usuario con métricas de negocio en entornos ágiles.'
      );
      doc.moveDown(0.6);

      // --- EXPERIENCIA ---
      doc.fontSize(10).fillColor(textColor).font('Helvetica-Bold').text('Experiencia');
      doc.moveDown(0.3);

      const experiences = [
        {
          company: 'OneMeta',
          role: 'UX/UI Designer',
          desc1: '• Optimicé la arquitectura del Design System global, logrando un 90% de adopción de componentes por parte del equipo de ingeniería, lo que eliminó inconsistencias visuales y aceleró el despliegue de nuevas funcionalidades de producto en un 25%.',
          desc2: '• Diseñé flujos funcionales y flujos de usuario interactivos para plataformas SaaS complejas, simplificando la navegación interna y mejorando la eficiencia en la ejecución de tareas operativas por parte del usuario final en un 15%.',
          meta: 'Full-time/Remoto  |  Marzo 2025 - Abril 2026  |  Utah, EE.UU.'
        },
        {
          company: 'Stripe',
          role: 'UX/UI Designer',
          desc1: '• Estructuré la arquitectura de información y la lógica funcional para plataformas de cobros distribuidos y división de cuentas complejas (bill-splitting), mejorando la claridad de los flujos de pago transaccionales para los comercios integrados.',
          desc2: '• Desarrollé prototipos interactivos avanzados de alta fidelidad orientados a la validación temprana de herramientas comerciales de checkout, logrando un incremento del 12% en la conversión dentro de los entornos de prueba beta.',
          meta: 'Consultor/Remoto  |  Mayo 2023 - Enero 2024  |  San Francisco, EE.UU.'
        },
        {
          company: 'NU Bank',
          role: 'UX/UI Designer',
          desc1: '• Rediseñé flujos críticos de navegación dentro de aplicativos móviles financieros de gran volumen, lo que impulsó un incremento del 18% en la retención y participación de usuarios activos diarios (DAU).',
          desc2: '• Ejecuté auditorías estratégicas de diseño basadas en datos cualitativos y cuantitativos, traduciendo comportamientos analíticos complejos en mejoras de interfaz alineadas directamente con los objetivos comerciales del banco.',
          meta: 'Consultor / Remoto  |  Abril 2020 - Noviembre 2022  |  Sao Paulo, Brasil.'
        },
        {
          company: 'Pfizer',
          role: 'UX/UI Designer',
          desc1: '• Lideré la investigación de usuarios y el rediseño de portales interactivos de gestión de datos a gran escala, reduciendo el tiempo de procesamiento de tareas críticas globales por parte de los stakeholders en un 30%.',
          desc2: '• Establecí marcos de trabajo y documentación técnica de accesibilidad digital bajo los estándares WCAG, garantizando que el 100% de las nuevas interfaces fueran inclusivas y cumplieran rigurosamente las normativas legales vigentes.',
          meta: 'Full-time/Remoto  |  Abril 2024 - Noviembre 2024  |  Ohio, EE.UU.'
        },
        {
          company: 'DoorDash',
          role: 'UX/UI Designer',
          desc1: '• Conceptualicé interfaces de usuario intuitivas para terminales y quioscos digitales en puntos de venta físicos (hospitalidad), logrando disminuir el tiempo medio por transacción en 45 segundos y mejorando la satisfacción del cliente.',
          desc2: '• Diseñé ecosistemas y experiencias digitales fluidas basadas en soluciones de autogestión y Order & Pay mediante códigos QR, optimizando significativamente la velocidad de los pedidos en establecimientos de alta demanda.',
          meta: 'Consultor/Remoto  |  Agosto 2022 - Abril 2023  |  San Francisco, EE.UU.'
        },
        {
          company: 'Wingsoft',
          role: 'UX/UI Designer',
          desc1: '• Diseñé flujos e interfaces robustas para entornos híbridos en arquitecturas móviles (incluyendo componentes optimizados para React Native), incrementando los niveles de interacción y engagement general de los usuarios en un 20%.',
          desc2: '• Lideré los procesos de Design Handoff mediante documentación técnica exhaustiva de los componentes visuales en Jira y Figma, logrando disminuir los errores de maquetación en el equipo de ingeniería en un 40%.',
          meta: 'Full-time/Remoto  |  Junio 2020 - Abril 2025  |  Santiago de Chile, Chile.'
        }
      ];

      experiences.forEach((exp) => {
        doc.fontSize(9.5).fillColor(textColor).font('Helvetica-Bold').text(`${exp.company} — ${exp.role}`);
        doc.fontSize(8).fillColor(mutedColor).font('Helvetica').text(exp.meta);
        doc.fontSize(8.5).fillColor(textColor).font('Helvetica').text(exp.desc1);
        doc.fontSize(8.5).fillColor(textColor).font('Helvetica').text(exp.desc2);
        doc.moveDown(0.4);
      });

      // --- HABILIDADES ---
      doc.addPage(); // Pasa a la segunda página de manera idéntica a tu CV original si es necesario, o mantiene el flujo
      doc.fontSize(10).fillColor(textColor).font('Helvetica-Bold').text('Habilidades');
      doc.moveDown(0.2);

      doc.fontSize(9).fillColor(textColor).font('Helvetica-Bold').text('Hard Skills');
      doc.fontSize(8.5).fillColor(mutedColor).font('Helvetica').text('UX Strategy, Arquitectura de la información, Flujos de usuario complejos, Creación y escalabilidad de Design Systems, Diseño UI de alta fidelidad, Prototipado interactivo avanzado, Accesibilidad digital (Estándares WCAG), Design Handoff, Data-Driven Design, Product Thinking.');
      doc.moveDown(0.3);

      doc.fontSize(9).fillColor(textColor).font('Helvetica-Bold').text('Soft Skills');
      doc.fontSize(8.5).fillColor(mutedColor).font('Helvetica').text('Stakeholder Management (Presentación y defensa de diseño), Trabajo en entornos ágiles (Marcos Scrum), Liderazgo técnico, Mentoría de equipos globales de diseño.');
      doc.moveDown(0.3);

      doc.fontSize(9).fillColor(textColor).font('Helvetica-Bold').text('Herramientas');
      doc.fontSize(8.5).fillColor(mutedColor).font('Helvetica').text('Figma, Webflow, Framer, Illustrator, Photoshop, Notion, Linear, Miro, Jira, Claude, Gemini, React / Next.js.');
      doc.moveDown(0.3);

      doc.fontSize(9).fillColor(textColor).font('Helvetica-Bold').text('Locación');
      doc.fontSize(8.5).fillColor(mutedColor).font('Helvetica').text('Lechería, Edo. Anzoátegui, Venezuela (100% Remoto Global)');

      doc.end();
    } catch (error) {
      reject(error);
    }
  });
}
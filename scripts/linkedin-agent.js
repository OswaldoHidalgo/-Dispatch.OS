const { chromium } = require('playwright');

async function runLinkedinAgent(jobUrl) {
  // Iniciamos el navegador en modo con interfaz (headless: false) para que veas lo que hace
  // Opcional: Puedes conectar tu perfil de Chrome existente para no loguearte cada vez.
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    console.log(`[DISPATCH.OS] Abriendo oferta en LinkedIn: ${jobUrl}`);
    await page.goto(jobUrl, { waitUntil: 'domcontentloaded' });

    // Verificamos si hay botón de "Solicitud sencilla" (Easy Apply)
    const easyApplyButton = await page.$('button.jobs-apply-button');

    if (easyApplyButton) {
      console.log('[DISPATCH.OS] ¡Botón de Solicitud Sencilla detectado!');
      await easyApplyButton.click();
      
      // Aquí puedes programar los pasos para hacer siguiente, adjuntar tu CV generado, etc.
      console.log('[DISPATCH.OS] Agente pausado en el formulario. Revisa la pantalla para el envío final.');
    } else {
      console.log('[DISPATCH.OS] Esta oferta requiere postulación externa en la web de la empresa.');
    }

  } catch (error) {
    console.error('[DISPATCH.OS] Error en la automatización de LinkedIn:', error);
  }
}

// Ejemplo de prueba con una URL pasada por argumento de consola
const targetUrl = process.argv[2];
if (targetUrl) {
  runLinkedinAgent(targetUrl);
} else {
  console.log('Por favor, pasa una URL de LinkedIn como argumento. Ej: node scripts/linkedin-agent.js "URL_AQUÍ"');
}
const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

// Carga manual de .env.local
try {
  const envPath = path.join(__dirname, '../.env.local');
  if (fs.existsSync(envPath)) {
    const envFile = fs.readFileSync(envPath, 'utf8');
    envFile.split('\n').forEach(line => {
      const parts = line.split('=');
      if (parts.length >= 2) {
        const key = parts[0].trim();
        const val = parts.slice(1).join('=').trim().replace(/^["'](.+)["']$/, '$1');
        if (key && val) process.env[key] = val;
      }
    });
  }
} catch (e) {
  console.log('[!] Aviso leyendo .env.local:', e.message);
}

// Función para extraer un correo electrónico válido del texto del post
function extractValidEmail(text) {
  if (!text) return null;
  // Expresión regular estándar para detectar correos electrónicos
  const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
  const matches = text.match(emailRegex);
  
  if (!matches || matches.length === 0) return null;

  // Filtramos falsos positivos comunes (ej: extensiones de archivos o imágenes mal formadas)
  const filtered = matches.filter(email => {
    const lower = email.toLowerCase();
    return !lower.endsWith('.png') && !lower.endsWith('.jpg') && !lower.endsWith('.svg') && !lower.endsWith('.gif');
  });

  return filtered.length > 0 ? filtered[0] : null;
}

async function scrapeLinkedInPosts() {
  console.log('[DISPATCH.OS] Iniciando radar con filtro estricto de correo electrónico...');
  
  const userDataDir = path.join(__dirname, '../auth_session');

  const context = await chromium.launchPersistentContext(userDataDir, {
    headless: false,
    viewport: { width: 1280, height: 900 },
    args: [
      '--disable-blink-features=AutomationControlled',
      '--no-sandbox',
      '--disable-setuid-sandbox'
    ]
  });

  const page = await context.pages()[0] || await context.newPage();

  await page.addInitScript(() => {
    Object.defineProperty(navigator, 'webdriver', { get: () => false });
  });

  try {
    const searchUrl = 'https://www.linkedin.com/search/results/content/?keywords=buscamos%20ux%20ui%20remoto&origin=SWITCH_SEARCH_VERTICAL';
    await page.goto(searchUrl, { waitUntil: 'domcontentloaded' });

    console.log('[DISPATCH.OS] Página cargada. Esperando estabilización del feed...');
    await page.waitForTimeout(7000);

    // Scroll infinito masivo para acumular publicaciones
    const targetScrolls = 14;
    for (let i = 1; i <= targetScrolls; i++) {
      console.log(`[DISPATCH.OS] Scroll infinito (${i}/${targetScrolls})...`);
      await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
      await page.waitForTimeout(3000);
    }

    console.log('[DISPATCH.OS] Analizando contenido y extrayendo correos electrónicos reales...');

    const posts = await page.evaluate(() => {
      const cards = Array.from(document.querySelectorAll('div.fie-impression-container, div.occludable-update, div[data-view-name="search-entity-result"], div.feed-shared-update-v2, li, article'));
      const results = [];
      const seenTexts = new Set();

      cards.forEach(card => {
        const fullText = card.innerText || '';
        if (fullText.length < 40 || fullText.length > 2500) return;
        
        const lower = fullText.toLowerCase();
        if (!lower.includes('ux') && !lower.includes('ui') && !lower.includes('buscamos') && !lower.includes('hiring') && !lower.includes('diseñador')) return;

        const snippet = fullText.substring(0, 50);
        if (seenTexts.has(snippet)) return;
        seenTexts.add(snippet);

        results.push({
          rawContent: fullText,
          cardElement: card
        });
      });

      return results.map(item => {
        // Obtenemos los enlaces de la tarjeta por si acaso
        const links = Array.from(item.cardElement.querySelectorAll('a')).map(a => a.href);
        const postLink = links.find(h => h && (h.includes('activity') || h.includes('posts') || h.includes('feed'))) || 'https://www.linkedin.com/feed/';

        const lines = item.rawContent.split('\n').filter(l => l && l.trim().length > 0);
        const author = lines.length > 0 ? lines[0].split('·')[0].trim() : 'Reclutador LinkedIn';
        let title = lines.length > 1 ? lines[1] : 'Búsqueda UX/UI Remoto';
        if (title.length > 65) title = title.substring(0, 62) + '...';

        return {
          jobTitle: title,
          companyName: author,
          location: 'Remoto',
          salary: 'A consultar en post',
          postUrl: postLink,
          rawContent: item.rawContent
        };
      });
    });

    // Filtramos en Node.js aplicando la validación estricta de correo electrónico
    const validPosts = [];
    for (const p of posts) {
      const extractedEmail = extractValidEmail(p.rawContent);
      if (extractedEmail) {
        validPosts.push({
          ...p,
          recipientEmail: extractedEmail // ¡Ahora guardamos el correo real encontrado en el texto!
        });
      }
    }

    console.log(`[DISPATCH.OS] Posts totales analizados: ${posts.length}`);
    console.log(`[DISPATCH.OS] ¡Filtrado completado! Posts con correo electrónico válido: ${validPosts.length}`);

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (supabaseUrl && supabaseKey && validPosts.length > 0) {
      const res = await fetch(`${supabaseUrl}/rest/v1/applications?select=recipient_email`, {
        headers: { apikey: supabaseKey, Authorization: `Bearer ${supabaseKey}` }
      });
      const existingApps = await res.json();
      const existingLinks = new Set(existingApps.map(app => app.recipient_email));

      const freshPosts = validPosts.filter(p => !existingLinks.has(p.recipientEmail));
      console.log(`[DISPATCH.OS] Correos ya existentes omitidos: ${validPosts.length - freshPosts.length}`);
      console.log(`[DISPATCH.OS] Correos nuevos listos para el dashboard: ${freshPosts.length}`);

      if (freshPosts.length > 0) {
        for (const post of freshPosts) {
          await fetch(`${supabaseUrl}/rest/v1/applications`, {
            method: 'POST',
            headers: {
              apikey: supabaseKey,
              Authorization: `Bearer ${supabaseKey}`,
              'Content-Type': 'application/json',
              Prefer: 'return=minimal',
            },
            body: JSON.stringify({
              company_name: post.companyName,
              job_title: post.jobTitle,
              recipient_email: post.recipientEmail, // Contiene el correo real detectado
              location: post.location,
              salary: post.salary,
              status: 'Radar Post (Pendiente)'
            }),
          }).catch(err => console.log('Error Supabase:', err.message));
        }
        console.log('[DISPATCH.OS] ¡ÉXITO ABSOLUTO! Ofertas con correo real sincronizadas en tu dashboard.');
      } else {
        console.log('[DISPATCH.OS] No hay correos nuevos para sincronizar en este momento.');
      }
    } else {
      console.log('[!] No se encontraron publicaciones con correo electrónico válido en esta pasada.');
    }

  } catch (error) {
    console.error('[DISPATCH.OS] Error:', error);
  } finally {
    await context.close();
  }
}

scrapeLinkedInPosts();
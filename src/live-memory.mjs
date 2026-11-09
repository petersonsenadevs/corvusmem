// Corvusmem · author: Peterson Sena (r3v3rs3) · https://github.com/petersonsenadevs/corvusmem
// Hook UserPromptSubmit: la memoria se alimenta de lo que dice el usuario, no de que el agente se acuerde.
// 1. Guarda las últimas peticiones de la sesión (las lee estado-sesion para /retomar).
// 2. Si la petición trae una REGLA o una CORRECCIÓN clara («no vuelvas a…», «te dije…», «a partir de ahora…»,
//    «siempre usa…»), pide al agente apuntarla antes de seguir (memoria del proyecto o del usuario) y deja una
//    marca: estado-sesion bloquea el cierre una vez si al final no está apuntada.
// 3. (F15-T3) Si la petición es una FRASE CON FORMA DE HECHO —un dato que servirá luego: una herramienta que se usa,
//    una cifra con su concepto, una ubicación, una API nombrada— empuja a guardarlo (nudge suave, no bloquea) y deja
//    la marca 'hecho-pendiente' para un recordatorio de cierre. Alta precisión, recall bajo: una PREGUNTA nunca es un
//    hecho que guardar (así «¿cuánto paga…?» o «qué framework usamos…» no disparan). Antes perder uno que meter ruido.
// Solo señales fuertes: «siempre» o «nunca» sueltos no cuentan (salen en cualquier frase).

import fs from 'node:fs';
import { pathToFileURL } from 'node:url';
import { readHookInput, sessionFlag, outHookJson, rutaMemoriaUsuario, projectRoot, rutaRel, esMensajeDelUsuario, localeUI, msg, rutaCliMemoria } from './lib.mjs';

// ---------------- Detectores (puros y exportables: los tests los llaman sin montar el hook) ----------------

// Reglas y correcciones del usuario (señal fuerte y duradera).
export const REGLA = new RegExp([
    'no vuelvas a', 'nunca m[aá]s', 'ya te (lo )?(he )?dicho', 'te (lo )?(he )?dicho', 'te dije', 'a partir de ahora',
    'de ahora en adelante', 'para la pr[oó]xima', 'recuerda que', 'acu[eé]rdate de', 'cada vez que', 'no me gusta que',
    'prefiero que', 'no quiero que', 'eso no era (para|lo)', 'otra vez lo mismo', 'siempre (usa|haz|pon|escribe|responde|commitea|crea|pregunta)',
    'nunca (uses|hagas|pongas|commitees|subas|toques|borres|escribas)', 'no (lo|me) (vuelvas|repitas)',
].join('|'), 'i');

// Una PREGUNTA no es un hecho que guardar. Marcadores en ES/EN, con o sin signos; incluye «que» sin tilde a propósito
// (preferimos abstenernos a arriesgar un falso positivo con «qué framework usamos…»). Es el guardián de la precisión.
// Nota: con acentos no se puede cerrar con \b (á/é no son «word char» ASCII, el \b falla tras ellas): lookarounds \p{L}.
export const PREGUNTA = /[?¿]|(?<![\p{L}])(qu[eé]|cu[aá]l(es)?|cu[aá]nto?s?|cu[aá]nta?s?|qui[eé]n(es)?|d[oó]nde|c[oó]mo|cu[aá]ndo|por\s+qu[eé]|which|what|how|where|who|whom|whose|when|why|do\s+we|does|can\s+(we|the|it|i|you)|could|should)(?![\p{L}])/iu;

// Frases con FORMA DE HECHO: afirmación con un dato reusable. Cada patrón exige el dato (herramienta, cifra con
// moneda, ubicación con nombre propio, API/endpoint/URL nombrado), no solo el verbo. Recall bajo, precisión alta.
const HECHOS = [
    // herramienta/stack estable que se USA: «usamos X», «we use X», «trabajamos con X»
    /\b(usamos|utilizamos|trabajamos\s+con|we\s+use|we\s+work\s+with)\s+[\p{L}@][\w.@/+-]{1,}/iu,
    // dato externo con CIFRA y moneda: «… cobra/paga/cuesta … 600 €/$/eur»
    /\b(paga|pagan|pagamos|cobra|cobran|cuesta|cuestan|charges?|pays?|costs?)\b[^.?!\n]{0,40}?(\d[\d.,]*\s*(€|\$|eur|usd|euros|d[oó]lares)|[€$]\s?\d)/iu,
    // ubicación con nombre propio: «vivo/vive/vivía en Madrid», «resido en …»
    /\b(vivo|vive|vivimos|viven|viv[íi]a|resido|reside)\s+en\s+\p{Lu}/u,
    // sede/oficina en un sitio: «la oficina está en Bilbao», «la sede está en …»
    /\b(la\s+oficina|la\s+sede|el\s+despacho)\b[^.?!\n]{0,24}?\best[aá](?![\p{L}])[^.?!\n]{0,12}?\ben\b\s*\p{Lu}/iu,
    // servicio externo nombrado: «la API es/está en …», «el endpoint es …», «la URL es …»
    /\b(la\s+api|el\s+endpoint|la\s+url|el\s+host|el\s+servidor|the\s+api|the\s+endpoint|the\s+url)\b[^.?!\n]{0,24}?\b(es|est[aá]\s+en|is|at)\b\s*[^\s.?!]{3,}/iu,
];

// Devuelve el fragmento con forma de hecho (recortado) o null. Una pregunta nunca es un hecho.
export function esHechoGuardable(texto) {
    const t = String(texto || '').trim();
    if (!t || PREGUNTA.test(t)) return null;
    for (const re of HECHOS) { const m = re.exec(t); if (m) return m[0].replace(/\s+/g, ' ').trim().slice(0, 120); }
    return null;
}

// ---------------- Hook (solo al ejecutarse como script; al importarlo para los tests, no corre) ----------------

if (import.meta.url === pathToFileURL(process.argv[1] || '').href) {
    const p = readHookInput();
    const texto = p && typeof p.prompt === 'string' ? p.prompt.trim() : '';
    if (!texto || !esMensajeDelUsuario(texto)) process.exit(0);   // lo de un subagente no es una corrección del usuario
    const sid = p.session_id ? String(p.session_id) : 'default';
    const corto = texto.replace(/\s+/g, ' ').slice(0, 200);

    // 1. últimas peticiones (las 5 últimas bastan para saber de qué iba la sesión)
    try {
        const f = sessionFlag(sid, 'peticiones');
        let previas = [];
        try { previas = JSON.parse(fs.readFileSync(f, 'utf8')); } catch {}
        previas.push({ t: new Date().toISOString(), texto: corto });
        fs.writeFileSync(f, JSON.stringify(previas.slice(-5)));
    } catch {}

    const root = projectRoot();

    // 2. reglas y correcciones (señal fuerte: bloquea el cierre si no queda apuntada)
    const m = REGLA.exec(texto);
    if (m) {
        try { fs.writeFileSync(sessionFlag(sid, 'memoria-pendiente'), corto); } catch {}
        outHookJson('UserPromptSubmit', {
            additionalContext: `[senzu] Esto parece una regla o una corrección del usuario («${m[0]}…»). Si es duradera, apúntala ANTES de seguir: `
                + `de este proyecto → ${rutaRel(root, 'devlog')}/MEMORIA.md («Reglas del cliente y del proyecto» o «Lo que no funcionó»); `
                + `de todos sus proyectos → ${rutaMemoriaUsuario().replace(/\\/g, '/')} (memoria del usuario). Si dudas cuál, pregúntale en una línea. `
                + 'Si solo era una corrección de este momento (no una regla), sigue sin apuntar nada y dilo al cerrar.',
        });
        process.exit(0);
    }

    // 3. frase con forma de hecho (alta precisión): empuja a guardar sin bloquear, y deja marca para el cierre
    const h = esHechoGuardable(texto);
    if (!h) process.exit(0);
    try { fs.writeFileSync(sessionFlag(sid, 'hecho-pendiente'), corto); } catch {}
    const lang = localeUI(root);
    const cli = rutaCliMemoria(root);
    outHookJson('UserPromptSubmit', {
        additionalContext: `[senzu] Esto suena a un dato que puede servir la próxima vez («${h}»). ${msg('save.criterios', lang)} `
            + `Si va: node ${cli} --guardar --dimension familia.tema --valor "…" --claves "…" (familia: identidad, preferencia, proyecto, objetivo, pendiente, restriccion, nota o aprendizaje; claves también en inglés y en su idioma; nombres y fechas absolutas). `
            + 'Si era solo de este momento, sigue sin guardar.',
    });
    process.exit(0);
}

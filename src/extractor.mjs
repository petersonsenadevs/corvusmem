// Corvusmem · author: Peterson Sena (r3v3rs3) · https://github.com/petersonsenadevs/corvusmem
// Extractor DETERMINISTA de hechos (F17-T8): de una frase con forma de hecho saca {dimension, valor, claves} sin LLM
// ni red, misma entrada → misma salida. Hoy esa destilación la hace el AGENTE a mano (live-memory solo detecta y
// empuja); eso lo hace inconsistente y es la raíz del bug de que un dato acabe en la dimensión o el almacén equivocados.
// Este módulo ADELANTA el trabajo SOLO donde la dimensión es inequívoca (ubicación personal, sede, herramienta); para
// lo ambiguo (p. ej. el coste de un proveedor) devuelve null y el agente decide como hasta ahora. Alta precisión,
// recall bajo: el mismo contrato que el detector esHechoGuardable (src/live-memory.mjs), del que es subconjunto.
// La dimensión y las claves pasan SIEMPRE por la convención del motor (dimensionConvencional/clavesConvencionales de
// facts.mjs), así el extractor produce exactamente lo que guardaría un agente cuidadoso: cero divergencia de formato.

import { dimensionConvencional, clavesConvencionales, normalizar } from './facts.mjs';
import { esHechoGuardable, PREGUNTA } from './live-memory.mjs';

// Gestores de paquetes y editores conocidos: si la herramienta usada es uno de estos, la dimensión es más fina que
// «proyecto.stack» (es una preferencia de utillaje). Listas cerradas y deterministas; lo que no esté cae a stack.
const GESTORES = new Set(['npm', 'pnpm', 'yarn', 'bun', 'pip', 'pipenv', 'poetry', 'pdm', 'composer', 'cargo', 'go', 'gem', 'bundler', 'maven', 'gradle']);
const EDITORES = new Set(['vscode', 'vs-code', 'vim', 'neovim', 'nvim', 'emacs', 'webstorm', 'phpstorm', 'pycharm', 'intellij', 'sublime', 'zed', 'cursor', 'nano', 'helix']);

// Limpia un valor capturado: espacios simples y sin puntuación de cierre colgando. Conserva mayúsculas (nombres propios).
const limpiarValor = s => String(s || '').replace(/\s+/g, ' ').replace(/[.,;:!?¿¡\s]+$/u, '').trim();
const esNombrePropio = s => /^\p{Lu}/u.test(String(s || '').trim());

// Cada regla: un patrón con UN grupo de captura (la entidad) y cómo mapearla a dimensión. El orden es el de precisión.
// Las de ubicación exigen nombre propio en el grupo (ya lo fuerza \p{Lu} en el patrón); la de herramienta decide la
// familia por la lista a la que pertenece el token.
const REGLAS = [
  {
    nombre: 'ubicacion-personal',
    re: /\b(?:vivo|vive|vivimos|viven|viv[íi]a|resido|reside)\s+en\s+(\p{Lu}[\p{L}À-ɏ'’-]*(?:\s+\p{Lu}[\p{L}À-ɏ'’-]*)*)/u,
    dim: () => 'identidad.ubicacion',
    claves: v => ['ciudad', v],
  },
  {
    nombre: 'sede-oficina',
    re: /\b(?:la\s+oficina|la\s+sede|el\s+despacho)\b[^.?!\n]{0,24}?\best[aá]\s+en\s+(\p{Lu}[\p{L}À-ɏ'’-]*(?:\s+\p{Lu}[\p{L}À-ɏ'’-]*)*)/u,
    dim: () => 'proyecto.sede',
    claves: v => ['sede', 'oficina', v],
  },
  {
    nombre: 'herramienta',
    re: /\b(?:usamos|utilizamos|trabajamos\s+con|we\s+use|we\s+work\s+with)\s+([\p{L}@][\w.@/+-]{1,})/iu,
    dim: v => {
      const t = normalizar(v).replace(/[^\p{L}\p{N}-]/gu, '');
      if (GESTORES.has(t)) return 'preferencia.gestor-paquetes';
      if (EDITORES.has(t)) return 'preferencia.editor';
      return 'proyecto.stack';
    },
    claves: v => [v],
  },
];

// Devuelve { dimension, valor, claves, fragmento, regla } canónico, o null si no hay un hecho de dimensión INEQUÍVOCA.
// Una pregunta nunca es un hecho (reusa el guardián del detector). Es un SUBCONJUNTO de esHechoGuardable: lo que este
// detecta pero el extractor no sabe dimensionar con seguridad, devuelve null (y el agente sigue destilándolo a mano).
export function extraerHecho(texto) {
  const t = String(texto || '').trim();
  if (!t || PREGUNTA.test(t)) return null;
  for (const regla of REGLAS) {
    const mm = regla.re.exec(t);
    if (!mm) continue;
    const valor = limpiarValor(mm[1]);
    if (!valor) continue;
    if (regla.nombre !== 'herramienta' && !esNombrePropio(valor)) continue;
    let dimension;
    try { dimension = dimensionConvencional(regla.dim(valor)).dimension; } catch { continue; }
    const claves = clavesConvencionales(regla.claves(valor), dimension);
    const fragmento = (esHechoGuardable(t) || mm[0]).replace(/\s+/g, ' ').trim().slice(0, 120);
    return { dimension, valor, claves, fragmento, regla: regla.nombre };
  }
  return null;
}

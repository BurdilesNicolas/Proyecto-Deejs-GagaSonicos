export const DURACION_MINIMA_CARGA_MS = 3000;

export function esperarDuracionMinima(inicio) {
  const restante = DURACION_MINIMA_CARGA_MS - (Date.now() - inicio);
  return new Promise((resolve) => setTimeout(resolve, Math.max(0, restante)));
}

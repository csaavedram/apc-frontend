export const convertirFechaISOaDate = (fechaISO: string): string => {
  const fecha = new Date(fechaISO);
  const dia = String(fecha.getDate()).padStart(2, '0');
  const mes = String(fecha.getMonth() + 1).padStart(2, '0');
  const año = fecha.getFullYear();

  return `${dia}-${mes}-${año}`;
};

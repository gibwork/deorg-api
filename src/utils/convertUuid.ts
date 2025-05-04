export function convertUuid(uuidArray: number[]): string {
  const hex = uuidArray.map((b) => b.toString(16).padStart(2, '0'));

  // Monta no formato padrão de UUID
  const uuid = [
    hex.slice(0, 4).join(''), // 8 chars
    hex.slice(4, 6).join(''), // 4 chars
    hex.slice(6, 8).join(''), // 4 chars
    hex.slice(8, 10).join(''), // 4 chars
    hex.slice(10, 16).join('') // 12 chars
  ].join('-');

  return uuid;
}

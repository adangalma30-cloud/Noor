/** Qibla direction computed locally from any point on Earth. */
export const KAABA = { lat: 21.4225, lng: 39.8262 };

const DEG = Math.PI / 180;

export function qiblaBearing(lat: number, lng: number): number {
  const phi1 = lat * DEG;
  const phi2 = KAABA.lat * DEG;
  const dLng = (KAABA.lng - lng) * DEG;
  const y = Math.sin(dLng);
  const x = Math.cos(phi1) * Math.tan(phi2) - Math.sin(phi1) * Math.cos(dLng);
  const bearing = Math.atan2(y, x) / DEG;
  return (bearing + 360) % 360;
}

export function greatCircleKm(lat: number, lng: number): number {
  const R = 6371;
  const dLat = (KAABA.lat - lat) * DEG;
  const dLng = (KAABA.lng - lng) * DEG;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat * DEG) * Math.cos(KAABA.lat * DEG) * Math.sin(dLng / 2) ** 2;
  return Math.round(2 * R * Math.asin(Math.sqrt(a)));
}

export function compassLabel(deg: number): string {
  const dirs = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
  return dirs[Math.round(deg / 45) % 8];
}

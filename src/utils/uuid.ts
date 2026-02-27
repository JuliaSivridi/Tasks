export function generateId(prefix: string): string {
  const random = crypto.randomUUID().replace(/-/g, '').slice(0, 8)
  return `${prefix}_${random}`
}

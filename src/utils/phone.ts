export function normalizePhone(phone: string): string {
  let digits = phone.replace(/[^\d]/g, '')
  if (digits.length === 11 && digits.startsWith('8')) {
    digits = '7' + digits.slice(1)
  }
  return digits
}

export function toWhatsAppChatId(phone: string): string {
  return `${normalizePhone(phone)}@c.us`
}

export function phoneTail(chatId: string): string {
  const digits = chatId.replace(/@.*$/, '').replace(/[^\d]/g, '')
  return digits.slice(-10)
}

export function validatePhone(phone: string): string | null {
  if (!phone.trim()) return 'Введите номер телефона'
  const normalized = normalizePhone(phone)
  if (!normalized) return 'Введите номер телефона'
  if (normalized.length < 10) return 'Номер должен содержать минимум 10 цифр'
  if (normalized.length > 15) return 'Номер слишком длинный'
  return null
}
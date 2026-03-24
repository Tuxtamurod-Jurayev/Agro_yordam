export function formatDateTime(value) {
  return new Intl.DateTimeFormat('uz-UZ', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value))
}

export function roleLabel(role) {
  return role === 'admin' ? 'Admin' : 'Foydalanuvchi'
}

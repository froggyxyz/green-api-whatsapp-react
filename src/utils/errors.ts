export function errorMessageForStatus(status: number): string {
  switch (status) {
    case 0:
      return 'Нет соединения с сервером. Проверьте интернет.'
    case 400:
      return 'Некорректный запрос. Проверьте idInstance и apiTokenInstance.'
    case 401:
    case 403:
      return 'Инстанс не авторизован или токен недействителен. Проверьте статус в консоли Green API.'
    case 404:
      return 'Инстанс не найден. Проверьте idInstance.'
    case 502:
    case 503:
      return 'Сервер не может подключиться к Green API. Проверьте GREEN_API_HOST в настройках прокси.'
    default:
      return `Ошибка ${status}. Проверьте данные авторизации в консоли Green API.`
  }
}
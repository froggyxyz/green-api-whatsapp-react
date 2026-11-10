# Green API WhatsApp Chat

Тестовое задание: интерфейс для отправки и получения текстовых сообщений через [Green API](https://green-api.com) (WhatsApp).

## Стек

- React 19 + TypeScript
- Vite
- ESLint

## ENV

В корне проекта должен быть файл `.env`:
```
GREEN_API_HOST=https://7107.api.greenapi.com # apiUrl из личного кабинета
```

`.env` намеренно не был добавлен в .gitignore для упрощения разворота и теста, поэтому при желании можно тестить на уже заданном апи

## Запуск локально

```bash
npm install

npm run dev
```

Открыть `http://localhost:5173`.

## Сборка

```bash
npm run build
npm run preview
```

## Линтер

```bash
npm run lint
npm run lint:fix
```

## Как пользоваться

1. Авторизуйте инстанс WhatsApp в [консоли Green API](https://console.green-api.com)
2. В приложении введите `idInstance` и `apiTokenInstance` из консоли
3. Введите номер получателя и нажмите "Новый чат"
4. Отправьте сообщение. Ответы приходят автоматически

## Структура

```
src/
├── api/                 # запросы к Green API
├── components/          # UI-компоненты
├── hooks/               # usePolling
├── types/               # TypeScript-типы
├── utils/               # phone, storage, errors, id, date, avatar
└── assets/styles/       # CSS
```
# RSS Aggregator (RSS Агрегатор)

**RSS Агрегатор** — это современный сервис для чтения новостных лент. Проект выполнен в рамках обучения на фронтенд-курсе Hexlet. Приложение позволяет добавлять неограниченное количество RSS-источников, автоматически обновляет их и предоставляет удобный интерфейс для просмотра статей.

## 🚀 Особенности

- **Валидация на лету**: Проверка корректности URL и отсутствия дубликатов с помощью `yup`.
- **Живое обновление**: Приложение каждые 5 секунд проверяет фиды на наличие новых постов без перезагрузки страницы.
- **Интернационализация**: Полная поддержка мультиязычности (i18next).
- **Стейт-менеджмент**: Реактивное управление состоянием с помощью библиотеки `on-change`.
- **Адаптивность**: Приятный интерфейс, построенный на Bootstrap 5.

## 🛠 Стек технологий

- **Frontend**: JavaScript (ES6+), HTML5, CSS3.
- **Инструменты сборки**: Vite.
- **Библиотеки**:
  - `axios` (запросы к API);
  - `i18next` (локализация);
  - `yup` (валидация данных);
  - `on-change` (наблюдение за состоянием);
  - `bootstrap` (стили и компоненты).

## 📸 Демонстрация работы

<p align="center">
  <video src="https://github.com/user-attachments/assets/65300c3e-5dce-4398-a700-6070530d9295" width="100%" controls></video>
</p>

---
Автор: [foxxdogg](https://github.com)


[![Quality Gate Status](https://sonarcloud.io/api/project_badges/measure?project=foxxdogg_frontend-project-11&metric=alert_status)](https://sonarcloud.io/summary/new_code?id=foxxdogg_frontend-project-11)

[Deployment](https://frontend-project-11-eight-green.vercel.app/)

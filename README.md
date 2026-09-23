# CareerForge: The System Architect's Journey

> Интерактивная 3D-игра-резюме. Превращает профессиональный опыт в играбельный мир.

![CareerForge](https://img.shields.io/badge/CareerForge-3D%20Resume-cyan)
![Three.js](https://img.shields.io/badge/Three.js-3D-black)
![XState](https://img.shields.io/badge/XState-State%20Machine-orange)
![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue)

## 🎮 Что это?

CareerForge — браузерная 3D-игра, где резюме системного архитектора становится интерактивным пространством. Рекрутер или любой посетитель может:

- 🏢 Исследовать здания-проекты
- 🎯 Проходить сценарии из реального опыта
- ⚡ Активировать способности, привязанные к навыкам
- 📊 Видеть метрики эффективности

## 🚀 Быстрый старт

```bash
# Установка зависимостей
npm install

# Запуск в режиме разработки
npm run dev

# Сборка для продакшена
npm run build
```

Откройте http://localhost:3000 в браузере.

## 🎯 Управление

| Клавиша | Действие |
|---------|----------|
| **WASD** | Перемещение |
| **Мышь** | Вращение камеры (клик для захвата) |
| **ЛКМ** | Взаимодействие с объектами |
| **1-7** | Способности |
| **Tab** | Инвентарь |
| **M** | Карта мира |
| **Esc** | Закрыть панели |
| **Scroll** | Зум камеры |

## 📁 Структура проекта

```
/data
  resume.json          ← ДАННЫЕ РЕЗЮМЕ (редактируйте здесь!)
  dialogues.json       ← NPC и диалоги
/schemas
  resume_schema.json   ← JSON Schema для валидации
/src
  engine/              ← 3D-движок (Three.js)
  state/               ← XState машина состояний
  ui/                  ← React UI компоненты
  types/               ← TypeScript типы
/docs/GDD/             ← Гейм-дизайн документы
```

## ✏️ Как добавить новый проект

Откройте `data/resume.json` и добавьте запись в массив `work[]`:

```json
{
  "id": "my-new-project",
  "name": "Мой Новый Проект",
  "position": "Ведущий разработчик",
  "startDate": "2024-01-01",
  "endDate": "2024-12-01",
  "summary": "Описание проекта и достижений",
  "highlights": [
    "Достижение 1",
    "Достижение 2"
  ],
  "metrics": {
    "users": "100K",
    "uptime": "99.9%"
  },
  "worldPosition": { "x": 30, "y": 0, "z": 10 },
  "buildingTheme": "cyan",
  "buildingScale": { "x": 6, "y": 8, "z": 6 },
  "scenario": {
    "title": "Название сценария",
    "description": "Что нужно сделать",
    "abilities": ["requirement_scanner", "ai_assistant"],
    "steps": [
      { "id": "step1", "text": "Первый шаг", "type": "collect" },
      { "id": "step2", "text": "Второй шаг", "type": "launch" }
    ]
  }
}
```

**Важно:**
- `id` — уникальный идентификатор
- `worldPosition` — координаты здания в мире (x, z — плоскость, y = 0)
- `buildingTheme` — цвет: `blue`, `green`, `purple`, `orange`, `red`, `cyan`
- `buildingScale` — размер здания (не ставьте слишком большим)
- Не меняйте код — только JSON!

## ✏️ Как добавить новый навык

В `data/resume.json`, массив `skills[]`:

```json
{
  "id": "new_skill",
  "name": "Название навыка",
  "level": 85,
  "category": "technical",
  "abilityMapping": "ai_assistant"
}
```

Категории: `analysis`, `technical`, `management`, `quality`, `systems`, `tools`

## ✏️ Как добавить нового NPC

В `data/dialogues.json`:

```json
{
  "id": "new-npc",
  "name": "Имя NPC",
  "avatar": "🧙",
  "location": "hub",
  "dialogueTree": {
    "start": {
      "text": "Приветствие",
      "choices": [
        { "text": "Вариант 1", "next": "option1" },
        { "text": "Уйти", "next": "end" }
      ]
    },
    "option1": {
      "text": "Ответ на вариант 1",
      "choices": [
        { "text": "Назад", "next": "start" }
      ]
    },
    "end": {
      "text": "Прощание",
      "choices": []
    }
  }
}
```

## 🏗️ Архитектура

```
┌─────────────────────────────────────────────┐
│                  App.tsx                     │
│  (React + Three.js + XState integration)    │
├─────────────────────────────────────────────┤
│  Engine Layer        │  UI Layer            │
│  ├─ SceneManager     │  ├─ HUD              │
│  ├─ WorldGenerator   │  ├─ Inventory        │
│  ├─ PlayerController │  ├─ Minimap          │
│  └─ AbilitySystem    │  └─ ScenarioPanel    │
├─────────────────────────────────────────────┤
│  State Layer         │  Data Layer          │
│  └─ XState Machine   │  ├─ resume.json      │
│                      │  ├─ dialogues.json   │
│                      │  └─ schema.json      │
└─────────────────────────────────────────────┘
```

## 🎯 Способности

| # | Способность | Навык из резюме | Клавиша |
|---|-------------|-----------------|---------|
| 1 | 🔍 Сканер требований | Сбор/формализация требований | 1 |
| 2 | 🤖 AI-Ассистент | Generative AI, Agentic AI | 2 |
| 3 | 🌐 API-Портал | REST API, интеграции, Swagger | 3 |
| 4 | ⚙️ Системный инсталлятор | Bitrix24, CRM, ЭДО, внедрение | 4 |
| 5 | 🚀 Запуск проекта | Agile PM, Scrum, Stakeholder | 5 |
| 6 | 🐛 Режим отладки | UAT, функциональное тестирование | 6 |
| 7 | 📄 Автоматизация | Excel, документооборот, макросы | 7 |

## 📊 Реальные метрики из резюме

- **1 300+** документов подготовлено
- **9** федеральных проектов одновременно
- **16 млн ₽** — управляемый бюджет
- **9 млн** — пользовательская база
- **89** регионов покрытия
- **28 000+** обработанных заявок
- **75%** — сокращение времени (AI)
- **60%** — экономия на документации
- **40%** — снижение заявок (антифрод)
- **30%** — ускорение процессов (Bitrix24)

## 📊 Формат резюме для подключения

Чтобы подключить своё резюме, подготовьте JSON в следующем формате:

### Обязательные поля
```json
{
  "basics": {
    "name": "Имя Фамилия",
    "label": "Ваша роль",
    "summary": "Краткое описание"
  },
  "work": [...],      // Массив мест работы/проектов
  "skills": [...],    // Массив навыков
  "abilities": [...], // Массив игровых способностей
  "worldConfig": {    // Конфигурация мира
    "hubPosition": { "x": 0, "y": 0, "z": 0 },
    "groundSize": 200,
    "districts": [...]
  }
}
```

### Формат записи work[]
Каждый проект должен иметь:
- `id` — уникальный строковый ID
- `name` — название
- `position` — должность
- `summary` — описание
- `worldPosition` — { x, y, z } координаты в мире
- `buildingTheme` — цвет здания
- Опционально: `highlights`, `metrics`, `scenario`

## 📄 Документация

Полная документация в папке `/docs/GDD/`:
- [Game Overview](./docs/GDD/01_Game_Overview.md)
- [Mechanics](./docs/GDD/02_Mechanics.md)
- [Content Design](./docs/GDD/03_Content_Design.md)
- [Design Diagrams](./docs/GDD/04_Design_Diagrams.mmd)
- [Technical Specs](./docs/GDD/05_Technical_Specs.md)

## 🚢 Деплой

### GitHub Pages
```bash
npm run build
# Загрузите содержимое dist/ в ветку gh-pages
```

### Vercel
Подключите репозиторий — деплой автоматический.

### Любой статический хостинг
```bash
npm run build
# Загрузите dist/ на хостинг
```

## 🛠️ Технологии

- **Vite** — сборка
- **TypeScript** — типизация
- **React** — UI
- **Three.js** — 3D-рендеринг
- **XState** — управление состоянием
- **Tailwind CSS** — стилизация
- **JSON Schema** — валидация данных

## 📝 Лицензия

MIT

---

**CareerForge** — превращаем резюме в приключение 🚀

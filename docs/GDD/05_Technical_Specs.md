# 05 — Technical Specs

## Технологический стек

| Компонент | Технология | Версия |
|-----------|-----------|--------|
| Сборка | Vite | 6.x |
| Язык | TypeScript | 5.x |
| UI-фреймворк | React | 18.x |
| 3D-рендеринг | Three.js | latest |
| Управление состоянием | XState | 5.x |
| Валидация | Zod / JSON Schema | - |
| Стилизация | Tailwind CSS | 4.x |
| Отладка | lil-gui (опционально) | - |

## Структура проекта

```
/data
  resume.json          — данные резюме (JSON Resume формат)
  dialogues.json       — NPC и диалоговые деревья
/schemas
  resume_schema.json   — JSON Schema для валидации
/src
  main.tsx             — точка входа React
  App.tsx              — главный компонент, сборка всего
  index.css            — глобальные стили
  types/
    index.ts           — TypeScript типы для данных
  engine/
    scene.ts           — SceneManager (Three.js сцена, камера, свет)
    player.ts          — PlayerController (управление, камера)
    worldGenerator.ts  — WorldGenerator (генерация мира из JSON)
    abilities/
      index.ts         — AbilitySystem (визуальные эффекты способностей)
  state/
    gameMachine.ts     — XState машина состояний
  ui/
    HUD.tsx            — интерфейс (способности, панели, мини-карта)
/docs
  GDD/                 — гейм-дизайн документы
```

## Производительность

### Целевые метрики
- **FPS**: 60 на среднем железе
- **Время загрузки**: < 3 сек
- **Размер бандла**: < 1 MB (gzip)
- **Количество draw calls**: < 100

### Оптимизации
1. **Instanced rendering** для повторяющихся объектов (окна, частицы)
2. **Frustum culling** — Three.js автоматически
3. **LOD** — упрощение геометрии на расстоянии (планируется)
4. **Texture atlasing** — объединение текстур (планируется)
5. **Code splitting** — динамические импорты для тяжёлых модулей

### Ограничения
- Максимум 20 зданий в мире
- Максимум 500 частиц
- Максимум 10 NPC одновременно
- Тени только от directional light

## Развёртывание

### GitHub Pages
```bash
npm run build
# Загрузить dist/ в ветку gh-pages
```

### Vercel / Netlify
```bash
# Автоматический деплой при push
npm run build
```

### Локальная разработка
```bash
npm install
npm run dev
# Открыть http://localhost:3000
```

## Редактирование контента

### Формат resume.json

Для добавления нового проекта добавьте запись в массив `work[]`:

```json
{
  "id": "unique-id",
  "name": "Название компании/проекта",
  "position": "Ваша должность",
  "startDate": "YYYY-MM-DD",
  "endDate": "YYYY-MM-DD",
  "summary": "Краткое описание",
  "highlights": ["Достижение 1", "Достижение 2"],
  "metrics": { "metric1": "value1" },
  "worldPosition": { "x": 0, "y": 0, "z": 0 },
  "buildingTheme": "blue|green|purple|orange|red|cyan",
  "buildingScale": { "x": 5, "y": 8, "z": 5 },
  "scenario": {
    "title": "Название сценария",
    "description": "Описание задачи",
    "abilities": ["ability_id_1", "ability_id_2"],
    "steps": [
      { "id": "step1", "text": "Описание шага", "type": "collect|analyze|connect|launch" }
    ]
  }
}
```

### Доступные темы зданий
- `blue` — синий (#2244aa)
- `green` — зелёный (#22aa44)
- `purple` — фиолетовый (#8822aa)
- `orange` — оранжевый (#aa6622)
- `red` — красный (#aa2222)
- `cyan` — циан (#22aaaa)

### Формат dialogues.json

```json
{
  "npcs": [
    {
      "id": "npc-id",
      "name": "Имя NPC",
      "avatar": "emoji",
      "location": "hub|tech|strategy",
      "dialogueTree": {
        "start": {
          "text": "Текст реплики",
          "choices": [
            { "text": "Вариант ответа", "next": "node_id" }
          ]
        }
      }
    }
  ]
}
```

## API (внутреннее)

### SceneManager
- `setupLighting(data)` — настройка освещения
- `createSkybox()` — создание звёздного неба
- `addAnimationCallback(fn)` — регистрация анимации
- `start()` — запуск рендер-цикла

### WorldGenerator
- `generate(data)` — полная генерация мира
- `getBuildings()` — карта зданий
- `getInteractables()` — объекты для raycast

### PlayerController
- `teleportTo(position)` — телепортация
- `getPosition()` — текущая позиция
- `update(delta)` — обновление физики

### AbilitySystem
- `setAbilities(abilities)` — загрузка способностей
- `activate(id, position)` — активация
- `deactivate(id)` — деактивация
- `getCooldown(id)` — оставшийся кулдаун
- `update(delta, elapsed)` — анимация эффектов

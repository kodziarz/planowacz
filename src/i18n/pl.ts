import type { Dictionary } from './en';

export const pl = {
  // Tabs
  tab: {
    availability: 'Dostępność',
    queues: 'Kolejki',
    tasks: 'Zadania',
    categories: 'Kategorie',
    settings: 'Ustawienia',
  },

  // Common
  common: {
    save: 'Zapisz',
    cancel: 'Anuluj',
    delete: 'Usuń',
    new: 'Nowe',
    none: 'Brak',
    optional: 'opcjonalne',
    required: 'wymagane',
    notSet: 'Nie ustawiono',
    confirm: 'Potwierdź',
  },

  // Statuses
  status: {
    pending: 'Oczekujące',
    inProgress: 'W trakcie',
    done: 'Ukończone',
    cancelled: 'Anulowane',
    change: 'Zmień status',
    cycle: 'Status: %{status}. Dotknij, aby zmienić.',
  },

  // Task form
  task: {
    new: 'Nowe zadanie',
    edit: 'Edytuj zadanie',
    newSubtask: 'Nowe podzadanie',
    name: 'Nazwa',
    namePlaceholder: 'Nazwa zadania',
    priority: 'Priorytet',
    priorityHint: '1 oznacza najwyższy priorytet.',
    category: 'Kategoria',
    plannedTime: 'Zaplanowany czas',
    granularity: 'Granularność',
    granularityHint: 'Minimalna jednostka czasu, w jakiej sensownie można wykonać to zadanie.',
    status: 'Status',
    parent: 'Zadanie nadrzędne',
    subtaskOf: 'Podzadanie: %{name}',
    defaultsNote:
      'To zadanie ma podzadania, więc zaplanowany czas i granularność są tu opcjonalne — służą jako wartości domyślne dla nowych podzadań.',
    leafNote: 'Zaplanowany czas i granularność są wymagane dla zadań bez podzadań.',
    addSubtask: 'Dodaj podzadanie',
    deleteTitle: 'Usuń zadanie',
    deleteChildrenMessage:
      'To zadanie ma podzadania, które również zostaną usunięte. Liczba podzadań do usunięcia: %{count}.',
    deleteMessage: 'Tej operacji nie można cofnąć.',
    nameRequired: 'Nazwa jest wymagana.',
    leafTimesRequired: 'Zaplanowany czas i granularność są wymagane dla zadań bez podzadań.',
    invalidTime: 'Czas mus być wielokrotnością 5 minut.',
    created: 'Utworzono: %{date}',
    remainingOfParent: 'Pozostały czas zadania nadrzędnego: %{time}',
    sliderHint: 'Przesuń, aby ustawić zaplanowany czas (5 min … pozostały czas rodzica).',
  },

  // Availability view
  availability: {
    availableTime: 'Dostępny czas',
    availableTimeHint: 'Podaj, ile czasu masz teraz do dyspozycji.',
    proposals: 'Proponowane zadania',
    displayMore: 'Wyświetl 5 więcej',
    empty: 'Brak pasujących zadań. Najpierw utwórz zadania.',
    marked: 'Propozycja z zastrzeżeniami',
    markBadge: '!',
  },

  // Priority queues view
  queues: {
    priority: 'Priorytet %{count}',
    waiting: 'Oczekujące',
    waitingValue: '%{count} (w trakcie: %{inProgress})',
    plannedTotal: 'Łączny zaplanowany czas',
    empty: 'Brak oczekujących zadań.',
  },

  // Tasks list
  tasks: {
    new: 'Nowe zadanie',
    empty: 'Brak zadań. Utwórz pierwsze.',
  },

  // Categories
  categories: {
    new: 'Nowa kategoria',
    edit: 'Edytuj kategorię',
    name: 'Nazwa',
    namePlaceholder: 'Nazwa kategorii',
    color: 'Kolor',
    empty: 'Brak kategorii.',
    tasksUsing: 'Zadania używające tej kategorii: %{count}',
    deleteTitle: 'Usuń kategorię',
    deleteMessage:
      'Zadania używające tej kategorii zostaną jej pozbawione. Tej operacji nie można cofnąć.',
    nameRequired: 'Nazwa jest wymagana.',
  },

  // Settings
  settings: {
    priorityCoefficient: 'Współczynnik priorytetu',
    priorityCoefficientValue: '%{percent}',
    priorityCoefficientExplain:
      'Minimalny udział zadań o jeden wyższym priorytecie, które muszą zostać wykonane w okresie referencyjnym priorytetu. Jeśli patrząc wstecz ukończono mniej zadań wyższej priorytetowości niż ten udział, propozycje zadań niższej priorytetowości są oznaczane w widoku dostępności — najpierw wykonaj te ważniejsze. Tylko pozostała część czasu może być wypełniana zadaniami niższej priorytetowości (jeśli pasują one granularnością do dostępnego czasu).',
    referencePeriod: 'Okres referencyjny priorytetu',
    referencePeriodExplain:
      'Jak daleko wstecz sięga analiza realizacji priorytetów, na podstawie czasu oznaczenia zadań jako ukończonych. Jeśli w tym okresie warunek współczynnika jest spełniony, system może proponować zadania niższej priorytetowości zamiast wyższej.',
    uiLanguage: 'Język interfejsu',
    languageExplain: 'Język interfejsu. „System” oznacza język ustawiony w urządzeniu.',
    language: {
      system: 'System',
      en: 'English',
      pl: 'Polski',
    },
  },

  // Durations
  duration: {
    minutes: '%{count} min',
    hours: '%{count} godz.',
    hoursMinutes: '%{hours} godz %{minutes} min',
    day: '%{count} dzień',
    days: '%{count} dni',
  },

  // Compact meta chips on task cards
  meta: {
    priority: 'P%{count}',
    planned: 'plan %{time}',
    granularity: 'gran %{time}',
  },

  // Accessibility / controls
  a11y: {
    decrease: 'Zmniejsz',
    increase: 'Zwiększ',
    clear: 'Wyczyść wartość',
    changeStatus: 'Zmień status',
  },
} satisfies Dictionary;

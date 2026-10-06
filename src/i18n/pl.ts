import type { Dictionary } from './en';

export const pl = {
  // Tabs
  tab: {
    availability: 'Dostępność',
    queues: 'Kolejki',
    tasks: 'Zadania',
    categories: 'Kategorie',
    settings: 'Ustawienia',
    situations: 'Sytuacje',
    statistics: 'Statystyki',
    more: 'Więcej',
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
    back: 'Wstecz',
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
    sliderHint: 'Przesuń, aby ustawić zaplanowany czas (5 min … 8 godz. lub pozostały czas rodzica).',
    prompts: 'Podpowiedzi',
    description: 'Opis',
    descriptionPlaceholder: 'Opis opcjonalny',
    timeSpent: 'Poświęcony czas',
    timeSpentEmpty: 'Brak wpisów czasu.',
    addTime: 'Dodaj czas',
    addTimeHint: 'Przesuń lub wpisz, ile czasu poświęciłeś na to zadanie.',
    entryTime: 'Data i czas wpisu',
    quickAdd: 'Dodaj poświęcony czas do %{name}',
    quickAddTitle: 'Dodaj czas — %{name}',
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

  // Menu „Więcej”
  more: {
    title: 'Więcej',
  },

  // Sytuacje
  situations: {
    empty: 'Brak sytuacji.',
    new: 'Nowa sytuacja',
    edit: 'Edytuj sytuację',
    name: 'Nazwa',
    namePlaceholder: 'Nazwa sytuacji',
    description: 'Opis',
    descriptionPlaceholder: 'Opis opcjonalny',
    localization: 'Lokalizacja',
    localizationPlaceholder: 'Adres lub nazwa miejsca',
    gps: 'Użyj mojej lokalizacji',
    reference: 'Twoja lokalizacja',
    referencePlaceholder: 'Adres, z którego mierzyć odległości',
    referenceSet: 'Odległości są mierzone od tej lokalizacji.',
    useAddress: 'Użyj adresu',
    sortNewest: 'Najnowsze',
    sortName: 'A–Z',
    sortDistance: 'Odległość',
    distance: '%{km} km',
    nameRequired: 'Nazwa jest wymagana.',
    geocodeFailed: 'Nie znaleziono tego adresu.',
    permissionDenied: 'Odmówiono dostępu do lokalizacji.',
    created: 'Utworzono: %{date}',
    notes: 'Notatki',
    deleteTitle: 'Usuń sytuację',
    deleteMessage: 'Tej operacji nie można cofnąć.',
    deleteNotesMessage: 'Jej notatki również zostaną usunięte. Liczba notatek do usunięcia: %{count}.',
  },

  // Notatki
  notes: {
    new: 'Nowa notatka',
    edit: 'Edytuj notatkę',
    name: 'Nazwa',
    namePlaceholder: 'Nazwa notatki',
    description: 'Opis',
    descriptionPlaceholder: 'Opis opcjonalny',
    empty: 'Brak notatek.',
    nameRequired: 'Nazwa jest wymagana.',
    inSituation: 'Notatka w sytuacji: %{name}',
    created: 'Utworzono: %{date}',
    deleteTitle: 'Usuń notatkę',
    deleteMessage: 'Tej operacji nie można cofnąć.',
  },

  // Statystyki
  statistics: {
    empty: 'Brak wpisów czasu — dodaj czas poświęcony zadaniom, aby zobaczyć statystyki.',
    period7: 'Ostatnie 7 dni',
    period30: 'Ostatnie 30 dni',
    periodAll: 'Cały okres',
    total: 'Razem',
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
    data: 'Dane',
    dataExplain: 'Wyeksportuj wszystkie dane aplikacji do pliku JSON albo zaimportuj wcześniej wyeksportowany plik.',
    export: 'Eksportuj dane',
    exportFailed: 'Eksport nie powiódł się.',
    exportUnavailable: 'Udostępnianie nie jest dostępne na tym urządzeniu.',
    import: 'Importuj dane',
  },

  // Ekran przeglądu importu
  import: {
    title: 'Importuj dane',
    intro: 'Wybierz wyeksportowany plik, a następnie zaznacz, co zaimportować.',
    choose: 'Wybierz plik',
    choosing: 'Otwieranie…',
    review: 'Przegląd',
    errorNotJson: 'Wybrany plik nie jest poprawnym JSON-em.',
    errorForeign: 'Plik został wyeksportowany przez inną aplikację.',
    errorNewer: 'Plik pochodzi z nowszej wersji aplikacji.',
    errorShape: 'Plik nie zawiera danych aplikacji.',
    readFailed: 'Nie udało się odczytać wybranego pliku.',
    emptyFile: 'Plik nie zawiera danych do importu.',
    types: {
      tasks: 'Zadania',
      categories: 'Kategorie',
      situations: 'Sytuacje',
      notes: 'Notatki',
      settings: 'Ustawienia',
    },
    currentCount: 'Obecnie: %{count}',
    fileCount: 'W pliku: %{count}',
    currentValue: 'Obecnie: %{value}',
    fileValue: 'W pliku: %{value}',
    settingsValue: '%{coefficient}, okres %{days}',
    add: 'Dodaj',
    remove: 'Usuń',
    replaceSettings: 'Zastąp ustawienia',
    apply: 'Importuj',
    nothingSelected: 'Najpierw zaznacz, co chcesz zaimportować.',
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
    spent: 'poświęcono %{time}',
  },

  // Etykiety jednostek czasu
  timeUnit: {
    hours: 'h',
    minutes: 'min',
  },

  // Accessibility / controls
  a11y: {
    decrease: 'Zmniejsz',
    increase: 'Zwiększ',
    clear: 'Wyczyść wartość',
    changeStatus: 'Zmień status',
  },
} satisfies Dictionary;

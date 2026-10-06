export const en = {
  // Tabs
  tab: {
    availability: 'Availability',
    queues: 'Queues',
    tasks: 'Tasks',
    categories: 'Categories',
    settings: 'Settings',
    situations: 'Situations',
    statistics: 'Statistics',
    more: 'More',
  },

  // Common
  common: {
    save: 'Save',
    cancel: 'Cancel',
    delete: 'Delete',
    new: 'New',
    none: 'None',
    optional: 'optional',
    required: 'required',
    notSet: 'Not set',
    confirm: 'Confirm',
    back: 'Back',
  },

  // Statuses
  status: {
    pending: 'Pending',
    inProgress: 'In progress',
    done: 'Done',
    cancelled: 'Cancelled',
    change: 'Change status',
    cycle: 'Status: %{status}. Tap to change.',
  },

  // Task form
  task: {
    new: 'New task',
    edit: 'Edit task',
    newSubtask: 'New subtask',
    name: 'Name',
    namePlaceholder: 'Task name',
    priority: 'Priority',
    priorityHint: '1 is the highest priority.',
    category: 'Category',
    plannedTime: 'Planned time',
    granularity: 'Granularity',
    granularityHint: 'The minimal unit of time this task can sensibly be performed in.',
    status: 'Status',
    parent: 'Parent task',
    subtaskOf: 'Subtask of %{name}',
    defaultsNote:
      'This task has subtasks, so planned time and granularity are optional here — they serve as default values for new subtasks.',
    leafNote: 'Planned time and granularity are required for tasks without subtasks.',
    addSubtask: 'Add subtask',
    deleteTitle: 'Delete task',
    deleteChildrenMessage:
      'This task has subtasks which will be deleted as well. Subtasks to delete: %{count}.',
    deleteMessage: 'This cannot be undone.',
    nameRequired: 'Name is required.',
    leafTimesRequired: 'Planned time and granularity are required for tasks without subtasks.',
    invalidTime: 'Time must be a multiple of 5 minutes.',
    created: 'Created %{date}',
    remainingOfParent: 'Remaining time of the parent task: %{time}',
    sliderHint: 'Slide to set the planned time (5 min … 8 h, or the remaining parent time).',
    prompts: 'Suggestions',
    description: 'Description',
    descriptionPlaceholder: 'Optional description',
    timeSpent: 'Time spent',
    timeSpentEmpty: 'No time entries yet.',
    addTime: 'Add time',
    addTimeHint: 'Slide or type how much time you spent on this task.',
    entryTime: 'Date and time of the entry',
    quickAdd: 'Add time spent to %{name}',
    quickAddTitle: 'Add time — %{name}',
  },

  // Availability view
  availability: {
    availableTime: 'Available time',
    availableTimeHint: 'Declare how much time you have right now.',
    proposals: 'Suggested tasks',
    displayMore: 'Display 5 more',
    empty: 'No matching tasks. Create tasks first.',
    marked: 'Suggestion with reservations',
    markBadge: '!',
  },

  // Priority queues view
  queues: {
    priority: 'Priority %{count}',
    waiting: 'Waiting',
    waitingValue: '%{count} (in progress: %{inProgress})',
    plannedTotal: 'Planned total',
    empty: 'No waiting tasks.',
  },

  // Tasks list
  tasks: {
    new: 'New task',
    empty: 'No tasks yet. Create the first one.',
  },

  // Categories
  categories: {
    new: 'New category',
    edit: 'Edit category',
    name: 'Name',
    namePlaceholder: 'Category name',
    color: 'Color',
    empty: 'No categories yet.',
    tasksUsing: 'Tasks using this category: %{count}',
    deleteTitle: 'Delete category',
    deleteMessage:
      'Tasks using this category will have the category removed. This cannot be undone.',
    nameRequired: 'Name is required.',
  },

  // "More" menu
  more: {
    title: 'More',
  },

  // Situations
  situations: {
    empty: 'No situations yet.',
    new: 'New situation',
    edit: 'Edit situation',
    name: 'Name',
    namePlaceholder: 'Situation name',
    description: 'Description',
    descriptionPlaceholder: 'Optional description',
    localization: 'Location',
    localizationPlaceholder: 'Address or place name',
    gps: 'Use my location',
    reference: 'Your location',
    referencePlaceholder: 'Address to measure distances from',
    referenceSet: 'Distances are measured from this location.',
    useAddress: 'Use address',
    sortNewest: 'Newest',
    sortName: 'A–Z',
    sortDistance: 'Distance',
    distance: '%{km} km',
    nameRequired: 'Name is required.',
    geocodeFailed: 'Could not find that address.',
    permissionDenied: 'Location permission was denied.',
    created: 'Created %{date}',
    notes: 'Notes',
    deleteTitle: 'Delete situation',
    deleteMessage: 'This cannot be undone.',
    deleteNotesMessage: 'Its notes will be deleted as well. Notes to delete: %{count}.',
  },

  // Notes
  notes: {
    new: 'New note',
    edit: 'Edit note',
    name: 'Name',
    namePlaceholder: 'Note name',
    description: 'Description',
    descriptionPlaceholder: 'Optional description',
    empty: 'No notes yet.',
    nameRequired: 'Name is required.',
    inSituation: 'Note in situation: %{name}',
    created: 'Created %{date}',
    deleteTitle: 'Delete note',
    deleteMessage: 'This cannot be undone.',
  },

  // Statistics
  statistics: {
    empty: 'No time entries yet — add time spent on tasks to see statistics.',
    period7: 'Last 7 days',
    period30: 'Last 30 days',
    periodAll: 'All time',
    total: 'Total',
  },

  // Settings
  settings: {
    priorityCoefficient: 'Priority coefficient',
    priorityCoefficientValue: '%{percent}',
    priorityCoefficientExplain:
      'The minimal share of tasks of one higher priority that need to be done within the priority reference period. If, looking back over that period, fewer higher-priority tasks were completed than this share, lower-priority suggestions are marked in the availability view — do the higher-priority ones first. Only the remaining part of the time should be filled with lower-priority tasks (when their granularity fits the available time).',
    referencePeriod: 'Priority reference period',
    referencePeriodExplain:
      'How far back the system looks when checking the priority coefficient, based on the time tasks were marked as done. If the coefficient condition is met over that period, lower-priority tasks may be proposed instead of the higher-priority ones.',
    uiLanguage: 'UI language',
    languageExplain: 'Language of the interface. “System” follows your device settings.',
    language: {
      system: 'System',
      en: 'English',
      pl: 'Polski',
    },
    data: 'Data',
    dataExplain:
      'Export all app data to a JSON file — share it or save it to a folder — or import a previously exported file.',
    export: 'Export data',
    exportFailed: 'Export failed.',
    exportUnavailable: 'Sharing is not available on this device.',
    save: 'Save to device',
    saveSucceeded: 'The file has been saved to the selected folder.',
    import: 'Import data',
  },

  // Import review screen
  import: {
    title: 'Import data',
    intro: 'Choose an exported file, then pick what to import.',
    choose: 'Choose file',
    choosing: 'Opening…',
    review: 'Review',
    errorNotJson: 'The selected file is not valid JSON.',
    errorForeign: 'The file was exported by a different app.',
    errorNewer: 'The file comes from a newer version of the app.',
    errorShape: 'The file does not contain app data.',
    readFailed: 'Could not read the selected file.',
    emptyFile: 'The file contains no data to import.',
    types: {
      tasks: 'Tasks',
      categories: 'Categories',
      situations: 'Situations',
      notes: 'Notes',
      settings: 'Settings',
    },
    currentCount: 'Current: %{count}',
    fileCount: 'In file: %{count}',
    currentValue: 'Current: %{value}',
    fileValue: 'In file: %{value}',
    settingsValue: '%{coefficient}, period %{days}',
    add: 'Add',
    remove: 'Remove',
    replaceSettings: 'Replace settings',
    apply: 'Import',
    nothingSelected: 'Select what to import first.',
  },

  // Durations
  duration: {
    minutes: '%{count} min',
    hours: '%{count} h',
    hoursMinutes: '%{hours} h %{minutes} min',
    day: '%{count} day',
    days: '%{count} days',
  },

  // Compact meta chips on task cards
  meta: {
    priority: 'P%{count}',
    planned: 'plan %{time}',
    granularity: 'gran %{time}',
    spent: 'spent %{time}',
  },

  // Time input unit labels
  timeUnit: {
    hours: 'h',
    minutes: 'min',
  },

  // Accessibility / controls
  a11y: {
    decrease: 'Decrease',
    increase: 'Increase',
    clear: 'Clear value',
    changeStatus: 'Change status',
  },
};

export type Dictionary = typeof en;

export const en = {
  // Tabs
  tab: {
    availability: 'Availability',
    queues: 'Queues',
    tasks: 'Tasks',
    categories: 'Categories',
    settings: 'Settings',
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
    sliderHint: 'Slide to set the planned time (5 min … remaining parent time).',
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

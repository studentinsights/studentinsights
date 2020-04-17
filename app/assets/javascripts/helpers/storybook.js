// Check env to see if this is running in dev mode in Storybook.
export function isStorybookDev() {
  return (window.STORYBOOK_IS_RUNNING === 'yes_storybook_is_running');
}
// React Native styles do not support server rendering by default.
// Server-rendered styles must remain consistent between the initial HTML render and the client render.
// CSS media queries are not directly supported in this environment without a styling library.
export function useColorScheme() {
  return 'light';
}

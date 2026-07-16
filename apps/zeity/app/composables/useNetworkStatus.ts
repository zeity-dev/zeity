export function useNetworkStatus() {
  const isOnline = useOnline();
  return { isOnline };
}

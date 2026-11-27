export function downloadAs(dataUri: string, name: string) {
  // Namespace is used to prevent conflict w/ Chrome Popper Blocker extension (Issue https://github.com/eligrey/FileSaver.js/issues/561)
  const a = document.createElementNS('http://www.w3.org/1999/xhtml', 'a') as HTMLAnchorElement;
  a.download = name;
  a.rel = 'noopener';
  a.href = dataUri;

  setTimeout(() => URL.revokeObjectURL(a.href), 40 /* sec */ * 1000);
  setTimeout(() => a.click(), 0);
}

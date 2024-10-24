export function assertExists<T>(obj: T | null | undefined, error: string): obj is T {
  if (obj === null || obj === undefined) {
    console.error(error);
    return false;
  }

  return true;
}

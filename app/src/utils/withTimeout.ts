export const withTimeout = <T>(
  promise: PromiseLike<T>,
  ms = 20000
): Promise<T> => {
  let id: ReturnType<typeof setTimeout>;
  const timeout = new Promise<T>((_, reject) => {
    id = setTimeout(() => reject(new Error('timeout')), ms);
  });
  return Promise.race([Promise.resolve(promise), timeout]).finally(() =>
    clearTimeout(id)
  );
};

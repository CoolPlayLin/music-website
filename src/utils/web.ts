function fetchData(useCache: boolean) {
  return async (url: string) => {
    return await fetch(url, {
      cache: useCache ? "default" : "no-store",
    });
  };
}

export { fetchData };

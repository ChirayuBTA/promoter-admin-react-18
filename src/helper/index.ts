const queryString = (query: any) =>
  Object.keys(query)
    .map((key) => {
      const value = Array.isArray(query[key])
        ? query[key].join(",")
        : query[key];
      return `${encodeURIComponent(key)}=${encodeURIComponent(value)}`;
    })
    .join("&");

export { queryString };

export async function handleResponse(response: Response) {
  return response.text().then((text) => {
    const data = text && JSON.parse(text);
    // if (!response.ok) {
    //   const error = (data && data.message) || response.statusText;
    //   return Promise.reject({ error, data });
    // }
    return data;
  });
}

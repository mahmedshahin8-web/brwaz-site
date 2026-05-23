export const apiFetch = async (input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
  let [resource, config] = [input, init];
  const isstring = typeof resource === 'string';
  const isApiTarget = isstring && resource.startsWith('/api/');
  
  if (isApiTarget || (isstring && resource.includes('ngrok'))) {
    if (!config) config = {};
    if (!config.headers) config.headers = {};
    
    const headers = new Headers(config.headers);
    headers.set('ngrok-skip-browser-warning', 'true');
    config.headers = headers;
  }
  
  return fetch(resource, config);
};

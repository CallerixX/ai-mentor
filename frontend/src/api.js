// API утилита для работы с бэкендом
// Использует BACKEND_URL из window (устанавливается в main.jsx)

const getBaseUrl = () => {
  return window.BACKEND_URL || 'http://localhost:8000';
};

// Универсальная функция для fetch запросов
export async function apiFetch(path, options = {}) {
  const url = `${getBaseUrl()}${path}`;
  
  const defaultOptions = {
    headers: {
      'Content-Type': 'application/json',
    },
  };

  try {
    const response = await fetch(url, {
      ...defaultOptions,
      ...options,
      headers: {
        ...defaultOptions.headers,
        ...options.headers,
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response;
  } catch (error) {
    console.error(`API Error (${path}):`, error);
    throw error;
  }
}

// SSE (Server-Sent Events) для стриминга
export async function apiSSE(path, body, onMessage) {
  const url = `${getBaseUrl()}${path}`;
  
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    const chunk = decoder.decode(value, { stream: true });
    for (const line of chunk.split('\n')) {
      if (line.startsWith('data: ')) {
        try {
          const data = JSON.parse(line.slice(6));
          onMessage(data);
        } catch {
          // skip invalid JSON
        }
      }
    }
  }
}

// Экспортируем удобный методы
export const api = {
  get: (path) => apiFetch(path, { method: 'GET' }),
  post: (path, body) => apiFetch(path, { method: 'POST', body: JSON.stringify(body) }),
  put: (path, body) => apiFetch(path, { method: 'PUT', body: JSON.stringify(body) }),
  delete: (path) => apiFetch(path, { method: 'DELETE' }),
  sse: apiSSE,
};

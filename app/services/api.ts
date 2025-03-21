import axios from 'axios';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
});

// Estado para evitar múltiplas requisições de refresh simultâneas
let isRefreshing = false;
let refreshSubscribers: ((token: string) => void)[] = [];

// 🔹 Notifica todas as requisições pendentes sobre o novo token
function onRefreshed(newAccessToken: string) {
  refreshSubscribers.forEach((callback) => callback(newAccessToken));
  refreshSubscribers = [];
}

// 🔹 Função para deslogar o usuário caso o refresh falhe
const logout = () => {
  localStorage.removeItem('access_token');
  localStorage.removeItem('refresh_token');
  window.location.href = '/'; // 🔥 Redireciona para o login
};

// 🔹 Função para renovar o token
const refreshToken = async (): Promise<string | null> => {
  try {
    const storedRefreshToken = localStorage.getItem('refresh_token');

    if (!storedRefreshToken) {
      console.warn('🔹 Nenhum refresh token encontrado. Redirecionando para login...');
      logout();
      return null;
    }

    const response = await axios.post(
      `${process.env.NEXT_PUBLIC_API_URL}/auth/refresh-token`,
      {},
      {
        headers: {
          Authorization: `Bearer ${storedRefreshToken}`,
        },
      }
    );

    const { access_token, refresh_token: newRefreshToken} = response.data;

    // 🔹 Atualiza os tokens no LocalStorage
    localStorage.setItem('access_token', access_token);
    localStorage.setItem('refresh_token', newRefreshToken);

    // 🔹 Notifica as requisições pendentes
    onRefreshed(access_token);

    return access_token;
  } catch (error) {
    console.error('❌ Erro ao atualizar token:', error);
    logout(); // 🔥 Se o refresh falhar, desloga o usuário
    return null;
  } finally {
    isRefreshing = false;
  }
};

// 🔹 Intercepta todas as requisições para adicionar o token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// 🔹 Intercepta respostas com erro (401/403) para tentar renovar o token
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (
      (error.response?.status === 401 || error.response?.status === 403) &&
      !originalRequest._retry
    ) {
      originalRequest._retry = true;

      if (!isRefreshing) {
        isRefreshing = true;
        const newAccessToken = await refreshToken();

        if (newAccessToken) {
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
          return api(originalRequest);
        }
      }

      return new Promise((resolve) => {
        refreshSubscribers.push((token) => {
          originalRequest.headers.Authorization = `Bearer ${token}`;
          resolve(api(originalRequest));
        });
      });
    }

    return Promise.reject(error);
  }
);

// 🔹 Login com Google
export const loginWithGoogle = () => {
  const params = new URLSearchParams({
    prompt: 'select_account',
    access_type: 'offline',
  }).toString();

  window.location.href = `${process.env.NEXT_PUBLIC_API_URL}/auth/google?${params}`;
};

// 🔹 Logout global
export const logoutUser = () => logout();

export default api;

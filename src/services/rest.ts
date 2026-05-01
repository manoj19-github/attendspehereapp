import axios, { AxiosRequestConfig, AxiosInstance } from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default class RestService {
  client: AxiosInstance;
  constructor(config: AxiosRequestConfig) {
    this.client = axios.create(config);
    this.client.interceptors.request.use(
      async config => {
        const token = await getToken();
        // console.log(token);
        
        if (token && !!config.headers) {
          config.headers['Authorization'] = token;
        }
        return config;
      },
      error => {
        return Promise.reject(error);
      },
    );

    this.client.interceptors.response.use(
      async response => {
        if (response?.data?.Token) {
          // console.log('response?.data?.Token', response?.data?.Token);
          
          await setToken(response?.data?.Token);
          this.client.defaults.headers.common['Authorization'] =
            `Bearer ` + response?.data?.Token;
        }
        return response;
      },
      async error => {
        const originalRequest = error?.config;
        // console.log('originalRequest error',originalRequest);
        
        if (error?.response?.status === 402 && !originalRequest?._retry) {
          originalRequest._retry = true;
          if (error?.response?.data?.Token) {
            await setToken(error?.response?.data?.Token);
            await new Promise((resolve: any) => setTimeout(resolve, 1000));
            return this.client(originalRequest);
          }
          await new Promise((resolve: any) => setTimeout(resolve, 1000));
          return this.client(originalRequest);
        }

        return Promise.reject(error);
      },
    );
  }

  get(endpoint: string) {
    return this.client.get<any>(endpoint);
  }

  post(endpoint: string, payload: any) {
    return this.client.post<any>(endpoint, payload);
  }
  postWithConfig(
    endpoint: string,
    payload: any,
    config: AxiosRequestConfig<any> | undefined,
  ) {
    return this.client.post<any>(endpoint, payload, config);
  }
}

export const getToken = async (): Promise<string | null> => {
  return await AsyncStorage.getItem('token');
};
export const setToken = async (token: string) => {
  return await AsyncStorage.setItem('token', token);
};
export const ClearLocalStorage = async () => {
  AsyncStorage.multiRemove(['token', 'user']);
};

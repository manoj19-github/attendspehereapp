import axios, { AxiosRequestConfig, AxiosInstance } from "axios";
import useAuthStore from "../stores/useAuthStore";

export const useRestService = (baseURL: string) => {
  const userContext = useAuthStore();
  class RestService {
    client: AxiosInstance;
    constructor(config: AxiosRequestConfig) {
      this.client = axios.create(config);
      this.client.interceptors.request.use(
        async (config) => {
          const token = await getToken();
          if (token && !!config.headers) {
            config.headers["Authorization"] = `Bearer ${token}`;
            // console.log("🚀 ~ RestService ~ token:", token);
          }
          return config;
        },
        (error) => {
          return Promise.reject(error);
        }
      );

      this.client.interceptors.response.use(
        async (response) => {
          if (response?.data?.token) {
            await setToken(response?.data?.token);
            this.client.defaults.headers.common[
              "Authorization"
            ] = `Bearer ${response?.data?.token}`;
          }
          return response;
        },
        async (error) => {
          const originalRequest = error?.config;
          if (error?.response?.status === 401 && !originalRequest?._retry) {
            originalRequest._retry = true;
            await new Promise((resolve:any) => setTimeout(resolve, 1000));
            return this.client(originalRequest);
          } else if (
            error?.response?.status === 408 &&
            !originalRequest?._retry
          ) {
            originalRequest._retry = true;
            if (error?.response?.data?.token) {
              await setToken(error?.response?.data?.token);
              this.client.defaults.headers.common[
                "Authorization"
              ] = `Bearer ${error.response?.data?.token}`;
              await new Promise((resolve:any) => setTimeout(resolve, 500));
              return this.client(originalRequest);
            }
            await new Promise((resolve:any) => setTimeout(resolve, 1000));
            return this.client(originalRequest);
          }

          return Promise.reject(error);
        }
      );
    }

    get(endpoint: string, token?: string) {
      if (token)
        this.client.defaults.headers.common[
          "Authorization"
        ] = `Bearer ${token}`;
      return this.client.get<any>(endpoint);
    }

    post(endpoint: string, payload: any, token?: string) {
      if (token)
        this.client.defaults.headers.common[
          "Authorization"
        ] = `Bearer ${token}`;
      return this.client.post<any>(endpoint, payload);
    }
    put(endpoint: string, payload: any, token?: string) {
      if (token)
        this.client.defaults.headers.common[
          "Authorization"
        ] = `Bearer ${token}`;
      return this.client.put<any>(endpoint, payload);
    }
  }

  const serviceClient = new RestService({
    baseURL,
  });

  const getToken = async (): Promise<string | null | undefined> => {
    return userContext.token;
  };

  const setToken = async (token: string) => {
    return userContext.setToken(token);
    // return "";
  };
  return serviceClient;
};

// 408=> refresh
// 403=> expaired
// 500=> system exception
// 200=> succes and business error

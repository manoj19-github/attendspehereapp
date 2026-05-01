
export type authServiceTypes = {  
  loginHandler: ({
    username,
    password,
    finallyCallback,
    successCallback,
  }: {
    username: string;
    password: string;
    errorCallback?: ((args?: any) => void) | undefined;
    finallyCallback?: ((args?: any) => void) | undefined;
    successCallback?: ((args?: any) => void) | undefined;
  }) => Promise<void>;
};

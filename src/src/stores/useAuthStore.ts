import { create } from "zustand";
import { UserStoreTypes } from "./storeTypes/auth.storeTypes";

const useAuthStore = create<UserStoreTypes>((set) => ({
    setToken:(data:string|undefined)=>set(()=>({token:data})),
    token:"",
}));

export default useAuthStore;
import { configureStore } from "@reduxjs/toolkit";
import rootReducer from "./reducers";
import { StoreState } from "../models/reduxModel";

export default function ConfigureStore(initialState?: StoreState) {
//   const logger = createLogger();
  return configureStore({
    reducer: rootReducer,
    preloadedState: initialState,
    // middleware: getDefaultMiddleware => getDefaultMiddleware().concat(logger),
    // devTools: process.env.NODE_ENV !== 'production',
  });
}

import { combineReducers } from "@reduxjs/toolkit";
import ErrorReducer from "./errorReducer";
import LoadingReducer from "./loadingReducer";
import UserReducer from "./userReducer";
import JobReducer from "./jobReducer";


const rootReducer = combineReducers({
  loading: LoadingReducer,
  auth: UserReducer,
  error: ErrorReducer,
  job: JobReducer,
  // candidate: CandidateReducer,
  // master: MasterReducer,
});

export default rootReducer;
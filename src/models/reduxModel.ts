import { ErrorState } from "./errorModels";
import { JobModelMain } from "./jobModel";
import { LoadingState } from "./loadingModels";
import { UserMain } from "./userModels";

export interface StoreState {
  loading: LoadingState;
  auth: UserMain;
  error: ErrorState;
  job: JobModelMain;
}
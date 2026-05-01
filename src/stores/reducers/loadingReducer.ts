import { LoadingState } from "../../models/loadingModels";
import { ApiStatusActionTypes } from "../actions/apiStatusAction";
import { AuthActionTypes } from "../actions/authAction";
import InitialState from "./initialState";

const initialState: LoadingState = InitialState.loading;
export default function LoadingReducer(
  state: LoadingState = initialState,
  action: any,
) {
  switch (action.type) {
    case ApiStatusActionTypes.Begin_Api_Call:
      return {
        ...state,
        count: state.count + action.payload.count,
        message: action.payload.message,
      };
    case ApiStatusActionTypes.Api_Call_Success:
      return {
        ...state,
        count: state.count > 0 ? state.count - 1 : 0,
        message: '',
      };
    case ApiStatusActionTypes.Loading_Stop_Success:
      return {
        ...state,
        count: 0,
        message: '',
      };
    case AuthActionTypes.Logout_Success_Action:
      return initialState;
    default:
      return state;
  }
}


import {ErrorState} from '../../models/errorModels';
import { ApiStatusActionTypes } from '../actions/apiStatusAction';
import { AuthActionTypes } from '../actions/authAction';
import InitialState from './initialState';

const initialState: ErrorState = InitialState.error;

export default function ErrorReducer(
  state: ErrorState = initialState,
  action: any,
) {
  switch (action.type) {
    case ApiStatusActionTypes.API_Call_Error_Action:
      return {...state, error: action.payload};
    case AuthActionTypes.Logout_Success_Action:
      return initialState;
    default:
      return state;
  }
}

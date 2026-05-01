import { JobModelMain } from '../../models/jobModel';
import { UserMain } from '../../models/userModels';
import { AuthActionTypes } from '../actions/authAction';
import { JobActionTypes } from '../actions/jobAction';
import InitialState from './initialState';

const initialState: JobModelMain = InitialState.job;
export default function JobReducer(
  state: JobModelMain = initialState,
  action: any,
) {
  switch (action.type) {
    case JobActionTypes.Job_List_Success_Action:
      console.log("action.payload >>>  14",action.payload);
      return {
        ...state,
        job_list_wrapper: action.payload,
      };
    case JobActionTypes.Get_Resume_Success_Action:
      console.log("resume data >>>> 20 >>> ",action.payload);
      
      return {
        ...state,
        resume_data: action.payload,
      }
    default:
      return state;
  }

}
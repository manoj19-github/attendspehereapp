import { UserMain } from '../../models/userModels';
import { AuthActionTypes } from '../actions/authAction';
import InitialState from './initialState';

const initialState: UserMain = InitialState.auth;
export default function UserReducer(
  state: UserMain = initialState,
  action: any,
) {
  switch (action.type) {
    case AuthActionTypes.User_Login_Success_Action:
      return {
        ...state,
        user_details: action.payload,
      };
    case AuthActionTypes.Get_All_Candidate_Services_Success_Action:
      return {
        ...state,
        get_all_services: action.payload,
      };
    case AuthActionTypes.Status_Change_By_Candidate_Success_Action:
      return {
        ...state,
        status_change_by_candidate: action.payload,
      };
    case AuthActionTypes.Logout_Success_Action:
      return initialState;

    case AuthActionTypes.Dashboard_Services_Success_Action:
      return {
        ...state,
        dashboard_services: action.payload,
      };
    case AuthActionTypes.Get_All_Domain_Master_Action:
      return {
        ...state,
        get_all_domain_list: action.payload,
      };
    case AuthActionTypes.Block_By_District_Action:
      return {
        ...state,
        get_all_blocks_by_district: action.payload,
      };
    case AuthActionTypes.District_Master_Action:
      return {
        ...state,
        get_district_master: action.payload,
      };
    case AuthActionTypes.Candidate_Profile_Details_Action:
      return {
        ...state,
        candidate_profile_details: action.payload,
      };
    case AuthActionTypes.Decline_Questions_Action:
      return {
        ...state,
        decline_questions: action.payload,
      };
    case AuthActionTypes.Fetch_KB_ID_Details_Success_Action:
      return {
        ...state,
        fetch_details_from_kbid: action.payload,
      };
    case AuthActionTypes.Sector_List_Success_Action:
      return {
        ...state,
        sector_list: action.payload,
      };
    case AuthActionTypes.Trade_List_Success_Action:
      return {
        ...state,
        trade_list: action.payload,
      };
    case AuthActionTypes.Skill_List_Success_Action:
      return {
        ...state,
        skill_list: action.payload,
      };
    case AuthActionTypes.Get_All_Service_List_Success_Action:
      return {
        ...state,
        get_all_service_list_against_skill: action.payload,
      };
    case AuthActionTypes.Candidate_Update_Success_Action:
      return {
        ...state,
        user_details: action.payload,
      };
    default:
      return state;
  }
}

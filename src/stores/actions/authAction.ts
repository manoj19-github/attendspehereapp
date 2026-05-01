import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  ApiCallErrorAction,
  BeginApiCallAction,
  ErrorHandller,
  LoadingStopAction,
} from './apiStatusAction';

import { ClearLocalStorage } from '../../services/rest';
import {
  BlockByDistrictPayload,
  CandidateGenerateOTPForMobileAndEmailPayload,
  CandidateImageViewPayload,
  CandidateLoginPayload,
  CandidateProfileEditPayload,
  CandidateProfilePayload,
  CandidateValidateOTPForMobileAndEmailPayload,
  DashboardPayload,
  DistrictPayload,
  DownloadDocPayload,
  FetchDetailsFromKBIDPayload,
  GenerateOTPForKBIDVerificationPayload,
  GenerateOTPPayload,
  GetAllCandidateServicesPayload,
  GetAllDomainPayload,
  gigContactToAdminPayload,
  LogoutPayload,
  RatingForCitizenPayload,
  RegisterPayload,
  StatusChangeByCandidatePayload,
  ValidateOTPForKBIDVerificationPayload,
} from '../../models/userModels';
import {
  CandidateGenerateOTPForMobileAndEmailService,
  CandidateImageViewService,
  CandidateLoginService,
  CandidateProfileEditService,
  CandidateProfileService,
  CandidateValidateOTPService,
  DashboardService,
  DeclineQuestionsService,
  DownloadDocService,
  FetchDetailsFromKBIDService,
  GenerateOTPForKBIDVerificationService,
  GenerateOTPService,
  GetAllCandidateServicesService,
  GetAllDomainMasterService,
  GetAllServiceListAgainstSkillService,
  GetBlockListingByDeistrictService,
  GetDistrictMasterService,
  GigContactToAdminService,
  GigRegisterService,
  LogoutCandidateService,
  RateForCitizenService,
  SectorListForCandidateService,
  SectorListService,
  StatusChangeByCandidateService,
  TradeListService,
  ValidateOTPForKBIDVerificationService,
} from '../../services/authService';

export enum AuthActionTypes {
  Logout_Success_Action = '[AUTH] Logout Success Action',
  User_Login_Success_Action = '[AUTH] User Login Success Action',
  Generate_OTP_Success_Action = '[AUTH] Generate OTP Success Action',
  Get_All_Candidate_Services_Success_Action = '[AUTH] Get All Candidate Services Success Action',
  Status_Change_By_Candidate_Success_Action = '[AUTH] Status Change By Candidate Successs Action',
  Dashboard_Services_Success_Action = '[AUTH] Dashboard Services Success Action',
  Ratings_For_Citizen_Success_Action = '[AUTH] Ratings For Citizen Success Action',
  Get_All_Domain_Master_Action = '[AUTH] Get All Domain Master Action',
  District_Master_Action = '[AUTH] District Master Action',
  Block_By_District_Action = '[AUTH] Block By District Action',
  Candidate_Profile_Details_Action = '[AUTH] Candidate Profile Details Action',
  Decline_Questions_Action = '[AUTH] Decline Questions Action',
  Fetch_KB_ID_Details_Success_Action = '[AUTH] Fetch KB ID Details Success Action',
  Trade_List_Success_Action = '[AUTH] Trade List Success Action',
  Sector_List_Success_Action = '[AUTH] Sector List Success Action',
  Skill_List_Success_Action = '[AUTH] Skill List Success Action',
  Get_All_Service_List_Success_Action = '[AUTH] Get All Service List Success Action',
  Candidate_Update_Success_Action = '[AUTH] Candidate Update Success Action',
}

export const UserLogoutSuccess = () => {
  ClearLocalStorage();
  return { type: AuthActionTypes.Logout_Success_Action };
};

// Generate OTP Action
export const GenerateOTPAction = ({
  payload,
  successCallback,
  errorCallback,
}: {
  payload: GenerateOTPPayload;
  successCallback?: any;
  errorCallback?: any;
}) => {
  return (dispatch: any, getState: any) => {
    dispatch(
      BeginApiCallAction({
        count: 1,
        message: 'Generate OTP. Please Wait...',
      }),
    );
    return GenerateOTPService(payload)
      .then(async response => {
        if (response.status != 200) {
          dispatch(ApiCallErrorAction(response.data?.Data));
        } else {
          dispatch({
            type: AuthActionTypes.Generate_OTP_Success_Action,
            payload: response?.data?.Data,
          });
          successCallback?.(response?.data?.Data);
        }
      })
      .catch((error: any) => {
        if (error.response.status === 401) {
          ErrorHandller(error, dispatch);
          dispatch(UserLogoutSuccess());
        } else if (error.response.status === 500) {
          ErrorHandller(error, dispatch);
        } else {
          ErrorHandller(error, dispatch);
        }
        errorCallback?.(error);
      })
      .finally(() => {
        dispatch(LoadingStopAction());
      });
  };
};
// Candidate Login Action
export const CandidateLoginAction = ({
  payload,
  successCallback,
}: {
  payload: CandidateLoginPayload;
  successCallback?: any;
}) => {
  return (dispatch: any, getState: any) => {
    dispatch(
      BeginApiCallAction({
        count: 1,
        message: 'Singing In. Please Wait...',
      }),
    );
    return CandidateLoginService(payload)
      .then(async response => {
        if (response.status != 200) {
          dispatch(ApiCallErrorAction(response.data?.Data));
        } else {
          console.log('Login Resp', response?.data);
          await AsyncStorage.setItem('user', JSON.stringify(response?.data));
          // console.log('Login Resp', response?.data);
          dispatch({
            type: AuthActionTypes.User_Login_Success_Action,
            payload: response?.data?.Data,
          });
          successCallback?.(response?.data?.Data);
        }
      })
      .catch((error: any) => {
        if (error.response.status === 401) {
          ErrorHandller(error, dispatch);
          dispatch(UserLogoutSuccess());
        } else if (error.response.status === 500) {
          ErrorHandller(error, dispatch);
        } else {
          ErrorHandller(error, dispatch);
        }
      })
      .finally(() => {
        dispatch(LoadingStopAction());
      });
  };
};

// Candidate All Services
export const CandidateAllServicesAction = ({
  payload,
  successCallback,
}: {
  payload: GetAllCandidateServicesPayload;
  successCallback?: any;
}) => {
  return (dispatch: any, getState: any) => {
    dispatch(
      BeginApiCallAction({
        count: 1,
        message: 'Get All Candidate Services. Please Wait...',
      }),
    );
    return GetAllCandidateServicesService(payload)
      .then(async response => {
        if (response.status != 200) {
          dispatch(ApiCallErrorAction(response.data?.Data));
        } else {
          dispatch({
            type: AuthActionTypes.Get_All_Candidate_Services_Success_Action,
            payload: response?.data?.Data,
          });
          successCallback?.(response?.data?.Data);
        }
      })
      .catch((error: any) => {
        if (error.response.status === 401) {
          ErrorHandller(error, dispatch);
          dispatch(UserLogoutSuccess());
        } else if (error.response.status === 500) {
          ErrorHandller(error, dispatch);
        } else {
          ErrorHandller(error, dispatch);
        }
      })
      .finally(() => {
        dispatch(LoadingStopAction());
      });
  };
};

// Status Change By Candidate
export const StatusChangeByCandidateAction = ({
  payload,
  successCallback,
}: {
  payload: StatusChangeByCandidatePayload;
  successCallback?: any;
}) => {
  return (dispatch: any, getState: any) => {
    dispatch(
      BeginApiCallAction({
        count: 1,
        message: 'Status Change By Candidate . Please Wait...',
      }),
    );
    return StatusChangeByCandidateService(payload)
      .then(async response => {
        if (response.status != 200) {
          dispatch(ApiCallErrorAction(response.data?.Data));
        } else {
          dispatch({
            type: AuthActionTypes.Status_Change_By_Candidate_Success_Action,
            payload: response?.data?.Data,
          });
          successCallback?.(response?.data?.Data);
        }
      })
      .catch((error: any) => {
        if (error.response.status === 401) {
          ErrorHandller(error, dispatch);
          dispatch(UserLogoutSuccess());
        } else if (error.response.status === 500) {
          ErrorHandller(error, dispatch);
        } else {
          ErrorHandller(error, dispatch);
        }
      })
      .finally(() => {
        dispatch(LoadingStopAction());
      });
  };
};
// Candidate Logout Action
export const CandidateLogoutAction = ({
  payload,
}: {
  payload: LogoutPayload;
}) => {
  return (dispatch: any, getState: any) => {
    dispatch(
      BeginApiCallAction({
        count: 1,
        message: 'Loging Out. Please Wait...',
      }),
    );
    return LogoutCandidateService(payload)
      .then(async response => {
        if (response.status != 200) {
          dispatch(ApiCallErrorAction(response.data?.Data));
        } else {
          dispatch(UserLogoutSuccess());
        }
      })
      .catch((error: any) => {
        if (error.response.status === 401) {
          ErrorHandller(error, dispatch);
          dispatch(UserLogoutSuccess());
        } else if (error.response.status === 500) {
          ErrorHandller(error, dispatch);
        } else {
          ErrorHandller(error, dispatch);
        }
      })
      .finally(() => {
        dispatch(LoadingStopAction());
      });
  };
};

export const DashboardAction = ({
  payload,
  successCallback,
}: {
  payload: DashboardPayload;
  successCallback?: any;
}) => {
  return (dispatch: any, getState: any) => {
    dispatch(
      BeginApiCallAction({
        count: 1,
        message: 'Status Change By Candidate . Please Wait...',
      }),
    );
    return DashboardService(payload)
      .then(async response => {
        if (response.status != 200) {
          dispatch(ApiCallErrorAction(response.data?.Data));
        } else {
          dispatch({
            type: AuthActionTypes.Dashboard_Services_Success_Action,
            payload: response?.data?.Data,
          });
          successCallback?.(response?.data?.Data);
        }
      })
      .catch((error: any) => {
        if (error.response.status === 401) {
          ErrorHandller(error, dispatch);
          dispatch(UserLogoutSuccess());
        } else if (error.response.status === 500) {
          ErrorHandller(error, dispatch);
        } else {
          ErrorHandller(error, dispatch);
        }
      })
      .finally(() => {
        dispatch(LoadingStopAction());
      });
  };
};

export const RatingForCitizenAction = ({
  payload,
  successCallback,
}: {
  payload: RatingForCitizenPayload;
  successCallback?: any;
}) => {
  return (dispatch: any, getState: any) => {
    dispatch(
      BeginApiCallAction({
        count: 1,
        message: 'Ratings For Citizen . Please Wait...',
      }),
    );
    return RateForCitizenService(payload)
      .then(async response => {
        if (response.status != 200) {
          dispatch(ApiCallErrorAction(response.data?.Data));
        } else {
          successCallback?.(response?.data?.Data);
        }
      })
      .catch((error: any) => {
        if (error.response.status === 401) {
          ErrorHandller(error, dispatch);
          dispatch(UserLogoutSuccess());
        } else if (error.response.status === 500) {
          ErrorHandller(error, dispatch);
        } else {
          ErrorHandller(error, dispatch);
        }
      })
      .finally(() => {
        dispatch(LoadingStopAction());
      });
  };
};

// Get All Domain List
export const GetAllDomainMasterAction = (payload: GetAllDomainPayload) => {
  return (dispatch: any) => {
    dispatch(
      BeginApiCallAction({
        count: 1,
        message: 'Get All Domain List. Please wait...',
      }),
    );
    return GetAllDomainMasterService(payload)
      .then((response: any) => {
        if (response.status !== 200) {
          dispatch(ApiCallErrorAction(response.data?.Data));
        } else {
          dispatch({
            type: AuthActionTypes.Get_All_Domain_Master_Action,
            payload: response?.data?.Data,
          });
        }
      })
      .catch((error: any) => {
        if (error.response?.status === 401) {
          ErrorHandller(error, dispatch);
          dispatch(UserLogoutSuccess());
        } else {
          ErrorHandller(error, dispatch);
        }
      })
      .finally(() => {
        dispatch(LoadingStopAction());
      });
  };
};

export const CandidateProfileEditAction = ({
  payload,
  successCallback,
}: {
  payload: CandidateProfileEditPayload;
  successCallback?: any;
}) => {
  return (dispatch: any, getState: any) => {
    dispatch(
      BeginApiCallAction({
        count: 1,
        message: 'Candidate Profile Edit . Please Wait...',
      }),
    );
    return CandidateProfileEditService(payload)
      .then(async response => {
        if (response.status != 200) {
          dispatch(ApiCallErrorAction(response.data?.Data));
        } else {
          successCallback?.(response?.data?.Data);
        }
      })
      .catch((error: any) => {
        if (error.response.status === 401) {
          ErrorHandller(error, dispatch);
          dispatch(UserLogoutSuccess());
        } else if (error.response.status === 500) {
          ErrorHandller(error, dispatch);
        } else {
          ErrorHandller(error, dispatch);
        }
      })
      .finally(() => {
        dispatch(LoadingStopAction());
      });
  };
};

// Block List By District Action
export const GetBlockListByDistrictAction = ({
  payload,
  successCallBack,
}: {
  payload: BlockByDistrictPayload;
  successCallBack?: any;
}) => {
  return (dispatch: any) => {
    dispatch(
      BeginApiCallAction({
        count: 1,
        message: 'Get All Block By District',
      }),
    );
    return GetBlockListingByDeistrictService(payload)
      .then((response: any) => {
        if (response.status !== 200) {
          dispatch(ApiCallErrorAction(response.data?.Data));
        } else {
          dispatch({
            type: AuthActionTypes.Block_By_District_Action,
            payload: response?.data?.Data,
          });
          // console.log('block ressss', response?.Data);

          successCallBack?.(response?.data?.Data);
        }
      })
      .catch((error: any) => {
        if (error.response?.status === 401) {
          ErrorHandller(error, dispatch);
          dispatch(UserLogoutSuccess());
        } else {
          ErrorHandller(error, dispatch);
        }
      })
      .finally(() => {
        dispatch(LoadingStopAction());
      });
  };
};
// District Ation
export const GetDistrictMasterAction = ({
  payload,
  successCallBack,
}: {
  payload: DistrictPayload;
  successCallBack?: any;
}) => {
  return (dispatch: any) => {
    dispatch(
      BeginApiCallAction({
        count: 1,
        message: 'Get All District Master Details. Please wait...',
      }),
    );
    return GetDistrictMasterService(payload)
      .then((response: any) => {
        if (response.status !== 200) {
          dispatch(ApiCallErrorAction(response.data?.Data));
        } else {
          dispatch({
            type: AuthActionTypes.District_Master_Action,
            payload: response?.data?.Data,
          });
          successCallBack?.(response?.data?.Data);
        }
      })
      .catch((error: any) => {
        if (error.response?.status === 401) {
          ErrorHandller(error, dispatch);
          dispatch(UserLogoutSuccess());
        } else {
          ErrorHandller(error, dispatch);
        }
      })
      .finally(() => {
        dispatch(LoadingStopAction());
      });
  };
};

// Candidate Profile Ation
export const CandidateProfileAction = ({
  payload,
  successCallBack,
}: {
  payload: CandidateProfilePayload;
  successCallBack?: any;
}) => {
  return (dispatch: any) => {
    dispatch(
      BeginApiCallAction({
        count: 1,
        message: 'Candidate Profile Details. Please wait...',
      }),
    );
    return CandidateProfileService(payload)
      .then((response: any) => {
        if (response.status !== 200) {
          dispatch(ApiCallErrorAction(response.data?.Data));
        } else {
          dispatch({
            type: AuthActionTypes.Candidate_Profile_Details_Action,
            payload: response?.data?.Data,
          });
          successCallBack?.(response?.data?.Data);
        }
      })
      .catch((error: any) => {
        if (error.response?.status === 401) {
          ErrorHandller(error, dispatch);
          dispatch(UserLogoutSuccess());
        } else {
          ErrorHandller(error, dispatch);
        }
      })
      .finally(() => {
        dispatch(LoadingStopAction());
      });
  };
};

// Candidate Generate OTP For Mobile And Email Ation
export const CandidateGenerateOTPForMobileAndEmailAction = ({
  payload,
  successCallBack,
}: {
  payload: CandidateGenerateOTPForMobileAndEmailPayload;
  successCallBack?: any;
}) => {
  return (dispatch: any) => {
    dispatch(
      BeginApiCallAction({
        count: 1,
        message: 'Candidate Generate OTP. Please wait...',
      }),
    );
    return CandidateGenerateOTPForMobileAndEmailService(payload)
      .then((response: any) => {
        if (response.status !== 200) {
          dispatch(ApiCallErrorAction(response.data?.Data));
        } else {
          successCallBack?.(response?.data?.Data);
        }
      })
      .catch((error: any) => {
        if (error.response?.status === 401) {
          ErrorHandller(error, dispatch);
          dispatch(UserLogoutSuccess());
        } else {
          ErrorHandller(error, dispatch);
        }
      })
      .finally(() => {
        dispatch(LoadingStopAction());
      });
  };
};

// Candidate Validate OTP Ation
export const CandidateValidateOTPAction = ({
  payload,
  successCallBack,
}: {
  payload: CandidateValidateOTPForMobileAndEmailPayload;
  successCallBack?: any;
}) => {
  return (dispatch: any) => {
    dispatch(
      BeginApiCallAction({
        count: 1,
        message: 'Candidate Validate OTP. Please wait...',
      }),
    );
    return CandidateValidateOTPService(payload)
      .then((response: any) => {
        if (response.status !== 200) {
          dispatch(ApiCallErrorAction(response.data?.Data));
        } else {
          successCallBack?.(response?.data?.Data);
        }
      })
      .catch((error: any) => {
        if (error.response?.status === 401) {
          ErrorHandller(error, dispatch);
          dispatch(UserLogoutSuccess());
        } else {
          ErrorHandller(error, dispatch);
        }
      })
      .finally(() => {
        dispatch(LoadingStopAction());
      });
  };
};

// Candidate Image View
export const CandidateImageViewAction = ({
  payload,
  successCallBack,
}: {
  payload: CandidateImageViewPayload;
  successCallBack?: any;
}) => {
  return (dispatch: any, getState: any) => {
    dispatch(
      BeginApiCallAction({
        count: 1,
        message: 'Downloading Document. Please Wait...',
      }),
    );
    return CandidateImageViewService(payload)
      .then(async response => {
        if (response.status != 200) {
          dispatch(ApiCallErrorAction(response.data?.Data));
        } else {
          successCallBack?.(response.data?.Data);
        }
      })
      .catch((error: any) => {
        if (error.response.status === 401) {
          ErrorHandller(error, dispatch);
          dispatch(UserLogoutSuccess());
        } else if (error.response.status === 500) {
          ErrorHandller(error, dispatch);
        } else {
          ErrorHandller(error, dispatch);
        }
      })
      .finally(() => {
        dispatch(LoadingStopAction());
      });
  };
};

// Candidate Decline Questions
export const DeclineQuestionsAction = () => {
  return (dispatch: any, getState: any) => {
    dispatch(
      BeginApiCallAction({
        count: 1,
        message: 'Decline Questions. Please Wait...',
      }),
    );
    return DeclineQuestionsService()
      .then(async response => {
        if (response.status != 200) {
          dispatch(ApiCallErrorAction(response.data?.Data));
        } else {
          dispatch({
            type: AuthActionTypes.Decline_Questions_Action,
            payload: response?.data?.Data,
          });
        }
      })
      .catch((error: any) => {
        if (error.response.status === 401) {
          ErrorHandller(error, dispatch);
          dispatch(UserLogoutSuccess());
        } else if (error.response.status === 500) {
          ErrorHandller(error, dispatch);
        } else {
          ErrorHandller(error, dispatch);
        }
      })
      .finally(() => {
        dispatch(LoadingStopAction());
      });
  };
};

// Download Document Files
export const DownloadDocAction = ({
  payload,
  successCallBack,
}: {
  payload: DownloadDocPayload;
  successCallBack?: any;
}) => {
  return (dispatch: any, getState: any) => {
    dispatch(
      BeginApiCallAction({
        count: 1,
        message: 'Downloading Document. Please Wait...',
      }),
    );
    return DownloadDocService(payload)
      .then(async response => {
        if (response.status != 200) {
          dispatch(ApiCallErrorAction(response.data?.Data));
        } else {
          successCallBack?.(response.data?.Data);
        }
      })
      .catch((error: any) => {
        if (error.response.status === 401) {
          ErrorHandller(error, dispatch);
          dispatch(UserLogoutSuccess());
        } else if (error.response.status === 500) {
          ErrorHandller(error, dispatch);
        } else {
          ErrorHandller(error, dispatch);
        }
      })
      .finally(() => {
        dispatch(LoadingStopAction());
      });
  };
};

// Fetch KB ID details
export const FetchDetailsFromKBIDAction = ({
  payload,
  successCallBack,
  errorCallBack,
}: {
  payload: FetchDetailsFromKBIDPayload;
  successCallBack?: any;
  errorCallBack?: any;
}) => {
  return (dispatch: any, getState: any) => {
    dispatch(
      BeginApiCallAction({
        count: 1,
        message: 'Getting Details From KB ID. Please Wait...',
      }),
    );
    return FetchDetailsFromKBIDService(payload)
      .then(async response => {
        if (response.status != 200) {
          dispatch(ApiCallErrorAction(response.data?.Data));
        } else {
          dispatch({
            type: AuthActionTypes.Fetch_KB_ID_Details_Success_Action,
            payload: response?.data?.Data,
          });
          successCallBack?.(response.data?.Data);
        }
      })
      .catch((error: any) => {
        errorCallBack?.();
        if (error.response.status === 401) {
          ErrorHandller(error, dispatch);
          dispatch(UserLogoutSuccess());
        } else if (error.response.status === 500) {
          ErrorHandller(error, dispatch);
        } else {
          ErrorHandller(error, dispatch);
        }
      })
      .finally(() => {
        dispatch(LoadingStopAction());
      });
  };
};

//Get Sector List
export const GetSectorListAction = () => {
  return (dispatch: any) => {
    dispatch(
      BeginApiCallAction({
        count: 1,
        message: 'Getting sector list. Please wait...',
      }),
    );

    return SectorListService()
      .then((response: any) => {
        if (response.status !== 200) {
          dispatch(ApiCallErrorAction(response.data?.Data));
        } else {
          dispatch({
            type: AuthActionTypes.Sector_List_Success_Action,
            payload: response?.data?.Data,
          });
        }
      })
      .catch((error: any) => {
        if (error.response?.status === 401) {
          ErrorHandller(error, dispatch);
          dispatch(UserLogoutSuccess());
        } else {
          ErrorHandller(error, dispatch);
        }
      })
      .finally(() => {
        dispatch(LoadingStopAction());
      });
  };
};

export const GetTradeListAction = (sector_id: number) => {
  return (dispatch: any) => {
    return TradeListService(sector_id)
      .then((response: any) => {
        if (response.status !== 200) {
          dispatch(ApiCallErrorAction(response.data?.Data));
        } else {
          dispatch({
            type: AuthActionTypes.Trade_List_Success_Action,
            payload: response?.data?.Data,
          });
        }
      })
      .catch((error: any) => {
        if (error.response?.status === 401) {
          ErrorHandller(error, dispatch);
          dispatch(UserLogoutSuccess());
        } else {
          ErrorHandller(error, dispatch);
        }
      })
      .finally(() => {
        dispatch(LoadingStopAction());
      });
  };
};

export const GetSkillListAction = () => {
  return (dispatch: any) => {
    return SectorListForCandidateService()
      .then((response: any) => {
        if (response.status !== 200) {
          dispatch(ApiCallErrorAction(response.data?.Data));
        } else {
          dispatch({
            type: AuthActionTypes.Skill_List_Success_Action,
            payload: response?.data?.Data,
          });
        }
      })
      .catch((error: any) => {
        if (error.response?.status === 401) {
          ErrorHandller(error, dispatch);
          dispatch(UserLogoutSuccess());
        } else {
          ErrorHandller(error, dispatch);
        }
      })
      .finally(() => {
        dispatch(LoadingStopAction());
      });
  };
};

// Get Service List
export const GetAllServiceListAction = () => {
  return (dispatch: any) => {
    dispatch(
      BeginApiCallAction({
        count: 1,
        message: 'Getting Service list. Please wait...',
      }),
    );
    return GetAllServiceListAgainstSkillService()
      .then((response: any) => {
        if (response.status !== 200) {
          dispatch(ApiCallErrorAction(response.data?.Data));
        } else {
          dispatch({
            type: AuthActionTypes.Get_All_Service_List_Success_Action,
            payload: response?.data?.Data,
          });
        }
      })
      .catch((error: any) => {
        if (error.response?.status === 401) {
          ErrorHandller(error, dispatch);
          dispatch(UserLogoutSuccess());
        } else {
          ErrorHandller(error, dispatch);
        }
      })
      .finally(() => {
        dispatch(LoadingStopAction());
      });
  };
};
// Generate OTP From KBID Details
export const GenerateOTPForKBIDVerificationAction = ({
  payload,
  successCallBack,
  errorCallBack,
}: {
  payload: GenerateOTPForKBIDVerificationPayload;
  successCallBack?: any;
  errorCallBack?: any;
}) => {
  return (dispatch: any, getState: any) => {
    dispatch(
      BeginApiCallAction({
        count: 1,
        message: 'Getting OTP. Please Wait...',
      }),
    );
    return GenerateOTPForKBIDVerificationService(payload)
      .then(async response => {
        if (response.status != 200) {
          dispatch(ApiCallErrorAction(response.data?.Data));
        } else {
          successCallBack?.(response.data?.Data);
        }
      })
      .catch((error: any) => {
        errorCallBack?.();
        if (error.response.status === 401) {
          ErrorHandller(error, dispatch);
          dispatch(UserLogoutSuccess());
        } else if (error.response.status === 500) {
          ErrorHandller(error, dispatch);
        } else {
          ErrorHandller(error, dispatch);
        }
      })
      .finally(() => {
        dispatch(LoadingStopAction());
      });
  };
};

// Validate OTP From KBID Details
export const ValidateOTPForKBIDVerificationAction = ({
  payload,
  successCallBack,
  errorCallBack,
}: {
  payload: ValidateOTPForKBIDVerificationPayload;
  successCallBack?: any;
  errorCallBack?: any;
}) => {
  return (dispatch: any, getState: any) => {
    dispatch(
      BeginApiCallAction({
        count: 1,
        message: 'Validating OTP details. Please Wait...',
      }),
    );
    return ValidateOTPForKBIDVerificationService(payload)
      .then(async response => {
        if (response.status != 200) {
          dispatch(ApiCallErrorAction(response.data?.Data));
        } else {
          successCallBack?.(response.data?.Data);
        }
      })
      .catch((error: any) => {
        errorCallBack?.();
        if (error.response.status === 401) {
          ErrorHandller(error, dispatch);
          dispatch(UserLogoutSuccess());
        } else if (error.response.status === 500) {
          ErrorHandller(error, dispatch);
        } else {
          ErrorHandller(error, dispatch);
        }
      })
      .finally(() => {
        dispatch(LoadingStopAction());
      });
  };
};

// Gig Contact To Admin
export const GigContactToAdminAction = ({
  payload,
  successCallBack,
  errorCallBack,
}: {
  payload: gigContactToAdminPayload;
  successCallBack?: any;
  errorCallBack?: any;
}) => {
  return (dispatch: any, getState: any) => {
    dispatch(
      BeginApiCallAction({
        count: 1,
        message: 'Gig Contact To Admin. Please Wait...',
      }),
    );
    return GigContactToAdminService(payload)
      .then(async response => {
        if (response.status != 200) {
          dispatch(ApiCallErrorAction(response.data?.Data));
        } else {
          successCallBack?.(response.data?.Data);
        }
      })
      .catch((error: any) => {
        errorCallBack?.();
        if (error.response.status === 401) {
          ErrorHandller(error, dispatch);
          dispatch(UserLogoutSuccess());
        } else if (error.response.status === 500) {
          ErrorHandller(error, dispatch);
        } else {
          ErrorHandller(error, dispatch);
        }
      })
      .finally(() => {
        dispatch(LoadingStopAction());
      });
  };
};

// Candidate Register
export const CandidateRegisterAction = ({
  payload,
  successCallBack,
}: {
  payload: RegisterPayload;
  successCallBack?: any;
}) => {
  return (dispatch: any, getState: any) => {
    dispatch(
      BeginApiCallAction({
        count: 1,
        message: 'Register candidate details. Please wait...',
      }),
    );

    return GigRegisterService(payload)
      .then(async response => {
        if (response.status !== 200) {
          dispatch(ApiCallErrorAction(response.data?.Data));
        } else {
          dispatch({
            type: AuthActionTypes.Candidate_Update_Success_Action,
            payload: response?.data?.Data,
          });
          successCallBack?.();
        }
      })
      .catch((error: any) => {
        if (error.response?.status === 401) {
          ErrorHandller(error, dispatch);
          dispatch(UserLogoutSuccess());
        } else {
          ErrorHandller(error, dispatch);
        }
      })
      .finally(() => {
        dispatch(LoadingStopAction());
      });
  };
};


import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  ApiCallErrorAction,
  BeginApiCallAction,
  ErrorHandller,
  LoadingStopAction,
} from './apiStatusAction';
import { ClearLocalStorage, getToken } from '../../services/rest';
import {
  ApplyJobService,
  GetJobListService,
  getResumeDataService,
  saveResumeDataService,
  UploadResumeService,
} from '../../services/jobService';
import { JobModelMain } from '../../models/jobModel';
import { UserLogoutSuccess } from './authAction';
import { Platform } from 'react-native';
import { baseServiceUrl, urls } from '../../environments';


export const JobActionTypes = {
  Job_List_Success_Action: '[JOB] Job List Success Action',
  Save_Resume_Success_Action: '[JOB] Save Resume Success Action',
  Get_Resume_Success_Action: '[JOB] Get Resume Success Action',
};



// Get Job List
export const GetJobListAction = ({payload,successCallback,errorCallback}:{payload:any,successCallback?:any,errorCallback?:any}) => {
  return (dispatch: any) => {
    dispatch(
      BeginApiCallAction({
        count: 1,
        message: 'Getting Job List. Please wait...',
      }),
    );
    console.log("payload >>> ",payload);
    
    return GetJobListService(payload)
      .then((response: any) => {
        console.log("response 30 >>> ",response?.data?.Data);
        
        if (response.status !== 200) {
          dispatch(ApiCallErrorAction(response.data?.Data));
        } else {
            successCallback?.();
          dispatch({
            type: JobActionTypes.Job_List_Success_Action,
            payload: response?.data?.Data,
          });
        }
      })
      .catch((error: any) => {
        errorCallback?.();
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
    }
  };

 





    // ─── Updated applyJobAction with file upload support ───────────────────────────



/**
 * Apply for a job with optional resume upload
 * @param payload - Application payload with job_id, remarks, resume_id
 * @param successCallback - Called on successful application
 * @param errorCallback - Called on error with error object
 */
export const applyJobAction = ({
  payload,
  successCallback,
  errorCallback,
}: {
  payload: { job_id: number; remarks: string; resume_id: number }
  successCallback?: () => void
  errorCallback?: (error: any) => void
}) => {
  return (dispatch: any) => {
    dispatch(
      BeginApiCallAction({
        count: 1,
        message: 'Submitting your application...',
      }),
    )

    console.log('[applyJobAction] payload >>> ', payload)

    return ApplyJobService(payload)
      .then((response: any) => {
        console.log('[applyJobAction] response >>> ', response?.data)

        if (response.status !== 200) {
          dispatch(ApiCallErrorAction(response.data?.Data))
          errorCallback?.(response.data?.Data || new Error('Application failed'))
        } else {
          successCallback?.()
          dispatch({
            type: JobActionTypes.Job_List_Success_Action,
            payload: response?.data?.Data,
          })
        }
      })
      .catch((error: any) => {
        console.error('[applyJobAction] error >>> ', error)
        errorCallback?.(error)

        if (error.response?.status === 401) {
          ErrorHandller(error, dispatch)
          dispatch(UserLogoutSuccess())
        } else if (error.response?.status === 500) {
          ErrorHandller(error, dispatch)
        } else {
          ErrorHandller(error, dispatch)
        }
      })
      .finally(() => {
        dispatch(LoadingStopAction())
      })
  }
}

/**
 * Upload resume file to server
 * @param file - Resume file object { uri, name, type }
 * @param successCallback - Called with uploaded resume_id
 * @param errorCallback - Called on error
 */
export const uploadResumeAction = ({
  file,
  successCallback,
  errorCallback,
}: {
  file: { uri: string; name: string; type: string }
  successCallback?: (resumeId: number) => void
  errorCallback?: (error: any) => void
}) => {
  return (dispatch: any) => {
    dispatch(
      BeginApiCallAction({
        count: 1,
        message: 'Uploading resume...',
      }),
    )

    const formData = new FormData()
    formData.append('resume', {
      uri: file.uri,
      name: file.name,
      type: file.type,
    } as any)

    return UploadResumeService(formData)
      .then((response: any) => {
        if (response.status === 200 && response.data?.Data?.resume_id) {
          successCallback?.(response.data.Data.resume_id)
        } else {
          errorCallback?.(new Error('Failed to upload resume'))
        }
      })
      .catch((error: any) => {
        console.error('[uploadResumeAction] error >>> ', error)
        errorCallback?.(error)
        ErrorHandller(error, dispatch)
      })
      .finally(() => {
        dispatch(LoadingStopAction())
      })
  }
}


export const saveResumeDataAction = ({
  payload,
  successCallback,
  errorCallback,
}: {
  payload:any;
  successCallback?: () => void
  errorCallback?: (error: any) => void
})=>{
  return (dispatch: any) => {
    dispatch(
      BeginApiCallAction({
        count: 1,
        message: 'Saving resume data...',
      }),
    )
    console.log("[saveResumeDataAction] payload >>> ",payload);
    return saveResumeDataService(payload)
      .then((response: any) => {
        console.log("[saveResumeDataAction] response >>> ",response);
        if ( response?.status !== 200) {
          dispatch(ApiCallErrorAction(response.data?.Data))
          errorCallback?.(response.data?.Data || new Error('Application failed'))
        } else {
          successCallback?.()
         
        }
      })
      .catch((error: any) => {
        console.error('[saveResumeDataAction] error >>> ', error)
        errorCallback?.(error)
        ErrorHandller(error, dispatch)
      })
      .finally(() => {
        dispatch(LoadingStopAction())
      })
  }
}

export const getResumeDataAction = ({
  payload,
  successCallback,
  errorCallback,
}: {
  payload:any;
  successCallback?: () => void
  errorCallback?: (error: any) => void
})=>{
  return (dispatch: any) => {
    dispatch(
      BeginApiCallAction({
        count: 1,
        message: 'Getting resume data...',
      }),
    )
    console.log("[getResumeDataAction] payload >>> ",payload);
    return getResumeDataService()
      .then((response: any) => {
        console.log("[getResumeDataAction] response >>> ",response?.data);
        if ( response?.status !== 200) {
          dispatch(ApiCallErrorAction(response.data?.Data))
          errorCallback?.(response.data?.Data || new Error('Application failed'))
        } else {
          successCallback?.()
          console.log("response?.data?.Data?.resume >>> ",response?.data?.Data?.resume);
          
          dispatch({
            type: JobActionTypes.Get_Resume_Success_Action,
            payload: response?.data?.Data?.resume,
          })
        }
      })
      .catch((error: any) => {
        console.error('[getResumeDataAction] error >>> ', error)
        errorCallback?.(error)
        // ErrorHandller(error, dispatch)
      })
      .finally(() => {
        dispatch(LoadingStopAction())
      })
  } }




  export const uploadResumePDFAction =  ({formObj,successCallback,errorCallback}:{formObj: any,errorCallback?:(args?:any)=>void,successCallback:(args?:any)=>void})=>async(dispatch:any) => {
  try {
     dispatch(
      BeginApiCallAction({
        count: 1,
        message: 'Getting resume data...',
      }),
    )
    console.log("formObj >>> 285 >>> ",formObj);
    
    const jwtToken = await getToken();
      console.log("service URL >>>>>> ",`${baseServiceUrl}${urls.uploadDocFiles}`);


    


    

    const response = await fetch(`${baseServiceUrl}${urls.uploadDocFiles}`, {
      method: 'POST',
      headers: {
        
        'Authorization': `${jwtToken}`,
        // Authorization: `Bearer ${token}`, // if needed
      },
      body: formObj,
    });

    const result = await response.json();
    console.log('Upload success:', result);
    successCallback?.(result);

  } catch (error) {
    console.log('Upload error:', error);
    errorCallback?.(error);
  }finally{
    dispatch(LoadingStopAction())
  }
};
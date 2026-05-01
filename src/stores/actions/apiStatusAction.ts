// import Toast, {
//   BaseToast,
//   ErrorToast,
//   ToastType,
// } from 'react-native-toast-message';
import { ErrorModel } from '../../models/errorModels';
import { LoadingPayload } from '../../models/loadingModels';
import AsyncStorage from '@react-native-async-storage/async-storage';
// import { UserLogoutSuccess } from './authAction';
import Toast from 'react-native-toast-message';
import { UserLogoutSuccess } from './authAction';
// import { UserLogoutSuccess } from './authAction';

export enum ApiStatusActionTypes {
  Begin_Api_Call = '[API_STATUS] Begin Api Call Action',
  Api_Call_Success = '[API_STATUS] Api Call Success Action',
  Loading_Stop_Success = '[API_STATUS] Loading Stop Success',
  API_Call_Error_Action = '[API_STATUS] API Call Error Action',
}

export const BeginApiCallAction = (payload: LoadingPayload) => {
  return { type: ApiStatusActionTypes.Begin_Api_Call, payload: payload };
};

export const ApiCallSuccessAction = () => {
  return { type: ApiStatusActionTypes.Api_Call_Success };
};

export const LoadingStopAction = () => {
  return { type: ApiStatusActionTypes.Loading_Stop_Success };
};

export const ApiCallErrorAction = (payload: ErrorModel) => {
  return { type: ApiStatusActionTypes.API_Call_Error_Action, payload: payload };
};

// export const ErrorHandller = async (error: any, dispatch: any) => {
//   const apiUrl =
//     error?.config?.baseURL && error?.config?.url
//       ? `${error.config.baseURL}${error.config.url}`
//       : error?.config?.url || 'Unknown API';

//   console.log('❌ API ERROR URL:', apiUrl);
//   console.log('❌ API ERROR METHOD:', error?.config?.method);
//   console.log('❌ API ERROR PAYLOAD:', error?.config?.data);
//   console.log('❌ API ERROR RESPONSE:', error?.response?.data);
//   console.log('ERRRRRRRRRRRRRRRRRRRRRRRRR', error?.response?.data);

//   if (error?.response?.data?.Status_Code === 310) {
//     dispatch(
//       ApiCallErrorAction(
//         error?.response?.data?.Errors?.Status_Message ||
//           error?.response?.data?.Errors?.Error_Message,
//       ),
//     );
//     showToast(
//       error?.response?.data?.Errors?.Status_Message ||
//         error?.response?.data?.Errors?.Error_Message,
//       'info',
//     );
//   } else if (error?.response?.data?.Status_Code === 311) {
//     dispatch(
//       ApiCallErrorAction(
//         error?.response?.data?.Errors?.Status_Message ||
//           error?.response?.data?.Errors?.Error_Message,
//       ),
//     );
//     showToast(
//       error?.response?.data?.Errors?.Status_Message ||
//         error?.response?.data?.Errors?.Error_Message ||
//         'Something went wrong. Please try again.',
//       'error',
//     );
//   } else if (
//     error?.response?.data?.Status_Code === 400 ||
//     error?.response?.data?.Status_Code === 404
//   ) {
//     dispatch(
//       ApiCallErrorAction(
//         error?.response?.data?.Errors?.Status_Message ||
//           error?.response?.data?.Errors?.Error_Message,
//       ),
//     );
//     showToast(
//       error?.response?.data?.Errors?.Status_Message ||
//         error?.response?.data?.Errors?.Error_Message ||
//         'Something went wrong. Please try again.',
//       'error',
//     );
//   } else if (
//     error?.response?.data?.Status_Code === 312 ||
//     error?.response?.data?.Status_Code === 500
//   ) {
//     dispatch(
//       ApiCallErrorAction(
//         error?.response?.data?.Errors?.Status_Message ||
//           error?.response?.data?.Errors?.Error_Message,
//       ),
//     );
//     showToast(
//       error?.response?.data?.Errors?.Status_Message ||
//         error?.response?.data?.Errors?.Error_Message ||
//         'Something went wrong. Please try again.',
//       'error',
//     );
//   } else if (error?.response?.data?.Status_Code === 313) {
//     dispatch(
//       ApiCallErrorAction(
//         error?.response?.data?.Errors?.Status_Message ||
//           error?.response?.data?.Errors?.Error_Message,
//       ),
//     );
//     showToast(
//       error?.response?.data?.Errors?.Status_Message ||
//         error?.response?.data?.Errors?.Error_Message ||
//         'Something went wrong. Please try again.',
//       'error',
//     );
//   } else if (error?.response?.data?.Status_Code === 413) {
//     dispatch(
//       ApiCallErrorAction(
//         error?.response?.data?.Errors?.Status_Message ||
//           error?.response?.data?.Errors?.Error_Message,
//       ),
//     );
//     showToast(
//       error?.response?.data?.Errors?.Status_Message ||
//         error?.response?.data?.Errors?.Error_Message ||
//         'File too large',
//       'error',
//     );
//   } else {
//     showToast('Something went wrong. Please try again.', 'error');
//     AsyncStorage.multiRemove(['token', 'user', 'cart']);
//     // dispatch(UserLogoutSuccess());
//   }
// };
const pickFirstMessage = (errData: any): string => {
  const errors = errData?.Errors;

  const msg =
    errors?.System_Errors?.[0]?.Message ||
    errors?.Business_Errors?.[0]?.Message ||
    errors?.Warnings?.[0]?.Message ||
    errors?.Info?.[0]?.Message;

  return (
    msg ||
    errData?.message ||
    errData?.Message ||
    'Something went wrong. Please try again.'
  );
};

const shouldLogout = (errData: any, statusCode: number) => {
  if (statusCode === 401 || statusCode === 403) return true;

  const msg = (pickFirstMessage(errData) || '').toLowerCase();
  if (
    msg.includes('unauthorized') ||
    msg.includes('invalid token') ||
    msg.includes('token expired') ||
    msg.includes('session expired') ||
    msg.includes('forbidden')
  ) {
    return true;
  }

  return false;
};

export const ErrorHandller = async (error: any, dispatch: any) => {
  const apiUrl =
    error?.config?.baseURL && error?.config?.url
      ? `${error.config.baseURL}${error.config.url}`
      : error?.config?.url || 'Unknown API';
  const errData = error?.response?.data;
  const statusCode = errData?.status_code ?? error?.response?.status;

  console.log('❌ API ERROR URL:', apiUrl);
  console.log('❌ API ERROR METHOD:', error?.config?.method);
  console.log('❌ API ERROR PAYLOAD:', error?.config?.data);
  console.log('❌ API ERROR RESPONSE:', error?.response?.data);
  console.log('ERRRRRRRRRRRRRRRRRRRRRRRRR', error?.response?.data);

  const message = pickFirstMessage(errData);

  // ✅ FIX: dispatch ErrorModel
  dispatch(ApiCallErrorAction({ message }));

  // ✅ Logout only if required
  if (shouldLogout(errData, statusCode)) {
    showToast('Session expired. Please login again.', 'error');
    await AsyncStorage.multiRemove(['token', 'user', 'cart']);
    dispatch(UserLogoutSuccess());
    return;
  }

  if (statusCode === 429) {
    showToast(message, 'error');
    return;
  }

  if (statusCode === 400 || statusCode === 404) {
    showToast(message, 'error');
    return;
  }

  if (statusCode === 500 || errData?.Exception === true) {
    showToast(message, 'error');
    return;
  }

  showToast(message, 'error');
};

export const showToast = (message: string, color: any) => {
  // Toast.show({
  //   type: color,
  //   text1: message,
  //   swipeable: true,
  //   text1Style: { fontSize: 15 },
  //   props: {
  //     text2NumberOfLines: 5,
  //   },
  // });
  Toast.show({
    type: color,
    text1: message,
    swipeable: true,
    text1Style: {
      fontSize: 15,
      flexWrap: 'wrap',
      width: '90%',
    },
  });
};

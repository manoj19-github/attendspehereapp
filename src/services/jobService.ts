import RestService, { getToken } from './rest';

import { baseServiceUrl, urls } from '../environments';
import axios from 'axios';

export const serviceClient = new RestService({
  baseURL: baseServiceUrl,
});

export const GetJobListService = (
  payload: any
) => {
  return serviceClient.post(urls.candidateJobListing, payload);
};


export const ApplyJobService = (
  payload: any
) => {
  return serviceClient.post(urls.applyjob, payload);
};


export const UploadResumeService = async (formData: FormData) => {
  const token = await getToken();
  return axios.post(`${baseServiceUrl}/resumes/upload`, formData, {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'multipart/form-data',
    },
  })
}



export const saveResumeDataService = async (payload: any) => {
  return serviceClient.post(urls.saveResume, payload);
}
export const getResumeDataService = async () => {
  return serviceClient.get(urls.getResume);
}
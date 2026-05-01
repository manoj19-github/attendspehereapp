import { AxiosRequestConfig } from 'axios';
import { baseServiceUrl, urls } from '../environments';
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
} from '../models/userModels';
import RestService from './rest';

export const serviceClient = new RestService({
  baseURL: baseServiceUrl,
});

export const GenerateOTPService = (data: GenerateOTPPayload) => {
  return serviceClient.post(urls.generateOtp, data);
};
export const CandidateLoginService = (data: CandidateLoginPayload) => {
  return serviceClient.post(urls.candidateLogin, data);
};
export const GetAllCandidateServicesService = (
  data: GetAllCandidateServicesPayload,
) => {
  return serviceClient.post(urls.citizenServiceDetails, data);
};
export const StatusChangeByCandidateService = (
  data: StatusChangeByCandidatePayload,
) => {
  return serviceClient.post(urls.statusChangeOfAnyServiceByCandidate, data);
};
export const LogoutCandidateService = (data: LogoutPayload) => {
  return serviceClient.post(urls.logoutGig, data);
};

export const DashboardService = (data: DashboardPayload) => {
  return serviceClient.post(urls.dashboardService, data);
};

export const RateForCitizenService = (data: RatingForCitizenPayload) => {
  return serviceClient.post(urls.ratingForCitizen, data);
};

export const CandidateProfileEditService = (
  data: CandidateProfileEditPayload,
) => {
  return serviceClient.post(urls.candidateProfileEdit, data);
};
export const GetAllDomainMasterService = (data: GetAllDomainPayload) => {
  return serviceClient.post(urls.getDomainList, data);
};
export const GetBlockListingByDeistrictService = (
  data: BlockByDistrictPayload,
) => {
  return serviceClient.post(urls.getAllBlock, data);
};
export const GetDistrictMasterService = (data: DistrictPayload) => {
  return serviceClient.post(urls.getAllDistrict, data);
};
export const CandidateProfileService = (data: CandidateProfilePayload) => {
  return serviceClient.post(urls.candidateProfile, data);
};
export const CandidateGenerateOTPForMobileAndEmailService = (
  data: CandidateGenerateOTPForMobileAndEmailPayload,
) => {
  return serviceClient.post(urls.candidateGenerateOTPForMobileAndEmail, data);
};
export const CandidateValidateOTPService = (
  data: CandidateValidateOTPForMobileAndEmailPayload,
) => {
  return serviceClient.post(urls.candidateOTPValidate, data);
};

export const CandidateImageViewService = (data: CandidateImageViewPayload) => {
  return serviceClient.post(urls.candidateImageView, data);
};
export const UploadDocService = (
  payload: any,
  config?: AxiosRequestConfig<any> | undefined,
) => {
  return serviceClient.postWithConfig(
    urls.uploadDocFiles as any,
    payload,
    config,
  );
};

export const DeclineQuestionsService = () => {
  return serviceClient.get(urls.declineQuestions);
};

export const DownloadDocService = (
  payload: any,
  config?: AxiosRequestConfig<any> | undefined,
) => {
  return serviceClient.postWithConfig(
    urls.downloadDocFile as any,
    payload,
    config,
  );
};
export const FetchDetailsFromKBIDService = (
  payload: FetchDetailsFromKBIDPayload,
) => {
  return serviceClient.post(urls.fetchDetailsFromKBID, payload);
};
export const SectorListService = () => {
  return serviceClient.get(urls.sectorList);
};

export const TradeListService = (sector_id: number) => {
  return serviceClient.get(`${urls.tradeList}?sector_id=${sector_id}`);
};

export const GenerateOTPForKBIDVerificationService = (
  payload: GenerateOTPForKBIDVerificationPayload,
) => {
  return serviceClient.post(urls.generateOTPForKBIDVerification, payload);
};

export const ValidateOTPForKBIDVerificationService = (
  payload: ValidateOTPForKBIDVerificationPayload,
) => {
  return serviceClient.post(urls.validateOTPForKBIDVerification, payload);
};
export const SectorListForCandidateService = () => {
  return serviceClient.get(`${urls.candidateSectorList}`);
};
export const GetAllServiceListAgainstSkillService = () => {
  return serviceClient.get(urls.getAllServiceListAgainstSkill);
};
export const GigContactToAdminService = (payload: gigContactToAdminPayload) => {
  return serviceClient.post(urls.gigContactToAdmin, payload);
};

export const GigRegisterService = (payload: RegisterPayload) => {
  return serviceClient.post(urls.candidateRegister, payload);
};

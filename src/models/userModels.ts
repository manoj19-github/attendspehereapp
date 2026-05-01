export interface UserMain {
  user_details?: CandidateLoginResponse;
  get_all_services?: GetAllCandidateServicesResp;
  status_change_by_candidate?: StatusChangeByCandidateResp;
  dashboard_services?: DashboardResponse;
  get_all_domain_list?: any;
  get_district_master?: DistrictListingResp;
  get_all_blocks_by_district?: BlockByDistrictResp;
  candidate_profile_details?: CandidateLoginResponse;
  decline_questions?: DeclineQuestionsResp;
  fetch_details_from_kbid?: FetchDetailsFromKBIDResp;
  sector_list?: SectorListResp;
  skill_list?: SkillListResp;
  get_all_service_list_against_skill?: GetAllServiceFromSkillsResp;
}
export interface GenerateOTPPayload {
  username: string;
}
export interface CandidateLoginPayload {
  username: string;
  otp: string;
  fcm_token: string;
  unique_id: any;
}
export interface CandidateLoginResponse {
  candidate_details: CandidateDetails;
  personalinfo: Personalinfo;
  experience: any[];
  education: Education;
  training: Training;
  preferredservice: any[];
  preferedlocation: Preferedlocation;
  document_listing: any[];
}
export interface CandidateDetails {
  user_id: number;
  candidate_id: number;
  candidate_code: string;
  full_name: string;
  firstname: string;
  lastname: string;
  is_firstname_verified: any;
  is_lastname_verified: any;
  kaushal_panjee_id: any;
  sanction_order: string;
  kb_project_id: string;
  mpr_project_id: any;
  mpr_id: any;
  status_id: number;
  status: string;
  nature_of_training: string;
  created_on: string;
  updated_on: string;
  remarks: any;
  is_verified: any;
  is_gig_worker: any;
  candidate_type: number;
  candidate_type_name: string;
  candidate_user_type?: any;
}

export interface Personalinfo {
  date_of_birth: string;
  is_dob_verified: any;
  father_name: any;
  gender_id: number;
  gender_name: string;
  is_gender_verified: any;
  category_id: number;
  category_name: string;
  mobile_no: string;
  is_mobile_verified: any;
  email: any;
  is_email_verified: any;
  permanent_address: string;
  village_address: any;
  house_no: any;
  pincode: string;
  state_id: number;
  state_name: string;
  district_id: number;
  district_name: string;
  is_district_verified: any;
  block_id: number;
  block_name: string;
  is_block_verified: any;
  constituency_id: any;
  constituency_name: any;
  pwd_id: number;
  pwd_name: string;
  minority: number;
  minority_name: string;
  religion_id: number;
  religion_name: string;
  is_religion_verified: any;
  aadhar: string;
  bank_account: string;
  workplace_postoffice: any;
  is_show_candidate_details: boolean;
  profile_signed_url?: any;
}

export interface Education {
  qualification: any;
}

export interface Training {
  training_start_date: string;
  training_end_date: string;
  training_center_id: any;
  training_center_name: string;
  training_distict_id: number;
  training_district_name: string;
  training_state_id: number;
  training_state_name: string;
  training_sector_id: number;
  training_sector_name: string;
  training_sector_other: any;
  training_skill_id: number;
  training_skill_name: string;
  training_skill_other: any;
  is_sector_verified: any;
  is_skill_verified: any;
  batch_id: number;
}

export interface Preferedlocation {
  location: any[];
  preferreddays: any[];
  available_start_time: any;
  available_end_time: any;
}

export interface GetAllCandidateServicesPayload {
  candidate_id?: number;
  // status_id?: any;
  status_id?: number[] | null;
}

export interface StatusChangeByCandidatePayload {
  service_request_id: number;
  citizen_id: number;
  candidate_id: number;
  service_id: number;
  district_id: number;
  service_status_to: number;
  address_id: any;
  preferred_day?: string;
  start_time?: string;
  end_time?: string;
  code?: any;
  remarks?: string;
  question_id?: number[];
  amount?: any;
}
export interface StatusChangeByCandidateResp {}

export interface GetAllCandidateServicesResp {
  gig_worker_service_list: GigWorkerServiceList[];
}
export interface GigWorkerServiceList {
  service_request_id: number;
  service_code: string;
  service_request_status_id: number;
  service_request_status: string;
  citizen_id: number;
  citizen_name: string;
  service_request_created: string;
  gigworker_name: string;
  district_id: number;
  service_district: string;
  citizen_mobile_number?: any;
  sector_id: number;
  sector_name: string;
  service_id: number;
  service_name: string;
  skill_id: number;
  skill_name: string;
  service_desc: string;
  citizen_service_address_id?: number;
  service_remarks?: string;
  service_preferred_day: number;
  service_requested_date?: string;
  service_preferred_day_name: string;
  service_address_line_1?: string;
  service_address_line_2?: string;
  service_land_mark?: string;
  service_city?: string;
  service_pincode?: string;
  service_lattitude?: string;
  service_longitude?: string;
  service_state?: string;
  service_country?: string;
  service_is_primary?: boolean;
  service_rating?: any;
  decline_questions?: any;
  is_gig_ratted?: any;
  service_start_time?: any;
  service_end_time?: any;
  service_rescheduled_start_time?: string;
  service_rescheduled_end_time?: string;
  service_rescheduled_date: any;
  service_rescheduled_flag?: any;
}
export interface LogoutPayload {
  user_type?: number;
  user_id?: number;
  token?: string;
}

export interface DashboardPayload {
  gig_worker_id: number;
  filter: string;
}

// export interface DashboardResponse {
//   woker_summary: WokerSummary[]
//   total_job_performed: TotalJobPerformed[]
//   upcoming_scheduled_job: UpcomingScheduledJob[]
//   overall_ratting: OverallRatting[]
//   district_service_count: DistrictServiceCount[]
//   Code: string
//   Message: string
//   "Status Message": string
// }

// export interface WokerSummary {
//   candidate_id: number
//   request_count: number
//   pending_count: number
//   complete_count: number
// }

// export interface TotalJobPerformed {
//   month_name: string
//   month_no?: string
//   accepted_count: number
//   completed_count: number
// }

// export interface UpcomingScheduledJob {
//   service_request_id: number
// }

// export interface OverallRatting {
//   avg_rating_out_of_5: any
// }

// export interface DistrictServiceCount {
//   district_id: number
//   completed_count: number
// }

export interface DashboardResponse {
  woker_summary: WokerSummary[];
  overall_ratting: OverallRatting[];
  pending_service_list: PendingServiceList[];
  upcoming_request: UpcomingRequest[];
}

export interface WokerSummary {
  candidate_id: number;
  request_count: number;
  pending_count: number;
  complete_count: number;
}

export interface OverallRatting {
  avg_rating_out_of_5: any;
}

export interface PendingServiceList {
  service_request_id: number;
  service_id: number;
  service_name: string;
  service_code: any;
  citizen_id: number;
  full_name: string;
  mobile_number: string;
  address: string;
  start_time: string;
  end_time: string;
  booked_date: string;
  service_icon?: string;
}

export interface UpcomingRequest {
  service_request_id: number;
  service_id: number;
  service_name: string;
  service_code: any;
  citizen_id: number;
  full_name: string;
  mobile_number: string;
  address: string;
  start_time: string;
  end_time: string;
  booked_date: string;
  service_icon?: string;
  service_address_id: number;
  service_district_id: number;
  latitude: string;
  longitude: string;
}
export interface RatingForCitizenPayload {
  gig_worker_id?: number;
  citizen_id: number;
  request_id: number;
  ratings: number;
  remarks: string;
}
export interface GetAllDomainPayload {
  domain_type: string[];
}
export interface CandidateProfileEditPayload {
  user_id?: number;
  candidate_id?: number;
  user_type?: number;
  first_name?: string;
  last_name?: string;
  father_name?: string;
  email?: string;
  mobile_no?: string;
  dob?: string;
  aadhar_no?: string;
  gender_id?: number;
  available_start_time?: any;
  available_end_time?: any;
  bank_account?: number;
  batch_id?: number;
  permanent_address?: string;
  pincode?: string;
  district_id?: number;
  block_id?: number;
  house_no?: number;
  kaushal_panjee_id?: string;
  kb_project_id?: string;
  mpr_id?: any;
  mpr_project_id?: string;
  parliamentary_constitution?: number;
  assembly_constituency?: number;
  pwd?: any;
  qualification?: string;
  religion_id?: number;
  minority?: number;
  village_address_id?: number;
  workplace_postoffice?: any;
  remarks?: any;
}
export interface BlockByDistrictPayload {
  district_id: number;
}
export interface BlockByDistrictResp {
  blocks: Block[];
}
export interface Block {
  block_id: number;
  block_name: string;
}
export interface DistrictPayload {
  state_id?: number;
}

export interface DistrictListing {
  district_name: string;
  id: number;
}

export interface DistrictListingResp {
  district_list: DistrictListing[];
}
export interface CandidateProfilePayload {
  candidate_id?: any;
}
export interface CandidateProfileResp {}
export interface CandidateGenerateOTPForMobileAndEmailPayload {
  username: any;
}
export interface CandidateValidateOTPForMobileAndEmailPayload {
  username: any;
  otp: any;
}
export interface CandidateImageViewPayload {
  candidate_id: any;
}
export interface ImageSignedResp {
  document_data: DocumentDaum[];
}
export interface DocumentDaum {
  doc_id: number;
  candidate_id: number;
  doc_location: string;
  doc_path: string;
  signed_url: string;
}
export interface DeclineQuestionsResp {
  decline_questions: DeclineQuestion[];
}
export interface DeclineQuestion {
  id: number;
  question_text: string;
  is_active: boolean;
  status: number;
  created_by: number;
  created_on: string;
  updated_by: any;
  updated_on: any;
}

export interface DownloadDocPayload {
  doc_id: number;
}
export interface FetchDetailsFromKBIDPayload {
  candidate_code: any;
}
export interface FetchDetailsFromKBIDResp {
  candidate_details: KBIDRespCandidateDetails;
}

export interface KBIDRespCandidateDetails {
  candidate_id: number;
  candidate_code: string;
  kaushal_panjee_id: any;
  sanction_order: string;
  kb_project_id: string;
  mpr_project_id: any;
  pincode: string;
  email: any;
  qualification: number;
  qualification_name: string;
  father_name: string;
  mpr_id: any;
  first_name: string;
  last_name: string;
  gender_id: number;
  gender_name: string;
  category_id: number;
  category_name: string;
  pwd: any;
  pwd_name: string;
  minority: number;
  minority_name: string;
  religion_id: number;
  religion_name: string;
  date_of_birth: string;
  mobile_no: string;
  nature_of_training: string;
  aadhar: string;
  bank_account: string;
  house_no: string;
  permanent_address: string;
  batch_id: any;
  block_id: number;
  block_name: string;
  batch_code: any;
  batch_kb_id: any;
  district_id: number;
  district_name: any;
  candidate_user_type: number;
  training_center_id: any;
  pi_id: any;
  sector_id: number;
  skill_id: number;
  sector_others: any;
  skill_others: any;
}

export interface SectorListResp {
  sector_list: SectorList[];
}

export interface SectorList {
  sector_id: number;
  sector_name: string;
  sector_type: number;
}

export interface SkillListResp {
  sector_skill_list: SectorSkillList[];
}
export interface SectorSkillList {
  sector_id: number;
  sector_name: string;
  skill_id: number;
  skill_name: string;
  skill_code: string;
  doc_required: boolean;
}
export interface GetAllServiceFromSkillsResp {
  services_list: ServicesList[];
}
export interface ServicesList {
  sector_id?: number;
  sector_name?: string;
  skill_id?: number;
  skill_name?: string;
  skill_code?: string;
  service_id: number;
  service_name: string;
  service_code: number;
}

export interface GenerateOTPForKBIDVerificationPayload {
  username: any;
}
export interface ValidateOTPForKBIDVerificationPayload {
  username: any;
  otp: string;
}
export interface gigContactToAdminPayload {
  kb_id: string;
  request_message: string;
  mobile:string;
}
export interface RegisterPayload {
  candidate_id: number;
  candidate_code: string;
  district_id: number;
  block_id: number;
  first_name: string;
  last_name: string;
  gender_id: number;
  religion_id: number;
  email: string;
  dob: string;
  sector_id: number;
  sector_other: string;
  skill_id: number;
  skill_other: string;
  available_start_time: any;
  available_end_time: any;
  aadhar_no: string;
  is_show_candidate_details: boolean;
  fcm_token: string;
  pref_available_days: PrefAvailableDay[];
  preferred_location: PreferredLocation[];
  pref_services: PrefService[];
  pref_experience: PrefExperience[];
}

export interface PrefAvailableDay {
  day_id: number;
}

export interface PreferredLocation {
  district_id: number;
}

export interface PrefService {
  sector_id: number;
  skill_id: number;
  services: Service[];
}

export interface Service {
  service_id: number;
  other?: string;
}

export interface PrefExperience {
  sector_id: number;
  job_role: string;
  exprience: number;
  self_employed: boolean;
  organization_name?: string;
}

//export const baseServiceUrl = 'http://dev.msqube.com/asrlm/citizen/'; ///////////////////// dev URL
export const baseServiceUrl = 'http://localhost:9000/asrlm/citizen/'; ///////////////////// dev URL
export const STATEID = 1568;
// export const baseServiceUrl = 'https://asrlmskills.com/asrlm/citizen/'; ///////////////////// prod URL
export const urls = {
  generateOtp: 'candidate/giggenerateotp/',
  candidateLogin: 'candidate/giglogin/',
  citizenServiceDetails: 'candidate/gigservicelist/',
  statusChangeOfAnyServiceByCandidate: 'user/citizenservicerequest/',
  logoutGig: 'candidate/logout/',
  dashboardService: 'candidate/gigworkerdashboard/',
  ratingForCitizen: 'candidate/gigratingtocitizen/',
  candidateProfileEdit: 'candidate/gigworkerprofileedit/',
  getAllDistrict: 'user/getdistrictlist/',
  getAllBlock: 'user/getblocklist/',
  getDomainList: 'user/getdomainvaluebytypes/',
  candidateProfile: 'candidate/gigprofiledetails/',
  candidateGenerateOTPForMobileAndEmail: 'common/otpgenerate/',
  candidateOTPValidate: 'common/otpvalidate/',
  candidateImageView: '',
  uploadDocFiles: 'common/uploaddocuments/',
  declineQuestions: 'common/getdeclinequestionmaster/',
  downloadDocFile: 'common/downloaddocuments/',
  appversioncheck: 'common/appversiondetails/',
  fetchDetailsFromKBID: 'candidate/candidatedetailbycode/',
  sectorList: 'user/getsectorlist/',
  tradeList: 'user/getskilllist/',
  generateOTPForKBIDVerification: 'common/otpgenerate/',
  validateOTPForKBIDVerification: 'common/otpvalidate/',
  candidateSectorList: 'user/sectorskilllist/',
  getAllServiceListAgainstSkill: 'user/serviceslist/',
  gigContactToAdmin: 'candidate/getgiggrievancerequest/',
  candidateRegister: 'candidate/register/',
  candidateJobListing:`candidate/joblist/`,
  applyjob:`candidate/applyjob/`,
  saveResume:`candidate/saveresume/`,
  getResume:`candidate/getresume/`
  
};

import { StoreState } from "../../models/reduxModel";


const InitialState: StoreState = {
  loading: {
    message: '',
    count: 0,
  },
  auth: {
    // cadre_profile: undefined,
    
    user_details:undefined
  },
  error: {
    error: undefined,
  },
  job: {
    job_list_wrapper: null,
    resume_data: null,
  },
};
export default InitialState;

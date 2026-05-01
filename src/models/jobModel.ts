export interface JobModelMain {
    job_list_wrapper:JobsData | null,
    resume_data:IResumeResponse | null;


}

export interface JobInterface {
  job_id: number;
  title: string;
  description: string;
  location: string;
  job_responsibilities:string
  status:any;
  salary_min: string;
  salary_max: string;
  job_type: string;
  job_category: string;
  created_on: string; // or Date if you parse it
  employer_name: string;
  job_type_name: string;
  skill_names: string[];
  applicant_count: number;
  is_approved: boolean;
  job_category_name:string;
}


export interface JobsData {
  jobs_list: JobInterface[];
  page: number;
  limit: number;
  total: number;
  total_pages: number;
  Code: string;
  Message: string;
   // because of space
}




export interface IResumeResponse {
  id: number;
  user_id: number;
  full_name: string;
  phone: string;
  email: string;
  address: string;
  linkedin: string;
  tagline: string;
  educations: string;
  is_fresher: boolean;
  career_objective: string;
  experiences: string;
  has_certification: boolean;
  certifications: string;
  skills: string;
  languages: string;
  template_id: string;
  resume_id?: any;
  created_by: number;
  created_on: string;
  updated_by: number;
  updated_on: string;
}


export interface User {
    id: number;
    first_name: string;
    last_name: string;
    user_name: string;
    profile_image: string;
    email: string;
    email_verified_at: string | null;
    created_at: string;
    updated_at: string;
  }
  
  export interface ApiResponse {
    user: User;
    msg: string;
    token: string;
  }
  
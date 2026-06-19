export interface User {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  company_name: string | null;
  website: string | null;
  bio: string | null;
  avatar_url: string | null;
  role: 'user' | 'admin';
  is_verified: boolean;
  email_verified_at: string | null;
  last_login_at: string | null;
  created_at: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
  password_confirmation: string;
  phone?: string;
  company_name?: string;
  website?: string;
  bio?: string;
}

export interface AuthResponse {
  success: boolean;
  message?: string;
  data: {
    token: string;
    user: User;
  };
}

// L'endpoint /verify-email finalise réellement la création du compte
// (controller: verifyEmailAndCompleteRegistration) : il exige name + password
// en plus du code, pas juste email+code. Vérifié par test curl le 19/06/2026 —
// sans name/password l'API renvoie "The name field is required." / "The password field is required."
export interface VerifyEmailPayload {
  name: string;
  email: string;
  password: string;
  code: string;
}

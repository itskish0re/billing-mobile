export type AppRoleCode = 'admin' | 'user';

export type UserProfile = {
  id: string;
  full_name: string;
  role_id: number;
  is_active: boolean;
  role_code: AppRoleCode;
  role_display_name: string;
};

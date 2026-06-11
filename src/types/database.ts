// Types mirroring the database schema from 000001_init.sql

export interface Role {
  id: number;
  name: string;
  label: string;
}

export interface User {
  id: string;
  username: string;
  email: string;
  full_name: string | null;
  phone: string | null;
  disabled: boolean;
  created_at: string;
  updated_at: string;
}

export interface UserRole {
  user_id: string;
  role_id: number;
}

export interface BloodType {
  id: number;
  code: string;
  label: string;
  is_rare: boolean;
}

export interface Donor {
  id: string;
  full_name: string;
  national_id: string;
  phone: string;
  age: number;
  gender: string;
  address: string;
  blood_type_id: number | null;
  notes: string | null;
  last_donation_date: string | null;
  total_donations: number;
  created_at: string;
  updated_at: string;
}

export interface Patient {
  id: string;
  full_name: string;
  national_id: string;
  phone: string;
  department: string;
  file_number: string;
  address: string;
  social_notes: string | null;
  medical_notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface CheckImage {
  id: string;
  file_path: string;
  type: string;
  uploaded_at: string;
}

export interface DonationCheck {
  id: string;
  serial: string;
  status: string;
  donor_id: string;
  patient_id: string | null;
  blood_type_id: number | null;
  created_by: string;
  distributor_id: string | null;
  transferred_to_distributor_at: string | null;
  distributed_at: string | null;
  blood_recorded_by: string | null;
  blood_recorded_at: string | null;
  metadata?: Record<string, unknown> | null;
  check_images: CheckImage[];
  created_at: string;
  updated_at: string;
}

export interface Activity {
  id: string;
  user_id: string;
  action: string;
  entity: string;
  entity_id: string;
  details: string | null;
  created_at: string;
  user?: Pick<User, "full_name" | "username"> | null;
}

// ---- Join types ----

export interface DonorWithBloodType extends Donor {
  blood_types: BloodType | null;
}

export interface CheckWithRelations extends DonationCheck {
  donors: DonorWithBloodType;
  patients: Patient | null;
  blood_types: BloodType | null;
  created_by_user: User | null;
  distributor: User | null;
  blood_recorder: User | null;
}

export interface UserWithRoles extends User {
  user_roles: (UserRole & { roles: Role })[];
}

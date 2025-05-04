export interface Student {
  id: number;
  student_id: string;
  branch: number;
  branch_name: string;
  profile_image: string | null;
  resume: string | null;
  age: number;
  gender: string;
  nationality: string;
  language_test: string;
  institution_name: string;
  dob: string | null;
  user: {
    id: number;
    email: string;
    first_name: string;
    last_name: string;
    role: string;
    name: string;
  };
  contact_number: string;
  address: string;
  emergency_contact?: string;
  mother_name?: string;
  father_name?: string;
  parent_number?: string;
  comments?: string;
}

export interface Employee {
  // ... existing properties ...
}

export interface Blog {
  id: number;
  title: string;
  content: string;
  thumbnail_image?: string | null;
  branch: number;
  branch_name?: string;
  author: number;
  author_name?: string;
  created_at: string;
  updated_at: string;
  status: 'draft' | 'published';
  slug?: string;
  tags?: string[];
}

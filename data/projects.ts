export interface Project {
  id: string;
  title: string;
  subtitle?: string;
  image?: string;
  category?: string;
  client?: string;
  date?: string;
  tools?: string[];
  description?: string;
  highlights?: string[];
  link?: string;
  linkText?: string;
  boxBgColor?: string;
  createdAt?: number;
  updatedAt?: number;
}

export const projectsData: Project[] = [];


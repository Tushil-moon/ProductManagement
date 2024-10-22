// Define the Product interface based on the provided structure
export interface Products {
  id: number;
  name: string;
  description: string;
  price: string;
  image: string;
  slug: string;
  created_at: string;
  updated_at: string;
}

export interface PaginationLinks {
  url: string | null;
  label: string;
  active: boolean;
}

export type PaginatedResponse = {
  current_page: number;
  data: Products[];
  first_page_url: string;
  from: number;
  last_page: number;
  last_page_url: string;
  links: PaginationLinks[];
  next_page_url: string | null;
  path: string;
  per_page: number;
  prev_page_url: string | null;
  to: number;
  total: number;
}



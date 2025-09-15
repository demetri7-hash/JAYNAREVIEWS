export type Language = 'en' | 'es' | 'tr';

export type Department = 'FOH' | 'BOH';

export type FOHShiftType = 'AM' | 'Transition' | 'PM' | 'Bar';
export type BOHShiftType = 'Opening Line' | 'Morning Prep' | 'Morning Clean' | 'Transition Line' | 'Closing Line' | 'Closing Prep/Dishwasher';
export type ShiftType = FOHShiftType | BOHShiftType;

export interface Employee {
  id: string;
  name: string;
  department: Department;
  languages_spoken: Language[];
  roles: string[];
  active: boolean;
  shifts: ShiftType[];
  created_at: string;
}

export interface WorksheetItem {
  id: string;
  text: string;
  required: boolean;
  category: string;
  requiresPhoto: boolean;
  requiresNote: boolean;
  completed: boolean;
  note?: string;
  photoUrl?: string;
  timestamp?: string;
}

export interface Worksheet {
  id: string;
  employee_id: string;
  employee_name: string;
  shift_type: ShiftType;
  department: Department;
  language_used: Language;
  worksheet_data: {
    items: WorksheetItem[];
  };
  photos: string[];
  completion_percentage: number;
  time_started: string;
  time_completed?: string;
  issues_flagged: string[];
  submitted_at?: string;
  created_at: string;
}

export interface Recipe {
  id: string;
  name: string;
  ingredients: IngredientAmount[];
  instructions: string[];
  batch_size: string;
  prep_time: number;
  translations: {
    [key in Language]: {
      name: string;
      instructions: string[];
    };
  };
  category: string;
}

export interface IngredientAmount {
  ingredient_id: string;
  amount: string;
  unit: string;
  notes?: string;
}

export interface InventoryItem {
  id: string;
  name: string;
  category: string;
  unit: string;
  par_level: number;
  current_stock: number;
  supplier?: string;
  cost?: number;
  translations: {
    [key in Language]: string;
  };
  recipe_usage: string[]; // Recipe IDs that use this ingredient
}

export interface Order {
  id: string;
  items: {
    item_id: string;
    quantity: number;
    urgency: 'Low' | 'Medium' | 'High';
  }[];
  requested_by: string;
  approved_by?: string;
  status: 'Pending' | 'Approved' | 'Ordered' | 'Delivered';
  delivery_date?: string;
  notes?: string;
  created_at: string;
}

export interface Translation {
  [key: string]: {
    en: string;
    es: string;
    tr: string;
  };
}

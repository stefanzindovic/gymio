export interface WgerImage {
  id: number;
  image: string;
  is_main: boolean;
}

export interface WgerTranslation {
  id: number;
  language: string;
  name: string;
  description: string;
}

export interface WgerMuscle {
  id: number;
  name: string;
  name_en: string;
  is_front: boolean;
  image_url_main?: string;
  image_url_secondary?: string;
}

export interface WgerEquipment {
  id: number;
  name: string;
}

export interface WgerCategory {
  id: number;
  name: string;
}

export interface WgerExerciseInfo {
  id: number;
  uuid: string;
  category: WgerCategory;
  muscles: WgerMuscle[];
  muscles_secondary: WgerMuscle[];
  equipment: WgerEquipment[];
  variations?: number;
  images: WgerImage[];
  translations: WgerTranslation[];
}

export interface WgerPaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

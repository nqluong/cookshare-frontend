// 📁 types/recipe.ts
// Định nghĩa các interface cho Recipe và Draft

export interface Step {
  description: string;
  image: string | null;
  stepNumber?: number;
  instruction?: string;
}

export interface ListItem {
  id: string;
  name: string;
  description?: string;
  color?: string;
  isLocal?: boolean;
}

export interface SelectedIngredient {
  id: string;
  quantity: string;
  unit: string;
}

export interface RecipeDraft {
  draftId: string;
  userId: string;
  
  // Basic info
  title: string;
  description: string;
  image: string | null;
  prepTime: string;
  cookTime: string;
  difficulty: string;
  servings: string;
  
  // Steps
  steps: Step[];
  
  // Selections
  selectedCategories: string[];
  selectedIngredients: SelectedIngredient[];
  selectedTags: string[];
  
  // Ingredient inputs state
  ingredientInputs: Record<string, { 
    quantity: string; 
    unit: string; 
    selected: boolean;
  }>;
  
  // Local data (chưa lưu DB)
  localCategories: ListItem[];
  localTags: ListItem[];
  localIngredients: ListItem[];
  
  // Metadata
  lastModified: string;
  version: number;
}

export interface DraftMetadata {
  draftId: string;
  title: string;
  lastModified: string;
  stepsCount: number;
  ingredientsCount: number;
}
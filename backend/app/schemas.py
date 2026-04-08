from pydantic import BaseModel, EmailStr
from typing import Optional, List
from datetime import datetime


# Auth
class UserCreate(BaseModel):
    email: str
    username: str
    password: str
    full_name: str = ""
    language: str = "en"


class UserLogin(BaseModel):
    email: str
    password: str


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"


class UserOut(BaseModel):
    id: int
    email: str
    username: str
    full_name: str
    avatar_url: str
    role: str
    language: str
    theme: str
    date_of_birth: str
    gender: str
    height_cm: float
    weight_kg: float
    goal: str
    experience_level: str
    xp: int
    level: int
    streak_days: int
    coins: int
    subscription_tier: str
    units: str
    is_active: bool
    is_verified: bool
    created_at: datetime

    class Config:
        from_attributes = True


class UserUpdate(BaseModel):
    full_name: Optional[str] = None
    avatar_url: Optional[str] = None
    language: Optional[str] = None
    theme: Optional[str] = None
    date_of_birth: Optional[str] = None
    gender: Optional[str] = None
    height_cm: Optional[float] = None
    weight_kg: Optional[float] = None
    goal: Optional[str] = None
    experience_level: Optional[str] = None
    units: Optional[str] = None
    timezone: Optional[str] = None


# Exercise
class ExerciseCreate(BaseModel):
    name_en: str
    name_ar: str = ""
    name_he: str = ""
    description_en: str = ""
    description_ar: str = ""
    description_he: str = ""
    category: str = ""
    muscle_group: str = ""
    secondary_muscles: str = ""
    equipment: str = ""
    difficulty: str = "beginner"
    video_url: str = ""
    image_url: str = ""
    instructions_en: str = ""
    instructions_ar: str = ""
    instructions_he: str = ""
    calories_per_rep: float = 0
    is_compound: bool = False


class ExerciseOut(BaseModel):
    id: int
    name_en: str
    name_ar: str
    name_he: str
    description_en: str
    category: str
    muscle_group: str
    secondary_muscles: str
    equipment: str
    difficulty: str
    video_url: str
    image_url: str
    instructions_en: str
    calories_per_rep: float
    is_compound: bool

    class Config:
        from_attributes = True


# Workout Plan
class WorkoutPlanExerciseCreate(BaseModel):
    exercise_id: int
    order: int = 0
    sets: int = 3
    reps: str = "10"
    rest_seconds: int = 60
    superset_group: int = 0
    notes: str = ""


class WorkoutPlanDayCreate(BaseModel):
    day_number: int
    name: str = ""
    focus: str = ""
    exercises: List[WorkoutPlanExerciseCreate] = []


class WorkoutPlanCreate(BaseModel):
    name: str
    description: str = ""
    plan_type: str = "custom"
    split_type: str = "full_body"
    periodization: str = "linear"
    difficulty: str = "intermediate"
    duration_weeks: int = 4
    days_per_week: int = 3
    goal: str = ""
    is_public: bool = False
    days: List[WorkoutPlanDayCreate] = []


class WorkoutPlanOut(BaseModel):
    id: int
    user_id: int
    name: str
    description: str
    plan_type: str
    split_type: str
    periodization: str
    difficulty: str
    duration_weeks: int
    days_per_week: int
    goal: str
    is_public: bool
    is_ai_generated: bool
    created_at: datetime

    class Config:
        from_attributes = True


# Workout Logging
class WorkoutSetCreate(BaseModel):
    exercise_id: int
    set_number: int = 1
    reps: int = 0
    weight_kg: float = 0
    duration_seconds: int = 0
    distance_meters: float = 0
    rpe: float = 0
    is_warmup: bool = False
    is_dropset: bool = False
    notes: str = ""


class WorkoutCreate(BaseModel):
    plan_id: Optional[int] = None
    name: str = ""
    notes: str = ""
    duration_minutes: int = 0
    calories_burned: float = 0
    rpe: float = 0
    mood_before: str = ""
    mood_after: str = ""
    sets: List[WorkoutSetCreate] = []


class WorkoutOut(BaseModel):
    id: int
    user_id: int
    name: str
    notes: str
    duration_minutes: int
    calories_burned: float
    rpe: float
    completed: bool
    created_at: datetime

    class Config:
        from_attributes = True


# Food
class FoodCreate(BaseModel):
    name_en: str
    name_ar: str = ""
    name_he: str = ""
    barcode: str = ""
    category: str = ""
    serving_size_g: float = 100
    calories: float = 0
    protein_g: float = 0
    carbs_g: float = 0
    fat_g: float = 0
    fiber_g: float = 0
    sugar_g: float = 0
    sodium_mg: float = 0
    glycemic_index: int = 0
    is_halal: bool = True
    is_kosher: bool = True
    is_vegan: bool = False
    is_gluten_free: bool = False
    region: str = ""


class FoodOut(BaseModel):
    id: int
    name_en: str
    name_ar: str
    name_he: str
    barcode: str
    category: str
    serving_size_g: float
    calories: float
    protein_g: float
    carbs_g: float
    fat_g: float
    fiber_g: float
    sugar_g: float
    glycemic_index: int
    is_halal: bool
    is_kosher: bool
    is_vegan: bool
    is_gluten_free: bool

    class Config:
        from_attributes = True


# Meal Log
class MealLogCreate(BaseModel):
    food_id: Optional[int] = None
    recipe_id: Optional[int] = None
    meal_type: str = "snack"
    name: str = ""
    quantity_g: float = 100
    calories: float = 0
    protein_g: float = 0
    carbs_g: float = 0
    fat_g: float = 0
    notes: str = ""


class MealLogOut(BaseModel):
    id: int
    user_id: int
    meal_type: str
    name: str
    quantity_g: float
    calories: float
    protein_g: float
    carbs_g: float
    fat_g: float
    logged_at: datetime

    class Config:
        from_attributes = True


# Nutrition Plan
class NutritionPlanCreate(BaseModel):
    name: str
    description: str = ""
    daily_calories: float = 2000
    protein_ratio: float = 0.3
    carbs_ratio: float = 0.4
    fat_ratio: float = 0.3
    diet_type: str = "balanced"
    meals_per_day: int = 3
    phase: str = "maintenance"


class NutritionPlanOut(BaseModel):
    id: int
    user_id: int
    name: str
    description: str
    daily_calories: float
    protein_ratio: float
    carbs_ratio: float
    fat_ratio: float
    diet_type: str
    meals_per_day: int
    phase: str
    created_at: datetime

    class Config:
        from_attributes = True


# Body Metric
class BodyMetricCreate(BaseModel):
    weight_kg: float = 0
    body_fat_pct: float = 0
    muscle_mass_kg: float = 0
    chest_cm: float = 0
    waist_cm: float = 0
    hips_cm: float = 0
    bicep_cm: float = 0
    thigh_cm: float = 0
    calf_cm: float = 0
    neck_cm: float = 0
    blood_pressure_sys: int = 0
    blood_pressure_dia: int = 0
    resting_hr: int = 0


class BodyMetricOut(BaseModel):
    id: int
    user_id: int
    weight_kg: float
    body_fat_pct: float
    muscle_mass_kg: float
    chest_cm: float
    waist_cm: float
    hips_cm: float
    bicep_cm: float
    thigh_cm: float
    measured_at: datetime

    class Config:
        from_attributes = True


# Water Log
class WaterLogCreate(BaseModel):
    amount_ml: float = 250


class WaterLogOut(BaseModel):
    id: int
    amount_ml: float
    logged_at: datetime

    class Config:
        from_attributes = True


# Mood Log
class MoodLogCreate(BaseModel):
    mood: str = "neutral"
    energy_level: int = 5
    stress_level: int = 5
    sleep_hours: float = 7
    sleep_quality: int = 5
    notes: str = ""


class MoodLogOut(BaseModel):
    id: int
    mood: str
    energy_level: int
    stress_level: int
    sleep_hours: float
    sleep_quality: int
    logged_at: datetime

    class Config:
        from_attributes = True


# Community
class PostCreate(BaseModel):
    content: str
    image_url: str = ""
    post_type: str = "text"


class PostOut(BaseModel):
    id: int
    user_id: int
    content: str
    image_url: str
    post_type: str
    likes_count: int
    comments_count: int
    created_at: datetime

    class Config:
        from_attributes = True


# Recipe
class RecipeCreate(BaseModel):
    name_en: str
    name_ar: str = ""
    name_he: str = ""
    description_en: str = ""
    instructions_en: str = ""
    prep_time_min: int = 0
    cook_time_min: int = 0
    servings: int = 1
    calories_per_serving: float = 0
    protein_per_serving: float = 0
    carbs_per_serving: float = 0
    fat_per_serving: float = 0
    category: str = ""
    tags: str = ""


class RecipeOut(BaseModel):
    id: int
    name_en: str
    name_ar: str
    name_he: str
    description_en: str
    prep_time_min: int
    cook_time_min: int
    servings: int
    calories_per_serving: float
    protein_per_serving: float
    carbs_per_serving: float
    fat_per_serving: float
    category: str
    rating: float
    created_at: datetime

    class Config:
        from_attributes = True


# TDEE Calculator
class TDEERequest(BaseModel):
    weight_kg: float
    height_cm: float
    age: int
    gender: str
    activity_level: str = "moderate"
    formula: str = "mifflin"
    goal: str = "maintain"


class TDEEResponse(BaseModel):
    bmr: float
    tdee: float
    target_calories: float
    protein_g: float
    carbs_g: float
    fat_g: float


# AI Chat
class ChatMessage(BaseModel):
    message: str
    language: str = "en"


class ChatResponse(BaseModel):
    response: str
    suggestions: List[str] = []


# Supplement
class SupplementCreate(BaseModel):
    name: str
    dosage: str = ""
    frequency: str = "daily"
    time_of_day: str = "morning"
    notes: str = ""


class SupplementOut(BaseModel):
    id: int
    name: str
    dosage: str
    frequency: str
    time_of_day: str
    is_active: bool
    created_at: datetime

    class Config:
        from_attributes = True


# Dashboard Stats
class DashboardStats(BaseModel):
    total_workouts: int
    total_calories_burned: float
    current_streak: int
    xp: int
    level: int
    coins: int
    achievements_count: int
    weekly_workouts: int
    daily_calories: float
    daily_protein: float
    daily_carbs: float
    daily_fat: float
    water_today_ml: float
    weight_trend: List[dict] = []
    workout_frequency: List[dict] = []

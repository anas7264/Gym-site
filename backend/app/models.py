from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime, Text, ForeignKey, JSON, Enum as SQLEnum
from sqlalchemy.orm import relationship
from datetime import datetime
from app.database import Base
import enum


class UserRole(str, enum.Enum):
    USER = "user"
    COACH = "coach"
    ADMIN = "admin"


class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    username = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    full_name = Column(String, default="")
    avatar_url = Column(String, default="")
    role = Column(String, default=UserRole.USER)
    language = Column(String, default="en")
    theme = Column(String, default="dark")
    date_of_birth = Column(String, default="")
    gender = Column(String, default="")
    height_cm = Column(Float, default=0)
    weight_kg = Column(Float, default=0)
    goal = Column(String, default="")
    experience_level = Column(String, default="beginner")
    xp = Column(Integer, default=0)
    level = Column(Integer, default=1)
    streak_days = Column(Integer, default=0)
    coins = Column(Integer, default=0)
    subscription_tier = Column(String, default="free")
    timezone = Column(String, default="UTC")
    units = Column(String, default="metric")
    is_active = Column(Boolean, default=True)
    is_verified = Column(Boolean, default=False)
    two_factor_enabled = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    workouts = relationship("Workout", back_populates="user")
    meal_logs = relationship("MealLog", back_populates="user")
    body_metrics = relationship("BodyMetric", back_populates="user")
    achievements = relationship("UserAchievement", back_populates="user")
    workout_plans = relationship("WorkoutPlan", back_populates="user")
    nutrition_plans = relationship("NutritionPlan", back_populates="user")
    mood_logs = relationship("MoodLog", back_populates="user")
    water_logs = relationship("WaterLog", back_populates="user")
    posts = relationship("CommunityPost", back_populates="user")


class Exercise(Base):
    __tablename__ = "exercises"
    id = Column(Integer, primary_key=True, index=True)
    name_en = Column(String, nullable=False)
    name_ar = Column(String, default="")
    name_he = Column(String, default="")
    description_en = Column(Text, default="")
    description_ar = Column(Text, default="")
    description_he = Column(Text, default="")
    category = Column(String, default="")
    muscle_group = Column(String, default="")
    secondary_muscles = Column(String, default="")
    equipment = Column(String, default="")
    difficulty = Column(String, default="beginner")
    video_url = Column(String, default="")
    image_url = Column(String, default="")
    instructions_en = Column(Text, default="")
    instructions_ar = Column(Text, default="")
    instructions_he = Column(Text, default="")
    calories_per_rep = Column(Float, default=0)
    is_compound = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)


class WorkoutPlan(Base):
    __tablename__ = "workout_plans"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    name = Column(String, nullable=False)
    description = Column(Text, default="")
    plan_type = Column(String, default="custom")
    split_type = Column(String, default="full_body")
    periodization = Column(String, default="linear")
    difficulty = Column(String, default="intermediate")
    duration_weeks = Column(Integer, default=4)
    days_per_week = Column(Integer, default=3)
    goal = Column(String, default="")
    is_public = Column(Boolean, default=False)
    is_ai_generated = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    user = relationship("User", back_populates="workout_plans")
    days = relationship("WorkoutPlanDay", back_populates="plan", cascade="all, delete-orphan")


class WorkoutPlanDay(Base):
    __tablename__ = "workout_plan_days"
    id = Column(Integer, primary_key=True, index=True)
    plan_id = Column(Integer, ForeignKey("workout_plans.id"))
    day_number = Column(Integer, nullable=False)
    name = Column(String, default="")
    focus = Column(String, default="")

    plan = relationship("WorkoutPlan", back_populates="days")
    exercises = relationship("WorkoutPlanExercise", back_populates="day", cascade="all, delete-orphan")


class WorkoutPlanExercise(Base):
    __tablename__ = "workout_plan_exercises"
    id = Column(Integer, primary_key=True, index=True)
    day_id = Column(Integer, ForeignKey("workout_plan_days.id"))
    exercise_id = Column(Integer, ForeignKey("exercises.id"))
    order = Column(Integer, default=0)
    sets = Column(Integer, default=3)
    reps = Column(String, default="10")
    rest_seconds = Column(Integer, default=60)
    superset_group = Column(Integer, default=0)
    notes = Column(Text, default="")

    day = relationship("WorkoutPlanDay", back_populates="exercises")
    exercise = relationship("Exercise")


class Workout(Base):
    __tablename__ = "workouts"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    plan_id = Column(Integer, ForeignKey("workout_plans.id"), nullable=True)
    name = Column(String, default="")
    notes = Column(Text, default="")
    duration_minutes = Column(Integer, default=0)
    calories_burned = Column(Float, default=0)
    rpe = Column(Float, default=0)
    mood_before = Column(String, default="")
    mood_after = Column(String, default="")
    completed = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="workouts")
    sets = relationship("WorkoutSet", back_populates="workout", cascade="all, delete-orphan")


class WorkoutSet(Base):
    __tablename__ = "workout_sets"
    id = Column(Integer, primary_key=True, index=True)
    workout_id = Column(Integer, ForeignKey("workouts.id"))
    exercise_id = Column(Integer, ForeignKey("exercises.id"))
    set_number = Column(Integer, default=1)
    reps = Column(Integer, default=0)
    weight_kg = Column(Float, default=0)
    duration_seconds = Column(Integer, default=0)
    distance_meters = Column(Float, default=0)
    rpe = Column(Float, default=0)
    is_warmup = Column(Boolean, default=False)
    is_dropset = Column(Boolean, default=False)
    is_pr = Column(Boolean, default=False)
    notes = Column(Text, default="")
    created_at = Column(DateTime, default=datetime.utcnow)

    workout = relationship("Workout", back_populates="sets")
    exercise = relationship("Exercise")


class Food(Base):
    __tablename__ = "foods"
    id = Column(Integer, primary_key=True, index=True)
    name_en = Column(String, nullable=False)
    name_ar = Column(String, default="")
    name_he = Column(String, default="")
    barcode = Column(String, default="")
    category = Column(String, default="")
    serving_size_g = Column(Float, default=100)
    calories = Column(Float, default=0)
    protein_g = Column(Float, default=0)
    carbs_g = Column(Float, default=0)
    fat_g = Column(Float, default=0)
    fiber_g = Column(Float, default=0)
    sugar_g = Column(Float, default=0)
    sodium_mg = Column(Float, default=0)
    potassium_mg = Column(Float, default=0)
    cholesterol_mg = Column(Float, default=0)
    vitamin_a_iu = Column(Float, default=0)
    vitamin_c_mg = Column(Float, default=0)
    calcium_mg = Column(Float, default=0)
    iron_mg = Column(Float, default=0)
    glycemic_index = Column(Integer, default=0)
    is_halal = Column(Boolean, default=True)
    is_kosher = Column(Boolean, default=True)
    is_vegan = Column(Boolean, default=False)
    is_gluten_free = Column(Boolean, default=False)
    region = Column(String, default="")
    created_at = Column(DateTime, default=datetime.utcnow)


class Recipe(Base):
    __tablename__ = "recipes"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    name_en = Column(String, nullable=False)
    name_ar = Column(String, default="")
    name_he = Column(String, default="")
    description_en = Column(Text, default="")
    description_ar = Column(Text, default="")
    description_he = Column(Text, default="")
    instructions_en = Column(Text, default="")
    instructions_ar = Column(Text, default="")
    instructions_he = Column(Text, default="")
    prep_time_min = Column(Integer, default=0)
    cook_time_min = Column(Integer, default=0)
    servings = Column(Integer, default=1)
    calories_per_serving = Column(Float, default=0)
    protein_per_serving = Column(Float, default=0)
    carbs_per_serving = Column(Float, default=0)
    fat_per_serving = Column(Float, default=0)
    image_url = Column(String, default="")
    video_url = Column(String, default="")
    category = Column(String, default="")
    tags = Column(String, default="")
    is_public = Column(Boolean, default=True)
    rating = Column(Float, default=0)
    rating_count = Column(Integer, default=0)
    created_at = Column(DateTime, default=datetime.utcnow)


class NutritionPlan(Base):
    __tablename__ = "nutrition_plans"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    name = Column(String, nullable=False)
    description = Column(Text, default="")
    daily_calories = Column(Float, default=2000)
    protein_ratio = Column(Float, default=0.3)
    carbs_ratio = Column(Float, default=0.4)
    fat_ratio = Column(Float, default=0.3)
    diet_type = Column(String, default="balanced")
    meals_per_day = Column(Integer, default=3)
    is_ai_generated = Column(Boolean, default=False)
    phase = Column(String, default="maintenance")
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    user = relationship("User", back_populates="nutrition_plans")


class MealLog(Base):
    __tablename__ = "meal_logs"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    food_id = Column(Integer, ForeignKey("foods.id"), nullable=True)
    recipe_id = Column(Integer, ForeignKey("recipes.id"), nullable=True)
    meal_type = Column(String, default="snack")
    name = Column(String, default="")
    quantity_g = Column(Float, default=100)
    calories = Column(Float, default=0)
    protein_g = Column(Float, default=0)
    carbs_g = Column(Float, default=0)
    fat_g = Column(Float, default=0)
    logged_at = Column(DateTime, default=datetime.utcnow)
    notes = Column(Text, default="")

    user = relationship("User", back_populates="meal_logs")


class BodyMetric(Base):
    __tablename__ = "body_metrics"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    weight_kg = Column(Float, default=0)
    body_fat_pct = Column(Float, default=0)
    muscle_mass_kg = Column(Float, default=0)
    chest_cm = Column(Float, default=0)
    waist_cm = Column(Float, default=0)
    hips_cm = Column(Float, default=0)
    bicep_cm = Column(Float, default=0)
    thigh_cm = Column(Float, default=0)
    calf_cm = Column(Float, default=0)
    neck_cm = Column(Float, default=0)
    blood_pressure_sys = Column(Integer, default=0)
    blood_pressure_dia = Column(Integer, default=0)
    resting_hr = Column(Integer, default=0)
    photo_front_url = Column(String, default="")
    photo_side_url = Column(String, default="")
    photo_back_url = Column(String, default="")
    measured_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="body_metrics")


class Achievement(Base):
    __tablename__ = "achievements"
    id = Column(Integer, primary_key=True, index=True)
    name_en = Column(String, nullable=False)
    name_ar = Column(String, default="")
    name_he = Column(String, default="")
    description_en = Column(Text, default="")
    description_ar = Column(Text, default="")
    description_he = Column(Text, default="")
    icon = Column(String, default="")
    category = Column(String, default="")
    xp_reward = Column(Integer, default=0)
    coins_reward = Column(Integer, default=0)
    condition_type = Column(String, default="")
    condition_value = Column(Integer, default=0)
    rarity = Column(String, default="common")


class UserAchievement(Base):
    __tablename__ = "user_achievements"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    achievement_id = Column(Integer, ForeignKey("achievements.id"))
    earned_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="achievements")
    achievement = relationship("Achievement")


class Challenge(Base):
    __tablename__ = "challenges"
    id = Column(Integer, primary_key=True, index=True)
    name_en = Column(String, nullable=False)
    name_ar = Column(String, default="")
    name_he = Column(String, default="")
    description_en = Column(Text, default="")
    description_ar = Column(Text, default="")
    description_he = Column(Text, default="")
    challenge_type = Column(String, default="")
    target_value = Column(Integer, default=0)
    duration_days = Column(Integer, default=30)
    xp_reward = Column(Integer, default=0)
    coins_reward = Column(Integer, default=0)
    image_url = Column(String, default="")
    is_seasonal = Column(Boolean, default=False)
    start_date = Column(DateTime, nullable=True)
    end_date = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)


class CommunityPost(Base):
    __tablename__ = "community_posts"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    content = Column(Text, default="")
    image_url = Column(String, default="")
    post_type = Column(String, default="text")
    likes_count = Column(Integer, default=0)
    comments_count = Column(Integer, default=0)
    is_pinned = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="posts")


class WaterLog(Base):
    __tablename__ = "water_logs"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    amount_ml = Column(Float, default=250)
    logged_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="water_logs")


class MoodLog(Base):
    __tablename__ = "mood_logs"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    mood = Column(String, default="neutral")
    energy_level = Column(Integer, default=5)
    stress_level = Column(Integer, default=5)
    sleep_hours = Column(Float, default=7)
    sleep_quality = Column(Integer, default=5)
    notes = Column(Text, default="")
    logged_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="mood_logs")


class CoachClient(Base):
    __tablename__ = "coach_clients"
    id = Column(Integer, primary_key=True, index=True)
    coach_id = Column(Integer, ForeignKey("users.id"))
    client_id = Column(Integer, ForeignKey("users.id"))
    status = Column(String, default="active")
    notes = Column(Text, default="")
    started_at = Column(DateTime, default=datetime.utcnow)

    coach = relationship("User", foreign_keys=[coach_id])
    client = relationship("User", foreign_keys=[client_id])


class Appointment(Base):
    __tablename__ = "appointments"
    id = Column(Integer, primary_key=True, index=True)
    coach_id = Column(Integer, ForeignKey("users.id"))
    client_id = Column(Integer, ForeignKey("users.id"))
    title = Column(String, default="")
    appointment_type = Column(String, default="in_person")
    scheduled_at = Column(DateTime, nullable=False)
    duration_minutes = Column(Integer, default=60)
    status = Column(String, default="scheduled")
    notes = Column(Text, default="")
    created_at = Column(DateTime, default=datetime.utcnow)


class Article(Base):
    __tablename__ = "articles"
    id = Column(Integer, primary_key=True, index=True)
    title_en = Column(String, nullable=False)
    title_ar = Column(String, default="")
    title_he = Column(String, default="")
    content_en = Column(Text, default="")
    content_ar = Column(Text, default="")
    content_he = Column(Text, default="")
    category = Column(String, default="")
    author_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    image_url = Column(String, default="")
    tags = Column(String, default="")
    views = Column(Integer, default=0)
    is_published = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)


class Notification(Base):
    __tablename__ = "notifications"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    title = Column(String, default="")
    message = Column(Text, default="")
    notification_type = Column(String, default="info")
    is_read = Column(Boolean, default=False)
    action_url = Column(String, default="")
    created_at = Column(DateTime, default=datetime.utcnow)


class Supplement(Base):
    __tablename__ = "supplements"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    name = Column(String, nullable=False)
    dosage = Column(String, default="")
    frequency = Column(String, default="daily")
    time_of_day = Column(String, default="morning")
    notes = Column(Text, default="")
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)


class PersonalRecord(Base):
    __tablename__ = "personal_records"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    exercise_id = Column(Integer, ForeignKey("exercises.id"))
    weight_kg = Column(Float, default=0)
    reps = Column(Integer, default=1)
    estimated_1rm = Column(Float, default=0)
    achieved_at = Column(DateTime, default=datetime.utcnow)

    exercise = relationship("Exercise")

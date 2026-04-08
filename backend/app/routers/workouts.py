from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime, timedelta
from app.database import get_db
from app.models import (
    User, Exercise, Workout, WorkoutSet, WorkoutPlan, WorkoutPlanDay,
    WorkoutPlanExercise, PersonalRecord
)
from app.schemas import (
    ExerciseCreate, ExerciseOut, WorkoutCreate, WorkoutOut,
    WorkoutPlanCreate, WorkoutPlanOut
)
from app.auth import get_required_user, get_current_user

router = APIRouter(prefix="/api", tags=["workouts"])


# Exercises
@router.get("/exercises", response_model=List[ExerciseOut])
async def list_exercises(
    category: Optional[str] = None,
    muscle_group: Optional[str] = None,
    equipment: Optional[str] = None,
    difficulty: Optional[str] = None,
    search: Optional[str] = None,
    db: Session = Depends(get_db),
):
    q = db.query(Exercise)
    if category:
        q = q.filter(Exercise.category == category)
    if muscle_group:
        q = q.filter(Exercise.muscle_group == muscle_group)
    if equipment:
        q = q.filter(Exercise.equipment == equipment)
    if difficulty:
        q = q.filter(Exercise.difficulty == difficulty)
    if search:
        q = q.filter(
            Exercise.name_en.ilike(f"%{search}%") |
            Exercise.name_ar.ilike(f"%{search}%") |
            Exercise.name_he.ilike(f"%{search}%")
        )
    return q.all()


@router.get("/exercises/{exercise_id}", response_model=ExerciseOut)
async def get_exercise(exercise_id: int, db: Session = Depends(get_db)):
    exercise = db.query(Exercise).filter(Exercise.id == exercise_id).first()
    if not exercise:
        raise HTTPException(status_code=404, detail="Exercise not found")
    return exercise


@router.post("/exercises", response_model=ExerciseOut)
async def create_exercise(
    data: ExerciseCreate,
    user: User = Depends(get_required_user),
    db: Session = Depends(get_db),
):
    exercise = Exercise(**data.model_dump())
    db.add(exercise)
    db.commit()
    db.refresh(exercise)
    return exercise


# Exercise categories and muscle groups
@router.get("/exercise-categories")
async def get_exercise_categories(db: Session = Depends(get_db)):
    categories = db.query(Exercise.category).distinct().all()
    return [c[0] for c in categories if c[0]]


@router.get("/muscle-groups")
async def get_muscle_groups(db: Session = Depends(get_db)):
    groups = db.query(Exercise.muscle_group).distinct().all()
    return [g[0] for g in groups if g[0]]


# Workout Plans
@router.get("/workout-plans", response_model=List[WorkoutPlanOut])
async def list_workout_plans(
    user: User = Depends(get_required_user),
    db: Session = Depends(get_db),
):
    return db.query(WorkoutPlan).filter(
        (WorkoutPlan.user_id == user.id) | (WorkoutPlan.is_public == True)
    ).all()


@router.post("/workout-plans", response_model=WorkoutPlanOut)
async def create_workout_plan(
    data: WorkoutPlanCreate,
    user: User = Depends(get_required_user),
    db: Session = Depends(get_db),
):
    plan = WorkoutPlan(
        user_id=user.id,
        name=data.name,
        description=data.description,
        plan_type=data.plan_type,
        split_type=data.split_type,
        periodization=data.periodization,
        difficulty=data.difficulty,
        duration_weeks=data.duration_weeks,
        days_per_week=data.days_per_week,
        goal=data.goal,
        is_public=data.is_public,
    )
    db.add(plan)
    db.commit()
    for day_data in data.days:
        day = WorkoutPlanDay(
            plan_id=plan.id,
            day_number=day_data.day_number,
            name=day_data.name,
            focus=day_data.focus,
        )
        db.add(day)
        db.commit()
        for ex_data in day_data.exercises:
            plan_ex = WorkoutPlanExercise(
                day_id=day.id,
                exercise_id=ex_data.exercise_id,
                order=ex_data.order,
                sets=ex_data.sets,
                reps=ex_data.reps,
                rest_seconds=ex_data.rest_seconds,
                superset_group=ex_data.superset_group,
                notes=ex_data.notes,
            )
            db.add(plan_ex)
        db.commit()
    db.refresh(plan)
    return plan


@router.get("/workout-plans/{plan_id}")
async def get_workout_plan(
    plan_id: int,
    user: User = Depends(get_required_user),
    db: Session = Depends(get_db),
):
    plan = db.query(WorkoutPlan).filter(WorkoutPlan.id == plan_id).first()
    if not plan:
        raise HTTPException(status_code=404, detail="Plan not found")
    days = db.query(WorkoutPlanDay).filter(WorkoutPlanDay.plan_id == plan_id).order_by(WorkoutPlanDay.day_number).all()
    result = {
        "id": plan.id,
        "name": plan.name,
        "description": plan.description,
        "plan_type": plan.plan_type,
        "split_type": plan.split_type,
        "periodization": plan.periodization,
        "difficulty": plan.difficulty,
        "duration_weeks": plan.duration_weeks,
        "days_per_week": plan.days_per_week,
        "goal": plan.goal,
        "is_public": plan.is_public,
        "days": [],
    }
    for day in days:
        exercises = db.query(WorkoutPlanExercise).filter(WorkoutPlanExercise.day_id == day.id).order_by(WorkoutPlanExercise.order).all()
        day_data = {
            "id": day.id,
            "day_number": day.day_number,
            "name": day.name,
            "focus": day.focus,
            "exercises": [],
        }
        for ex in exercises:
            exercise = db.query(Exercise).filter(Exercise.id == ex.exercise_id).first()
            day_data["exercises"].append({
                "id": ex.id,
                "exercise": {
                    "id": exercise.id,
                    "name_en": exercise.name_en,
                    "name_ar": exercise.name_ar,
                    "name_he": exercise.name_he,
                    "muscle_group": exercise.muscle_group,
                    "equipment": exercise.equipment,
                } if exercise else None,
                "sets": ex.sets,
                "reps": ex.reps,
                "rest_seconds": ex.rest_seconds,
                "superset_group": ex.superset_group,
            })
        result["days"].append(day_data)
    return result


# AI Workout Plan Generator
@router.post("/workout-plans/generate")
async def generate_workout_plan(
    goal: str = "muscle_gain",
    experience: str = "intermediate",
    days_per_week: int = 4,
    equipment: str = "full_gym",
    user: User = Depends(get_required_user),
    db: Session = Depends(get_db),
):
    split_types = {
        3: "full_body",
        4: "upper_lower",
        5: "ppl",
        6: "ppl",
    }
    split = split_types.get(days_per_week, "full_body")

    exercises = db.query(Exercise).all()
    chest_ex = [e for e in exercises if e.muscle_group in ("chest", "upper_chest")]
    back_ex = [e for e in exercises if e.muscle_group in ("back", "lats")]
    shoulder_ex = [e for e in exercises if "delt" in (e.muscle_group or "") or e.muscle_group == "shoulders"]
    leg_ex = [e for e in exercises if e.muscle_group in ("quadriceps", "hamstrings", "glutes", "calves")]
    arm_ex = [e for e in exercises if e.muscle_group in ("biceps", "triceps")]
    core_ex = [e for e in exercises if e.muscle_group in ("core", "abs")]

    plan = WorkoutPlan(
        user_id=user.id,
        name=f"AI {goal.replace('_', ' ').title()} Plan",
        description=f"AI-generated {split.upper()} split for {goal}",
        plan_type="ai_generated",
        split_type=split,
        periodization="linear",
        difficulty=experience,
        duration_weeks=8,
        days_per_week=days_per_week,
        goal=goal,
        is_ai_generated=True,
    )
    db.add(plan)
    db.commit()

    if split == "full_body":
        for day_num in range(1, days_per_week + 1):
            day = WorkoutPlanDay(plan_id=plan.id, day_number=day_num, name=f"Full Body Day {day_num}", focus="full_body")
            db.add(day)
            db.commit()
            all_groups = chest_ex[:1] + back_ex[:1] + leg_ex[:2] + shoulder_ex[:1] + core_ex[:1]
            for i, ex in enumerate(all_groups):
                db.add(WorkoutPlanExercise(day_id=day.id, exercise_id=ex.id, order=i, sets=3, reps="10", rest_seconds=90))
            db.commit()
    elif split == "upper_lower":
        day_configs = [
            ("Upper A", "upper", chest_ex[:2] + back_ex[:2] + shoulder_ex[:1] + arm_ex[:2]),
            ("Lower A", "lower", leg_ex[:4] + core_ex[:2]),
            ("Upper B", "upper", chest_ex[:2] + back_ex[:2] + shoulder_ex[:1] + arm_ex[:2]),
            ("Lower B", "lower", leg_ex[:4] + core_ex[:2]),
        ]
        for day_num, (name, focus, exs) in enumerate(day_configs[:days_per_week], 1):
            day = WorkoutPlanDay(plan_id=plan.id, day_number=day_num, name=name, focus=focus)
            db.add(day)
            db.commit()
            for i, ex in enumerate(exs):
                db.add(WorkoutPlanExercise(day_id=day.id, exercise_id=ex.id, order=i, sets=4, reps="8-12", rest_seconds=90))
            db.commit()
    else:
        day_configs = [
            ("Push", "push", chest_ex[:3] + shoulder_ex[:2] + [e for e in arm_ex if e.muscle_group == "triceps"][:2]),
            ("Pull", "pull", back_ex[:3] + [e for e in arm_ex if e.muscle_group == "biceps"][:2]),
            ("Legs", "legs", leg_ex[:5] + core_ex[:2]),
        ]
        if days_per_week >= 6:
            day_configs = day_configs + day_configs
        for day_num, (name, focus, exs) in enumerate(day_configs[:days_per_week], 1):
            day = WorkoutPlanDay(plan_id=plan.id, day_number=day_num, name=name, focus=focus)
            db.add(day)
            db.commit()
            for i, ex in enumerate(exs):
                db.add(WorkoutPlanExercise(day_id=day.id, exercise_id=ex.id, order=i, sets=4, reps="8-12", rest_seconds=90))
            db.commit()

    db.refresh(plan)
    return {"id": plan.id, "name": plan.name, "message": "Workout plan generated successfully"}


# Workout Logging
@router.get("/workouts", response_model=List[WorkoutOut])
async def list_workouts(
    limit: int = 50,
    offset: int = 0,
    user: User = Depends(get_required_user),
    db: Session = Depends(get_db),
):
    return db.query(Workout).filter(Workout.user_id == user.id).order_by(Workout.created_at.desc()).offset(offset).limit(limit).all()


@router.post("/workouts", response_model=WorkoutOut)
async def create_workout(
    data: WorkoutCreate,
    user: User = Depends(get_required_user),
    db: Session = Depends(get_db),
):
    workout = Workout(
        user_id=user.id,
        plan_id=data.plan_id,
        name=data.name,
        notes=data.notes,
        duration_minutes=data.duration_minutes,
        calories_burned=data.calories_burned,
        rpe=data.rpe,
        mood_before=data.mood_before,
        mood_after=data.mood_after,
    )
    db.add(workout)
    db.commit()

    for set_data in data.sets:
        workout_set = WorkoutSet(
            workout_id=workout.id,
            exercise_id=set_data.exercise_id,
            set_number=set_data.set_number,
            reps=set_data.reps,
            weight_kg=set_data.weight_kg,
            duration_seconds=set_data.duration_seconds,
            distance_meters=set_data.distance_meters,
            rpe=set_data.rpe,
            is_warmup=set_data.is_warmup,
            is_dropset=set_data.is_dropset,
            notes=set_data.notes,
        )
        # Check for PR
        if set_data.weight_kg > 0 and set_data.reps > 0:
            existing_pr = db.query(PersonalRecord).filter(
                PersonalRecord.user_id == user.id,
                PersonalRecord.exercise_id == set_data.exercise_id,
            ).order_by(PersonalRecord.estimated_1rm.desc()).first()
            estimated_1rm = set_data.weight_kg * (1 + set_data.reps / 30)
            if not existing_pr or estimated_1rm > existing_pr.estimated_1rm:
                workout_set.is_pr = True
                pr = PersonalRecord(
                    user_id=user.id,
                    exercise_id=set_data.exercise_id,
                    weight_kg=set_data.weight_kg,
                    reps=set_data.reps,
                    estimated_1rm=estimated_1rm,
                )
                db.add(pr)

        db.add(workout_set)
    db.commit()

    # Update user XP and streak
    user.xp += 50
    user.level = user.xp // 500 + 1
    user.streak_days = min(user.streak_days + 1, 365)
    user.coins += 10
    db.commit()
    db.refresh(workout)
    return workout


@router.get("/workouts/{workout_id}")
async def get_workout(
    workout_id: int,
    user: User = Depends(get_required_user),
    db: Session = Depends(get_db),
):
    workout = db.query(Workout).filter(Workout.id == workout_id, Workout.user_id == user.id).first()
    if not workout:
        raise HTTPException(status_code=404, detail="Workout not found")
    sets = db.query(WorkoutSet).filter(WorkoutSet.workout_id == workout_id).all()
    return {
        "id": workout.id,
        "name": workout.name,
        "notes": workout.notes,
        "duration_minutes": workout.duration_minutes,
        "calories_burned": workout.calories_burned,
        "rpe": workout.rpe,
        "created_at": workout.created_at.isoformat(),
        "sets": [
            {
                "id": s.id,
                "exercise_id": s.exercise_id,
                "exercise_name": db.query(Exercise).filter(Exercise.id == s.exercise_id).first().name_en if db.query(Exercise).filter(Exercise.id == s.exercise_id).first() else "",
                "set_number": s.set_number,
                "reps": s.reps,
                "weight_kg": s.weight_kg,
                "rpe": s.rpe,
                "is_pr": s.is_pr,
                "is_warmup": s.is_warmup,
            }
            for s in sets
        ],
    }


# Personal Records
@router.get("/personal-records")
async def get_personal_records(
    user: User = Depends(get_required_user),
    db: Session = Depends(get_db),
):
    prs = db.query(PersonalRecord).filter(PersonalRecord.user_id == user.id).all()
    result = []
    for pr in prs:
        exercise = db.query(Exercise).filter(Exercise.id == pr.exercise_id).first()
        result.append({
            "id": pr.id,
            "exercise_id": pr.exercise_id,
            "exercise_name": exercise.name_en if exercise else "",
            "weight_kg": pr.weight_kg,
            "reps": pr.reps,
            "estimated_1rm": pr.estimated_1rm,
            "achieved_at": pr.achieved_at.isoformat(),
        })
    return result


# One Rep Max Calculator
@router.post("/calculate-1rm")
async def calculate_one_rep_max(weight: float, reps: int, formula: str = "epley"):
    if reps <= 0 or weight <= 0:
        raise HTTPException(status_code=400, detail="Weight and reps must be positive")
    formulas = {
        "epley": weight * (1 + reps / 30),
        "brzycki": weight * 36 / (37 - reps),
        "lombardi": weight * reps ** 0.1,
        "oconner": weight * (1 + reps / 40),
    }
    result = formulas.get(formula, formulas["epley"])
    return {
        "estimated_1rm": round(result, 2),
        "formula": formula,
        "percentages": {
            f"{pct}%": round(result * pct / 100, 2)
            for pct in [100, 95, 90, 85, 80, 75, 70, 65, 60, 55, 50]
        },
    }


# Plate Calculator
@router.post("/plate-calculator")
async def plate_calculator(target_weight: float, bar_weight: float = 20):
    plates_available = [25, 20, 15, 10, 5, 2.5, 1.25]
    weight_per_side = (target_weight - bar_weight) / 2
    if weight_per_side < 0:
        raise HTTPException(status_code=400, detail="Target weight is less than bar weight")
    result = []
    remaining = weight_per_side
    for plate in plates_available:
        count = int(remaining // plate)
        if count > 0:
            result.append({"plate_kg": plate, "count_per_side": count})
            remaining -= count * plate
    return {
        "target_weight": target_weight,
        "bar_weight": bar_weight,
        "plates_per_side": result,
        "actual_weight": target_weight - (remaining * 2),
    }

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from datetime import datetime, timedelta
from app.database import get_db
from app.models import (
    User, Workout, WorkoutSet, MealLog, BodyMetric, UserAchievement,
    WaterLog, MoodLog, PersonalRecord, CommunityPost
)
from app.schemas import DashboardStats, BodyMetricCreate, BodyMetricOut, MoodLogCreate, MoodLogOut
from app.auth import get_required_user
from typing import List, Optional

router = APIRouter(prefix="/api", tags=["dashboard"])


@router.get("/dashboard", response_model=DashboardStats)
async def get_dashboard(user: User = Depends(get_required_user), db: Session = Depends(get_db)):
    today = datetime.utcnow().replace(hour=0, minute=0, second=0, microsecond=0)
    week_start = today - timedelta(days=6)

    total_workouts = db.query(Workout).filter(Workout.user_id == user.id).count()
    total_cal_burned = db.query(func.sum(Workout.calories_burned)).filter(Workout.user_id == user.id).scalar() or 0
    weekly_workouts = db.query(Workout).filter(Workout.user_id == user.id, Workout.created_at >= week_start).count()
    achievements_count = db.query(UserAchievement).filter(UserAchievement.user_id == user.id).count()

    today_meals = db.query(MealLog).filter(MealLog.user_id == user.id, MealLog.logged_at >= today).all()
    daily_cal = sum(m.calories for m in today_meals)
    daily_protein = sum(m.protein_g for m in today_meals)
    daily_carbs = sum(m.carbs_g for m in today_meals)
    daily_fat = sum(m.fat_g for m in today_meals)

    water_today = db.query(func.sum(WaterLog.amount_ml)).filter(
        WaterLog.user_id == user.id, WaterLog.logged_at >= today
    ).scalar() or 0

    weight_records = db.query(BodyMetric).filter(
        BodyMetric.user_id == user.id
    ).order_by(BodyMetric.measured_at.desc()).limit(30).all()
    weight_trend = [
        {"date": r.measured_at.strftime("%Y-%m-%d"), "weight": r.weight_kg, "body_fat": r.body_fat_pct}
        for r in reversed(weight_records)
    ]

    workout_freq = []
    for i in range(7):
        day = week_start + timedelta(days=i)
        count = db.query(Workout).filter(
            Workout.user_id == user.id,
            Workout.created_at >= day,
            Workout.created_at < day + timedelta(days=1),
        ).count()
        workout_freq.append({"day": day.strftime("%a"), "date": day.strftime("%Y-%m-%d"), "count": count})

    return DashboardStats(
        total_workouts=total_workouts,
        total_calories_burned=round(total_cal_burned, 1),
        current_streak=user.streak_days,
        xp=user.xp,
        level=user.level,
        coins=user.coins,
        achievements_count=achievements_count,
        weekly_workouts=weekly_workouts,
        daily_calories=round(daily_cal, 1),
        daily_protein=round(daily_protein, 1),
        daily_carbs=round(daily_carbs, 1),
        daily_fat=round(daily_fat, 1),
        water_today_ml=water_today,
        weight_trend=weight_trend,
        workout_frequency=workout_freq,
    )


# Body Metrics
@router.get("/body-metrics", response_model=List[BodyMetricOut])
async def list_body_metrics(
    limit: int = 30,
    user: User = Depends(get_required_user),
    db: Session = Depends(get_db),
):
    return db.query(BodyMetric).filter(
        BodyMetric.user_id == user.id
    ).order_by(BodyMetric.measured_at.desc()).limit(limit).all()


@router.post("/body-metrics", response_model=BodyMetricOut)
async def create_body_metric(
    data: BodyMetricCreate,
    user: User = Depends(get_required_user),
    db: Session = Depends(get_db),
):
    metric = BodyMetric(user_id=user.id, **data.model_dump())
    db.add(metric)
    if data.weight_kg > 0:
        user.weight_kg = data.weight_kg
    db.commit()
    db.refresh(metric)
    return metric


# Mood Logs
@router.get("/mood-logs", response_model=List[MoodLogOut])
async def list_mood_logs(
    limit: int = 30,
    user: User = Depends(get_required_user),
    db: Session = Depends(get_db),
):
    return db.query(MoodLog).filter(MoodLog.user_id == user.id).order_by(MoodLog.logged_at.desc()).limit(limit).all()


@router.post("/mood-logs", response_model=MoodLogOut)
async def create_mood_log(
    data: MoodLogCreate,
    user: User = Depends(get_required_user),
    db: Session = Depends(get_db),
):
    log = MoodLog(user_id=user.id, **data.model_dump())
    db.add(log)
    db.commit()
    db.refresh(log)
    return log


# Analytics endpoints
@router.get("/analytics/volume")
async def get_volume_analytics(
    days: int = 30,
    user: User = Depends(get_required_user),
    db: Session = Depends(get_db),
):
    start = datetime.utcnow() - timedelta(days=days)
    workouts = db.query(Workout).filter(
        Workout.user_id == user.id, Workout.created_at >= start
    ).all()

    muscle_volume = {}
    for w in workouts:
        sets = db.query(WorkoutSet).filter(WorkoutSet.workout_id == w.id).all()
        for s in sets:
            from app.models import Exercise
            ex = db.query(Exercise).filter(Exercise.id == s.exercise_id).first()
            if ex:
                mg = ex.muscle_group
                if mg not in muscle_volume:
                    muscle_volume[mg] = {"sets": 0, "volume": 0}
                muscle_volume[mg]["sets"] += 1
                muscle_volume[mg]["volume"] += s.reps * s.weight_kg

    return {
        "period_days": days,
        "total_workouts": len(workouts),
        "muscle_group_volume": muscle_volume,
        "total_sets": sum(v["sets"] for v in muscle_volume.values()),
        "total_volume_kg": round(sum(v["volume"] for v in muscle_volume.values()), 1),
    }


@router.get("/analytics/strength-progress")
async def get_strength_progress(
    exercise_id: Optional[int] = None,
    user: User = Depends(get_required_user),
    db: Session = Depends(get_db),
):
    prs = db.query(PersonalRecord).filter(PersonalRecord.user_id == user.id)
    if exercise_id:
        prs = prs.filter(PersonalRecord.exercise_id == exercise_id)
    prs = prs.order_by(PersonalRecord.achieved_at).all()

    from app.models import Exercise
    result = {}
    for pr in prs:
        ex = db.query(Exercise).filter(Exercise.id == pr.exercise_id).first()
        name = ex.name_en if ex else f"Exercise {pr.exercise_id}"
        if name not in result:
            result[name] = []
        result[name].append({
            "date": pr.achieved_at.strftime("%Y-%m-%d"),
            "weight": pr.weight_kg,
            "reps": pr.reps,
            "estimated_1rm": round(pr.estimated_1rm, 2),
        })
    return result


@router.get("/analytics/consistency")
async def get_consistency_analytics(
    days: int = 90,
    user: User = Depends(get_required_user),
    db: Session = Depends(get_db),
):
    start = datetime.utcnow() - timedelta(days=days)
    workouts = db.query(Workout).filter(
        Workout.user_id == user.id, Workout.created_at >= start
    ).all()

    heatmap = {}
    for w in workouts:
        date_str = w.created_at.strftime("%Y-%m-%d")
        heatmap[date_str] = heatmap.get(date_str, 0) + 1

    workout_days = len(heatmap)
    consistency_pct = round(workout_days / days * 100, 1) if days > 0 else 0

    return {
        "period_days": days,
        "workout_days": workout_days,
        "rest_days": days - workout_days,
        "consistency_percentage": consistency_pct,
        "heatmap": heatmap,
        "current_streak": user.streak_days,
    }


@router.get("/analytics/nutrition-compliance")
async def get_nutrition_compliance(
    days: int = 30,
    user: User = Depends(get_required_user),
    db: Session = Depends(get_db),
):
    plan = db.query(NutritionPlan).filter(NutritionPlan.user_id == user.id).order_by(NutritionPlan.created_at.desc()).first()
    target_cal = plan.daily_calories if plan else 2000

    start = datetime.utcnow() - timedelta(days=days)
    result = []
    compliant_days = 0
    for i in range(days):
        day = start + timedelta(days=i)
        day_start = day.replace(hour=0, minute=0, second=0, microsecond=0)
        meals = db.query(MealLog).filter(
            MealLog.user_id == user.id,
            MealLog.logged_at >= day_start,
            MealLog.logged_at < day_start + timedelta(days=1),
        ).all()
        total_cal = sum(m.calories for m in meals)
        deviation = abs(total_cal - target_cal) / target_cal * 100 if target_cal > 0 else 0
        is_compliant = deviation < 15
        if is_compliant and total_cal > 0:
            compliant_days += 1
        result.append({
            "date": day_start.strftime("%Y-%m-%d"),
            "calories": round(total_cal, 1),
            "target": target_cal,
            "deviation_pct": round(deviation, 1),
            "compliant": is_compliant,
        })

    return {
        "period_days": days,
        "compliant_days": compliant_days,
        "compliance_pct": round(compliant_days / days * 100, 1) if days > 0 else 0,
        "daily_data": result,
    }


# Import NutritionPlan for use in analytics
from app.models import NutritionPlan

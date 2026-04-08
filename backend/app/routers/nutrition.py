from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List, Optional
from datetime import datetime, timedelta
from app.database import get_db
from app.models import User, Food, MealLog, NutritionPlan, Recipe, WaterLog, Supplement
from app.schemas import (
    FoodCreate, FoodOut, MealLogCreate, MealLogOut,
    NutritionPlanCreate, NutritionPlanOut, RecipeCreate, RecipeOut,
    WaterLogCreate, WaterLogOut, SupplementCreate, SupplementOut,
    TDEERequest, TDEEResponse
)
from app.auth import get_required_user

router = APIRouter(prefix="/api", tags=["nutrition"])


# TDEE Calculator
@router.post("/calculate-tdee", response_model=TDEEResponse)
async def calculate_tdee(data: TDEERequest):
    activity_multipliers = {
        "sedentary": 1.2,
        "light": 1.375,
        "moderate": 1.55,
        "active": 1.725,
        "very_active": 1.9,
    }
    multiplier = activity_multipliers.get(data.activity_level, 1.55)

    if data.formula == "mifflin":
        if data.gender == "male":
            bmr = 10 * data.weight_kg + 6.25 * data.height_cm - 5 * data.age + 5
        else:
            bmr = 10 * data.weight_kg + 6.25 * data.height_cm - 5 * data.age - 161
    elif data.formula == "harris":
        if data.gender == "male":
            bmr = 88.362 + 13.397 * data.weight_kg + 4.799 * data.height_cm - 5.677 * data.age
        else:
            bmr = 447.593 + 9.247 * data.weight_kg + 3.098 * data.height_cm - 4.330 * data.age
    else:
        bmr = 370 + 21.6 * (data.weight_kg * (1 - 0.2))

    tdee = bmr * multiplier
    goal_adjustments = {"lose": -500, "maintain": 0, "gain": 300, "aggressive_lose": -750, "lean_bulk": 200}
    target = tdee + goal_adjustments.get(data.goal, 0)

    protein_g = data.weight_kg * 2.0
    fat_g = target * 0.25 / 9
    carbs_g = (target - protein_g * 4 - fat_g * 9) / 4

    return TDEEResponse(
        bmr=round(bmr, 1),
        tdee=round(tdee, 1),
        target_calories=round(target, 1),
        protein_g=round(protein_g, 1),
        carbs_g=round(max(carbs_g, 50), 1),
        fat_g=round(fat_g, 1),
    )


# Foods
@router.get("/foods", response_model=List[FoodOut])
async def list_foods(
    search: Optional[str] = None,
    category: Optional[str] = None,
    is_halal: Optional[bool] = None,
    is_kosher: Optional[bool] = None,
    is_vegan: Optional[bool] = None,
    is_gluten_free: Optional[bool] = None,
    region: Optional[str] = None,
    limit: int = 50,
    db: Session = Depends(get_db),
):
    q = db.query(Food)
    if search:
        q = q.filter(Food.name_en.ilike(f"%{search}%") | Food.name_ar.ilike(f"%{search}%") | Food.name_he.ilike(f"%{search}%"))
    if category:
        q = q.filter(Food.category == category)
    if is_halal is not None:
        q = q.filter(Food.is_halal == is_halal)
    if is_kosher is not None:
        q = q.filter(Food.is_kosher == is_kosher)
    if is_vegan is not None:
        q = q.filter(Food.is_vegan == is_vegan)
    if is_gluten_free is not None:
        q = q.filter(Food.is_gluten_free == is_gluten_free)
    if region:
        q = q.filter(Food.region == region)
    return q.limit(limit).all()


@router.post("/foods", response_model=FoodOut)
async def create_food(data: FoodCreate, user: User = Depends(get_required_user), db: Session = Depends(get_db)):
    food = Food(**data.model_dump())
    db.add(food)
    db.commit()
    db.refresh(food)
    return food


@router.get("/foods/barcode/{barcode}", response_model=FoodOut)
async def get_food_by_barcode(barcode: str, db: Session = Depends(get_db)):
    food = db.query(Food).filter(Food.barcode == barcode).first()
    if not food:
        raise HTTPException(status_code=404, detail="Food not found")
    return food


# Meal Logs
@router.get("/meal-logs", response_model=List[MealLogOut])
async def list_meal_logs(
    date: Optional[str] = None,
    meal_type: Optional[str] = None,
    user: User = Depends(get_required_user),
    db: Session = Depends(get_db),
):
    q = db.query(MealLog).filter(MealLog.user_id == user.id)
    if date:
        target_date = datetime.strptime(date, "%Y-%m-%d")
        q = q.filter(
            MealLog.logged_at >= target_date,
            MealLog.logged_at < target_date + timedelta(days=1)
        )
    if meal_type:
        q = q.filter(MealLog.meal_type == meal_type)
    return q.order_by(MealLog.logged_at.desc()).all()


@router.post("/meal-logs", response_model=MealLogOut)
async def create_meal_log(data: MealLogCreate, user: User = Depends(get_required_user), db: Session = Depends(get_db)):
    if data.food_id:
        food = db.query(Food).filter(Food.id == data.food_id).first()
        if food:
            ratio = data.quantity_g / food.serving_size_g
            data.calories = food.calories * ratio
            data.protein_g = food.protein_g * ratio
            data.carbs_g = food.carbs_g * ratio
            data.fat_g = food.fat_g * ratio
            if not data.name:
                data.name = food.name_en

    meal = MealLog(user_id=user.id, **data.model_dump())
    db.add(meal)
    db.commit()
    db.refresh(meal)
    return meal


@router.delete("/meal-logs/{meal_id}")
async def delete_meal_log(meal_id: int, user: User = Depends(get_required_user), db: Session = Depends(get_db)):
    meal = db.query(MealLog).filter(MealLog.id == meal_id, MealLog.user_id == user.id).first()
    if not meal:
        raise HTTPException(status_code=404, detail="Meal not found")
    db.delete(meal)
    db.commit()
    return {"status": "deleted"}


# Daily nutrition summary
@router.get("/nutrition-summary")
async def get_nutrition_summary(
    date: Optional[str] = None,
    user: User = Depends(get_required_user),
    db: Session = Depends(get_db),
):
    if date:
        target_date = datetime.strptime(date, "%Y-%m-%d")
    else:
        target_date = datetime.utcnow().replace(hour=0, minute=0, second=0, microsecond=0)

    meals = db.query(MealLog).filter(
        MealLog.user_id == user.id,
        MealLog.logged_at >= target_date,
        MealLog.logged_at < target_date + timedelta(days=1),
    ).all()

    total_cal = sum(m.calories for m in meals)
    total_protein = sum(m.protein_g for m in meals)
    total_carbs = sum(m.carbs_g for m in meals)
    total_fat = sum(m.fat_g for m in meals)

    plan = db.query(NutritionPlan).filter(NutritionPlan.user_id == user.id).order_by(NutritionPlan.created_at.desc()).first()
    target_cal = plan.daily_calories if plan else 2000

    by_meal = {}
    for m in meals:
        if m.meal_type not in by_meal:
            by_meal[m.meal_type] = {"calories": 0, "protein": 0, "carbs": 0, "fat": 0, "items": []}
        by_meal[m.meal_type]["calories"] += m.calories
        by_meal[m.meal_type]["protein"] += m.protein_g
        by_meal[m.meal_type]["carbs"] += m.carbs_g
        by_meal[m.meal_type]["fat"] += m.fat_g
        by_meal[m.meal_type]["items"].append({"name": m.name, "calories": m.calories})

    return {
        "date": target_date.strftime("%Y-%m-%d"),
        "total_calories": round(total_cal, 1),
        "target_calories": target_cal,
        "remaining_calories": round(target_cal - total_cal, 1),
        "total_protein": round(total_protein, 1),
        "total_carbs": round(total_carbs, 1),
        "total_fat": round(total_fat, 1),
        "compliance_pct": round(min(total_cal / target_cal * 100, 100), 1) if target_cal > 0 else 0,
        "by_meal_type": by_meal,
        "meal_count": len(meals),
    }


# Weekly nutrition data
@router.get("/nutrition-weekly")
async def get_weekly_nutrition(user: User = Depends(get_required_user), db: Session = Depends(get_db)):
    today = datetime.utcnow().replace(hour=0, minute=0, second=0, microsecond=0)
    week_start = today - timedelta(days=6)
    result = []
    for i in range(7):
        day = week_start + timedelta(days=i)
        meals = db.query(MealLog).filter(
            MealLog.user_id == user.id,
            MealLog.logged_at >= day,
            MealLog.logged_at < day + timedelta(days=1),
        ).all()
        result.append({
            "date": day.strftime("%Y-%m-%d"),
            "day_name": day.strftime("%A"),
            "calories": round(sum(m.calories for m in meals), 1),
            "protein": round(sum(m.protein_g for m in meals), 1),
            "carbs": round(sum(m.carbs_g for m in meals), 1),
            "fat": round(sum(m.fat_g for m in meals), 1),
        })
    return result


# Nutrition Plans
@router.get("/nutrition-plans", response_model=List[NutritionPlanOut])
async def list_nutrition_plans(user: User = Depends(get_required_user), db: Session = Depends(get_db)):
    return db.query(NutritionPlan).filter(NutritionPlan.user_id == user.id).all()


@router.post("/nutrition-plans", response_model=NutritionPlanOut)
async def create_nutrition_plan(data: NutritionPlanCreate, user: User = Depends(get_required_user), db: Session = Depends(get_db)):
    plan = NutritionPlan(user_id=user.id, **data.model_dump())
    db.add(plan)
    db.commit()
    db.refresh(plan)
    return plan


# AI Meal Plan Generator
@router.post("/nutrition-plans/generate")
async def generate_meal_plan(
    daily_calories: float = 2000,
    diet_type: str = "balanced",
    meals_per_day: int = 3,
    user: User = Depends(get_required_user),
    db: Session = Depends(get_db),
):
    plan = NutritionPlan(
        user_id=user.id,
        name=f"AI {diet_type.title()} Plan - {int(daily_calories)} kcal",
        description=f"AI-generated {diet_type} meal plan",
        daily_calories=daily_calories,
        diet_type=diet_type,
        meals_per_day=meals_per_day,
        is_ai_generated=True,
    )
    db.add(plan)
    db.commit()

    foods = db.query(Food).all()
    protein_foods = [f for f in foods if f.category == "protein"]
    carb_foods = [f for f in foods if f.category in ("grains", "carbs")]
    fat_foods = [f for f in foods if f.category in ("fats", "nuts")]
    veggie_foods = [f for f in foods if f.category in ("vegetables", "fruits")]

    cal_per_meal = daily_calories / meals_per_day
    meal_types = ["breakfast", "lunch", "dinner", "snack", "pre_workout", "post_workout"]

    suggestions = []
    for i in range(meals_per_day):
        meal_type = meal_types[i] if i < len(meal_types) else "snack"
        meal_foods = []
        if protein_foods:
            meal_foods.append(protein_foods[i % len(protein_foods)])
        if carb_foods:
            meal_foods.append(carb_foods[i % len(carb_foods)])
        if veggie_foods:
            meal_foods.append(veggie_foods[i % len(veggie_foods)])

        suggestions.append({
            "meal_type": meal_type,
            "target_calories": round(cal_per_meal),
            "foods": [
                {"name": f.name_en, "name_ar": f.name_ar, "name_he": f.name_he, "calories": f.calories, "protein": f.protein_g}
                for f in meal_foods
            ],
        })

    return {
        "plan_id": plan.id,
        "name": plan.name,
        "daily_calories": daily_calories,
        "meal_suggestions": suggestions,
    }


# Recipes
@router.get("/recipes", response_model=List[RecipeOut])
async def list_recipes(
    search: Optional[str] = None,
    category: Optional[str] = None,
    max_calories: Optional[float] = None,
    db: Session = Depends(get_db),
):
    q = db.query(Recipe).filter(Recipe.is_public == True)
    if search:
        q = q.filter(Recipe.name_en.ilike(f"%{search}%") | Recipe.name_ar.ilike(f"%{search}%"))
    if category:
        q = q.filter(Recipe.category == category)
    if max_calories:
        q = q.filter(Recipe.calories_per_serving <= max_calories)
    return q.all()


@router.post("/recipes", response_model=RecipeOut)
async def create_recipe(data: RecipeCreate, user: User = Depends(get_required_user), db: Session = Depends(get_db)):
    recipe = Recipe(user_id=user.id, **data.model_dump())
    db.add(recipe)
    db.commit()
    db.refresh(recipe)
    return recipe


@router.get("/recipes/{recipe_id}")
async def get_recipe(recipe_id: int, db: Session = Depends(get_db)):
    recipe = db.query(Recipe).filter(Recipe.id == recipe_id).first()
    if not recipe:
        raise HTTPException(status_code=404, detail="Recipe not found")
    return recipe


# Water Tracking
@router.get("/water-logs", response_model=List[WaterLogOut])
async def list_water_logs(
    date: Optional[str] = None,
    user: User = Depends(get_required_user),
    db: Session = Depends(get_db),
):
    q = db.query(WaterLog).filter(WaterLog.user_id == user.id)
    if date:
        target_date = datetime.strptime(date, "%Y-%m-%d")
        q = q.filter(WaterLog.logged_at >= target_date, WaterLog.logged_at < target_date + timedelta(days=1))
    return q.order_by(WaterLog.logged_at.desc()).all()


@router.post("/water-logs", response_model=WaterLogOut)
async def create_water_log(data: WaterLogCreate, user: User = Depends(get_required_user), db: Session = Depends(get_db)):
    log = WaterLog(user_id=user.id, amount_ml=data.amount_ml)
    db.add(log)
    db.commit()
    db.refresh(log)
    return log


@router.get("/water-today")
async def get_water_today(user: User = Depends(get_required_user), db: Session = Depends(get_db)):
    today = datetime.utcnow().replace(hour=0, minute=0, second=0, microsecond=0)
    logs = db.query(WaterLog).filter(WaterLog.user_id == user.id, WaterLog.logged_at >= today).all()
    total = sum(l.amount_ml for l in logs)
    target = 3000
    return {"total_ml": total, "target_ml": target, "percentage": round(min(total / target * 100, 100), 1), "glasses": len(logs)}


# Supplements
@router.get("/supplements", response_model=List[SupplementOut])
async def list_supplements(user: User = Depends(get_required_user), db: Session = Depends(get_db)):
    return db.query(Supplement).filter(Supplement.user_id == user.id).all()


@router.post("/supplements", response_model=SupplementOut)
async def create_supplement(data: SupplementCreate, user: User = Depends(get_required_user), db: Session = Depends(get_db)):
    supp = Supplement(user_id=user.id, **data.model_dump())
    db.add(supp)
    db.commit()
    db.refresh(supp)
    return supp


# Intermittent Fasting
@router.post("/fasting/start")
async def start_fasting(protocol: str = "16:8", user: User = Depends(get_required_user)):
    protocols = {
        "16:8": {"fast_hours": 16, "eat_hours": 8},
        "20:4": {"fast_hours": 20, "eat_hours": 4},
        "18:6": {"fast_hours": 18, "eat_hours": 6},
        "omad": {"fast_hours": 23, "eat_hours": 1},
        "5:2": {"fast_hours": 0, "eat_hours": 0, "note": "Eat normally 5 days, restrict 2 days"},
    }
    p = protocols.get(protocol, protocols["16:8"])
    start = datetime.utcnow()
    end = start + timedelta(hours=p["fast_hours"])
    return {
        "protocol": protocol,
        "started_at": start.isoformat(),
        "ends_at": end.isoformat(),
        "fast_hours": p["fast_hours"],
        "eat_hours": p["eat_hours"],
    }

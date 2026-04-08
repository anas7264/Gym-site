from sqlalchemy.orm import Session
from app.models import Exercise, Food, Achievement, Challenge, Article, Recipe
from app.auth import get_password_hash


def seed_exercises(db: Session):
    if db.query(Exercise).count() > 0:
        return
    exercises = [
        Exercise(name_en="Barbell Bench Press", name_ar="بنش بريس بالبار", name_he="לחיצת חזה עם מוט", category="chest", muscle_group="chest", secondary_muscles="triceps,shoulders", equipment="barbell", difficulty="intermediate", is_compound=True, calories_per_rep=0.5, description_en="The king of chest exercises. Lie on a flat bench and press the barbell from chest level to full arm extension.", instructions_en="1. Lie flat on bench\n2. Grip bar slightly wider than shoulders\n3. Lower bar to mid-chest\n4. Press up to full extension"),
        Exercise(name_en="Barbell Squat", name_ar="سكوات بالبار", name_he="סקוואט עם מוט", category="legs", muscle_group="quadriceps", secondary_muscles="glutes,hamstrings,core", equipment="barbell", difficulty="intermediate", is_compound=True, calories_per_rep=0.8, description_en="The king of all exercises. A compound movement targeting the entire lower body."),
        Exercise(name_en="Deadlift", name_ar="ديدلفت", name_he="דדליפט", category="back", muscle_group="back", secondary_muscles="hamstrings,glutes,traps,core", equipment="barbell", difficulty="advanced", is_compound=True, calories_per_rep=1.0, description_en="Full body compound lift. Lift the barbell from the ground to hip level."),
        Exercise(name_en="Overhead Press", name_ar="ضغط علوي", name_he="לחיצת כתפיים", category="shoulders", muscle_group="shoulders", secondary_muscles="triceps,core", equipment="barbell", difficulty="intermediate", is_compound=True, calories_per_rep=0.5),
        Exercise(name_en="Barbell Row", name_ar="تجديف بالبار", name_he="חתירה עם מוט", category="back", muscle_group="back", secondary_muscles="biceps,rear_delts", equipment="barbell", difficulty="intermediate", is_compound=True, calories_per_rep=0.5),
        Exercise(name_en="Pull-Up", name_ar="عقلة", name_he="מתח", category="back", muscle_group="lats", secondary_muscles="biceps,rear_delts", equipment="pullup_bar", difficulty="intermediate", is_compound=True, calories_per_rep=0.6),
        Exercise(name_en="Dumbbell Curl", name_ar="كيرل دمبل", name_he="כפיפת מרפק עם משקולת", category="arms", muscle_group="biceps", secondary_muscles="forearms", equipment="dumbbells", difficulty="beginner", is_compound=False, calories_per_rep=0.2),
        Exercise(name_en="Tricep Pushdown", name_ar="بوش داون ترايسبس", name_he="לחיצת טרייספס", category="arms", muscle_group="triceps", equipment="cable", difficulty="beginner", is_compound=False, calories_per_rep=0.2),
        Exercise(name_en="Leg Press", name_ar="ليج بريس", name_he="לחיצת רגליים", category="legs", muscle_group="quadriceps", secondary_muscles="glutes,hamstrings", equipment="machine", difficulty="beginner", is_compound=True, calories_per_rep=0.6),
        Exercise(name_en="Lat Pulldown", name_ar="سحب أمامي", name_he="משיכה עליונה", category="back", muscle_group="lats", secondary_muscles="biceps", equipment="cable", difficulty="beginner", is_compound=True, calories_per_rep=0.4),
        Exercise(name_en="Dumbbell Shoulder Press", name_ar="ضغط كتف دمبل", name_he="לחיצת כתפיים עם משקולות", category="shoulders", muscle_group="shoulders", secondary_muscles="triceps", equipment="dumbbells", difficulty="intermediate", is_compound=True, calories_per_rep=0.4),
        Exercise(name_en="Romanian Deadlift", name_ar="ديدلفت روماني", name_he="דדליפט רומני", category="legs", muscle_group="hamstrings", secondary_muscles="glutes,lower_back", equipment="barbell", difficulty="intermediate", is_compound=True, calories_per_rep=0.7),
        Exercise(name_en="Cable Fly", name_ar="فلاي كيبل", name_he="פתיחות בכבל", category="chest", muscle_group="chest", equipment="cable", difficulty="beginner", is_compound=False, calories_per_rep=0.3),
        Exercise(name_en="Plank", name_ar="بلانك", name_he="פלאנק", category="core", muscle_group="core", secondary_muscles="shoulders", equipment="bodyweight", difficulty="beginner", is_compound=False, calories_per_rep=0.1),
        Exercise(name_en="Hanging Leg Raise", name_ar="رفع أرجل معلق", name_he="הרמת רגליים בתלייה", category="core", muscle_group="core", equipment="pullup_bar", difficulty="intermediate", is_compound=False, calories_per_rep=0.3),
        Exercise(name_en="Face Pull", name_ar="فيس بول", name_he="משיכה לפנים", category="shoulders", muscle_group="rear_delts", secondary_muscles="traps,rotator_cuff", equipment="cable", difficulty="beginner", is_compound=False, calories_per_rep=0.2),
        Exercise(name_en="Incline Dumbbell Press", name_ar="بنش مائل دمبل", name_he="לחיצה משופעת עם משקולות", category="chest", muscle_group="upper_chest", secondary_muscles="triceps,shoulders", equipment="dumbbells", difficulty="intermediate", is_compound=True, calories_per_rep=0.4),
        Exercise(name_en="Hip Thrust", name_ar="هيب ثرست", name_he="דחיפת ירכיים", category="legs", muscle_group="glutes", secondary_muscles="hamstrings", equipment="barbell", difficulty="intermediate", is_compound=True, calories_per_rep=0.5),
        Exercise(name_en="Dumbbell Lateral Raise", name_ar="رفع جانبي", name_he="הרמה צדדית", category="shoulders", muscle_group="side_delts", equipment="dumbbells", difficulty="beginner", is_compound=False, calories_per_rep=0.2),
        Exercise(name_en="Calf Raise", name_ar="رفع ساق", name_he="הרמת עקבים", category="legs", muscle_group="calves", equipment="machine", difficulty="beginner", is_compound=False, calories_per_rep=0.15),
        Exercise(name_en="Bulgarian Split Squat", name_ar="سكوات بلغاري", name_he="סקוואט בולגרי", category="legs", muscle_group="quadriceps", secondary_muscles="glutes,hamstrings", equipment="dumbbells", difficulty="intermediate", is_compound=True, calories_per_rep=0.5),
        Exercise(name_en="Chest Dip", name_ar="ديبس صدر", name_he="שכיבת שקיעה", category="chest", muscle_group="chest", secondary_muscles="triceps,shoulders", equipment="dip_bars", difficulty="intermediate", is_compound=True, calories_per_rep=0.5),
        Exercise(name_en="Hammer Curl", name_ar="هامر كيرل", name_he="כפיפת פטיש", category="arms", muscle_group="biceps", secondary_muscles="brachialis,forearms", equipment="dumbbells", difficulty="beginner", is_compound=False, calories_per_rep=0.2),
        Exercise(name_en="Skull Crusher", name_ar="سكل كراشر", name_he="שבירת גולגולת", category="arms", muscle_group="triceps", equipment="barbell", difficulty="intermediate", is_compound=False, calories_per_rep=0.25),
        Exercise(name_en="Cable Crunch", name_ar="كرنش كيبل", name_he="כפיפת בטן בכבל", category="core", muscle_group="abs", equipment="cable", difficulty="beginner", is_compound=False, calories_per_rep=0.2),
        Exercise(name_en="Walking Lunges", name_ar="لانجز مشي", name_he="מכרעים בהליכה", category="legs", muscle_group="quadriceps", secondary_muscles="glutes,hamstrings", equipment="dumbbells", difficulty="beginner", is_compound=True, calories_per_rep=0.4),
        Exercise(name_en="T-Bar Row", name_ar="تي بار رو", name_he="חתירת טי-בר", category="back", muscle_group="back", secondary_muscles="biceps,rear_delts", equipment="barbell", difficulty="intermediate", is_compound=True, calories_per_rep=0.5),
        Exercise(name_en="Leg Curl", name_ar="ليج كيرل", name_he="כפיפת רגליים", category="legs", muscle_group="hamstrings", equipment="machine", difficulty="beginner", is_compound=False, calories_per_rep=0.3),
        Exercise(name_en="Leg Extension", name_ar="ليج اكستنشن", name_he="פשיטת רגליים", category="legs", muscle_group="quadriceps", equipment="machine", difficulty="beginner", is_compound=False, calories_per_rep=0.3),
        Exercise(name_en="Seated Cable Row", name_ar="تجديف كيبل", name_he="חתירה בכבל בישיבה", category="back", muscle_group="back", secondary_muscles="biceps", equipment="cable", difficulty="beginner", is_compound=True, calories_per_rep=0.4),
        Exercise(name_en="Treadmill Running", name_ar="جري على السير", name_he="ריצה על הליכון", category="cardio", muscle_group="full_body", equipment="treadmill", difficulty="beginner", is_compound=True, calories_per_rep=10),
        Exercise(name_en="Cycling", name_ar="دراجة ثابتة", name_he="רכיבה על אופניים", category="cardio", muscle_group="legs", equipment="bike", difficulty="beginner", is_compound=True, calories_per_rep=8),
        Exercise(name_en="Rowing Machine", name_ar="آلة التجديف", name_he="מכונת חתירה", category="cardio", muscle_group="full_body", equipment="rowing_machine", difficulty="beginner", is_compound=True, calories_per_rep=9),
        Exercise(name_en="Jump Rope", name_ar="نط الحبل", name_he="קפיצה בחבל", category="cardio", muscle_group="full_body", equipment="jump_rope", difficulty="beginner", is_compound=True, calories_per_rep=12),
        Exercise(name_en="Mountain Climbers", name_ar="متسلق الجبال", name_he="מטפס הרים", category="cardio", muscle_group="core", secondary_muscles="shoulders,legs", equipment="bodyweight", difficulty="beginner", is_compound=True, calories_per_rep=0.3),
        Exercise(name_en="Burpees", name_ar="بيربي", name_he="בורפיז", category="cardio", muscle_group="full_body", equipment="bodyweight", difficulty="intermediate", is_compound=True, calories_per_rep=1.0),
        Exercise(name_en="Box Jump", name_ar="قفز صندوق", name_he="קפיצה על קופסה", category="plyometrics", muscle_group="legs", secondary_muscles="core", equipment="box", difficulty="intermediate", is_compound=True, calories_per_rep=0.5),
        Exercise(name_en="Battle Ropes", name_ar="حبال المعركة", name_he="חבלי קרב", category="cardio", muscle_group="full_body", equipment="battle_ropes", difficulty="intermediate", is_compound=True, calories_per_rep=0.8),
        Exercise(name_en="Kettlebell Swing", name_ar="كيتل بيل سوينج", name_he="תנופת קטלבל", category="full_body", muscle_group="glutes", secondary_muscles="hamstrings,core,shoulders", equipment="kettlebell", difficulty="intermediate", is_compound=True, calories_per_rep=0.6),
        Exercise(name_en="Turkish Get Up", name_ar="تركش جت أب", name_he="קימה טורקית", category="full_body", muscle_group="full_body", equipment="kettlebell", difficulty="advanced", is_compound=True, calories_per_rep=1.5),
    ]
    db.add_all(exercises)
    db.commit()


def seed_foods(db: Session):
    if db.query(Food).count() > 0:
        return
    foods = [
        Food(name_en="Chicken Breast", name_ar="صدر دجاج", name_he="חזה עוף", category="protein", serving_size_g=100, calories=165, protein_g=31, carbs_g=0, fat_g=3.6, is_halal=True, is_kosher=True, is_gluten_free=True),
        Food(name_en="Brown Rice", name_ar="أرز بني", name_he="אורז חום", category="grains", serving_size_g=100, calories=112, protein_g=2.3, carbs_g=24, fat_g=0.8, fiber_g=1.8, is_vegan=True, is_gluten_free=True, glycemic_index=50),
        Food(name_en="Salmon", name_ar="سلمون", name_he="סלמון", category="protein", serving_size_g=100, calories=208, protein_g=20, carbs_g=0, fat_g=13, is_kosher=True, is_gluten_free=True),
        Food(name_en="Eggs", name_ar="بيض", name_he="ביצים", category="protein", serving_size_g=50, calories=78, protein_g=6, carbs_g=0.6, fat_g=5, is_gluten_free=True),
        Food(name_en="Sweet Potato", name_ar="بطاطا حلوة", name_he="בטטה", category="carbs", serving_size_g=100, calories=86, protein_g=1.6, carbs_g=20, fat_g=0.1, fiber_g=3, is_vegan=True, is_gluten_free=True, glycemic_index=44),
        Food(name_en="Greek Yogurt", name_ar="زبادي يوناني", name_he="יוגורט יווני", category="dairy", serving_size_g=100, calories=59, protein_g=10, carbs_g=3.6, fat_g=0.7, is_gluten_free=True),
        Food(name_en="Oats", name_ar="شوفان", name_he="שיבולת שועל", category="grains", serving_size_g=100, calories=389, protein_g=16.9, carbs_g=66, fat_g=6.9, fiber_g=10.6, is_vegan=True, glycemic_index=55),
        Food(name_en="Banana", name_ar="موز", name_he="בננה", category="fruits", serving_size_g=100, calories=89, protein_g=1.1, carbs_g=23, fat_g=0.3, fiber_g=2.6, is_vegan=True, is_gluten_free=True, glycemic_index=51),
        Food(name_en="Avocado", name_ar="أفوكادو", name_he="אבוקדו", category="fats", serving_size_g=100, calories=160, protein_g=2, carbs_g=9, fat_g=15, fiber_g=7, is_vegan=True, is_gluten_free=True),
        Food(name_en="Almonds", name_ar="لوز", name_he="שקדים", category="nuts", serving_size_g=28, calories=164, protein_g=6, carbs_g=6, fat_g=14, fiber_g=3.5, is_vegan=True, is_gluten_free=True),
        Food(name_en="Hummus", name_ar="حمص", name_he="חומוס", category="legumes", serving_size_g=100, calories=166, protein_g=7.9, carbs_g=14, fat_g=9.6, fiber_g=6, is_vegan=True, is_gluten_free=True, region="middle_east"),
        Food(name_en="Falafel", name_ar="فلافل", name_he="פלאפל", category="legumes", serving_size_g=100, calories=333, protein_g=13, carbs_g=32, fat_g=18, fiber_g=5, is_vegan=True, region="middle_east"),
        Food(name_en="Shawarma (Chicken)", name_ar="شاورما دجاج", name_he="שווארמה עוף", category="protein", serving_size_g=100, calories=190, protein_g=22, carbs_g=5, fat_g=9, region="middle_east"),
        Food(name_en="Tabbouleh", name_ar="تبولة", name_he="טאבולה", category="salad", serving_size_g=100, calories=90, protein_g=2.5, carbs_g=13, fat_g=3.5, fiber_g=3, is_vegan=True, region="middle_east"),
        Food(name_en="Shakshuka", name_ar="شكشوكة", name_he="שקשוקה", category="eggs", serving_size_g=200, calories=220, protein_g=14, carbs_g=12, fat_g=14, is_gluten_free=True, region="middle_east"),
        Food(name_en="Labneh", name_ar="لبنة", name_he="לבנה", category="dairy", serving_size_g=100, calories=150, protein_g=8, carbs_g=4, fat_g=11, is_gluten_free=True, region="middle_east"),
        Food(name_en="Pita Bread", name_ar="خبز بيتا", name_he="פיתה", category="grains", serving_size_g=60, calories=165, protein_g=5.5, carbs_g=33, fat_g=0.7, region="middle_east"),
        Food(name_en="Mansaf", name_ar="منسف", name_he="מנסף", category="main_dish", serving_size_g=300, calories=550, protein_g=28, carbs_g=45, fat_g=28, region="middle_east"),
        Food(name_en="Olive Oil", name_ar="زيت زيتون", name_he="שמן זית", category="fats", serving_size_g=14, calories=119, protein_g=0, carbs_g=0, fat_g=14, is_vegan=True, is_gluten_free=True),
        Food(name_en="Whey Protein Powder", name_ar="بروتين واي", name_he="אבקת חלבון", category="supplement", serving_size_g=30, calories=120, protein_g=24, carbs_g=3, fat_g=1.5, is_gluten_free=True),
        Food(name_en="Broccoli", name_ar="بروكلي", name_he="ברוקולי", category="vegetables", serving_size_g=100, calories=34, protein_g=2.8, carbs_g=7, fat_g=0.4, fiber_g=2.6, is_vegan=True, is_gluten_free=True),
        Food(name_en="Quinoa", name_ar="كينوا", name_he="קינואה", category="grains", serving_size_g=100, calories=120, protein_g=4.4, carbs_g=21, fat_g=1.9, fiber_g=2.8, is_vegan=True, is_gluten_free=True, glycemic_index=53),
        Food(name_en="Cottage Cheese", name_ar="جبنة قريش", name_he="גבינת קוטג׳", category="dairy", serving_size_g=100, calories=98, protein_g=11, carbs_g=3.4, fat_g=4.3, is_gluten_free=True),
        Food(name_en="Turkey Breast", name_ar="صدر ديك رومي", name_he="חזה הודו", category="protein", serving_size_g=100, calories=135, protein_g=30, carbs_g=0, fat_g=1, is_gluten_free=True),
        Food(name_en="White Rice", name_ar="أرز أبيض", name_he="אורז לבן", category="grains", serving_size_g=100, calories=130, protein_g=2.7, carbs_g=28, fat_g=0.3, is_vegan=True, is_gluten_free=True, glycemic_index=73),
        Food(name_en="Lentils", name_ar="عدس", name_he="עדשים", category="legumes", serving_size_g=100, calories=116, protein_g=9, carbs_g=20, fat_g=0.4, fiber_g=7.9, is_vegan=True, is_gluten_free=True, glycemic_index=32),
        Food(name_en="Dates", name_ar="تمر", name_he="תמרים", category="fruits", serving_size_g=100, calories=277, protein_g=1.8, carbs_g=75, fat_g=0.2, fiber_g=6.7, is_vegan=True, is_gluten_free=True, region="middle_east"),
        Food(name_en="Tahini", name_ar="طحينة", name_he="טחינה", category="fats", serving_size_g=30, calories=178, protein_g=5.1, carbs_g=6.3, fat_g=16, fiber_g=1.4, is_vegan=True, is_gluten_free=True, region="middle_east"),
        Food(name_en="Baba Ganoush", name_ar="بابا غنوج", name_he="באבא גנוש", category="appetizer", serving_size_g=100, calories=130, protein_g=2.5, carbs_g=10, fat_g=9, fiber_g=4, is_vegan=True, is_gluten_free=True, region="middle_east"),
        Food(name_en="Beef Steak", name_ar="ستيك لحم", name_he="סטייק בקר", category="protein", serving_size_g=100, calories=271, protein_g=26, carbs_g=0, fat_g=18, is_gluten_free=True),
    ]
    db.add_all(foods)
    db.commit()


def seed_achievements(db: Session):
    if db.query(Achievement).count() > 0:
        return
    achievements = [
        Achievement(name_en="First Steps", name_ar="الخطوات الأولى", name_he="צעדים ראשונים", description_en="Complete your first workout", icon="🏋️", category="workout", xp_reward=50, coins_reward=10, condition_type="workouts_completed", condition_value=1, rarity="common"),
        Achievement(name_en="Week Warrior", name_ar="محارب الأسبوع", name_he="לוחם השבוע", description_en="Complete 7 workouts", icon="⚔️", category="workout", xp_reward=200, coins_reward=50, condition_type="workouts_completed", condition_value=7, rarity="common"),
        Achievement(name_en="Iron Will", name_ar="إرادة حديدية", name_he="רצון ברזל", description_en="Complete 30 workouts", icon="🔥", category="workout", xp_reward=500, coins_reward=100, condition_type="workouts_completed", condition_value=30, rarity="uncommon"),
        Achievement(name_en="Century Club", name_ar="نادي المئة", name_he="מועדון המאה", description_en="Complete 100 workouts", icon="💯", category="workout", xp_reward=1000, coins_reward=250, condition_type="workouts_completed", condition_value=100, rarity="rare"),
        Achievement(name_en="Streak Master", name_ar="سيد السلسلة", name_he="אלוף הרצף", description_en="Maintain a 30-day streak", icon="🔥", category="consistency", xp_reward=750, coins_reward=200, condition_type="streak_days", condition_value=30, rarity="rare"),
        Achievement(name_en="Nutrition Ninja", name_ar="نينجا التغذية", name_he="נינג׳ת תזונה", description_en="Log meals for 7 consecutive days", icon="🥗", category="nutrition", xp_reward=300, coins_reward=75, condition_type="meal_streak", condition_value=7, rarity="common"),
        Achievement(name_en="PR Crusher", name_ar="محطم الأرقام القياسية", name_he="שובר שיאים", description_en="Set 10 personal records", icon="🏆", category="strength", xp_reward=500, coins_reward=125, condition_type="prs_set", condition_value=10, rarity="uncommon"),
        Achievement(name_en="Social Butterfly", name_ar="فراشة اجتماعية", name_he="פרפר חברתי", description_en="Make 5 community posts", icon="🦋", category="social", xp_reward=200, coins_reward=50, condition_type="posts_made", condition_value=5, rarity="common"),
        Achievement(name_en="Hydration Hero", name_ar="بطل الترطيب", name_he="גיבור ההידרציה", description_en="Log water for 14 consecutive days", icon="💧", category="health", xp_reward=300, coins_reward=75, condition_type="water_streak", condition_value=14, rarity="uncommon"),
        Achievement(name_en="Legend", name_ar="أسطورة", name_he="אגדה", description_en="Reach level 50", icon="👑", category="level", xp_reward=2000, coins_reward=500, condition_type="level_reached", condition_value=50, rarity="legendary"),
    ]
    db.add_all(achievements)
    db.commit()


def seed_challenges(db: Session):
    if db.query(Challenge).count() > 0:
        return
    challenges = [
        Challenge(name_en="30-Day Plank Challenge", name_ar="تحدي البلانك 30 يوم", name_he="אתגר פלאנק 30 יום", description_en="Hold a plank every day for 30 days, increasing duration each day", challenge_type="daily", target_value=30, duration_days=30, xp_reward=500, coins_reward=100),
        Challenge(name_en="100 Push-Up Challenge", name_ar="تحدي 100 ضغطة", name_he="אתגר 100 שכיבות סמיכה", description_en="Complete 100 push-ups in a single workout", challenge_type="single", target_value=100, duration_days=7, xp_reward=300, coins_reward=75),
        Challenge(name_en="Summer Shred", name_ar="تحدي الصيف", name_he="אתגר הקיץ", description_en="Complete 20 workouts in 30 days to get shredded for summer", challenge_type="cumulative", target_value=20, duration_days=30, xp_reward=750, coins_reward=200, is_seasonal=True),
        Challenge(name_en="Ramadan Fitness", name_ar="رمضان فتنس", name_he="כושר רמדאן", description_en="Maintain your fitness during Ramadan with adjusted workouts", challenge_type="daily", target_value=30, duration_days=30, xp_reward=1000, coins_reward=300, is_seasonal=True),
        Challenge(name_en="Marathon Prep", name_ar="تحضير ماراثون", name_he="הכנה למרתון", description_en="Run a total of 100km in 30 days", challenge_type="cumulative", target_value=100, duration_days=30, xp_reward=1000, coins_reward=250),
    ]
    db.add_all(challenges)
    db.commit()


def seed_articles(db: Session):
    if db.query(Article).count() > 0:
        return
    articles = [
        Article(title_en="The Science of Progressive Overload", title_ar="علم الحمل التدريجي", title_he="המדע של עומס מתקדם", content_en="Progressive overload is the gradual increase of stress placed upon the body during exercise training...", category="training"),
        Article(title_en="Macronutrients: The Complete Guide", title_ar="المغذيات الكبرى: الدليل الكامل", title_he="מאקרו: המדריך המלא", content_en="Understanding macronutrients is essential for anyone looking to optimize their nutrition...", category="nutrition"),
        Article(title_en="Sleep and Recovery: The Missing Link", title_ar="النوم والتعافي: الحلقة المفقودة", title_he="שינה והתאוששות: החוליה החסרה", content_en="Sleep is often the most overlooked aspect of fitness. Quality sleep is when your body repairs...", category="recovery"),
        Article(title_en="Debunking Fitness Myths", title_ar="تفنيد خرافات اللياقة", title_he="מיתוסים בכושר", content_en="From spot reduction to the anabolic window, we debunk the most common fitness myths...", category="education"),
        Article(title_en="Training During Ramadan", title_ar="التدريب خلال رمضان", title_he="אימון בזמן רמדאן", content_en="Training while fasting requires adjustments to timing, intensity, and nutrition...", category="training"),
    ]
    db.add_all(articles)
    db.commit()


def seed_recipes(db: Session):
    if db.query(Recipe).count() > 0:
        return
    recipes = [
        Recipe(name_en="High-Protein Chicken Bowl", name_ar="وعاء دجاج عالي البروتين", name_he="קערת עוף עשירה בחלבון", description_en="A delicious high-protein meal perfect for post-workout", instructions_en="1. Grill chicken breast\n2. Cook brown rice\n3. Add vegetables\n4. Top with tahini sauce", prep_time_min=10, cook_time_min=25, servings=1, calories_per_serving=550, protein_per_serving=45, carbs_per_serving=50, fat_per_serving=12, category="main_dish", tags="high-protein,meal-prep"),
        Recipe(name_en="Protein Smoothie", name_ar="سموذي بروتين", name_he="שייק חלבון", description_en="Quick and easy protein smoothie for busy mornings", instructions_en="1. Add protein powder, banana, oats, milk\n2. Blend until smooth", prep_time_min=5, cook_time_min=0, servings=1, calories_per_serving=380, protein_per_serving=35, carbs_per_serving=45, fat_per_serving=8, category="smoothie", tags="quick,breakfast"),
        Recipe(name_en="Mediterranean Quinoa Salad", name_ar="سلطة كينوا متوسطية", name_he="סלט קינואה ים תיכוני", description_en="Fresh and nutritious quinoa salad with Mediterranean flavors", instructions_en="1. Cook quinoa\n2. Dice vegetables\n3. Mix with olive oil and lemon\n4. Add feta cheese", prep_time_min=15, cook_time_min=15, servings=2, calories_per_serving=320, protein_per_serving=12, carbs_per_serving=40, fat_per_serving=14, category="salad", tags="vegetarian,meal-prep"),
        Recipe(name_en="Shakshuka Power Breakfast", name_ar="شكشوكة فطور القوة", name_he="שקשוקה ארוחת בוקר", description_en="Traditional Middle Eastern egg dish packed with protein", instructions_en="1. Sauté onions and peppers\n2. Add crushed tomatoes and spices\n3. Create wells and crack eggs\n4. Cover and cook until set", prep_time_min=10, cook_time_min=20, servings=2, calories_per_serving=280, protein_per_serving=18, carbs_per_serving=15, fat_per_serving=16, category="breakfast", tags="middle-eastern,high-protein"),
        Recipe(name_en="Overnight Protein Oats", name_ar="شوفان بروتين بين عشية وضحاها", name_he="שיבולת שועל חלבון לילה", description_en="Prepare the night before for a quick high-protein breakfast", instructions_en="1. Mix oats, protein powder, milk, chia seeds\n2. Refrigerate overnight\n3. Top with fruits and nuts", prep_time_min=5, cook_time_min=0, servings=1, calories_per_serving=420, protein_per_serving=35, carbs_per_serving=55, fat_per_serving=10, category="breakfast", tags="meal-prep,quick"),
    ]
    db.add_all(recipes)
    db.commit()


def run_seeds(db: Session):
    seed_exercises(db)
    seed_foods(db)
    seed_achievements(db)
    seed_challenges(db)
    seed_articles(db)
    seed_recipes(db)

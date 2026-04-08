from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime
from app.database import get_db
from app.models import User, CommunityPost, Challenge, UserAchievement, Achievement, Notification
from app.schemas import PostCreate, PostOut
from app.auth import get_required_user

router = APIRouter(prefix="/api", tags=["social"])


# Community Posts
@router.get("/posts", response_model=List[PostOut])
async def list_posts(limit: int = 50, offset: int = 0, db: Session = Depends(get_db)):
    return db.query(CommunityPost).order_by(CommunityPost.created_at.desc()).offset(offset).limit(limit).all()


@router.post("/posts", response_model=PostOut)
async def create_post(data: PostCreate, user: User = Depends(get_required_user), db: Session = Depends(get_db)):
    post = CommunityPost(user_id=user.id, **data.model_dump())
    db.add(post)
    user.xp += 10
    user.coins += 5
    db.commit()
    db.refresh(post)
    return post


@router.post("/posts/{post_id}/like")
async def like_post(post_id: int, user: User = Depends(get_required_user), db: Session = Depends(get_db)):
    post = db.query(CommunityPost).filter(CommunityPost.id == post_id).first()
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")
    post.likes_count += 1
    db.commit()
    return {"likes_count": post.likes_count}


# Challenges
@router.get("/challenges")
async def list_challenges(db: Session = Depends(get_db)):
    challenges = db.query(Challenge).all()
    return [
        {
            "id": c.id,
            "name_en": c.name_en,
            "name_ar": c.name_ar,
            "name_he": c.name_he,
            "description_en": c.description_en,
            "challenge_type": c.challenge_type,
            "target_value": c.target_value,
            "duration_days": c.duration_days,
            "xp_reward": c.xp_reward,
            "coins_reward": c.coins_reward,
            "is_seasonal": c.is_seasonal,
        }
        for c in challenges
    ]


# Achievements
@router.get("/achievements")
async def list_achievements(db: Session = Depends(get_db)):
    achievements = db.query(Achievement).all()
    return [
        {
            "id": a.id,
            "name_en": a.name_en,
            "name_ar": a.name_ar,
            "name_he": a.name_he,
            "description_en": a.description_en,
            "icon": a.icon,
            "category": a.category,
            "xp_reward": a.xp_reward,
            "coins_reward": a.coins_reward,
            "rarity": a.rarity,
        }
        for a in achievements
    ]


@router.get("/achievements/user")
async def get_user_achievements(user: User = Depends(get_required_user), db: Session = Depends(get_db)):
    user_achievements = db.query(UserAchievement).filter(UserAchievement.user_id == user.id).all()
    all_achievements = db.query(Achievement).all()
    earned_ids = {ua.achievement_id for ua in user_achievements}
    return {
        "earned": [
            {
                "id": a.id,
                "name_en": a.name_en,
                "name_ar": a.name_ar,
                "name_he": a.name_he,
                "description_en": a.description_en,
                "icon": a.icon,
                "rarity": a.rarity,
                "earned_at": next((ua.earned_at.isoformat() for ua in user_achievements if ua.achievement_id == a.id), None),
            }
            for a in all_achievements if a.id in earned_ids
        ],
        "locked": [
            {
                "id": a.id,
                "name_en": a.name_en,
                "name_ar": a.name_ar,
                "name_he": a.name_he,
                "description_en": a.description_en,
                "icon": a.icon,
                "rarity": a.rarity,
                "condition_type": a.condition_type,
                "condition_value": a.condition_value,
            }
            for a in all_achievements if a.id not in earned_ids
        ],
        "total": len(all_achievements),
        "earned_count": len(earned_ids),
    }


# Gamification - Leaderboard
@router.get("/leaderboard")
async def get_leaderboard(category: str = "xp", limit: int = 20, db: Session = Depends(get_db)):
    if category == "xp":
        users = db.query(User).order_by(User.xp.desc()).limit(limit).all()
    elif category == "streak":
        users = db.query(User).order_by(User.streak_days.desc()).limit(limit).all()
    elif category == "level":
        users = db.query(User).order_by(User.level.desc()).limit(limit).all()
    else:
        users = db.query(User).order_by(User.xp.desc()).limit(limit).all()

    return [
        {
            "rank": i + 1,
            "username": u.username,
            "full_name": u.full_name,
            "avatar_url": u.avatar_url,
            "xp": u.xp,
            "level": u.level,
            "streak_days": u.streak_days,
        }
        for i, u in enumerate(users)
    ]


# Notifications
@router.get("/notifications")
async def list_notifications(
    unread_only: bool = False,
    user: User = Depends(get_required_user),
    db: Session = Depends(get_db),
):
    q = db.query(Notification).filter(Notification.user_id == user.id)
    if unread_only:
        q = q.filter(Notification.is_read == False)
    notifs = q.order_by(Notification.created_at.desc()).limit(50).all()
    return [
        {
            "id": n.id,
            "title": n.title,
            "message": n.message,
            "type": n.notification_type,
            "is_read": n.is_read,
            "action_url": n.action_url,
            "created_at": n.created_at.isoformat(),
        }
        for n in notifs
    ]


@router.put("/notifications/{notif_id}/read")
async def mark_notification_read(notif_id: int, user: User = Depends(get_required_user), db: Session = Depends(get_db)):
    notif = db.query(Notification).filter(Notification.id == notif_id, Notification.user_id == user.id).first()
    if notif:
        notif.is_read = True
        db.commit()
    return {"status": "ok"}


@router.put("/notifications/read-all")
async def mark_all_notifications_read(user: User = Depends(get_required_user), db: Session = Depends(get_db)):
    db.query(Notification).filter(Notification.user_id == user.id, Notification.is_read == False).update({"is_read": True})
    db.commit()
    return {"status": "ok"}


# AI Chat
@router.post("/chat")
async def ai_chat(message: str, language: str = "en", user: User = Depends(get_required_user)):
    msg_lower = message.lower()
    if any(w in msg_lower for w in ["workout", "training", "exercise", "تمرين", "אימון"]):
        if language == "ar":
            response = "بناءً على أهدافك، أنصحك ببرنامج تمرين يركز على القوة مع 4 أيام تدريب أسبوعياً. يجب أن يتضمن تمارين مركبة مثل السكوات والبنش بريس والديدلفت. تأكد من زيادة الأوزان تدريجياً."
        elif language == "he":
            response = "בהתבסס על המטרות שלך, אני ממליץ על תוכנית אימונים המתמקדת בכוח עם 4 ימי אימון בשבוע. התוכנית צריכה לכלול תרגילים מורכבים כמו סקוואט, לחיצת חזה ודדליפט."
        else:
            response = "Based on your goals, I recommend a strength-focused program with 4 training days per week. Include compound movements like squats, bench press, and deadlifts. Focus on progressive overload by gradually increasing weights each week."
    elif any(w in msg_lower for w in ["diet", "nutrition", "calorie", "food", "meal", "تغذية", "وجبة", "תזונה", "ארוחה"]):
        if language == "ar":
            response = "لتحقيق أهدافك الغذائية، أنصح بتوزيع السعرات: 30% بروتين، 40% كربوهيدرات، 30% دهون. تناول وجبات متوازنة كل 3-4 ساعات واشرب الكثير من الماء."
        elif language == "he":
            response = "כדי להשיג את יעדי התזונה שלך, אני ממליץ על חלוקת קלוריות: 30% חלבון, 40% פחמימות, 30% שומן. אכול ארוחות מאוזנות כל 3-4 שעות ושתה הרבה מים."
        else:
            response = "For your nutrition goals, I recommend a macronutrient split of 30% protein, 40% carbs, and 30% fat. Eat balanced meals every 3-4 hours, stay hydrated with at least 3L of water daily, and prioritize whole foods."
    elif any(w in msg_lower for w in ["recover", "sleep", "rest", "نوم", "راحة", "שינה", "מנוחה"]):
        if language == "ar":
            response = "التعافي مهم جداً! تأكد من النوم 7-9 ساعات يومياً، خذ أيام راحة كافية، ومارس تمارين الإطالة بعد التمرين."
        elif language == "he":
            response = "התאוששות חשובה מאוד! הקפד על 7-9 שעות שינה ביום, קח ימי מנוחה מספיקים, ועשה מתיחות אחרי האימון."
        else:
            response = "Recovery is crucial! Ensure 7-9 hours of sleep per night, take adequate rest days between intense training sessions, and incorporate stretching and foam rolling. Consider tracking your sleep quality and HRV."
    else:
        if language == "ar":
            response = "أنا مدربك الشخصي بالذكاء الاصطناعي! يمكنني مساعدتك في التمارين والتغذية والتعافي. ماذا تريد أن تعرف؟"
        elif language == "he":
            response = "אני המאמן האישי שלך מבוסס בינה מלאכותית! אני יכול לעזור לך עם אימונים, תזונה והתאוששות. מה תרצה לדעת?"
        else:
            response = "I'm your AI personal trainer! I can help with workout programming, nutrition planning, recovery strategies, and more. What would you like to know?"

    return {"response": response, "suggestions": ["Tell me about workouts", "Help with nutrition", "Recovery tips"]}


# Articles
@router.get("/articles")
async def list_articles(
    category: Optional[str] = None,
    search: Optional[str] = None,
    db: Session = Depends(get_db),
):
    from app.models import Article
    q = db.query(Article).filter(Article.is_published == True)
    if category:
        q = q.filter(Article.category == category)
    if search:
        q = q.filter(Article.title_en.ilike(f"%{search}%") | Article.content_en.ilike(f"%{search}%"))
    articles = q.order_by(Article.created_at.desc()).all()
    return [
        {
            "id": a.id,
            "title_en": a.title_en,
            "title_ar": a.title_ar,
            "title_he": a.title_he,
            "content_en": a.content_en,
            "content_ar": a.content_ar,
            "content_he": a.content_he,
            "category": a.category,
            "image_url": a.image_url,
            "views": a.views,
            "created_at": a.created_at.isoformat(),
        }
        for a in articles
    ]


# Coach endpoints
@router.get("/coaches")
async def list_coaches(db: Session = Depends(get_db)):
    coaches = db.query(User).filter(User.role == "coach").all()
    return [
        {
            "id": c.id,
            "username": c.username,
            "full_name": c.full_name,
            "avatar_url": c.avatar_url,
            "experience_level": c.experience_level,
        }
        for c in coaches
    ]


# Appointments
@router.get("/appointments")
async def list_appointments(user: User = Depends(get_required_user), db: Session = Depends(get_db)):
    from app.models import Appointment
    appts = db.query(Appointment).filter(
        (Appointment.coach_id == user.id) | (Appointment.client_id == user.id)
    ).order_by(Appointment.scheduled_at).all()
    return [
        {
            "id": a.id,
            "title": a.title,
            "type": a.appointment_type,
            "scheduled_at": a.scheduled_at.isoformat(),
            "duration_minutes": a.duration_minutes,
            "status": a.status,
        }
        for a in appts
    ]

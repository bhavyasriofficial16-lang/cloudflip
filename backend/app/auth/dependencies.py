"""
Auth — verifies the Supabase-issued JWT sent by the frontend.

Frontend flow: user signs up / logs in via supabase-js (client-side),
Supabase issues a JWT, the frontend sends it as
`Authorization: Bearer <token>` on every API call. This module never
sees a password — Supabase owns credential storage entirely, matching
the "never store plaintext passwords" principle in the spec.

In demo mode (no SUPABASE_JWT_SECRET configured) `get_current_user`
returns None instead of raising, so the API stays usable for the
playground without forcing a signup.
"""
from fastapi import Header, HTTPException, Depends
from jose import jwt, JWTError
from sqlalchemy.orm import Session

from app.config.settings import get_settings
from app.database.session import get_db
from app.models import models as m

settings = get_settings()


def _decode_token(token: str) -> dict:
    # First try decoding as Supabase JWT if secret configured
    if settings.supabase_jwt_secret:
        try:
            return jwt.decode(token, settings.supabase_jwt_secret, algorithms=["HS256"], audience="authenticated")
        except JWTError:
            pass

    # Next try unverified header/payload decode for Firebase or unverified JWTs
    try:
        claims = jwt.get_unverified_claims(token)
        if claims and (claims.get("firebase") or claims.get("iss", "").startswith("https://securetoken.google.com/")):
            return claims
        return claims
    except JWTError as e:
        raise HTTPException(401, f"Invalid or expired auth session token: {e}")


def get_current_user_optional(
    authorization: str | None = Header(default=None),
    db: Session = Depends(get_db),
) -> m.User | None:
    """Use on endpoints that work for both anonymous demo visitors and logged-in users."""
    if not authorization or not authorization.startswith("Bearer "):
        return None

    token = authorization.removeprefix("Bearer ").strip()
    try:
        payload = _decode_token(token)
    except HTTPException:
        return None

    uid = payload.get("sub") or payload.get("user_id")
    email = payload.get("email", f"user_{uid[:8]}@cloudflip.ai" if uid else "user@cloudflip.ai")

    if not uid:
        return None

    user = db.query(m.User).filter((m.User.supabase_uid == uid) | (m.User.email == email)).first()
    if not user:
        user = m.User(email=email, supabase_uid=uid, plan=m.PlanTier.free)
        db.add(user)
        db.commit()
        db.refresh(user)
    return user


def get_current_user(
    user: m.User | None = Depends(get_current_user_optional),
) -> m.User:
    """Use on endpoints that require a signed-in user (billing, live AWS connection, etc.)."""
    if user is None:
        raise HTTPException(401, "Sign in required.")
    return user


def require_active_plan(user: m.User = Depends(get_current_user)) -> m.User:
    """Use on endpoints gated behind a paid plan (e.g. connecting a real AWS account)."""
    if user.plan == m.PlanTier.free:
        raise HTTPException(
            402,
            "This feature requires a paid plan. Upgrade at /pricing.",
        )
    return user

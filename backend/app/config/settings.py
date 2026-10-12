"""
Centralized configuration. Everything here is read from environment
variables (see .env.example) — never hard-code secrets or credentials.
"""
from functools import lru_cache
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    environment: str = "demo"                      # "demo" | "live"
    secret_key: str = "change-me"
    cors_origins: str = "http://localhost:5173,*"

    database_url: str = "sqlite:///./cloudflip.db"

    supabase_url: str = ""
    supabase_anon_key: str = ""
    supabase_jwt_secret: str = ""

    # Firebase Auth settings
    firebase_project_id: str = ""

    stripe_secret_key: str = ""
    stripe_webhook_secret: str = ""
    stripe_price_monthly: str = ""       # Stripe Price ID for the monthly plan
    stripe_price_annual: str = ""        # Stripe Price ID for the annual plan
    stripe_price_metered: str = ""       # Stripe metered Price ID for pay-as-you-go
    frontend_url: str = "https://cloudflip-five.vercel.app"

    # Razorpay settings for India payments
    razorpay_key_id: str = ""
    razorpay_key_secret: str = ""
    razorpay_webhook_secret: str = ""
    razorpay_plan_monthly: str = ""      # Razorpay Plan ID for monthly
    razorpay_plan_annual: str = ""       # Razorpay Plan ID for annual

    free_plan_resource_limit: int = 3

    use_real_aws: bool = False
    aws_region: str = "ap-south-1"
    aws_access_key_id: str = ""
    aws_secret_access_key: str = ""
    aws_role_arn: str = ""

    # Hard safety switch: even an approved recommendation will not touch
    # real AWS resources while this is true. Principle #9 / #12 in the spec.
    simulation_only_mode: bool = True

    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    @property
    def cors_origin_list(self) -> list[str]:
        return [o.strip() for o in self.cors_origins.split(",") if o.strip()]

    @property
    def is_live(self) -> bool:
        return self.environment == "live" and self.use_real_aws


@lru_cache
def get_settings() -> Settings:
    return Settings()

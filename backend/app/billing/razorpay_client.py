"""
Razorpay client wrapper — section for India payment processing.
Handles creating orders/subscriptions, verifying signatures (HMAC SHA256),
and webhook event validation.
"""
import hmac
import hashlib
import logging
from typing import Dict, Any, Optional

from app.config.settings import get_settings

logger = logging.getLogger("cloudflip.billing.razorpay")
settings = get_settings()


class RazorpayClient:
    def __init__(self):
        self.key_id = settings.razorpay_key_id
        self.key_secret = settings.razorpay_key_secret
        self.webhook_secret = settings.razorpay_webhook_secret

    @property
    def is_configured(self) -> bool:
        return bool(self.key_id and self.key_secret)

    def create_order(self, amount_in_paise: int, currency: str = "INR", receipt: Optional[str] = None, notes: Optional[Dict[str, str]] = None) -> Dict[str, Any]:
        """
        Creates a Razorpay payment order.
        If Razorpay API keys are not provided (demo mode), returns a mock order structure.
        """
        if not self.is_configured:
            logger.info("Razorpay not configured — returning mock order for demo mode.")
            return {
                "id": f"order_demo_{hashlib.md5(str(amount_in_paise).encode()).hexdigest()[:12]}",
                "entity": "order",
                "amount": amount_in_paise,
                "amount_paid": 0,
                "amount_due": amount_in_paise,
                "currency": currency,
                "receipt": receipt or "receipt_demo",
                "status": "created",
                "is_demo": True,
            }

        try:
            import razorpay
            client = razorpay.Client(auth=(self.key_id, self.key_secret))
            data = {
                "amount": amount_in_paise,
                "currency": currency,
                "receipt": receipt,
                "notes": notes or {},
            }
            return client.order.create(data=data)
        except ImportError:
            logger.info("razorpay package not installed — returning demo order.")
            return {
                "id": f"order_demo_{hashlib.md5(str(amount_in_paise).encode()).hexdigest()[:12]}",
                "entity": "order",
                "amount": amount_in_paise,
                "amount_paid": 0,
                "amount_due": amount_in_paise,
                "currency": currency,
                "receipt": receipt or "receipt_demo",
                "status": "created",
                "is_demo": True,
            }
        except Exception as e:
            logger.error(f"Razorpay order creation failed: {e}")
            raise RuntimeError(f"Razorpay Order creation error: {str(e)}")


    def verify_payment_signature(self, razorpay_order_id: str, razorpay_payment_id: str, razorpay_signature: str) -> bool:
        """
        Verifies HMAC SHA256 signature for Razorpay web/mobile checkout payment.
        """
        if not self.is_configured or razorpay_order_id.startswith("order_demo_"):
            # In demo mode, accept test signature
            return True

        msg = f"{razorpay_order_id}|{razorpay_payment_id}".encode("utf-8")
        secret = self.key_secret.encode("utf-8")
        generated_signature = hmac.new(secret, msg, hashlib.sha256).hexdigest()
        return hmac.compare_digest(generated_signature, razorpay_signature)

    def verify_webhook_signature(self, body_bytes: bytes, signature_header: str) -> bool:
        """
        Verifies HMAC SHA256 webhook signature sent by Razorpay.
        """
        if not self.webhook_secret:
            logger.warning("No Razorpay webhook secret configured.")
            return True

        secret = self.webhook_secret.encode("utf-8")
        generated_signature = hmac.new(secret, body_bytes, hashlib.sha256).hexdigest()
        return hmac.compare_digest(generated_signature, signature_header)


razorpay_client = RazorpayClient()

"""
Stripe wrapper. Mirrors the AWS client pattern used elsewhere in this
project: when STRIPE_SECRET_KEY isn't set, every method returns a
clearly-labeled "not configured" result instead of raising, so the
rest of the app (and the pricing page) stays usable while you're
still setting up billing.
"""
from app.config.settings import get_settings

settings = get_settings()


class StripeClient:
    def __init__(self):
        self.enabled = bool(settings.stripe_secret_key)
        if self.enabled:
            import stripe

            stripe.api_key = settings.stripe_secret_key
            self._stripe = stripe

    def _require(self):
        if not self.enabled:
            raise RuntimeError(
                "Stripe is not configured — set STRIPE_SECRET_KEY in .env before calling billing endpoints."
            )

    def get_or_create_customer(self, email: str, existing_customer_id: str | None) -> str:
        self._require()
        if existing_customer_id:
            return existing_customer_id
        customer = self._stripe.Customer.create(email=email)
        return customer.id

    def create_checkout_session(
        self, customer_id: str, price_id: str, mode: str, success_url: str, cancel_url: str
    ):
        self._require()
        return self._stripe.checkout.Session.create(
            customer=customer_id,
            line_items=[{"price": price_id, "quantity": 1}],
            mode=mode,  # "subscription" for monthly/annual/metered, "payment" for one-off
            success_url=success_url,
            cancel_url=cancel_url,
        )

    def create_billing_portal_session(self, customer_id: str, return_url: str):
        self._require()
        return self._stripe.billing_portal.Session.create(customer=customer_id, return_url=return_url)

    def report_usage(self, subscription_item_id: str, quantity: int):
        self._require()
        return self._stripe.SubscriptionItem.create_usage_record(
            subscription_item_id, quantity=quantity, action="increment"
        )

    def construct_webhook_event(self, payload: bytes, sig_header: str):
        self._require()
        return self._stripe.Webhook.construct_event(payload, sig_header, settings.stripe_webhook_secret)


stripe_client = StripeClient()

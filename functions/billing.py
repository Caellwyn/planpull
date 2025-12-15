"""
Stripe billing functions for PlanPull.
Handles checkout sessions, webhooks, and subscription management.
"""

import os
import stripe
from firebase_functions import https_fn, options
from firebase_admin import firestore

# Initialize Stripe with secret key from environment
# For Cloud Functions, we'll use Firebase config or environment variables
stripe.api_key = os.environ.get('STRIPE_PRIVATE_KEY', '')

# Price ID mapping - will be set from environment
PRICE_IDS = {
    'basic': os.environ.get('STRIPE_BASIC_PRICE_ID', ''),
}

# Tier limits (pages per month)
TIER_LIMITS = {
    'none': 0,
    'basic': 500,
    'premium': 2000,
}


def get_db():
    """Get Firestore client."""
    return firestore.client()


@https_fn.on_call(
    cors=options.CorsOptions(cors_origins="*", cors_methods=["get", "post"]),
)
def create_checkout_session(req: https_fn.CallableRequest) -> dict:
    """
    Creates a Stripe Checkout session for subscription.

    Request data:
        - priceId: The Stripe price ID to subscribe to

    Returns:
        - url: The checkout session URL to redirect to
    """
    # Require authentication
    if not req.auth:
        raise https_fn.HttpsError(
            code=https_fn.FunctionsErrorCode.UNAUTHENTICATED,
            message="Must be logged in to subscribe."
        )

    uid = req.auth.uid
    email = req.auth.token.get('email', '')

    price_id = req.data.get('priceId')
    if not price_id:
        raise https_fn.HttpsError(
            code=https_fn.FunctionsErrorCode.INVALID_ARGUMENT,
            message="Missing priceId."
        )

    # Get or create Stripe customer
    db = get_db()
    user_ref = db.collection('users').document(uid)
    user_doc = user_ref.get()

    customer_id = None
    if user_doc.exists:
        customer_id = user_doc.to_dict().get('stripeCustomerId')

    if not customer_id:
        # Create new Stripe customer
        customer = stripe.Customer.create(
            email=email,
            metadata={'firebaseUID': uid}
        )
        customer_id = customer.id
        # Save to Firestore
        user_ref.set({'stripeCustomerId': customer_id}, merge=True)

    # Determine success/cancel URLs
    # These should point to your frontend
    base_url = os.environ.get('FRONTEND_URL', 'https://planpull.web.app')
    success_url = f"{base_url}/app?checkout=success&session_id={{CHECKOUT_SESSION_ID}}"
    cancel_url = f"{base_url}/pricing?checkout=canceled"

    try:
        # Create checkout session
        session = stripe.checkout.Session.create(
            customer=customer_id,
            payment_method_types=['card'],
            line_items=[{
                'price': price_id,
                'quantity': 1,
            }],
            mode='subscription',
            success_url=success_url,
            cancel_url=cancel_url,
            client_reference_id=uid,
            metadata={'firebaseUID': uid},
        )

        return {'url': session.url}

    except stripe.error.StripeError as e:
        print(f"Stripe error: {e}")
        raise https_fn.HttpsError(
            code=https_fn.FunctionsErrorCode.INTERNAL,
            message=f"Failed to create checkout session: {str(e)}"
        )


@https_fn.on_call(
    cors=options.CorsOptions(cors_origins="*", cors_methods=["get", "post"]),
)
def create_portal_session(req: https_fn.CallableRequest) -> dict:
    """
    Creates a Stripe Customer Portal session for managing subscription.

    Returns:
        - url: The portal session URL to redirect to
    """
    if not req.auth:
        raise https_fn.HttpsError(
            code=https_fn.FunctionsErrorCode.UNAUTHENTICATED,
            message="Must be logged in."
        )

    uid = req.auth.uid
    db = get_db()
    user_doc = db.collection('users').document(uid).get()

    if not user_doc.exists:
        raise https_fn.HttpsError(
            code=https_fn.FunctionsErrorCode.NOT_FOUND,
            message="User not found."
        )

    customer_id = user_doc.to_dict().get('stripeCustomerId')
    if not customer_id:
        raise https_fn.HttpsError(
            code=https_fn.FunctionsErrorCode.FAILED_PRECONDITION,
            message="No subscription found."
        )

    base_url = os.environ.get('FRONTEND_URL', 'https://planpull.web.app')
    return_url = f"{base_url}/app/account"

    try:
        session = stripe.billing_portal.Session.create(
            customer=customer_id,
            return_url=return_url,
        )
        return {'url': session.url}

    except stripe.error.StripeError as e:
        print(f"Stripe error: {e}")
        raise https_fn.HttpsError(
            code=https_fn.FunctionsErrorCode.INTERNAL,
            message=f"Failed to create portal session: {str(e)}"
        )


@https_fn.on_request(
    cors=options.CorsOptions(cors_origins="*", cors_methods=["post"]),
)
def stripe_webhook(req: https_fn.Request) -> https_fn.Response:
    """
    Handles Stripe webhook events.

    Events handled:
        - checkout.session.completed: New subscription created
        - customer.subscription.updated: Subscription changed
        - customer.subscription.deleted: Subscription canceled
        - invoice.paid: Payment successful, reset usage
        - invoice.payment_failed: Payment failed
    """
    payload = req.data
    sig_header = req.headers.get('stripe-signature')
    webhook_secret = os.environ.get('STRIPE_WEBHOOK_SECRET', '')

    try:
        event = stripe.Webhook.construct_event(
            payload, sig_header, webhook_secret
        )
    except ValueError:
        # Invalid payload
        return https_fn.Response("Invalid payload", status=400)
    except stripe.error.SignatureVerificationError:
        # Invalid signature
        return https_fn.Response("Invalid signature", status=400)

    db = get_db()
    event_type = event['type']
    data = event['data']['object']

    try:
        if event_type == 'checkout.session.completed':
            handle_checkout_completed(db, data)
        elif event_type == 'customer.subscription.updated':
            handle_subscription_updated(db, data)
        elif event_type == 'customer.subscription.deleted':
            handle_subscription_deleted(db, data)
        elif event_type == 'invoice.paid':
            handle_invoice_paid(db, data)
        elif event_type == 'invoice.payment_failed':
            handle_invoice_payment_failed(db, data)
        else:
            print(f"Unhandled event type: {event_type}")
    except Exception as e:
        print(f"Error handling webhook {event_type}: {e}")
        return https_fn.Response(f"Webhook handler error: {str(e)}", status=500)

    return https_fn.Response("OK", status=200)


def handle_checkout_completed(db, session):
    """Handle successful checkout - activate subscription."""
    customer_id = session.get('customer')
    subscription_id = session.get('subscription')
    uid = session.get('client_reference_id') or session.get('metadata', {}).get('firebaseUID')

    if not uid:
        print(f"No user ID found in checkout session: {session.get('id')}")
        return

    # Get subscription details
    subscription = stripe.Subscription.retrieve(subscription_id)
    print(f"Subscription retrieved: {subscription}")

    # Handle both dict-style and object-style access
    items_data = subscription.get('items', {}).get('data', []) if isinstance(subscription, dict) else subscription.items.data
    first_item = items_data[0] if items_data else {}
    price_id = first_item.get('price', {}).get('id') if isinstance(first_item, dict) else getattr(first_item.get('price'), 'id', None)

    # Determine tier from price
    tier = 'basic'  # Default
    if price_id:
        for tier_name, pid in PRICE_IDS.items():
            if pid == price_id:
                tier = tier_name
                break

    # Get period timestamps - now on item level in newer Stripe API
    # Try subscription level first, then fall back to item level
    period_start = subscription.get('current_period_start')
    period_end = subscription.get('current_period_end')

    # If not on subscription, get from first item
    if not period_start and first_item:
        period_start = first_item.get('current_period_start')
    if not period_end and first_item:
        period_end = first_item.get('current_period_end')

    # Update user document
    user_ref = db.collection('users').document(uid)
    update_data = {
        'stripeCustomerId': customer_id,
        'stripeSubscriptionId': subscription_id,
        'subscriptionStatus': 'active',
        'subscriptionTier': tier,
        'pagesUsedThisPeriod': 0,  # Reset usage on new subscription
    }

    # Only add period fields if available
    if period_start:
        update_data['currentPeriodStart'] = period_start
    if period_end:
        update_data['currentPeriodEnd'] = period_end

    user_ref.set(update_data, merge=True)

    print(f"Activated subscription for user {uid}: {tier}")


def handle_subscription_updated(db, subscription):
    """Handle subscription updates (plan changes, etc.)."""
    customer_id = subscription.get('customer')

    # Find user by customer ID
    users = db.collection('users').where('stripeCustomerId', '==', customer_id).limit(1).get()
    if not users:
        print(f"No user found for customer: {customer_id}")
        return

    user_ref = users[0].reference

    # Handle both dict-style and object-style access
    items_data = subscription.get('items', {}).get('data', []) if isinstance(subscription, dict) else getattr(subscription, 'items', {}).get('data', [])
    first_item = items_data[0] if items_data else {}
    price_id = first_item.get('price', {}).get('id') if isinstance(first_item, dict) else None

    # Determine tier
    tier = 'basic'
    if price_id:
        for tier_name, pid in PRICE_IDS.items():
            if pid == price_id:
                tier = tier_name
                break

    status = subscription.get('status', 'active')
    if status in ['active', 'trialing']:
        sub_status = 'active'
    elif status == 'past_due':
        sub_status = 'past_due'
    else:
        sub_status = status

    # Get period timestamps - try subscription level first, then item level
    period_start = subscription.get('current_period_start')
    period_end = subscription.get('current_period_end')
    if not period_start and first_item:
        period_start = first_item.get('current_period_start')
    if not period_end and first_item:
        period_end = first_item.get('current_period_end')

    update_data = {
        'subscriptionStatus': sub_status,
        'subscriptionTier': tier,
    }
    if period_start:
        update_data['currentPeriodStart'] = period_start
    if period_end:
        update_data['currentPeriodEnd'] = period_end

    user_ref.set(update_data, merge=True)

    print(f"Updated subscription for customer {customer_id}: {tier}, {sub_status}")


def handle_subscription_deleted(db, subscription):
    """Handle subscription cancellation."""
    customer_id = subscription.get('customer')

    users = db.collection('users').where('stripeCustomerId', '==', customer_id).limit(1).get()
    if not users:
        print(f"No user found for customer: {customer_id}")
        return

    user_ref = users[0].reference
    user_ref.set({
        'subscriptionStatus': 'canceled',
        'subscriptionTier': 'none',
        'stripeSubscriptionId': None,
    }, merge=True)

    print(f"Canceled subscription for customer {customer_id}")


def handle_invoice_paid(db, invoice):
    """Handle successful invoice payment - reset monthly usage."""
    customer_id = invoice.get('customer')
    subscription_id = invoice.get('subscription')

    if not subscription_id:
        # Not a subscription invoice
        return

    users = db.collection('users').where('stripeCustomerId', '==', customer_id).limit(1).get()
    if not users:
        print(f"No user found for customer: {customer_id}")
        return

    # Get updated subscription period
    subscription = stripe.Subscription.retrieve(subscription_id)

    # Get period timestamps - try subscription level first, then item level
    items_data = subscription.get('items', {}).get('data', []) if isinstance(subscription, dict) else getattr(subscription, 'items', {}).get('data', [])
    first_item = items_data[0] if items_data else {}

    period_start = subscription.get('current_period_start')
    period_end = subscription.get('current_period_end')
    if not period_start and first_item:
        period_start = first_item.get('current_period_start')
    if not period_end and first_item:
        period_end = first_item.get('current_period_end')

    user_ref = users[0].reference
    update_data = {
        'pagesUsedThisPeriod': 0,  # Reset usage
        'subscriptionStatus': 'active',
    }
    if period_start:
        update_data['currentPeriodStart'] = period_start
    if period_end:
        update_data['currentPeriodEnd'] = period_end

    user_ref.set(update_data, merge=True)

    print(f"Reset usage for customer {customer_id}")


def handle_invoice_payment_failed(db, invoice):
    """Handle failed payment."""
    customer_id = invoice.get('customer')

    users = db.collection('users').where('stripeCustomerId', '==', customer_id).limit(1).get()
    if not users:
        return

    user_ref = users[0].reference
    user_ref.set({
        'subscriptionStatus': 'past_due',
    }, merge=True)

    print(f"Payment failed for customer {customer_id}")

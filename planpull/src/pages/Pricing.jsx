import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { redirectToCheckout } from '../services/billing';

// Price IDs - these should match your Stripe dashboard
// TODO: Move to environment variables
const PRICES = {
  basic: {
    id: import.meta.env.VITE_STRIPE_BASIC_PRICE_ID || '',
    name: 'Basic',
    price: '$50',
    period: 'month',
    pages: 500,
    features: [
      'Up to 500 pages/month',
      'PDF table extraction',
      'Diagram annotation extraction',
      'CSV export',
      'Detail & Consolidated views',
      'Email support',
    ],
  },
};

const Pricing = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(null);
  const [error, setError] = useState(null);

  const checkoutCanceled = searchParams.get('checkout') === 'canceled';

  const handleSubscribe = async (priceId) => {
    if (!currentUser) {
      // Redirect to login with return URL
      navigate('/login?redirect=/pricing');
      return;
    }

    if (!priceId) {
      setError('Subscription not available yet. Please check back soon.');
      return;
    }

    setLoading(priceId);
    setError(null);

    try {
      await redirectToCheckout(priceId);
    } catch (err) {
      console.error('Checkout error:', err);
      setError('Failed to start checkout. Please try again.');
      setLoading(null);
    }
  };

  return (
    <div style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto' }}>
      <h1 style={{ textAlign: 'center', marginBottom: '0.5rem', color: '#333' }}>
        Simple Pricing
      </h1>
      <p style={{ textAlign: 'center', color: '#666', marginBottom: '2rem' }}>
        Extract materials lists from landscaping PDFs in minutes, not hours.
      </p>

      {checkoutCanceled && (
        <div style={{
          padding: '12px 20px',
          backgroundColor: '#fff3cd',
          color: '#856404',
          borderRadius: '4px',
          marginBottom: '2rem',
          textAlign: 'center'
        }}>
          Checkout was canceled. Feel free to try again when you're ready.
        </div>
      )}

      {error && (
        <div style={{
          padding: '12px 20px',
          backgroundColor: '#ffebee',
          color: '#c62828',
          borderRadius: '4px',
          marginBottom: '2rem',
          textAlign: 'center'
        }}>
          {error}
        </div>
      )}

      <div style={{ display: 'flex', gap: '2rem', justifyContent: 'center', flexWrap: 'wrap' }}>
        {/* Basic Plan Card */}
        <div style={{
          border: '2px solid #2E5C43',
          borderRadius: '12px',
          padding: '2rem',
          width: '320px',
          backgroundColor: '#fff',
          boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
        }}>
          <h2 style={{ margin: '0 0 0.5rem 0', color: '#2E5C43' }}>
            {PRICES.basic.name}
          </h2>
          <div style={{ marginBottom: '1.5rem' }}>
            <span style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#333' }}>
              {PRICES.basic.price}
            </span>
            <span style={{ color: '#666' }}>/{PRICES.basic.period}</span>
          </div>

          <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 1.5rem 0' }}>
            {PRICES.basic.features.map((feature, i) => (
              <li key={i} style={{
                padding: '8px 0',
                borderBottom: i < PRICES.basic.features.length - 1 ? '1px solid #eee' : 'none',
                color: '#444'
              }}>
                <span style={{ color: '#2E5C43', marginRight: '8px' }}>✓</span>
                {feature}
              </li>
            ))}
          </ul>

          <button
            onClick={() => handleSubscribe(PRICES.basic.id)}
            disabled={loading === PRICES.basic.id}
            style={{
              width: '100%',
              padding: '14px',
              backgroundColor: loading === PRICES.basic.id ? '#ccc' : '#2E5C43',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              fontSize: '1rem',
              fontWeight: '600',
              cursor: loading === PRICES.basic.id ? 'not-allowed' : 'pointer',
            }}
          >
            {loading === PRICES.basic.id ? 'Loading...' : 'Get Started'}
          </button>
        </div>
      </div>

      <p style={{ textAlign: 'center', color: '#888', marginTop: '2rem', fontSize: '0.9rem' }}>
        Cancel anytime. No long-term contracts.
      </p>
    </div>
  );
};

export default Pricing;

import React, { useState, useEffect } from 'react';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '../services/firebase';
import { useAuth } from '../contexts/AuthContext';
import { openCustomerPortal } from '../services/billing';

const Account = () => {
  const { currentUser } = useAuth();
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [portalLoading, setPortalLoading] = useState(false);

  useEffect(() => {
    if (!currentUser) return;

    const unsubscribe = onSnapshot(
      doc(db, 'users', currentUser.uid),
      (doc) => {
        if (doc.exists()) {
          setUserData(doc.data());
        }
        setLoading(false);
      },
      (error) => {
        console.error('Error fetching user data:', error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [currentUser]);

  const handleManageBilling = async () => {
    setPortalLoading(true);
    try {
      await openCustomerPortal();
    } catch (error) {
      console.error('Error opening portal:', error);
      alert('Failed to open billing portal. Please try again.');
    } finally {
      setPortalLoading(false);
    }
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return 'N/A';
    const date = new Date(timestamp * 1000);
    return date.toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getTierLimit = (tier) => {
    const limits = {
      basic: 500,
      premium: 2000,
      none: 0,
    };
    return limits[tier] || 0;
  };

  if (loading) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        Loading account information...
      </div>
    );
  }

  const subscriptionStatus = userData?.subscriptionStatus || 'none';
  const subscriptionTier = userData?.subscriptionTier || 'none';
  const pagesUsed = userData?.pagesUsedThisPeriod || 0;
  const pageLimit = getTierLimit(subscriptionTier);
  const renewalDate = userData?.currentPeriodEnd;

  return (
    <div style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto' }}>
      <h1 style={{ marginBottom: '2rem', color: '#333' }}>Account</h1>

      {/* User Info Card */}
      <div className="card" style={{ marginBottom: '1.5rem' }}>
        <h3 style={{ marginTop: 0, color: '#2E5C43' }}>Profile</h3>
        <p><strong>Email:</strong> {currentUser?.email}</p>
      </div>

      {/* Subscription Card */}
      <div className="card" style={{ marginBottom: '1.5rem' }}>
        <h3 style={{ marginTop: 0, color: '#2E5C43' }}>Subscription</h3>

        {subscriptionStatus === 'active' ? (
          <>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <div>
                <span style={{
                  display: 'inline-block',
                  padding: '4px 12px',
                  backgroundColor: '#e8f5e9',
                  color: '#2E7D32',
                  borderRadius: '20px',
                  fontSize: '0.9rem',
                  fontWeight: '600',
                  textTransform: 'capitalize'
                }}>
                  {subscriptionTier} Plan
                </span>
              </div>
              <span style={{
                padding: '4px 8px',
                backgroundColor: '#e3f2fd',
                color: '#1565c0',
                borderRadius: '4px',
                fontSize: '0.85rem'
              }}>
                Active
              </span>
            </div>

            {/* Usage Bar */}
            <div style={{ marginBottom: '1rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                <span style={{ fontSize: '0.9rem', color: '#666' }}>Pages Used</span>
                <span style={{ fontSize: '0.9rem', color: '#666' }}>
                  {pagesUsed} / {pageLimit}
                </span>
              </div>
              <div style={{
                height: '8px',
                backgroundColor: '#e0e0e0',
                borderRadius: '4px',
                overflow: 'hidden'
              }}>
                <div style={{
                  height: '100%',
                  width: `${Math.min((pagesUsed / pageLimit) * 100, 100)}%`,
                  backgroundColor: pagesUsed >= pageLimit ? '#c62828' : '#2E5C43',
                  transition: 'width 0.3s ease'
                }} />
              </div>
            </div>

            <p style={{ color: '#666', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
              <strong>Renews:</strong> {formatDate(renewalDate)}
            </p>

            <button
              onClick={handleManageBilling}
              disabled={portalLoading}
              className="btn-secondary"
              style={{ marginRight: '10px' }}
            >
              {portalLoading ? 'Loading...' : 'Manage Billing'}
            </button>
          </>
        ) : subscriptionStatus === 'past_due' ? (
          <>
            <p style={{ color: '#c62828', marginBottom: '1rem' }}>
              Your payment is past due. Please update your payment method.
            </p>
            <button
              onClick={handleManageBilling}
              disabled={portalLoading}
              className="btn-primary"
            >
              {portalLoading ? 'Loading...' : 'Update Payment'}
            </button>
          </>
        ) : (
          <>
            <p style={{ color: '#666', marginBottom: '1rem' }}>
              You don't have an active subscription.
            </p>
            <a href="/pricing" className="btn-primary" style={{ textDecoration: 'none' }}>
              View Plans
            </a>
          </>
        )}
      </div>

      {/* Usage History (optional - could add later) */}
      <div className="card">
        <h3 style={{ marginTop: 0, color: '#2E5C43' }}>Usage This Period</h3>
        <p style={{ color: '#666' }}>
          You've processed <strong>{pagesUsed} pages</strong> this billing period.
        </p>
      </div>
    </div>
  );
};

export default Account;

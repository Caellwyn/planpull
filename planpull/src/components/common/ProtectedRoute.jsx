import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '../../services/firebase';
import { useAuth } from '../../contexts/AuthContext';

const ProtectedRoute = ({ children, requireSubscription = true }) => {
    const { currentUser, loading } = useAuth();
    const [subscriptionStatus, setSubscriptionStatus] = useState(null);
    const [checkingSubscription, setCheckingSubscription] = useState(true);

    useEffect(() => {
        if (!currentUser) {
            setCheckingSubscription(false);
            return;
        }

        const unsubscribe = onSnapshot(
            doc(db, 'users', currentUser.uid),
            (doc) => {
                if (doc.exists()) {
                    setSubscriptionStatus(doc.data().subscriptionStatus || 'none');
                } else {
                    setSubscriptionStatus('none');
                }
                setCheckingSubscription(false);
            },
            (error) => {
                console.error('Error checking subscription:', error);
                setSubscriptionStatus('none');
                setCheckingSubscription(false);
            }
        );

        return () => unsubscribe();
    }, [currentUser]);

    if (loading || checkingSubscription) {
        return <div style={{ padding: '2rem', textAlign: 'center' }}>Loading...</div>;
    }

    if (!currentUser) {
        return <Navigate to="/login" />;
    }

    // Check subscription if required
    if (requireSubscription && subscriptionStatus !== 'active') {
        return <Navigate to="/pricing" />;
    }

    return children;
};

export default ProtectedRoute;

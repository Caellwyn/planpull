import React from 'react';
import { Link } from 'react-router-dom';

const Landing = () => {
    return (
        <div style={{ overflowX: 'hidden' }}>
            {/* Hero Section */}
            <section style={{
                background: 'linear-gradient(135deg, #e8f5e9 0%, #c8e6c9 100%)',
                color: '#1a3a2a',
                padding: '80px 20px',
                position: 'relative',
                overflow: 'hidden'
            }}>
                {/* Background image overlay - subtle */}
                <div style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    opacity: 0.08,
                    backgroundImage: 'url(/images/landscape-bg.jpg)',
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    pointerEvents: 'none'
                }} />

                <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', alignItems: 'center', gap: '60px', flexWrap: 'wrap', position: 'relative', zIndex: 1 }}>
                    <div style={{ flex: '1 1 500px' }}>
                        <h1 style={{
                            fontSize: 'clamp(2.5rem, 5vw, 3.5rem)',
                            fontWeight: '700',
                            marginBottom: '20px',
                            lineHeight: '1.1'
                        }}>
                            Stop Typing.<br />Start Estimating.
                        </h1>
                        <p style={{
                            fontSize: '1.25rem',
                            opacity: 0.9,
                            marginBottom: '30px',
                            maxWidth: '500px',
                            lineHeight: '1.6'
                        }}>
                            Extract material quantities from your plans automatically.
                            Upload a PDF, get a spreadsheet ready for your estimating software.
                        </p>
                        <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap' }}>
                            <Link to="/login" style={{
                                padding: '14px 32px',
                                backgroundColor: '#2E5C43',
                                color: 'white',
                                textDecoration: 'none',
                                borderRadius: '6px',
                                fontWeight: '600',
                                fontSize: '1.1rem',
                                transition: 'transform 0.2s, box-shadow 0.2s',
                                boxShadow: '0 4px 14px rgba(0,0,0,0.15)'
                            }}>
                                Get Started Free
                            </Link>
                            <a href="#how-it-works" style={{
                                padding: '14px 32px',
                                backgroundColor: 'transparent',
                                color: '#2E5C43',
                                textDecoration: 'none',
                                borderRadius: '6px',
                                fontWeight: '600',
                                fontSize: '1.1rem',
                                border: '2px solid #2E5C43'
                            }}>
                                See How It Works
                            </a>
                        </div>
                    </div>

                    {/* Hero Image */}
                    <div style={{
                        flex: '1 1 400px',
                        borderRadius: '12px',
                        overflow: 'hidden',
                        boxShadow: '0 20px 40px rgba(0,0,0,0.3)'
                    }}>
                        <img
                            src="/images/hero.jpg"
                            alt="PlanPull in action"
                            style={{
                                display: 'block',
                                width: '100%',
                                height: 'auto',
                                borderRadius: '12px'
                            }}
                        />
                    </div>
                </div>
            </section>

            {/* Problem Statement */}
            <section style={{
                padding: '80px 20px',
                backgroundColor: '#f8f9fa',
                textAlign: 'center'
            }}>
                <div style={{ maxWidth: '800px', margin: '0 auto' }}>
                    <h2 style={{ fontSize: '2rem', color: '#333', marginBottom: '30px' }}>
                        Sound Familiar?
                    </h2>
                    <div style={{ display: 'flex', gap: '30px', flexWrap: 'wrap', justifyContent: 'center' }}>
                        <ProblemCard
                            icon="⏱️"
                            title="Hours of Data Entry"
                            description="Manually typing material lists from PDFs takes 10+ minutes per project"
                        />
                        <ProblemCard
                            icon="🔢"
                            title="Costly Typos"
                            description="One wrong digit can mean overbidding—or losing money on the job"
                        />
                        <ProblemCard
                            icon="📋"
                            title="Scattered Info"
                            description="Quantities spread across tables, diagrams, and multiple pages"
                        />
                    </div>
                </div>
            </section>

            {/* How It Works */}
            <section id="how-it-works" style={{
                padding: '80px 20px',
                backgroundColor: 'white'
            }}>
                <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
                    <h2 style={{ fontSize: '2rem', color: '#333', textAlign: 'center', marginBottom: '50px' }}>
                        How It Works
                    </h2>
                    <div style={{ display: 'flex', gap: '40px', flexWrap: 'wrap', justifyContent: 'center' }}>
                        <StepCard
                            number="1"
                            title="Upload Your PDF"
                            description="Drop any plan, material list, or diagram. Multi-page PDFs work great."
                            placeholder="upload-icon.svg"
                        />
                        <StepCard
                            number="2"
                            title="Review & Edit"
                            description="AI extracts items, quantities, and units. You verify and fix anything it missed."
                            placeholder="review-icon.svg"
                        />
                        <StepCard
                            number="3"
                            title="Export to CSV"
                            description="Download formatted for HeavyBid, Excel, or your estimating software."
                            placeholder="export-icon.svg"
                        />
                    </div>
                </div>
            </section>

            {/* Features */}
            <section style={{
                padding: '80px 20px',
                backgroundColor: '#e8f5e9',
                color: '#1a3a2a',
                position: 'relative'
            }}>
                {/* Background image - subtle */}
                <div style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    opacity: 0.08,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    backgroundImage: 'url(/images/landscape-bg.jpg)'
                }} />

                <div style={{ maxWidth: '1100px', margin: '0 auto', position: 'relative', zIndex: 1 }}>
                    <h2 style={{ fontSize: '2rem', textAlign: 'center', marginBottom: '50px' }}>
                        Built for Contractors
                    </h2>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '30px' }}>
                        <FeatureCard
                            iconImage="/images/Ai_guy_transparent_face.png"
                            title="AI-Powered Extraction"
                            description="Automatically detects tables, diagrams, and annotations. No manual tagging needed."
                        />
                        <FeatureCard
                            icon="✏️"
                            title="Edit Before Export"
                            description="Click any cell to fix errors. Delete junk rows. Verify everything is correct."
                        />
                        <FeatureCard
                            icon="📊"
                            title="Consolidated View"
                            description="Group by item or area, sum quantities automatically. See totals at a glance."
                        />
                        <FeatureCard
                            icon="📄"
                            title="Custom Export Schemas"
                            description="Format outputs for HeavyBid, B2W, Excel—or create your own template."
                        />
                    </div>
                </div>
            </section>

            {/* Social Proof / Who It's For */}
            <section style={{
                padding: '80px 20px',
                backgroundColor: 'white'
            }}>
                <div style={{ maxWidth: '1000px', margin: '0 auto', display: 'flex', alignItems: 'center', gap: '60px', flexWrap: 'wrap' }}>
                    {/* Contractor Image */}
                    <div style={{
                        flex: '1 1 400px',
                        minHeight: '300px',
                        borderRadius: '12px',
                        overflow: 'hidden',
                        boxShadow: '0 10px 30px rgba(0,0,0,0.15)'
                    }}>
                        <img
                            src="/images/contractor.jpg"
                            alt="Contractor using PlanPull"
                            style={{
                                width: '100%',
                                height: '100%',
                                objectFit: 'cover',
                                borderRadius: '12px'
                            }}
                        />
                    </div>

                    <div style={{ flex: '1 1 400px' }}>
                        <h2 style={{ fontSize: '2rem', color: '#333', marginBottom: '20px' }}>
                            Made for Professionals Like You
                        </h2>
                        <p style={{ color: '#666', lineHeight: '1.7', marginBottom: '20px' }}>
                            Whether you're a solo contractor or running a crew, PlanPull saves you hours
                            every month on takeoffs.
                        </p>
                        <ul style={{ color: '#666', lineHeight: '2', paddingLeft: '20px' }}>
                            <li>Works with Bluebeam, PDF plans, hand-drawn diagrams</li>
                            <li>Exports ready for HeavyBid, B2W, Excel</li>
                            <li>No training required—upload and go</li>
                        </ul>
                    </div>
                </div>
            </section>

            {/* Pricing Preview */}
            <section style={{
                padding: '80px 20px',
                backgroundColor: '#f8f9fa',
                textAlign: 'center'
            }}>
                <div style={{ maxWidth: '600px', margin: '0 auto' }}>
                    <h2 style={{ fontSize: '2rem', color: '#333', marginBottom: '10px' }}>
                        Simple, Transparent Pricing
                    </h2>
                    <p style={{ color: '#666', marginBottom: '40px' }}>
                        One plan. Everything included. No surprises.
                    </p>

                    <div style={{
                        backgroundColor: 'white',
                        borderRadius: '12px',
                        padding: '40px',
                        boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
                        border: '2px solid #2E5C43'
                    }}>
                        <div style={{ fontSize: '1rem', color: '#2E5C43', fontWeight: '600', marginBottom: '10px' }}>
                            PROFESSIONAL
                        </div>
                        <div style={{ fontSize: '3rem', fontWeight: '700', color: '#333' }}>
                            $50<span style={{ fontSize: '1.2rem', fontWeight: '400', color: '#666' }}>/month</span>
                        </div>
                        <ul style={{
                            listStyle: 'none',
                            padding: '30px 0',
                            margin: 0,
                            borderTop: '1px solid #eee',
                            borderBottom: '1px solid #eee',
                            marginTop: '20px'
                        }}>
                            <PricingFeature text="Unlimited PDF extractions" />
                            <PricingFeature text="Multi-page document support" />
                            <PricingFeature text="Custom export schemas" />
                            <PricingFeature text="Consolidated quantity views" />
                            <PricingFeature text="Email support" />
                        </ul>
                        <Link to="/pricing" style={{
                            display: 'inline-block',
                            marginTop: '20px',
                            padding: '14px 40px',
                            backgroundColor: '#2E5C43',
                            color: 'white',
                            textDecoration: 'none',
                            borderRadius: '6px',
                            fontWeight: '600',
                            fontSize: '1.1rem'
                        }}>
                            Start Free Trial
                        </Link>
                    </div>
                </div>
            </section>

            {/* Final CTA */}
            <section style={{
                padding: '80px 20px',
                backgroundColor: '#1a3a2a',
                color: 'white',
                textAlign: 'center'
            }}>
                <div style={{ maxWidth: '600px', margin: '0 auto' }}>
                    <h2 style={{ fontSize: '2.5rem', marginBottom: '20px' }}>
                        Ready to Save Hours Every Month?
                    </h2>
                    <p style={{ fontSize: '1.2rem', opacity: 0.9, marginBottom: '30px' }}>
                        Join contractors who've stopped typing and started estimating.
                    </p>
                    <Link to="/login" style={{
                        display: 'inline-block',
                        padding: '16px 48px',
                        backgroundColor: 'white',
                        color: '#1a3a2a',
                        textDecoration: 'none',
                        borderRadius: '6px',
                        fontWeight: '600',
                        fontSize: '1.2rem',
                        boxShadow: '0 4px 14px rgba(0,0,0,0.3)'
                    }}>
                        Get Started Now
                    </Link>
                </div>
            </section>

        </div>
    );
};

// Component: Problem Card
const ProblemCard = ({ icon, title, description }) => (
    <div style={{
        flex: '1 1 200px',
        maxWidth: '250px',
        padding: '25px',
        backgroundColor: 'white',
        borderRadius: '8px',
        boxShadow: '0 2px 10px rgba(0,0,0,0.08)'
    }}>
        <div style={{ fontSize: '2.5rem', marginBottom: '15px' }}>{icon}</div>
        <h3 style={{ fontSize: '1.1rem', color: '#333', marginBottom: '10px' }}>{title}</h3>
        <p style={{ color: '#666', fontSize: '0.95rem', margin: 0, lineHeight: '1.5' }}>{description}</p>
    </div>
);

// Component: Step Card
const StepCard = ({ number, title, description, placeholder }) => (
    <div style={{
        flex: '1 1 250px',
        maxWidth: '300px',
        textAlign: 'center'
    }}>
        {/* Icon placeholder */}
        <div style={{
            width: '80px',
            height: '80px',
            margin: '0 auto 20px',
            backgroundColor: '#e8f5e9',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            border: '3px solid #2E5C43'
        }}>
            {/* Replace with icon image */}
            <span style={{ fontSize: '2rem', color: '#2E5C43', fontWeight: '700' }}>{number}</span>
        </div>
        <h3 style={{ fontSize: '1.25rem', color: '#333', marginBottom: '10px' }}>{title}</h3>
        <p style={{ color: '#666', fontSize: '0.95rem', margin: 0, lineHeight: '1.6' }}>{description}</p>
    </div>
);

// Component: Feature Card
const FeatureCard = ({ icon, iconImage, title, description }) => (
    <div style={{
        padding: '30px',
        backgroundColor: 'white',
        borderRadius: '8px',
        boxShadow: '0 2px 10px rgba(0,0,0,0.08)',
        textAlign: 'center'
    }}>
        <div style={{ fontSize: '2.5rem', marginBottom: '15px', height: '50px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {iconImage ? (
                <img src={iconImage} alt="" style={{ height: '50px', width: 'auto' }} />
            ) : (
                icon
            )}
        </div>
        <h3 style={{ fontSize: '1.2rem', marginBottom: '10px', color: '#1a3a2a' }}>{title}</h3>
        <p style={{ color: '#555', fontSize: '0.95rem', margin: 0, lineHeight: '1.6' }}>{description}</p>
    </div>
);

// Component: Pricing Feature
const PricingFeature = ({ text }) => (
    <li style={{
        padding: '8px 0',
        color: '#555',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '10px'
    }}>
        <span style={{ color: '#2E5C43' }}>✓</span> {text}
    </li>
);

export default Landing;

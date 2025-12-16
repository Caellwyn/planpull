import React from 'react';
import { Link } from 'react-router-dom';

const Help = () => {
    return (
        <div style={{
            maxWidth: '800px',
            margin: '0 auto',
            padding: '2rem 1.5rem',
            lineHeight: '1.6'
        }}>
            <h1 style={{ color: '#2E5C43', marginBottom: '0.5rem' }}>How to Use PlanPull</h1>
            <p style={{ color: '#666', marginBottom: '2rem', fontSize: '1.1rem' }}>
                Extract material lists from your PDFs in three steps.
            </p>

            {/* Quick Start */}
            <Section title="Quick Start">
                <Step number="1" title="Upload your PDF">
                    Drop your file into the upload area on the <Link to="/app" style={{ color: '#2E5C43' }}>Dashboard</Link>.
                    Works best with material lists, quantity tables, and annotated plans.
                    Maximum file size is 25MB.
                </Step>

                <Step number="2" title="Review the results">
                    Your materials appear in a table. The AI extracts item names, quantities,
                    units, and areas when it can find them. Click any cell to fix mistakes,
                    then check off rows as you verify them.
                </Step>

                <Step number="3" title="Export to CSV">
                    Click the Export button to download your data. Open it in Excel or
                    import directly into your estimating software.
                </Step>

                <Tip>
                    Extraction typically takes 5-15 seconds depending on the number of pages.
                </Tip>
            </Section>

            {/* Working with Results */}
            <Section title="Working with Your Data">
                <SubSection title="Editing cells">
                    Click any cell to edit it directly. The AI does its best, but it's not
                    perfect — always review quantities before using them in a bid.
                </SubSection>

                <SubSection title="Deleting rows">
                    If the AI pulled in something that isn't a material (like a title row or note),
                    check the box on the left side of that row, then click "Delete Selected."
                </SubSection>

                <SubSection title="Detail view vs. Consolidated view">
                    <strong>Detail</strong> shows every line item exactly as extracted —
                    this is where you edit and verify. <strong>Consolidated</strong> groups
                    identical items and totals the quantities — useful for getting a quick
                    summary. Use the toggle buttons above the table to switch views.
                </SubSection>

                <SubSection title="Combining multiple PDFs">
                    Have several PDFs for the same project? After your first extraction,
                    click "+ Add Pages" instead of starting over. The new items get added
                    to your existing list with row numbers that continue automatically.
                </SubSection>
            </Section>

            {/* Export Schemas */}
            <Section title="Custom Export Formats">
                <p>
                    By default, the export includes whatever columns are visible in your table.
                    If you need a specific format for your estimating software, you can create
                    a custom schema.
                </p>
                <p>
                    A schema lets you choose which columns to include, rename them to match
                    what your software expects, and set the column order. Create schemas on
                    the <Link to="/app/schemas" style={{ color: '#2E5C43' }}>Schemas</Link> page,
                    then select one from the dropdown on the Dashboard before exporting.
                </p>
            </Section>

            {/* Account */}
            <Section title="Your Account">
                <p>
                    Visit the <Link to="/app/account" style={{ color: '#2E5C43' }}>Account</Link> page
                    to check your usage, see your renewal date, and manage your subscription.
                </p>
                <p>
                    Usage is based on PDF pages processed — a 10-page PDF counts as 10 pages,
                    regardless of how many items are extracted. Your page count resets at the
                    start of each billing cycle. If you're running low, you'll see a warning
                    before hitting your limit.
                </p>
            </Section>

            {/* Troubleshooting */}
            <Section title="Common Questions">
                <FAQ question="Why is extraction taking so long?">
                    Large PDFs (10+ pages) can take 20-30 seconds. If it times out,
                    try splitting the PDF into smaller chunks and using "+ Add Pages"
                    to combine them.
                </FAQ>

                <FAQ question="Why are some items missing?">
                    The AI looks for materials with quantities. It intentionally skips
                    decorative text, section headers, and general notes. If something
                    important is missing, the PDF may need clearer formatting.
                </FAQ>

                <FAQ question="Why do similar items show up separately in Consolidated view?">
                    Items are grouped by exact name. "Red Mulch" and "RED MULCH" or
                    "River Rock" and "River Rock " (with a trailing space) are treated
                    as different items. Fix the spelling in Detail view and they'll combine.
                </FAQ>

                <FAQ question="What if a quantity is wrong?">
                    Click the cell and fix it. The AI reads what's on the page, but
                    handwriting, unusual fonts, or low-quality scans can cause errors.
                    Always double-check before using numbers in an estimate.
                </FAQ>

                <FAQ question="Can I undo changes?">
                    There's no undo button — if you make a mistake, you can re-upload
                    the PDF and start fresh. Your exported CSVs are saved to your computer,
                    so you won't lose completed work.
                </FAQ>
            </Section>

            {/* Contact */}
            <div style={{
                marginTop: '3rem',
                padding: '1.5rem',
                backgroundColor: '#f8f9fa',
                borderRadius: '8px'
            }}>
                <p style={{ margin: 0, color: '#666', textAlign: 'center' }}>
                    Questions? Email us at{' '}
                    <a href="mailto:support@planpull.com" style={{ color: '#2E5C43' }}>
                        support@planpull.com
                    </a>
                </p>
            </div>

            {/* Back to Dashboard */}
            <div style={{ marginTop: '2rem', textAlign: 'center' }}>
                <Link
                    to="/app"
                    style={{
                        color: '#2E5C43',
                        fontWeight: '500',
                        textDecoration: 'none'
                    }}
                >
                    ← Back to Dashboard
                </Link>
            </div>
        </div>
    );
};

// Section wrapper
const Section = ({ title, children }) => (
    <section style={{ marginBottom: '2.5rem' }}>
        <h2 style={{
            color: '#333',
            fontSize: '1.35rem',
            marginBottom: '1rem',
            paddingBottom: '0.5rem',
            borderBottom: '2px solid #e8f5e9'
        }}>
            {title}
        </h2>
        <div style={{ color: '#444' }}>
            {children}
        </div>
    </section>
);

// Numbered step for Quick Start
const Step = ({ number, title, children }) => (
    <div style={{
        display: 'flex',
        gap: '1rem',
        marginBottom: '1.25rem',
        alignItems: 'flex-start'
    }}>
        <div style={{
            width: '32px',
            height: '32px',
            borderRadius: '50%',
            backgroundColor: '#2E5C43',
            color: 'white',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: '600',
            flexShrink: 0,
            marginTop: '2px'
        }}>
            {number}
        </div>
        <div style={{ flex: 1 }}>
            <strong style={{ color: '#333' }}>{title}</strong>
            <p style={{ margin: '0.25rem 0 0 0', color: '#555' }}>{children}</p>
        </div>
    </div>
);

// Tip callout
const Tip = ({ children }) => (
    <div style={{
        backgroundColor: '#e8f5e9',
        borderLeft: '4px solid #2E5C43',
        padding: '12px 16px',
        borderRadius: '0 4px 4px 0',
        marginTop: '0.5rem',
        color: '#2E5C43',
        fontSize: '0.95rem'
    }}>
        {children}
    </div>
);

// Subsection with title
const SubSection = ({ title, children }) => (
    <div style={{ marginBottom: '1.25rem' }}>
        <h4 style={{
            margin: '0 0 0.35rem 0',
            color: '#333',
            fontSize: '1rem',
            fontWeight: '600'
        }}>
            {title}
        </h4>
        <p style={{ margin: 0, color: '#555' }}>{children}</p>
    </div>
);

// FAQ item
const FAQ = ({ question, children }) => (
    <div style={{ marginBottom: '1.25rem' }}>
        <h4 style={{
            margin: '0 0 0.35rem 0',
            color: '#333',
            fontSize: '1rem',
            fontWeight: '600'
        }}>
            {question}
        </h4>
        <p style={{ margin: 0, color: '#555' }}>{children}</p>
    </div>
);

export default Help;

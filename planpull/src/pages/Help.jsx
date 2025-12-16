import React, { useState } from 'react';

const Help = () => {
    const [activeSection, setActiveSection] = useState('getting-started');
    const [mobileNavOpen, setMobileNavOpen] = useState(false);

    const sections = [
        { id: 'getting-started', title: 'Getting Started' },
        { id: 'uploading', title: 'Uploading PDFs' },
        { id: 'understanding-results', title: 'Understanding Results' },
        { id: 'editing', title: 'Editing & Verification' },
        { id: 'views-filtering', title: 'Views & Filtering' },
        { id: 'schemas-export', title: 'Schemas & Export' },
        { id: 'account', title: 'Account & Billing' },
        { id: 'tips', title: 'Tips & Troubleshooting' },
    ];

    const handleSectionClick = (sectionId) => {
        setActiveSection(sectionId);
        setMobileNavOpen(false);
        document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth' });
    };

    return (
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '1rem' }}>
            {/* Mobile Navigation Dropdown */}
            <div className="mobile-nav" style={{ marginBottom: '1rem' }}>
                <button
                    onClick={() => setMobileNavOpen(!mobileNavOpen)}
                    style={{
                        width: '100%',
                        padding: '12px 16px',
                        backgroundColor: '#e8f5e9',
                        border: '1px solid #c8e6c9',
                        borderRadius: '6px',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        cursor: 'pointer',
                        fontSize: '1rem',
                        color: '#2E5C43',
                        fontWeight: '600'
                    }}
                >
                    <span>{sections.find(s => s.id === activeSection)?.title || 'Navigate'}</span>
                    <span>{mobileNavOpen ? '▲' : '▼'}</span>
                </button>
                {mobileNavOpen && (
                    <div style={{
                        backgroundColor: 'white',
                        border: '1px solid #e0e0e0',
                        borderRadius: '6px',
                        marginTop: '4px',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                    }}>
                        {sections.map(section => (
                            <button
                                key={section.id}
                                onClick={() => handleSectionClick(section.id)}
                                style={{
                                    display: 'block',
                                    width: '100%',
                                    padding: '12px 16px',
                                    border: 'none',
                                    borderBottom: '1px solid #f0f0f0',
                                    background: activeSection === section.id ? '#e8f5e9' : 'white',
                                    color: activeSection === section.id ? '#2E5C43' : '#666',
                                    fontWeight: activeSection === section.id ? '600' : '400',
                                    textAlign: 'left',
                                    cursor: 'pointer',
                                    fontSize: '0.95rem'
                                }}
                            >
                                {section.title}
                            </button>
                        ))}
                    </div>
                )}
            </div>

            <div className="help-container" style={{ display: 'flex', gap: '2rem' }}>
                {/* Desktop Sidebar Navigation */}
                <nav className="desktop-sidebar" style={{
                    width: '220px',
                    flexShrink: 0,
                    position: 'sticky',
                    top: '2rem',
                    height: 'fit-content'
                }}>
                    <h3 style={{ margin: '0 0 1rem', color: '#2E5C43' }}>User Guide</h3>
                    <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                        {sections.map(section => (
                            <li key={section.id}>
                                <button
                                    onClick={() => handleSectionClick(section.id)}
                                    style={{
                                        display: 'block',
                                        width: '100%',
                                        padding: '8px 12px',
                                        border: 'none',
                                        background: activeSection === section.id ? '#e8f5e9' : 'transparent',
                                        color: activeSection === section.id ? '#2E5C43' : '#666',
                                        fontWeight: activeSection === section.id ? '600' : '400',
                                        textAlign: 'left',
                                        cursor: 'pointer',
                                        borderRadius: '4px',
                                        marginBottom: '4px',
                                        fontSize: '0.95rem'
                                    }}
                                >
                                    {section.title}
                                </button>
                            </li>
                        ))}
                    </ul>
                </nav>

                {/* Main Content */}
                <main style={{ flex: 1, minWidth: 0 }}>
                <h1 style={{ color: '#333', marginTop: 0 }}>PlanPull User Guide</h1>
                <p style={{ color: '#666', fontSize: '1.1rem', marginBottom: '2rem' }}>
                    Learn how to extract material quantities from your landscaping PDFs and export them for your estimating software.
                </p>

                {/* Getting Started */}
                <Section id="getting-started" title="Getting Started">
                    <h4>The Happy Path: Your First Extraction</h4>
                    <ol>
                        <li><strong>Sign in</strong> with your Google account or email/password</li>
                        <li><strong>Subscribe</strong> to a plan from the Pricing page (if you haven't already)</li>
                        <li><strong>Go to Dashboard</strong> - this is your main workspace</li>
                        <li><strong>Drop a PDF</strong> into the upload area (or click to browse)</li>
                        <li><strong>Wait for extraction</strong> - usually 5-15 seconds depending on page count</li>
                        <li><strong>Review the results</strong> in the data grid</li>
                        <li><strong>Verify rows</strong> by checking the checkbox on the right</li>
                        <li><strong>Export to CSV</strong> using the export button at the top</li>
                    </ol>
                    <Tip>
                        The extraction uses AI to identify material items and quantities. Always verify the results before using them in your estimates.
                    </Tip>
                </Section>

                {/* Uploading PDFs */}
                <Section id="uploading" title="Uploading PDFs">
                    <h4>Supported Files</h4>
                    <ul>
                        <li>PDF files up to 25MB</li>
                        <li>Single or multi-page documents</li>
                        <li>Works with tables, material lists, and annotated diagrams</li>
                    </ul>

                    <h4>New Extraction vs. Add Pages</h4>
                    <p>After your first extraction, you have two options:</p>
                    <ul>
                        <li><strong>Start New Extraction</strong> - Clears current results and starts fresh</li>
                        <li><strong>+ Add Pages</strong> - Appends new items to your existing extraction (great for multi-file projects)</li>
                    </ul>
                    <Tip>
                        Use "Add Pages" when you have multiple PDFs for the same project. Row numbers will automatically continue from where you left off.
                    </Tip>

                    <h4>What Gets Extracted</h4>
                    <p>The AI looks for:</p>
                    <ul>
                        <li><strong>Item names</strong> - Plant names, materials, products</li>
                        <li><strong>Quantities</strong> - Numeric values</li>
                        <li><strong>Units</strong> - ea, sf, cy, lf, etc.</li>
                        <li><strong>Areas/Zones</strong> - Location labels if present</li>
                        <li><strong>Page numbers</strong> - Which page each item came from</li>
                    </ul>
                </Section>

                {/* Understanding Results */}
                <Section id="understanding-results" title="Understanding Results">
                    <h4>The Data Grid</h4>
                    <p>After extraction, your data appears in an interactive grid with these columns:</p>
                    <ul>
                        <li><strong>#</strong> - Row number (for reference)</li>
                        <li><strong>Item</strong> - The material or plant name</li>
                        <li><strong>Qty</strong> - Quantity extracted</li>
                        <li><strong>Unit</strong> - Unit of measure</li>
                        <li><strong>Area</strong> - Zone or location (if detected)</li>
                        <li><strong>Page</strong> - Source page number</li>
                        <li><strong>Checkmark</strong> - Verification status</li>
                    </ul>

                    <h4>Two View Modes</h4>
                    <p>Toggle between views using the buttons at the top of the results:</p>
                    <ul>
                        <li><strong>Detail View</strong> - Shows every extracted row, fully editable</li>
                        <li><strong>Consolidated View</strong> - Groups items and sums quantities</li>
                    </ul>
                    <Tip>
                        Consolidated view groups by both Item AND Unit. So "Gravel (lb)" and "Gravel (cy)" stay separate - they won't be incorrectly combined.
                    </Tip>
                </Section>

                {/* Editing & Verification */}
                <Section id="editing" title="Editing & Verification">
                    <h4>Editing Cells</h4>
                    <p>Click any cell in Detail view to edit it directly:</p>
                    <ul>
                        <li>Fix typos in item names</li>
                        <li>Correct quantities</li>
                        <li>Update units or areas</li>
                    </ul>
                    <p>Changes are reflected immediately in the Consolidated view.</p>

                    <h4>Verification Workflow</h4>
                    <p>The checkmark column helps you track which rows you've reviewed:</p>
                    <ol>
                        <li>Click individual checkboxes to verify row-by-row</li>
                        <li>Or use <strong>Select All</strong> then <strong>Verify Selected</strong> for bulk verification</li>
                    </ol>

                    <h4>Selecting & Deleting Rows</h4>
                    <ul>
                        <li>Click the checkbox on the left of any row to select it</li>
                        <li>Use <strong>Select All</strong> / <strong>Deselect All</strong> buttons</li>
                        <li><strong>Delete Selected</strong> removes unwanted rows (with confirmation)</li>
                    </ul>
                    <Tip>
                        If the AI extracted something that isn't a material (like a header row or note), just select it and delete it.
                    </Tip>
                </Section>

                {/* Views & Filtering */}
                <Section id="views-filtering" title="Views & Filtering">
                    <h4>Row Number Filter</h4>
                    <p>Filter to specific rows using the text input:</p>
                    <ul>
                        <li><code>5</code> - Show only row 5</li>
                        <li><code>1-10</code> - Show rows 1 through 10</li>
                        <li><code>5, 10-15, 20</code> - Show rows 5, 10-15, and 20</li>
                    </ul>
                    <p>Click <strong>Apply</strong> to filter, <strong>Clear</strong> to reset.</p>

                    <h4>Column Visibility</h4>
                    <p>Use the <strong>Columns</strong> dropdown to show/hide columns. Hidden columns won't appear in exports.</p>

                    <h4>Column Filters</h4>
                    <p>Click the filter icon in any column header to filter by content:</p>
                    <ul>
                        <li>Text columns: contains, equals, starts with</li>
                        <li>Number columns: equals, greater than, less than</li>
                    </ul>

                    <h4>Consolidated View Options</h4>
                    <p>When in Consolidated view, use the <strong>Group by</strong> dropdown to change how items are grouped:</p>
                    <ul>
                        <li><strong>Item</strong> - Group by material name (default)</li>
                        <li><strong>Area</strong> - Group by location/zone</li>
                        <li><strong>Unit</strong> - Group by unit of measure</li>
                    </ul>
                </Section>

                {/* Schemas & Export */}
                <Section id="schemas-export" title="Schemas & Export">
                    <h4>What Are Schemas?</h4>
                    <p>Schemas define how your data is formatted when exported. They control:</p>
                    <ul>
                        <li>Which columns are included</li>
                        <li>What the column headers are named</li>
                        <li>The order of columns</li>
                    </ul>

                    <h4>System Schemas</h4>
                    <p>PlanPull includes pre-built schemas:</p>
                    <ul>
                        <li><strong>HeavyBid</strong> - Formatted for HeavyBid import</li>
                        <li><strong>Simple List</strong> - Just Item and Quantity</li>
                        <li><strong>Full Detail</strong> - All columns included</li>
                    </ul>

                    <h4>Creating Custom Schemas</h4>
                    <ol>
                        <li>Go to <strong>Schemas</strong> in the navigation</li>
                        <li>Click <strong>Create New Schema</strong></li>
                        <li>Name it and optionally note the target software</li>
                        <li>Check which columns to include</li>
                        <li>Rename column headers as needed</li>
                        <li>Drag to reorder columns</li>
                        <li>Save your schema</li>
                    </ol>
                    <Tip>
                        You can duplicate a system schema and modify it to create your own version.
                    </Tip>

                    <h4>Exporting</h4>
                    <p>The export controls are at the top of the results area:</p>
                    <ol>
                        <li>Select a schema from the dropdown (or leave as "visible columns")</li>
                        <li>Click <strong>Export CSV</strong></li>
                        <li>The file downloads with your data formatted per the schema</li>
                    </ol>
                    <p>Export respects:</p>
                    <ul>
                        <li>Current view mode (Detail or Consolidated)</li>
                        <li>Active filters (only visible rows are exported)</li>
                        <li>Selected schema column configuration</li>
                    </ul>
                </Section>

                {/* Account & Billing */}
                <Section id="account" title="Account & Billing">
                    <h4>Viewing Your Usage</h4>
                    <p>Go to <strong>Account</strong> in the navigation to see:</p>
                    <ul>
                        <li>Your current plan</li>
                        <li>Pages used this billing period</li>
                        <li>Subscription renewal date</li>
                    </ul>

                    <h4>Managing Your Subscription</h4>
                    <p>Click <strong>Manage Billing</strong> to access Stripe's customer portal where you can:</p>
                    <ul>
                        <li>Update payment method</li>
                        <li>View billing history</li>
                        <li>Cancel subscription</li>
                    </ul>

                    <h4>Page Counting</h4>
                    <p>Usage is counted by PDF pages processed:</p>
                    <ul>
                        <li>A 5-page PDF counts as 5 pages</li>
                        <li>Pages are counted even if no items are found</li>
                        <li>Usage resets each billing cycle</li>
                    </ul>
                </Section>

                {/* Tips & Troubleshooting */}
                <Section id="tips" title="Tips & Troubleshooting">
                    <h4>Best Practices</h4>
                    <ul>
                        <li><strong>Use clear PDFs</strong> - Higher quality scans give better results</li>
                        <li><strong>Check unusual items</strong> - AI may misread handwriting or unusual fonts</li>
                        <li><strong>Verify quantities</strong> - Double-check numbers, especially large ones</li>
                        <li><strong>Use Add Pages</strong> - For multi-file projects, add pages instead of starting over</li>
                    </ul>

                    <h4>Common Issues</h4>

                    <h5>Extraction taking too long?</h5>
                    <p>Large PDFs (10+ pages) may take 15-30 seconds. If it fails, try splitting the PDF into smaller chunks.</p>

                    <h5>Missing items?</h5>
                    <p>The AI focuses on material quantities. Decorative text, headers, or notes may be skipped. This is usually correct behavior.</p>

                    <h5>Wrong quantities?</h5>
                    <p>Click the cell and correct it directly. The AI does its best but isn't perfect - that's why verification exists.</p>

                    <h5>Items combined incorrectly?</h5>
                    <p>In Consolidated view, items are grouped by name AND unit. If you see incorrect grouping, check for slight name variations in Detail view.</p>

                    <h5>Export not working?</h5>
                    <p>Make sure you have data in the grid and check your browser's download settings. Try a different browser if issues persist.</p>

                    <h4>Need More Help?</h4>
                    <p>Contact us at <a href="mailto:support@planpull.com" style={{ color: '#2E5C43' }}>support@planpull.com</a></p>
                </Section>
            </main>
            </div>

            <style>{`
                @media (max-width: 768px) {
                    .desktop-sidebar {
                        display: none !important;
                    }
                    .mobile-nav {
                        display: block !important;
                    }
                }
                @media (min-width: 769px) {
                    .mobile-nav {
                        display: none !important;
                    }
                    .desktop-sidebar {
                        display: block !important;
                    }
                }
            `}</style>
        </div>
    );
};

// Reusable Section component
const Section = ({ id, title, children }) => (
    <section id={id} style={{ marginBottom: '3rem', scrollMarginTop: '2rem' }}>
        <h2 style={{
            color: '#2E5C43',
            borderBottom: '2px solid #e0e0e0',
            paddingBottom: '0.5rem',
            marginBottom: '1rem'
        }}>
            {title}
        </h2>
        <div style={{ color: '#444', lineHeight: '1.7' }}>
            {children}
        </div>
    </section>
);

// Tip callout component
const Tip = ({ children }) => (
    <div style={{
        backgroundColor: '#e8f5e9',
        border: '1px solid #c8e6c9',
        borderLeft: '4px solid #2E5C43',
        padding: '12px 16px',
        borderRadius: '4px',
        margin: '1rem 0',
        fontSize: '0.95rem'
    }}>
        <strong style={{ color: '#2E5C43' }}>Tip:</strong> {children}
    </div>
);

export default Help;

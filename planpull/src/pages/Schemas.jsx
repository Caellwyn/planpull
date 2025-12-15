import React, { useState, useEffect } from 'react';
import { collection, query, where, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from '../services/firebase';
import { useAuth } from '../contexts/AuthContext';
import SchemaEditor from '../components/schemas/SchemaEditor';

const Schemas = () => {
  const { currentUser } = useAuth();
  const [schemas, setSchemas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingSchema, setEditingSchema] = useState(null); // null = list view, 'new' = new schema, schema object = editing
  const [activeTab, setActiveTab] = useState('all'); // 'all' | 'system' | 'custom'

  useEffect(() => {
    // Subscribe to schemas collection
    const schemasRef = collection(db, 'schemas');

    // Get system schemas and user's custom schemas
    const unsubscribe = onSnapshot(
      schemasRef,
      (snapshot) => {
        const allSchemas = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));

        // Filter to system schemas + user's schemas
        const filtered = allSchemas.filter(s =>
          s.scope === 'system' || s.ownerId === currentUser?.uid
        );

        // Sort: system first, then by name
        filtered.sort((a, b) => {
          if (a.scope === 'system' && b.scope !== 'system') return -1;
          if (a.scope !== 'system' && b.scope === 'system') return 1;
          return a.name.localeCompare(b.name);
        });

        setSchemas(filtered);
        setLoading(false);
      },
      (error) => {
        console.error('Error fetching schemas:', error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [currentUser]);

  const filteredSchemas = schemas.filter(schema => {
    if (activeTab === 'system') return schema.scope === 'system';
    if (activeTab === 'custom') return schema.scope !== 'system';
    return true;
  });

  const handleCreateNew = () => {
    setEditingSchema('new');
  };

  const handleEdit = (schema) => {
    if (schema.scope === 'system') {
      // Can't edit system schemas, but can duplicate
      alert('System schemas cannot be edited. Use "Duplicate" to create your own version.');
      return;
    }
    setEditingSchema(schema);
  };

  const handleDuplicate = (schema) => {
    // Create a copy for editing as new
    setEditingSchema({
      ...schema,
      id: null, // Will be treated as new
      name: `${schema.name} (Copy)`,
      scope: 'user',
      ownerId: currentUser?.uid
    });
  };

  const handleEditorClose = () => {
    setEditingSchema(null);
  };

  if (editingSchema) {
    return (
      <SchemaEditor
        schema={editingSchema === 'new' ? null : editingSchema}
        onClose={handleEditorClose}
      />
    );
  }

  if (loading) {
    return (
      <div className="container" style={{ padding: '2rem', maxWidth: '1000px', margin: '0 auto' }}>
        <p>Loading schemas...</p>
      </div>
    );
  }

  return (
    <div className="container" style={{ padding: '2rem', maxWidth: '1000px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h1 style={{ margin: 0, color: '#333' }}>Export Schemas</h1>
        <button onClick={handleCreateNew} className="btn-primary">
          + Create Schema
        </button>
      </div>

      <p style={{ color: '#666', marginBottom: '1.5rem' }}>
        Schemas define how your extracted data is formatted when exported. Create custom schemas to match your estimating software.
      </p>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '0', marginBottom: '1.5rem', borderBottom: '1px solid #ddd' }}>
        {['all', 'system', 'custom'].map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{
              padding: '10px 20px',
              border: 'none',
              background: 'none',
              borderBottom: activeTab === tab ? '2px solid #2E5C43' : '2px solid transparent',
              color: activeTab === tab ? '#2E5C43' : '#666',
              fontWeight: activeTab === tab ? '600' : '400',
              cursor: 'pointer',
              textTransform: 'capitalize'
            }}
          >
            {tab === 'all' ? 'All Schemas' : tab === 'system' ? 'System' : 'My Schemas'}
          </button>
        ))}
      </div>

      {/* Schema List */}
      {filteredSchemas.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
          <p style={{ color: '#666', marginBottom: '1rem' }}>
            {activeTab === 'custom'
              ? "You haven't created any custom schemas yet."
              : "No schemas found."}
          </p>
          {activeTab === 'custom' && (
            <button onClick={handleCreateNew} className="btn-primary">
              Create Your First Schema
            </button>
          )}
        </div>
      ) : (
        <div style={{ display: 'grid', gap: '1rem' }}>
          {filteredSchemas.map(schema => (
            <div
              key={schema.id}
              className="card"
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '1rem 1.5rem'
              }}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
                  <h3 style={{ margin: 0, color: '#333' }}>{schema.name}</h3>
                  {schema.scope === 'system' && (
                    <span style={{
                      fontSize: '0.75rem',
                      padding: '2px 8px',
                      backgroundColor: '#e3f2fd',
                      color: '#1565c0',
                      borderRadius: '10px'
                    }}>
                      System
                    </span>
                  )}
                </div>
                <p style={{ margin: 0, color: '#666', fontSize: '0.9rem' }}>
                  {schema.description || 'No description'}
                </p>
                <p style={{ margin: '4px 0 0 0', color: '#888', fontSize: '0.85rem' }}>
                  {schema.columns?.filter(c => c.include).length || 0} columns
                  {schema.targetSoftware && ` • ${schema.targetSoftware}`}
                </p>
              </div>

              <div style={{ display: 'flex', gap: '8px' }}>
                {schema.scope === 'system' ? (
                  <button
                    onClick={() => handleDuplicate(schema)}
                    className="btn-secondary"
                    style={{ fontSize: '0.9rem' }}
                  >
                    Duplicate
                  </button>
                ) : (
                  <>
                    <button
                      onClick={() => handleEdit(schema)}
                      className="btn-secondary"
                      style={{ fontSize: '0.9rem' }}
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDuplicate(schema)}
                      className="btn-secondary"
                      style={{ fontSize: '0.9rem' }}
                    >
                      Duplicate
                    </button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Schemas;

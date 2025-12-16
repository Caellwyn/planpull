import React, { useState, useEffect } from 'react';
import { collection, onSnapshot } from 'firebase/firestore';
import { db } from '../services/firebase';
import { useAuth } from '../contexts/AuthContext';
import SchemaEditor from '../components/schemas/SchemaEditor';

const Schemas = () => {
  const { currentUser } = useAuth();
  const [schemas, setSchemas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingSchema, setEditingSchema] = useState(null); // null = list view, 'new' = new schema, schema object = editing

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

        // Filter to user's schemas only (system schemas temporarily disabled)
        const filtered = allSchemas.filter(s =>
          s.ownerId === currentUser?.uid
        );

        // Sort by name
        filtered.sort((a, b) => a.name.localeCompare(b.name));

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

  const handleCreateNew = () => {
    setEditingSchema('new');
  };

  const handleEdit = (schema) => {
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

      {/* Tabs - hidden while system schemas are disabled */}

      {/* Schema List */}
      {schemas.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
          <p style={{ color: '#666', marginBottom: '1rem' }}>
            You haven't created any schemas yet.
          </p>
          <button onClick={handleCreateNew} className="btn-primary">
            Create Your First Schema
          </button>
        </div>
      ) : (
        <div style={{ display: 'grid', gap: '1rem' }}>
          {schemas.map(schema => (
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
                <h3 style={{ margin: 0, marginBottom: '4px', color: '#333' }}>{schema.name}</h3>
                <p style={{ margin: 0, color: '#666', fontSize: '0.9rem' }}>
                  {schema.description || 'No description'}
                </p>
                <p style={{ margin: '4px 0 0 0', color: '#888', fontSize: '0.85rem' }}>
                  {schema.columns?.filter(c => c.include).length || 0} columns
                  {schema.targetSoftware && ` • ${schema.targetSoftware}`}
                </p>
              </div>

              <div style={{ display: 'flex', gap: '8px' }}>
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
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Schemas;

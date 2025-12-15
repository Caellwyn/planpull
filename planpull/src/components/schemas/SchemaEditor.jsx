import React, { useState } from 'react';
import { collection, addDoc, updateDoc, deleteDoc, doc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../services/firebase';
import { useAuth } from '../../contexts/AuthContext';
import ColumnMapper from './ColumnMapper';

// Available source fields from extraction
const SOURCE_FIELDS = [
  { field: 'rowNumber', label: 'Row Number' },
  { field: 'item', label: 'Item' },
  { field: 'quantity', label: 'Quantity' },
  { field: 'unit', label: 'Unit' },
  { field: 'area', label: 'Area' },
  { field: 'page', label: 'Page' },
];

const DEFAULT_COLUMNS = SOURCE_FIELDS.map((f, i) => ({
  sourceField: f.field,
  outputName: f.label,
  include: ['item', 'quantity', 'unit'].includes(f.field), // Default include common fields
  order: i
}));

// Merge schema columns with all available source fields
const mergeWithAllFields = (schemaColumns) => {
  if (!schemaColumns) return DEFAULT_COLUMNS;

  // Start with schema columns
  const merged = [...schemaColumns];

  // Add any missing source fields
  SOURCE_FIELDS.forEach((sf, idx) => {
    const exists = merged.find(c => c.sourceField === sf.field);
    if (!exists) {
      merged.push({
        sourceField: sf.field,
        outputName: sf.label,
        include: false,
        order: merged.length + idx
      });
    }
  });

  // Re-sort by order
  merged.sort((a, b) => a.order - b.order);

  return merged;
};

const SchemaEditor = ({ schema, onClose }) => {
  const { currentUser } = useAuth();
  const isNew = !schema || !schema.id;

  const [name, setName] = useState(schema?.name || '');
  const [description, setDescription] = useState(schema?.description || '');
  const [targetSoftware, setTargetSoftware] = useState(schema?.targetSoftware || '');
  const [columns, setColumns] = useState(mergeWithAllFields(schema?.columns));
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState(null);

  const handleSave = async () => {
    // Validation
    if (!name.trim()) {
      setError('Schema name is required');
      return;
    }

    const includedColumns = columns.filter(c => c.include);
    if (includedColumns.length === 0) {
      setError('At least one column must be included');
      return;
    }

    setSaving(true);
    setError(null);

    try {
      const schemaData = {
        name: name.trim(),
        description: description.trim(),
        targetSoftware: targetSoftware.trim(),
        columns: columns,
        scope: 'user',
        ownerId: currentUser.uid,
        updatedAt: serverTimestamp()
      };

      if (isNew) {
        schemaData.createdAt = serverTimestamp();
        await addDoc(collection(db, 'schemas'), schemaData);
      } else {
        await updateDoc(doc(db, 'schemas', schema.id), schemaData);
      }

      onClose();
    } catch (err) {
      console.error('Error saving schema:', err);
      setError('Failed to save schema. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!schema?.id) return;

    if (!window.confirm(`Are you sure you want to delete "${schema.name}"? This cannot be undone.`)) {
      return;
    }

    setDeleting(true);
    setError(null);

    try {
      await deleteDoc(doc(db, 'schemas', schema.id));
      onClose();
    } catch (err) {
      console.error('Error deleting schema:', err);
      setError('Failed to delete schema. Please try again.');
      setDeleting(false);
    }
  };

  return (
    <div className="container" style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h1 style={{ margin: 0, color: '#333' }}>
          {isNew ? 'Create Schema' : 'Edit Schema'}
        </h1>
        <button
          onClick={onClose}
          style={{
            background: 'none',
            border: 'none',
            fontSize: '1.5rem',
            cursor: 'pointer',
            color: '#666'
          }}
        >
          &times;
        </button>
      </div>

      {error && (
        <div style={{
          padding: '12px 20px',
          backgroundColor: '#ffebee',
          color: '#c62828',
          borderRadius: '4px',
          marginBottom: '1rem'
        }}>
          {error}
        </div>
      )}

      <div className="card" style={{ marginBottom: '1.5rem' }}>
        <h3 style={{ marginTop: 0, color: '#2E5C43' }}>Schema Details</h3>

        <div style={{ marginBottom: '1rem' }}>
          <label style={{ display: 'block', marginBottom: '4px', fontWeight: '500' }}>
            Name <span style={{ color: '#c62828' }}>*</span>
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g., My HeavyBid Format"
            style={{
              width: '100%',
              padding: '10px',
              border: '1px solid #ddd',
              borderRadius: '4px',
              fontSize: '1rem'
            }}
          />
        </div>

        <div style={{ marginBottom: '1rem' }}>
          <label style={{ display: 'block', marginBottom: '4px', fontWeight: '500' }}>
            Description
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="What is this schema used for?"
            rows={2}
            style={{
              width: '100%',
              padding: '10px',
              border: '1px solid #ddd',
              borderRadius: '4px',
              fontSize: '1rem',
              resize: 'vertical'
            }}
          />
        </div>

        <div style={{ marginBottom: '0' }}>
          <label style={{ display: 'block', marginBottom: '4px', fontWeight: '500' }}>
            Target Software
          </label>
          <input
            type="text"
            value={targetSoftware}
            onChange={(e) => setTargetSoftware(e.target.value)}
            placeholder="e.g., HeavyBid, Excel, B2W"
            style={{
              width: '100%',
              padding: '10px',
              border: '1px solid #ddd',
              borderRadius: '4px',
              fontSize: '1rem'
            }}
          />
        </div>
      </div>

      <div className="card" style={{ marginBottom: '1.5rem' }}>
        <h3 style={{ marginTop: 0, color: '#2E5C43' }}>Column Mapping</h3>
        <p style={{ color: '#666', marginBottom: '1rem' }}>
          Select which columns to include and customize their names in the export.
        </p>
        <ColumnMapper
          columns={columns}
          sourceFields={SOURCE_FIELDS}
          onChange={setColumns}
        />
      </div>

      {/* Action Buttons */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          {!isNew && (
            <button
              onClick={handleDelete}
              disabled={deleting || saving}
              style={{
                padding: '10px 20px',
                backgroundColor: 'transparent',
                color: '#c62828',
                border: '1px solid #c62828',
                borderRadius: '4px',
                cursor: deleting ? 'not-allowed' : 'pointer',
                opacity: deleting ? 0.6 : 1
              }}
            >
              {deleting ? 'Deleting...' : 'Delete Schema'}
            </button>
          )}
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            onClick={onClose}
            disabled={saving || deleting}
            className="btn-secondary"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving || deleting}
            className="btn-primary"
          >
            {saving ? 'Saving...' : isNew ? 'Create Schema' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default SchemaEditor;

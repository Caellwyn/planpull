#!/usr/bin/env python3
"""
Seed system schemas into Firestore.

Run from project root:
    python scripts/seed_schemas.py

Requires:
    pip install firebase-admin

Set GOOGLE_APPLICATION_CREDENTIALS or use Firebase Admin default credentials.
"""

import firebase_admin
from firebase_admin import credentials, firestore

# Initialize Firebase Admin
firebase_admin.initialize_app()
db = firestore.client()

# System schemas - these are available to all users
SYSTEM_SCHEMAS = [
    {
        "name": "HeavyBid",
        "description": "Export format compatible with HCSS HeavyBid estimating software",
        "targetSoftware": "HeavyBid",
        "scope": "system",
        "columns": [
            {"sourceField": "item", "outputName": "Material Description", "include": True, "order": 0},
            {"sourceField": "quantity", "outputName": "Quantity", "include": True, "order": 1},
            {"sourceField": "unit", "outputName": "Unit", "include": True, "order": 2},
        ]
    },
    {
        "name": "Simple List",
        "description": "Basic two-column export with item and quantity",
        "targetSoftware": "Generic",
        "scope": "system",
        "columns": [
            {"sourceField": "item", "outputName": "Item", "include": True, "order": 0},
            {"sourceField": "quantity", "outputName": "Qty", "include": True, "order": 1},
        ]
    },
    {
        "name": "Full Detail",
        "description": "Complete export with all available fields",
        "targetSoftware": "Generic",
        "scope": "system",
        "columns": [
            {"sourceField": "rowNumber", "outputName": "#", "include": True, "order": 0},
            {"sourceField": "item", "outputName": "Item", "include": True, "order": 1},
            {"sourceField": "quantity", "outputName": "Quantity", "include": True, "order": 2},
            {"sourceField": "unit", "outputName": "Unit", "include": True, "order": 3},
            {"sourceField": "area", "outputName": "Area", "include": True, "order": 4},
            {"sourceField": "page", "outputName": "Page", "include": True, "order": 5},
        ]
    },
]


def seed_schemas():
    """Create or update system schemas in Firestore."""
    schemas_ref = db.collection('schemas')

    for schema in SYSTEM_SCHEMAS:
        # Check if schema already exists by name and scope
        existing = schemas_ref.where('name', '==', schema['name']).where('scope', '==', 'system').limit(1).get()

        if existing:
            # Update existing schema
            doc_ref = existing[0].reference
            doc_ref.update({
                **schema,
                'updatedAt': firestore.SERVER_TIMESTAMP
            })
            print(f"Updated: {schema['name']}")
        else:
            # Create new schema
            schemas_ref.add({
                **schema,
                'createdAt': firestore.SERVER_TIMESTAMP,
                'updatedAt': firestore.SERVER_TIMESTAMP
            })
            print(f"Created: {schema['name']}")

    print("\nSystem schemas seeded successfully!")


if __name__ == '__main__':
    seed_schemas()

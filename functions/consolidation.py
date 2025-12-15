import pandas as pd
from typing import Dict, Any, List

def consolidate_items(raw_data: Dict[str, Any]) -> Dict[str, Any]:
    """
    Consolidates raw extraction results by grouping items with the same name and unit.
    
    Args:
        raw_data: The raw JSON response from Gemini, containing 'tables' and 'diagrams'.
        
    Returns:
        A dictionary containing the original raw_data plus a 'consolidated_items' list.
    """
    all_items = []

    # Flatten tables
    if 'tables' in raw_data and raw_data['tables']:
        for table in raw_data['tables']:
            if 'items' in table:
                for item in table['items']:
                    item_data = item.copy()
                    item_data['page'] = table.get('page')
                    item_data['source'] = 'table'
                    all_items.append(item_data)

    # Flatten diagrams
    if 'diagrams' in raw_data and raw_data['diagrams']:
        for diagram in raw_data['diagrams']:
            if 'items' in diagram:
                for item in diagram['items']:
                    item_data = item.copy()
                    item_data['page'] = diagram.get('page')
                    item_data['source'] = 'diagram'
                    item_data['area'] = diagram.get('area')
                    all_items.append(item_data)

    if not all_items:
        return {
            **raw_data,
            "consolidated_items": []
        }

    # Create DataFrame
    df = pd.DataFrame(all_items)

    # Normalize item names (lowercase, strip whitespace)
    df['normalized_item'] = df['item'].astype(str).str.lower().str.strip()
    
    # Fill NaN units with empty string for grouping
    df['unit'] = df['unit'].fillna('')

    # Group by normalized item and unit
    # Aggregations:
    # - quantity: sum
    # - item: first (to keep the original casing of the first occurrence)
    # - page: unique list
    grouped = df.groupby(['normalized_item', 'unit']).agg({
        'quantity': 'sum',
        'item': 'first',
        'page': lambda x: sorted(list(set(x)))
    }).reset_index()

    # Convert back to list of dicts
    consolidated_list = []
    for _, row in grouped.iterrows():
        consolidated_list.append({
            "item": row['item'],
            "quantity": float(row['quantity']),
            "unit": row['unit'] if row['unit'] else None,
            "pages": row['page']
        })

    # Sort primarily by item name
    consolidated_list.sort(key=lambda x: x['item'].lower())

    # Add row numbers
    for idx, item in enumerate(consolidated_list):
        item['rowNumber'] = idx + 1

    result = raw_data.copy()
    result['consolidated_items'] = consolidated_list
    
    return result

from typing import Dict, Any, List

def flatten_items(raw_data: Dict[str, Any]) -> Dict[str, Any]:
    """
    Flattens raw extraction results into a single list of items with row numbers.
    Consolidation is handled on the frontend for immediate edit feedback.

    Args:
        raw_data: The raw JSON response from Gemini, containing 'tables' and 'diagrams'.

    Returns:
        A dictionary containing 'items' (flat list) and 'pageCount'.
    """
    all_items = []

    # Flatten tables
    if 'tables' in raw_data and raw_data['tables']:
        for table in raw_data['tables']:
            if 'items' in table:
                for item in table['items']:
                    item_data = {
                        'item': item.get('item', ''),
                        'quantity': item.get('quantity', 0),
                        'unit': item.get('unit', ''),
                        'area': item.get('area', ''),
                        'page': table.get('page'),
                        'source': 'table',
                        'verified': False
                    }
                    all_items.append(item_data)

    # Flatten diagrams
    if 'diagrams' in raw_data and raw_data['diagrams']:
        for diagram in raw_data['diagrams']:
            if 'items' in diagram:
                for item in diagram['items']:
                    item_data = {
                        'item': item.get('item', ''),
                        'quantity': item.get('quantity', 0),
                        'unit': item.get('unit', ''),
                        'area': diagram.get('area', ''),
                        'page': diagram.get('page'),
                        'source': 'diagram',
                        'verified': False
                    }
                    all_items.append(item_data)

    # Assign row numbers
    for idx, item in enumerate(all_items, start=1):
        item['rowNumber'] = idx

    # Calculate page count from unique pages
    all_pages = set()
    for item in all_items:
        if item.get('page') is not None:
            all_pages.add(item['page'])

    return {
        'items': all_items,
        'pageCount': len(all_pages)
    }


# Keep old name as alias for backward compatibility during transition
def consolidate_items(raw_data: Dict[str, Any]) -> Dict[str, Any]:
    """Alias for flatten_items - consolidation now happens on frontend."""
    return flatten_items(raw_data)

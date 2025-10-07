# Disneyland Halloween 2025 Food Guide - JSON Data

This JSON file contains all Halloween food and beverage items at Disneyland Resort (excluding items with meat), optimized for a SvelteKit web application.

## 📊 Data Statistics

- **Total Items**: 201
- **Locations**: 5 (Disneyland, California Adventure, 3 Hotels)
- **Restaurants/Vendors**: 66
- **Categories**: 14
- **Unique Tags**: 31

## 🏗️ Data Structure

### Root Object
```typescript
{
  metadata: FoodGuideMetadata,
  items: FoodItem[]
}
```

### FoodItem Schema

Each item contains:

| Field | Type | Description |
|-------|------|-------------|
| `id` | number | Unique identifier |
| `name` | string | Item name |
| `description` | string \| null | Detailed description |
| `location` | string \| null | Park/hotel location |
| `restaurant` | string \| null | Specific restaurant/vendor |
| `price` | number \| null | Price in USD |
| `category` | FoodCategory | Main category |
| `itemType` | string \| null | Original item type from spreadsheet |
| `mobileOrderAvailable` | boolean | Can be ordered via mobile app |
| `availability.startDate` | string \| null | First available date (YYYY-MM-DD) |
| `availability.endDate` | string \| null | Last available date (YYYY-MM-DD) |
| `imageUrl` | string \| null | Link to item image |
| `tags` | string[] | Filterable tags |

## 🏷️ Categories

1. **Alcoholic Beverages** (11)
   - `alcoholic-beverage` - General alcoholic drinks
   - `beer` (14)
   - `cocktail` (26)
   - `wine-cider` (5)
   - `hard-seltzer` (3)

2. **Desserts** (88 total)
   - `baked-dessert` (40) - Cookies, muffins, donuts, etc.
   - `frozen-dessert` (8) - Ice cream, shakes
   - `specialty-dessert` (19) - Caramel apples, cake pops, etc.
   - `dessert` (21) - Other desserts

3. **Savory Items** (17)
   - `entree-side` (14)
   - `salad` (3)

4. **Other**
   - `churro` (11)
   - `coffee-tea` (20)
   - `other` (6)

## 🏷️ Available Tags

### Dietary & Allergen Tags
- `vegan` - Plant-based, no animal products
- `vegetarian` - No meat (all items in this dataset)
- `contains-dairy` - Has milk, cheese, cream, etc. (86 items)
- `contains-nuts` - Contains nuts or nut products

### Price Tags
- `budget-friendly` - Under $8 (65 items)
- `moderate-price` - $8-$15 (36 items)
- `premium-price` - Over $15 (39 items)

### Beverage Tags
- `alcoholic` / `non-alcoholic`
- `beer`, `cocktail`, `wine-cider`, `hard-seltzer`
- `coffee-tea` (37 items)
- `soft-drink`

### Flavor Profile Tags
- `pumpkin-spice` (32 items) - Fall flavors
- `chocolate` (62 items)
- `caramel` (31 items)
- `berry` - Strawberry, blueberry, etc.
- `apple` - Apple flavored
- `spicy` - Has heat/spice

### Special Features
- `character-themed` (36 items) - Mickey, Minnie, Oogie Boogie, etc.
- `limited-time` - Seasonal availability
- `cold` / `hot` - Temperature serving
- `specialty-candy` - Special artisan candy items

## 🎯 SvelteKit Usage Examples

### Load Data in +page.ts
```typescript
import type { PageLoad } from './$types';
import type { FoodGuideData } from '$lib/types';
import foodData from '$lib/data/disneyland_halloween_food.json';

export const load: PageLoad = async () => {
  return {
    foodData: foodData as FoodGuideData
  };
};
```

### Filter by Category
```typescript
const desserts = items.filter(item => 
  ['baked-dessert', 'frozen-dessert', 'specialty-dessert', 'dessert']
    .includes(item.category)
);
```

### Filter by Tags
```typescript
// Get all vegan desserts
const veganDesserts = items.filter(item =>
  item.tags.includes('vegan') && item.tags.includes('dessert')
);

// Get character-themed items
const characterItems = items.filter(item =>
  item.tags.includes('character-themed')
);

// Get budget-friendly drinks
const budgetDrinks = items.filter(item =>
  item.tags.includes('budget-friendly') && 
  (item.category === 'coffee-tea' || item.tags.includes('soft-drink'))
);
```

### Search Functionality
```typescript
function searchItems(query: string, items: FoodItem[]): FoodItem[] {
  const lowerQuery = query.toLowerCase();
  return items.filter(item =>
    item.name.toLowerCase().includes(lowerQuery) ||
    item.description?.toLowerCase().includes(lowerQuery) ||
    item.restaurant?.toLowerCase().includes(lowerQuery)
  );
}
```

### Filter by Date Range
```typescript
function isAvailableOnDate(item: FoodItem, date: Date): boolean {
  if (!item.availability.startDate || !item.availability.endDate) {
    return true; // No date restriction
  }
  
  const start = new Date(item.availability.startDate);
  const end = new Date(item.availability.endDate);
  
  return date >= start && date <= end;
}
```

### Price Range Filter
```typescript
function filterByPrice(
  items: FoodItem[],
  min: number | null,
  max: number | null
): FoodItem[] {
  return items.filter(item => {
    if (!item.price) return true; // Include items without price
    if (min !== null && item.price < min) return false;
    if (max !== null && item.price > max) return false;
    return true;
  });
}
```

### Group Items
```typescript
// Group by location
const itemsByLocation = items.reduce((acc, item) => {
  const location = item.location || 'Unknown';
  if (!acc[location]) acc[location] = [];
  acc[location].push(item);
  return acc;
}, {} as Record<string, FoodItem[]>);

// Group by category
const itemsByCategory = items.reduce((acc, item) => {
  if (!acc[item.category]) acc[item.category] = [];
  acc[item.category].push(item);
  return acc;
}, {} as Record<string, FoodItem[]>);
```

## 🎨 UI Component Ideas

1. **Filter Sidebar**
   - Multi-select for locations
   - Multi-select for tags
   - Price range slider
   - Date picker for availability

2. **Item Cards**
   - Show image if available
   - Display tags as chips/badges
   - Show price and location
   - Mobile order badge

3. **Search Bar**
   - Real-time search
   - Search by name, description, or restaurant

4. **Sort Options**
   - By price (low to high, high to low)
   - By name (A-Z)
   - By category
   - By availability dates

## 🔍 Metadata Usage

The metadata object contains pre-computed lists for all filter options:
- Use `metadata.filters.locations` for location dropdown
- Use `metadata.filters.restaurants` for restaurant filter
- Use `metadata.filters.categories` for category filter
- Use `metadata.filters.allTags` for tag filter

## 📝 Notes

- All items have had meat products removed
- Some items may have incomplete data (null values)
- Dates are in ISO format (YYYY-MM-DD)
- Images may not be available for all items
- Prices are in USD and may change

## 🚀 Suggested Features

1. **Save Favorites**: Let users save items to a wishlist
2. **Trip Calculator**: Sum prices of selected items
3. **Share Itinerary**: Generate shareable links
4. **Map View**: Show items on a park map
5. **Ratings**: Add user ratings/reviews
6. **Similar Items**: Suggest similar items based on tags

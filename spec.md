# Muscle Build

## Current State
The Nutrition tab has an "Add Food" button that opens a dialog with manual text/number inputs for food name, calories, protein, carbs, and fat. There is also a barcode scanner. Users must type everything from scratch each time.

## Requested Changes (Diff)

### Add
- A "Quick Select" food picker panel inside the Add Food dialog, showing a list of common foods the user can tap to auto-fill the form fields instantly
- A set of built-in popular foods (e.g. Chicken Breast, Eggs, Rice, Banana, etc.) as selectable options
- Previously logged foods from the user's history shown as quick-select options (pulled from past entries)
- A search/filter input to narrow the food list by name

### Modify
- The Add Food dialog now has two views: (1) a "Quick Select" list view and (2) the manual entry form. Selecting a food from the list switches to the form pre-filled with that food's macros, which the user can adjust before saving.

### Remove
- Nothing removed

## Implementation Plan
1. Add a `COMMON_FOODS` array of popular foods with estimated macros in NutritionTab
2. Add a `useFoodHistory` hook that aggregates unique previously-logged foods from the user's food entries
3. Modify the Add Food dialog to show a searchable list of foods (common + history) first
4. When a food is tapped, pre-fill the form and switch to the manual entry view
5. Add a "Custom" / "Enter manually" option to skip to the blank form
6. Apply deterministic data-ocid markers to new interactive elements

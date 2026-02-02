# Water Tracker Undo Feature

## Overview
Added an undo functionality to the water tracker that allows users to reverse their most recent water intake addition.

## Changes Made

### 1. **hooks/useWater.ts**
- Added `lastAddedAmount` state to track the most recent water addition
- Created `undoLastAddition` function that:
  - Subtracts the last added amount from the current total
  - Updates Firestore with the new amount
  - Clears the undo state after use
- Updated `addWater` to track each addition for undo capability
- Exported `undoLastAddition` and `lastAddedAmount` from the hook

### 2. **components/water/WaterTracker.tsx**
- Imported `Undo2` icon from lucide-react
- Added undo button with:
  - **Conditional rendering**: Only appears when there's a recent addition to undo
  - **Smooth animations**: Fade in/out with scale effect using Framer Motion
  - **Distinctive styling**: Orange/amber gradient to differentiate from add buttons
  - **Responsive layout**: Grid adjusts from 2 to 3 columns when undo button appears

## User Experience

1. **Add Water**: User clicks +250ml or +500ml button
2. **Undo Appears**: An orange "Undo" button smoothly animates in
3. **Undo Action**: Clicking undo removes the last added amount
4. **Button Disappears**: Undo button fades away after being used

## Features
- ✅ Instant feedback with optimistic updates
- ✅ Smooth animations for better UX
- ✅ Only allows undoing the most recent addition
- ✅ Prevents negative water amounts
- ✅ Works in both light and dark themes
- ✅ Syncs with Firestore automatically

## Technical Details
- Uses React hooks for state management
- Leverages Framer Motion's AnimatePresence for smooth transitions
- Maintains optimistic UI updates for instant feedback
- Properly handles edge cases (no negative amounts, null checks)

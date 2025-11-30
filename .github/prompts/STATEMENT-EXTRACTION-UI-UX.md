# Statement Extraction - UI/UX Design

## Design Philosophy
- **Simple & Intuitive**: Users should understand the feature at a glance
- **Transparent**: Show what's being extracted and extracted accuracy
- **Forgiving**: Easy to edit, undo, and correct mistakes
- **Fast**: Minimize steps to import transactions
- **Accessible**: Works on mobile and desktop

---

## User Journey & Screens

### Screen 1: Import Statement Button/Tab
**Location:** In the main navigation or sidebar

```
┌─────────────────────────────────────────┐
│ 📊 Finance Tracker                      │
├─────────────────────────────────────────┤
│ [📊 Overview] [📅 Daily] [📈 Weekly]    │
│ [🗓️ Monthly] [📤 Import Statements]     │  ← New Tab
├─────────────────────────────────────────┤
│ Main Content Area                       │
└─────────────────────────────────────────┘
```

**When clicked:** User sees the upload interface

---

### Screen 2: File Upload (Empty State)
**Design Pattern:** Drag-and-drop with fallback

```
┌─────────────────────────────────────────────────────────┐
│ 📤 Import Bank Statement                                │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  ┌───────────────────────────────────────────────────┐ │
│  │                                                   │ │
│  │  📄 Drop your PDF here or click to browse       │ │
│  │                                                   │ │
│  │  Supported: Bank statements (PDF format)         │ │
│  │  Max size: 10MB                                  │ │
│  │  Supported banks: All Indian banks               │ │
│  │                                                   │ │
│  │  ┌─────────────────────────────────────────────┐ │ │
│  │  │  Choose File  [Browse Icon]                  │ │ │
│  │  └─────────────────────────────────────────────┘ │ │
│  │                                                   │ │
│  └───────────────────────────────────────────────────┘ │
│                                                         │
│  💡 Tips:                                              │
│  • Ensure the statement shows transactions clearly    │
│  • Clear image/PDF works best for accuracy            │
│  • Can import multiple statements one at a time       │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

**Features:**
- Large drag-drop zone (easy touch target)
- Visual feedback on hover
- File size validation
- Helpful tips & supported formats

---

### Screen 3: Processing State (While Extracting)
**Design Pattern:** Progress indicator with live feedback

```
┌─────────────────────────────────────────────────────────┐
│ 📤 Import Bank Statement                                │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  Statement: HDFC_Nov_2025.pdf (650 KB)                │
│                                                         │
│  ⏳ Processing your statement...                        │
│                                                         │
│  ████████░░░░░░░░░░░░░░░░░░░░░░  60%                 │
│                                                         │
│  Steps:                                                 │
│  ✅ Reading PDF file                                    │
│  ✅ Extracting transactions                             │
│  ⏳ Categorizing transactions                            │
│  ○ Preparing preview                                    │
│                                                         │
│  Estimated time: 5-10 seconds                          │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

**Features:**
- Progress bar showing completion
- Step-by-step feedback
- Time estimate
- Estimated transaction count
- Cancel button (if applicable)

---

### Screen 4: Preview & Edit (Main Interface)
**Design Pattern:** Editable data table with bulk actions

```
┌──────────────────────────────────────────────────────────────────┐
│ 📤 Import Bank Statement - Preview                              │
├──────────────────────────────────────────────────────────────────┤
│                                                                  │
│ HDFC_Nov_2025.pdf ✓                                             │
│ Extracted 28 transactions from Nov 1-30, 2025                  │
│                                                                  │
│ ┌─ Bulk Actions ────────────────────────────────────────────┐  │
│ │ [✓ Select All] [✗ Clear All]                             │  │
│ │ [Set Category: Food ▼] [Delete Selected]                │  │
│ └────────────────────────────────────────────────────────────┘  │
│                                                                  │
│ ┌────────────────────────────────────────────────────────────┐  │
│ │ # │Date    │Merchant                   │Amt  │Type   │Cat  │  │
│ ├────────────────────────────────────────────────────────────┤  │
│ │☑ │Nov 23  │YOUSTA                      │1298 │DEBIT  │🍽️ F │  │
│ │☑ │Nov 22  │ATTIBELE ELECTRONIC CITY    │ 25  │DEBIT  │🛍️ S │  │
│ │☑ │Nov 22  │SHAILESH-IDEXCEL            │2000 │DEBIT  │ ? O │  │
│ │☑ │Nov 21  │AMAZON DIGITAL               │ 499 │DEBIT  │🛍️ S │  │
│ │☑ │Nov 21  │ZOMATO FOODTECH             │ 320 │DEBIT  │🍽️ F │  │
│ │☑ │Nov 20  │UBER MOTO                    │ 150 │DEBIT  │🚗 T │  │
│ │☑ │Nov 20  │NETFLIX INDIA                │ 199 │DEBIT  │🎬 E │  │
│ │☑ │Nov 19  │SWIGGY PAYMENT              │ 580 │DEBIT  │🍽️ F │  │
│ │  │...     │...                         │... │...   │...  │  │
│ └────────────────────────────────────────────────────────────┘  │
│                                                                  │
│ Legend: 🍽️ Food | 🚗 Transport | 🛍️ Shopping | 🎬 Entertainment  │
│         💳 Bills | ⚕️ Health | ? Other                          │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
```

**Features:**
- Checkbox for each row (select all, deselect)
- Editable cells (click to edit)
- Category emoji badges (visual recognition)
- Sortable columns (Date, Amount, Category)
- Bulk category assignment
- Delete individual rows
- Accuracy indicators (✓ = confident, ? = uncertain)

---

### Screen 5: Edit Row (Modal/Inline Editor)
**Design Pattern:** Form modal for detailed editing

```
┌────────────────────────────────────────────┐
│ ✏️ Edit Transaction                        │
├────────────────────────────────────────────┤
│                                            │
│ Date *                                     │
│ ┌──────────────────────────────────────┐  │
│ │ Nov 23, 2025          [📅 Calendar]  │  │
│ └──────────────────────────────────────┘  │
│                                            │
│ Merchant/Description *                    │
│ ┌──────────────────────────────────────┐  │
│ │ ATTIBELE ELECTRONIC CITY             │  │
│ └──────────────────────────────────────┘  │
│                                            │
│ Amount *                                   │
│ ┌──────────────────────────────────────┐  │
│ │ 25.00                    [₹ Currency]│  │
│ └──────────────────────────────────────┘  │
│                                            │
│ Type *                                     │
│ ◉ Debit    ○ Credit                      │
│                                            │
│ Category *                                 │
│ ┌──────────────────────────────────────┐  │
│ │ Other                          ▼     │  │
│ └──────────────────────────────────────┘  │
│  [🍽️ Food] [🚗 Transport] [🛍️ Shopping]    │
│  [💳 Bills] [⚕️ Health] [🎬 Entertainment] │
│  [? Other]                                 │
│                                            │
│ Notes (Optional)                          │
│ ┌──────────────────────────────────────┐  │
│ │ Weekly groceries from electronics    │  │
│ │ store. Should be Food category       │  │
│ └──────────────────────────────────────┘  │
│                                            │
│        [Cancel]  [Save Changes]           │
│                                            │
└────────────────────────────────────────────┘
```

**Features:**
- Date picker with calendar
- Auto-filled with extracted data
- Category quick-select buttons
- Notes field for context
- Save & Cancel buttons
- Form validation

---

### Screen 6: Summary Before Import
**Design Pattern:** Confirmation screen with overview

```
┌────────────────────────────────────────────────────────────┐
│ ✓ Ready to Import                                          │
├────────────────────────────────────────────────────────────┤
│                                                            │
│ Import Summary                                             │
│ ┌────────────────────────────────────────────────────────┐ │
│ │ Statement: HDFC_Nov_2025.pdf                           │ │
│ │ Period: Nov 1 - Nov 30, 2025                           │ │
│ │ Total Transactions: 25                                 │ │
│ │ Total Amount: ₹12,847.50                               │ │
│ └────────────────────────────────────────────────────────┘ │
│                                                            │
│ Category Breakdown                                         │
│ ┌────────────────────────────────────────────────────────┐ │
│ │ 🍽️ Food              7 transactions  ₹3,498           │ │
│ │ 🚗 Transport         4 transactions  ₹1,250           │ │
│ │ 🛍️ Shopping          6 transactions  ₹4,320           │ │
│ │ 🎬 Entertainment     2 transactions  ₹698             │ │
│ │ ? Other             6 transactions  ₹2,081           │ │
│ └────────────────────────────────────────────────────────┘ │
│                                                            │
│ ⚠️  Warnings & Notes                                       │
│ • 0 duplicate transactions detected (safe to import)      │
│ • 6 transactions auto-categorized as "Other"              │
│   (consider reviewing these)                              │
│ • Total will be added to your Nov 2025 expenses           │
│                                                            │
│            [← Go Back]  [Import Now]                      │
│                                                            │
└────────────────────────────────────────────────────────────┘
```

**Features:**
- Visual summary of what will be imported
- Category pie chart/breakdown
- Warning for uncertain categories
- Duplicate detection alert
- Buttons to go back or confirm

---

### Screen 7: Success/Import Complete
**Design Pattern:** Success confirmation with next steps

```
┌────────────────────────────────────────────────────────────┐
│ ✅ Import Successful!                                       │
├────────────────────────────────────────────────────────────┤
│                                                            │
│               🎉 25 Transactions Imported                  │
│                                                            │
│ ┌────────────────────────────────────────────────────────┐ │
│ │ ✅ Imported:    25 transactions                         │ │
│ │ ⏭️  Skipped:     0 (duplicates)                          │ │
│ │ ⚠️  Review:      6 (Other category)                     │ │
│ │ Total Amount: ₹12,847.50                               │ │
│ └────────────────────────────────────────────────────────┘ │
│                                                            │
│ What's Next?                                               │
│ • Transactions added to Nov 2025 expense list             │
│ • Monthly statistics updated automatically                │
│ • Review transactions marked as "Other"                   │
│                                                            │
│ View Imported:                                             │
│ [📊 View in Monthly Stats] [📋 View in Expense List]      │
│                                                            │
│ Import Another Statement:                                  │
│ [📤 Upload Another]  [✕ Close]                           │
│                                                            │
└────────────────────────────────────────────────────────────┘
```

**Features:**
- Success animation/icon
- Clear summary of what happened
- Links to view imported data
- Option to import another file
- Next steps guidance

---

### Screen 8: Error Handling
**Design Pattern:** Helpful error messages

```
┌────────────────────────────────────────────────────────────┐
│ ⚠️ Import Failed                                            │
├────────────────────────────────────────────────────────────┤
│                                                            │
│ Error: Could not extract transactions from PDF            │
│                                                            │
│ ℹ️ What went wrong?                                        │
│ The PDF might be:                                          │
│ • Password protected                                       │
│ • Image-only (scanned without text layer)                │
│ • Corrupted or damaged                                    │
│ • In an unsupported format                                │
│                                                            │
│ 🔧 How to fix:                                             │
│ 1. Try a different bank statement                         │
│ 2. Ensure the PDF has a text layer                        │
│ 3. Check file size (max 10MB)                             │
│ 4. Contact support if issue persists                      │
│                                                            │
│ Error Code: PDF_PARSE_ERROR_001                           │
│                                                            │
│            [Upload Different File]  [Cancel]              │
│                                                            │
└────────────────────────────────────────────────────────────┘
```

**Features:**
- Clear error message
- Explanation of what went wrong
- Actionable steps to fix
- Error code for debugging
- Buttons to retry or cancel

---

## Mobile Responsive Design

### Mobile: Collapsed View
```
┌──────────────────────────────┐
│ 📤 Import Statement          │
├──────────────────────────────┤
│                              │
│ 📄 Drop PDF here or browse   │
│                              │
│ [Choose File]                │
│                              │
│ Recent Uploads:              │
│ • HDFC_Nov.pdf (28 trans)   │
│ • SBI_Oct.pdf (35 trans)    │
│                              │
└──────────────────────────────┘

── Preview (Scrollable) ──
┌──────────────────────────────┐
│ #│Date │Merchant   │Amt│Cat  │
├──────────────────────────────┤
│✓│Nov23│YOUSTA      │₹12│🍽️   │
│✓│Nov22│ATTIBELE    │₹25│🛍️   │
│✓│Nov22│SHAILESH    │₹20│?   │
│ [Edit] [Delete]              │
└──────────────────────────────┘
```

**Features:**
- Single column table (swipe to see more)
- Inline edit/delete buttons
- Touch-friendly sizing
- Vertical scrolling

---

## Color & Visual Scheme

### Category Colors (Consistent across app)
```
🍽️ Food            → #FF6B6B (Red)
🚗 Transport       → #4ECDC4 (Teal)
🛍️ Shopping       → #FFE66D (Yellow)
💳 Bills           → #95E1D3 (Mint)
⚕️ Health          → #A8E6CF (Green)
🎬 Entertainment   → #DDA0DD (Plum)
? Other            → #999999 (Gray)
```

### Status Indicators
```
✓ Confirmed/Extracted    → Green checkmark
⚠️ Warning/Review needed  → Orange warning icon
❌ Error/Failed           → Red X icon
⏳ Processing            → Blue spinner
```

---

## UX Patterns & Interactions

### 1. Drag & Drop
- User drags PDF → highlights drop zone
- File drops → shows processing state
- Progress bar updates in real-time

### 2. Inline Editing
- Click on cell → becomes editable
- Type to change → press Enter to save
- Escape key to cancel

### 3. Bulk Actions
- Checkbox to select rows
- Right-click context menu for actions
- Bulk category assignment dropdown
- Delete selected button

### 4. Keyboard Shortcuts
- `Ctrl/Cmd + A` → Select all transactions
- `Delete` → Remove selected rows
- `Enter` → Save edits
- `Esc` → Cancel edits
- `↑/↓` → Navigate rows

### 5. Accessibility
- ARIA labels for screen readers
- Keyboard navigation support
- High contrast mode
- Focus indicators
- Alt text for icons

---

## Animations & Transitions

### 1. File Upload
- Drag-over glow effect
- Smooth file size validation feedback

### 2. Processing
- Animated progress bar
- Step indicators with checkmarks
- Smooth transitions between states

### 3. Table Interactions
- Row hover highlight
- Smooth checkbox animation
- Category icon scale on hover
- Modal slide-in animation

### 4. Success/Error
- Confetti animation (optional, for success)
- Shake animation for errors
- Fade-in for success message

---

## Accessibility Features

✅ **Screen Reader Compatible**
- All buttons labeled
- Form fields have labels
- Table structure properly marked
- Loading states announced

✅ **Keyboard Navigation**
- All interactive elements reachable via Tab
- Escape key to close modals
- Enter key to confirm actions
- Arrow keys to navigate tables

✅ **Color Blind Friendly**
- Icons with text labels (not color alone)
- Patterns/textures in addition to colors
- High contrast mode support

✅ **Mobile Friendly**
- Touch targets min 44x44 pixels
- Readable text (min 16px)
- Pinch to zoom enabled
- Responsive layout

---

## Performance Considerations

⚡ **Fast Loading**
- Lazy load preview table rows (virtualization)
- Compress PDF processing feedback
- Debounce search/filter inputs

⚡ **Smooth Interactions**
- Use CSS transforms for animations
- Debounce edit saves
- Optimize table re-renders (React keys)

⚡ **Offline Support**
- Allow offline PDF preview
- Queue imports if offline
- Sync when online

---

## Implementation Roadmap

### Phase 1: MVP
- ✅ File upload (drag-drop)
- ✅ Processing state
- ✅ Preview table
- ✅ Bulk category assignment
- ✅ Import confirmation
- ✅ Success screen

### Phase 2: Polish
- 🔲 Inline edit modal
- 🔲 Keyboard shortcuts
- 🔲 Mobile optimizations
- 🔲 Error animations

### Phase 3: Advanced
- 🔲 Undo/Redo
- 🔲 Import history
- 🔲 Duplicate detection UI
- 🔲 Smart categorization feedback

---

## Design Files & Assets

**To Create:**
- Figma/design file with all screens
- Component library
- Icon set
- Color palette
- Typography scale

**Recommended Tools:**
- Figma for design
- Storybook for component library
- Tailwind CSS for styling
- Framer Motion for animations


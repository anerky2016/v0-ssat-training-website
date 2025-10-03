# 🎨 Professional Icon Guide for SSAT Website

## 📚 Available Icon Libraries

### 1. **Heroicons** (by Tailwind Team) - Recommended
- **Style**: Clean, minimal, consistent
- **Best for**: UI elements, navigation, buttons
- **Usage**: `library="heroicons"` (default)

### 2. **React Icons** (Massive Collection)
- **Style**: Diverse styles from Font Awesome, Material Design, etc.
- **Best for**: Social media, brand icons, specialized icons
- **Usage**: `library="reactIcons"`

### 3. **Phosphor Icons** (Beautiful & Modern)
- **Style**: Rounded, friendly, modern
- **Best for**: Educational content, kid-friendly designs
- **Usage**: `library="phosphor"`

## 🚀 How to Use Icons

### Basic Usage
```tsx
import { Icon, AcademicCap, Calculator, Trophy } from '@/components/ui/icon'

// Using the Icon component
<Icon name="academic-cap" size="lg" className="text-primary" />

// Using convenience components
<AcademicCap size="xl" className="text-primary" />
<Calculator size="md" className="text-blue-500" />
<Trophy size="2xl" className="text-yellow-500" />
```

### Advanced Usage
```tsx
// Different libraries
<Icon name="calculator" library="heroicons" size="lg" />
<Icon name="calculator" library="reactIcons" size="lg" />
<Icon name="calculator" library="phosphor" size="lg" />

// Custom styling
<Icon 
  name="trophy" 
  size="xl" 
  className="text-yellow-500 hover:text-yellow-600 transition-colors" 
  color="yellow-500"
/>
```

## 📏 Size Options
- `xs`: 12px (h-3 w-3)
- `sm`: 16px (h-4 w-4)
- `md`: 20px (h-5 w-5) - **Default**
- `lg`: 24px (h-6 w-6)
- `xl`: 32px (h-8 w-8)
- `2xl`: 48px (h-12 w-12)

## 🎨 Color Options
```tsx
// Using Tailwind colors
<Icon name="star" className="text-yellow-500" />
<Icon name="fire" className="text-orange-500" />
<Icon name="trophy" className="text-yellow-600" />

// Using theme colors
<Icon name="academic-cap" className="text-primary" />
<Icon name="calculator" className="text-accent" />
<Icon name="chart-bar" className="text-secondary" />
```

## 🎯 Icon Categories

### Education & Learning
- `academic-cap` - Graduation cap
- `book-open` - Open book
- `calculator` - Math calculator
- `chart-bar` - Statistics/analytics
- `document-text` - Documents/notes
- `pencil` - Writing/editing
- `light-bulb` - Ideas/creativity

### Success & Achievement
- `check-circle` - Success/completion
- `trophy` - Achievement/winning
- `star` - Excellence/rating
- `award` - Recognition
- `medal` - Achievement
- `gem` - Precious/valuable

### Energy & Motivation
- `fire` - Energy/passion
- `lightning` - Power/speed
- `rocket` - Launch/progress
- `magic` - Wonder/creativity
- `brain` - Intelligence/thinking
- `target` - Focus/goals

### UI Elements
- `clock` - Time/scheduling
- `cog` - Settings/preferences
- `play` - Start/action
- `user-group` - People/community
- `x-mark` - Close/cancel
- `exclamation-triangle` - Warning/alert

## 💡 Best Practices

### 1. **Consistency**
```tsx
// ✅ Good - Consistent library
<Icon name="calculator" library="heroicons" size="md" />
<Icon name="book-open" library="heroicons" size="md" />

// ❌ Avoid - Mixed libraries
<Icon name="calculator" library="heroicons" size="md" />
<Icon name="book-open" library="phosphor" size="md" />
```

### 2. **Appropriate Sizing**
```tsx
// ✅ Good - Appropriate sizes for context
<Icon name="academic-cap" size="lg" /> // Header logo
<Icon name="calculator" size="md" />   // Button icon
<Icon name="trophy" size="sm" />      // List item
```

### 3. **Meaningful Colors**
```tsx
// ✅ Good - Meaningful colors
<Icon name="check-circle" className="text-green-500" /> // Success
<Icon name="exclamation-triangle" className="text-red-500" /> // Warning
<Icon name="star" className="text-yellow-500" /> // Rating
```

### 4. **Accessibility**
```tsx
// ✅ Good - Include screen reader text
<button>
  <Icon name="play" size="md" />
  <span className="sr-only">Start lesson</span>
</button>
```

## 🔧 Customization Examples

### Animated Icons
```tsx
<Icon 
  name="rocket" 
  size="xl" 
  className="text-blue-500 hover:text-blue-600 transition-colors animate-bounce" 
/>
```

### Gradient Icons
```tsx
<Icon 
  name="trophy" 
  size="2xl" 
  className="bg-gradient-to-r from-yellow-400 to-yellow-600 bg-clip-text text-transparent" 
/>
```

### Interactive Icons
```tsx
<Icon 
  name="star" 
  size="lg" 
  className="text-yellow-400 hover:text-yellow-500 cursor-pointer transition-all duration-200 hover:scale-110" 
/>
```

## 📱 Responsive Icons
```tsx
<Icon 
  name="academic-cap" 
  size="lg" 
  className="h-5 w-5 sm:h-6 sm:w-6 text-primary" 
/>
```

## 🎨 Theme Integration
```tsx
// Light mode
<Icon name="sun" className="text-yellow-500" />

// Dark mode
<Icon name="moon" className="text-blue-400" />

// Theme-aware
<Icon name="academic-cap" className="text-primary" />
```

## 🚀 Performance Tips

1. **Tree Shaking**: Only import icons you use
2. **Consistent Library**: Stick to one library per component
3. **Size Optimization**: Use appropriate sizes
4. **Color Classes**: Use Tailwind classes for better performance

## 📝 Example Implementations

### Header Logo
```tsx
<Link href="/" className="flex items-center gap-2">
  <AcademicCap size="lg" className="text-primary" />
  <span>SSAT Prep</span>
</Link>
```

### Feature Cards
```tsx
<div className="flex items-center gap-3">
  <Calculator size="md" className="text-blue-500" />
  <span>Math Practice</span>
</div>
```

### Achievement Badges
```tsx
<div className="flex items-center gap-2">
  <Trophy size="sm" className="text-yellow-500" />
  <span className="text-sm">Master Level</span>
</div>
```

### Action Buttons
```tsx
<Button className="flex items-center gap-2">
  <Play size="sm" />
  Start Lesson
</Button>
```

This comprehensive icon system gives you access to thousands of professional icons from three different libraries, all with consistent sizing, coloring, and theming! 🎨✨

# 🎲 Dice Golf

A strategic web-based dice-driven golf game where players use dice rolls, golfer cards with stat modifiers, and tactical decision-making to navigate a 9-hole or 18-hole golf course.

## 🎯 Game Overview

Dice Golf simulates a realistic golf experience using dice rolls and strategy. The game combines:

- **Dice rolls**: Core randomness mechanic (2d6)
- **Golfer cards**: Each with different stat modifiers
- **Shot selection**: Strategic choices based on lie and distance
- **Course conditions**: Wind effects, terrain distribution, green characteristics
- **Scorekeeping**: Full tracking of shots, scores, and performance

## 🧩 Core Gameplay

1. **Choose your course**: 9-hole or 18-hole options
2. **Play each hole**:
   - Select a golfer card (with unique stats)
   - Take shots by rolling dice (drive, approach, chip, putt)
   - Adapt to conditions like wind and terrain
   - Complete the hole and see your score
3. **Strategize**:
   - Save your best golfer cards for challenging holes
   - Choose appropriate shot types based on distance and lie
   - Balance risk vs. reward

## 🏌️ Golfer Cards

Each golfer card features four stats, ranging from -3 to +3:

- **Drive**: Affects distance off the tee
- **Accuracy**: Affects approach shot precision
- **Short Game**: Affects chipping quality
- **Putting**: Affects putting performance

Choose when to play each golfer card strategically, as each can only be used on one hole.

## 🌬️ Wind System

Wind changes every 3 holes and affects shots:
- **Tailwind**: Helps drives go further
- **Headwind**: Reduces drive distance
- **Crosswind**: Reduces accuracy
- **None**: No effect

## 🎮 How to Play

1. **Start the game** and select a course
2. **Choose a golfer card** for the current hole
3. **Take shots** by clicking the appropriate shot type
4. **Complete the hole** and move to the next one
5. **Track your score** on the scorecard

## 🛠️ Development

### Tech Stack

- **Frontend**: React + TypeScript
- **Styling**: Bootstrap + Custom CSS
- **State Management**: React Hooks (useState, useReducer)

### Running Locally

1. Clone the repository
2. Install dependencies:
   ```
   npm install
   ```
3. Start the development server:
   ```
   npm start
   ```

Note: This project uses CRACO (Create React App Configuration Override) to manage configuration. The npm scripts have been updated to use CRACO instead of react-scripts.

## 📝 Project Structure

- `src/components/`: React components
- `src/data/`: Sample course and golfer data
- `src/types/`: TypeScript type definitions
- `src/utils/`: Game engine logic
- `src/hooks/`: Custom React hooks

## 🎲 Game Engine

The core game engine handles:
- Dice rolling mechanics
- Shot result calculation
- Game state management
- Scoring system
- Wind and terrain effects

## 🔮 Future Enhancements

Potential future features:
- Multiplayer support
- Course designer
- Custom golfer creation
- Career mode with progression
- More detailed statistics

## CSS Configuration

The project uses Bootstrap for styling with a custom CSS implementation:
- Bootstrap is imported in index.tsx
- Custom styles in index.css provide additional game-specific styling
- We use CRACO (Create React App Configuration Override) to manage PostCSS configuration
- This setup avoids issues with Tailwind CSS's PostCSS plugin

---

Enjoy your round of Dice Golf! ⛳

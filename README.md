# 🎲 Dice Golf

A strategic web-based dice-driven golf game where players use dice rolls, golfer cards with stat modifiers, and tactical decision-making to navigate a 9-hole or 18-hole golf course.

## 🎯 Game Overview

Dice Golf simulates a realistic golf experience using dice rolls and strategy. The game combines:

- **Dice rolls**: Core randomness mechanic (2d6) with dynamic 3D animations
- **Golfer cards**: Each with different stat modifiers
- **Shot selection**: Strategic choices based on lie and distance
- **Course conditions**: Wind effects, terrain distribution, green characteristics
- **Scorekeeping**: Full tracking of shots, scores, and performance
- **Leaderboards**: Global score tracking with optional location sharing

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
6. **Submit your score** to the leaderboard after completing all holes

## 🏆 Leaderboard

The game features a global leaderboard system that allows players to:

- Submit their scores after completing a round
- View top scores for each course
- Share their location (optional)
- Compare their performance with other players
- Filter leaderboard by course

The leaderboard data is stored in Supabase for shared access across all players, with localStorage as a fallback when offline or if there are connection issues.

### Setting Up Supabase for the Leaderboard

1. Create a free Supabase account at [supabase.com](https://supabase.com)
2. Create a new project
3. Create a new table called `leaderboard` with the following columns:

   | Column Name | Type | Additional |
   |-------------|------|------------|
   | id | uuid | Primary Key |
   | playerName | text | |
   | courseName | text | |
   | score | integer | |
   | date | timestamptz | |
   | location | jsonb | Can be null |
   | holeCount | integer | |

4. Set up Row Level Security (RLS) policies to allow anyone to read entries but restrict writes:
   - Enable RLS on the table
   - Create an INSERT policy that allows authenticated users to insert new rows
   - Create a SELECT policy that allows anyone to read all rows

5. Add your Supabase URL and anon key to your environment variables or the Netlify dashboard:
   ```
   REACT_APP_SUPABASE_URL=your_supabase_url
   REACT_APP_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

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
- Dice rolling mechanics with realistic 3D animations and sound effects
- Shot result calculation
- Game state management
- Scoring system
- Wind and terrain effects
- Leaderboard management

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

## Leaderboard Configuration

The game uses Supabase to store and retrieve leaderboard data. This ensures all players see the same leaderboard regardless of which device they use.

### Setup Instructions

1. Create a `.env.local` file in the project root with the following:
```
REACT_APP_SUPABASE_URL=https://afilynsbqsoruoteplow.supabase.co
REACT_APP_SUPABASE_ANON_KEY=your_actual_anon_key_here
```

2. Replace `your_actual_anon_key_here` with your actual Supabase anon key.
   - You can find this in your Supabase project settings > API > Project API keys > anon public

3. Make sure your Supabase database has a `leaderboard` table with the following columns:
   - `id` (uuid, primary key)
   - `playername` (text)
   - `coursename` (text)
   - `score` (integer)
   - `date` (timestamp with timezone)
   - `location` (jsonb)
   - `holecount` (integer)

### Troubleshooting

If leaderboard data isn't syncing properly:

1. Use the Debug Tools in the app to test Supabase connectivity
2. Check that your Supabase URL and anon key are correctly set in `.env.local`
3. Verify that your network allows connections to Supabase
4. Ensure the leaderboard table schema matches the required format

## Sound System

Dice Golf includes a comprehensive sound system with effects for all game events:

- **Golf Shots**: Different sounds for swing and putt shots
- **Results**: Special sound for when the ball goes in the hole
- **Dice**: Realistic dice rolling sound effects
- **UI**: Click sounds for buttons and interactions

### Sound Implementation

The game uses a direct Audio API approach for sound management:
- Each component handles its own sound playback
- Shot Controls component manages swing/putt sounds
- Game component manages dice roll sounds
- useGameReducer hook manages the hole-in sound
- Volume can be controlled through the Volume Control component

### Sound Files

The game uses optimized audio formats for better performance:
- `.wav` files for most game sounds (swing, putt, dice roll, click)
- `.ogg` file for the hole-in sound

These audio files are smaller and load faster than MP3 files while maintaining good sound quality.

### Testing Sounds

In development mode, you can:
1. Use the Volume Control in the top-right corner to adjust or mute sounds
2. Access the sound test page at `/sound-test.html`

### Sound Credits

All sound effects are sourced from free sound libraries:
- Mixkit (https://mixkit.co/free-sound-effects/)
- Freesound (https://freesound.org/)

For details on specific sounds and attribution, see `public/sounds/README.md`.

---

Enjoy your round of Dice Golf! ⛳

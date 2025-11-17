# Lyriq Mobile - React Native Conversion

A professional songwriting companion app for iOS and Android, converted from the Lyriq web application.

## 🎵 Overview

Lyriq Mobile is a sophisticated music creation tool with:
- **Rich lyric editing** with real-time syllable counting
- **Audio recording** ("takes") with waveform visualization
- **Master beat playback** for timing reference
- **AI-powered assistance** via Google Gemini (rhymes, suggestions, rewrites)
- **Native mobile UX** with gestures and animations
- **Dark aesthetic** with platform-specific design tokens

## 🚀 Current Status

### ✅ Completed (Phase 1)
- [x] Expo project setup with TypeScript
- [x] Platform-specific theme system (iOS/Android/Web colors)
- [x] Data models and types ported from web version
- [x] Core services:
  - [x] Syllable counting service
  - [x] Audio recording/playback service (expo-av)
  - [x] Local storage service (AsyncStorage)
  - [x] Gemini AI service
- [x] UI Components:
  - [x] Icon library (20+ icons)
  - [x] Header component
  - [x] Button component
- [x] Navigation structure (Tab-based with expo-router)
- [x] Basic app screens (Editor, Takes, More)

### 🚧 In Progress (Phase 2-5)
- [ ] Lyric editor component (TextInput-based, multi-line)
- [ ] Section management (add, delete, rename, reorder)
- [ ] Audio recording UI (red button, timer, save/cancel)
- [ ] Bottom sheet players (takes + master beat)
- [ ] Waveform visualization
- [ ] Gesture interactions:
  - [ ] Swipe-to-delete sections
  - [ ] Drag-to-reorder sections
  - [ ] Bottom sheet swipe animations
- [ ] AI features UI:
  - [ ] Rhyme popup on word selection
  - [ ] Section-level AI modal
- [ ] Master beat upload and playback
- [ ] State persistence (auto-save every 10s)

## 📁 Project Structure

```
lyriq-mobile/
├── app/                      # App screens (expo-router)
│   ├── _layout.tsx          # Root layout
│   └── (tabs)/              # Tab navigation
│       ├── _layout.tsx      # Tab layout
│       ├── editor.tsx       # Main editor screen
│       ├── takes.tsx        # Takes/recordings view
│       └── more.tsx         # Settings screen
├── components/              # Reusable UI components
│   ├── Icons.tsx           # Icon library
│   ├── Header.tsx          # App header
│   └── Button.tsx          # Button component
├── services/               # Business logic services
│   ├── syllableService.ts # Syllable counting
│   ├── audioService.ts    # Audio recording/playback
│   ├── storageService.ts  # Local persistence
│   └── geminiService.ts   # AI integration
├── theme/                  # Design system
│   ├── colors.ts          # Platform-specific colors
│   ├── typography.ts      # Fonts and text styles
│   ├── spacing.ts         # Spacing scale
│   └── index.ts           # Theme exports
├── utils/                  # Utility functions
│   ├── formatters.ts      # Time/duration formatters
│   └── constants.ts       # App constants
├── types.ts               # TypeScript types
└── package.json           # Dependencies

## 🎨 Design System

### Color Palette
- **Background**: `rgb(0, 2, 5)` - OLED-friendly deep black
- **Surface**: `rgb(18, 29, 42)` - Elevated components
- **Text**: `rgb(246, 250, 255)` - High contrast white
- **Accent**: Platform-specific blue (iOS/Android/Web)
- **Recording**: `rgb(220, 38, 38)` - Red accent

### Typography
- System fonts (SF Pro on iOS, Roboto on Android)
- Monospace for timing displays
- 16-17px body text, 28-32px headlines

### Interactions
- 44pt minimum touch targets
- Smooth 300-400ms animations
- Haptic feedback on gestures
- Bottom sheet modals for players

## 🛠 Technology Stack

- **Framework**: React Native 0.81 + Expo SDK 54
- **Navigation**: expo-router (file-based routing)
- **Audio**: expo-av (recording + playback)
- **Gestures**: react-native-gesture-handler + reanimated
- **Bottom Sheets**: @gorhom/bottom-sheet
- **Storage**: @react-native-async-storage/async-storage
- **AI**: @google/genai (Gemini 2.5 Flash)
- **Icons**: react-native-svg

## 📦 Installation

```bash
cd lyriq-mobile
npm install
```

## 🚀 Running the App

```bash
# Start Expo dev server
npm start

# Run on iOS simulator
npm run ios

# Run on Android emulator
npm run android

# Run on web
npm run web
```

## 🔐 Environment Variables

Create a `.env` file:

```env
EXPO_PUBLIC_GEMINI_API_KEY=your_api_key_here
```

## 📝 Next Steps

1. **Implement Lyric Editor** - Multi-line TextInput with formatting
2. **Build Section Management** - Add/delete/rename/reorder sections
3. **Create Recording UI** - Red button with timer and controls
4. **Bottom Sheet Players** - Waveform visualization and playback
5. **Gesture Handlers** - Swipe and drag interactions
6. **AI Integration UI** - Rhyme popups and suggestion modals
7. **Polish & Testing** - Animations, haptics, performance

## 🎯 Key Differences from Web Version

| Feature | Web Version | Mobile Version |
|---------|-------------|----------------|
| Text Editing | contentEditable | TextInput |
| Audio API | MediaRecorder | expo-av |
| Waveform | Canvas API | react-native-svg or custom |
| Gestures | Mouse events | GestureHandler |
| State | localStorage | AsyncStorage |
| Rich Text | HTML | Plain text with formatting |

## 🐛 Known Issues

- [ ] Waveform visualization pending (needs custom implementation)
- [ ] Haptic feedback not yet implemented
- [ ] Auto-save not yet enabled
- [ ] Section reordering drag-and-drop pending

## 📄 License

Proprietary - Lyriq Mobile App

---

**Status**: 🚧 Active Development (Phase 1 Complete)
**Version**: 1.0.0-alpha
**Last Updated**: Nov 2025
```

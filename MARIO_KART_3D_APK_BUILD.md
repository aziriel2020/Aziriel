# 🏎️ Mario Kart 3D - Android APK Build Guide

## Overview
This guide explains how to build the Mario Kart 3D racing game as an Android APK using Capacitor.

## 📱 Game Features
- **Full 3D Graphics**: Built with Three.js WebGL engine
- **8 Playable Characters**: Mario, Luigi, Peach, Toad, Yoshi, Bowser, Donkey Kong, Wario
- **7 AI Opponents**: Smart racing AI with varying difficulty
- **3-Lap Racing**: Complete checkpoint system with position tracking
- **Power-Ups**: 🚀 Speed Boost, 🐢 Shell Attack, 🍌 Banana, ⭐ Star Power
- **Touch Controls**: Optimized joystick and button controls for mobile
- **Responsive Design**: Works on all screen sizes
- **Real-time 3D Physics**: Smooth kart handling and collision detection

## 🎮 Controls

### Desktop/Laptop
- **Arrow Keys**: Steer and accelerate/brake
- **SPACE**: Use power-up items

### Mobile/Tablet
- **Virtual Joystick** (bottom-left): Steer your kart
- **GAS Button** (bottom-right): Accelerate
- **BRAKE Button** (bottom-right): Slow down
- **Tap Item Icon**: Use collected power-ups

## 🛠️ Prerequisites

### Required Software
1. **Node.js** (v18 or higher)
2. **npm** (v9 or higher)
3. **Android Studio** (for APK building)
4. **Java JDK** (v11 or higher)

### Install Android Studio
1. Download from: https://developer.android.com/studio
2. Install Android SDK and tools
3. Set up environment variables:
   ```bash
   export ANDROID_HOME=$HOME/Android/Sdk
   export PATH=$PATH:$ANDROID_HOME/tools
   export PATH=$PATH:$ANDROID_HOME/platform-tools
   ```

## 📦 Installation

### 1. Install Dependencies
```bash
npm install
```

This will install:
- Three.js (3D graphics engine)
- Capacitor core and CLI
- Capacitor Android platform
- All other dependencies

### 2. Verify Capacitor Setup
```bash
npx cap doctor
```

This checks that Capacitor and Android environment are correctly configured.

## 🔨 Building the APK

### Method 1: Debug APK (Quick Testing)
```bash
npm run cap:build:android
```

This command:
1. Syncs web assets to Android project
2. Builds a debug APK
3. Output: `android/app/build/outputs/apk/debug/app-debug.apk`

### Method 2: Release APK (Production)
```bash
npm run cap:build:android:release
```

**Note**: Release builds require signing with a keystore. See "Signing the APK" section below.

### Method 3: Using Android Studio (Recommended for Advanced)
```bash
npm run cap:open:android
```

This opens Android Studio where you can:
- Build and run the app
- Debug on emulator or real device
- Create signed release builds
- Customize Android-specific settings

## 🔐 Signing the APK (Release Builds)

### 1. Generate a Keystore
```bash
keytool -genkey -v -keystore mario-kart-release.keystore \
  -alias mario-kart-key -keyalg RSA -keysize 2048 -validity 10000
```

### 2. Configure Gradle Signing
Create `android/keystore.properties`:
```properties
storeFile=/path/to/mario-kart-release.keystore
storePassword=YOUR_STORE_PASSWORD
keyAlias=mario-kart-key
keyPassword=YOUR_KEY_PASSWORD
```

### 3. Update `android/app/build.gradle`
Add before `android` block:
```gradle
def keystorePropertiesFile = rootProject.file("keystore.properties")
def keystoreProperties = new Properties()
if (keystorePropertiesFile.exists()) {
    keystoreProperties.load(new FileInputStream(keystorePropertiesFile))
}
```

Add inside `android` block:
```gradle
signingConfigs {
    release {
        storeFile file(keystoreProperties['storeFile'])
        storePassword keystoreProperties['storePassword']
        keyAlias keystoreProperties['keyAlias']
        keyPassword keystoreProperties['keyPassword']
    }
}

buildTypes {
    release {
        signingConfig signingConfigs.release
        // ... other settings
    }
}
```

## 📲 Installing the APK

### On Android Device
1. Enable "Install from Unknown Sources" in device settings
2. Transfer APK to device
3. Tap the APK file to install
4. Launch "Mario Kart 3D" from app drawer

### Using ADB (Android Debug Bridge)
```bash
adb install android/app/build/outputs/apk/debug/app-debug.apk
```

## 🧪 Testing

### Test in Browser (Quick)
```bash
npm run game:serve
```
Open http://localhost:3000/mario-kart-3d.html

### Test on Android Emulator
1. Open Android Studio
2. Start an emulator (AVD Manager)
3. Run:
   ```bash
   npm run cap:open:android
   ```
4. Click "Run" in Android Studio

### Test on Real Device
1. Enable USB Debugging on Android device
2. Connect via USB
3. Run:
   ```bash
   npm run cap:open:android
   ```
4. Select your device and click "Run"

## 🎨 Customization

### App Icon and Splash Screen
1. Replace icons in `android/app/src/main/res/`:
   - `mipmap-hdpi/ic_launcher.png` (72x72)
   - `mipmap-mdpi/ic_launcher.png` (48x48)
   - `mipmap-xhdpi/ic_launcher.png` (96x96)
   - `mipmap-xxhdpi/ic_launcher.png` (144x144)
   - `mipmap-xxxhdpi/ic_launcher.png` (192x192)

2. Update splash screen in `android/app/src/main/res/drawable/`

### App Name and Package ID
Edit `capacitor.config.ts`:
```typescript
const config: CapacitorConfig = {
  appId: 'com.mariokart.racing',  // Change this
  appName: 'Mario Kart 3D',        // Change this
  webDir: 'public'
};
```

After changes, run:
```bash
npm run cap:sync
```

## 🐛 Troubleshooting

### "SDK location not found"
Set ANDROID_HOME environment variable:
```bash
export ANDROID_HOME=$HOME/Android/Sdk
```

### "Gradle build failed"
1. Check Java version: `java -version` (should be 11 or higher)
2. Clean gradle cache:
   ```bash
   cd android
   ./gradlew clean
   ```

### "WebView not loading"
1. Ensure `public` directory has all game files
2. Run `npm run cap:sync`
3. Rebuild the app

### Performance Issues
1. Enable hardware acceleration in Android settings
2. Test on device with WebGL support
3. Reduce graphics quality if needed (edit mario-kart-3d.html)

## 📊 File Structure
```
Aziriel/
├── public/
│   ├── index.html              # Auto-redirects to game
│   ├── mario-kart-3d.html      # Main 3D game file
│   ├── mario-kart.html         # 2D version (backup)
│   └── index-platform.html     # Original platform index
├── android/                     # Android project (auto-generated)
│   ├── app/
│   │   ├── build/
│   │   │   └── outputs/apk/    # Built APK files here
│   │   └── src/main/
│   │       ├── assets/public/  # Web assets copied here
│   │       └── res/            # Android resources
│   └── gradlew                 # Gradle wrapper
├── capacitor.config.ts         # Capacitor configuration
└── package.json                # Build scripts

## 🚀 Quick Commands Reference

| Command | Description |
|---------|-------------|
| `npm run cap:sync` | Sync web assets to Android |
| `npm run cap:open:android` | Open project in Android Studio |
| `npm run cap:build:android` | Build debug APK |
| `npm run cap:build:android:release` | Build release APK |
| `npm run game:serve` | Test game in browser |

## 📝 Additional Notes

### Performance Tips
- The game uses WebGL, ensure device supports it
- Recommended: Android 7.0+ with GPU acceleration
- Minimum RAM: 2GB
- Best experience: 4GB+ RAM devices

### Browser Compatibility
The game works in modern browsers:
- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Samsung Internet 14+

### Web Version
You can also host the game on a web server:
1. Upload `public/mario-kart-3d.html` to your server
2. Access via HTTPS (required for some features)
3. Share the URL with players

## 📄 License
This game is part of the Neurafield Quantum platform.
See main repository for license information.

## 🤝 Support
For issues or questions:
1. Check the troubleshooting section
2. Review Capacitor docs: https://capacitorjs.com
3. Check Three.js docs: https://threejs.org

## 🎮 Enjoy Racing!
Have fun playing Mario Kart 3D! 🏁
```

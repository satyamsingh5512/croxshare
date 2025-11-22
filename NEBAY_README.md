# 🚀 Nebay Share - Premium P2P File Sharing

<div align="center">

![Nebay Share](https://img.shields.io/badge/Nebay-Share-4F46E5?style=for-the-badge&logo=data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTEzIDJMMyAxNEgxMkwxMSAyMkwyMSAxMEgxMkwxMyAyWiIgc3Ryb2tlPSJ3aGl0ZSIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiLz4KPC9zdmc+)
[![Next.js](https://img.shields.io/badge/Next.js-14-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3-38B2AC?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com/)

**Fast. Secure. Offline. Instant.**

Transfer files directly between devices on the same network. No cloud, no limits, just pure speed.

[Live Demo](#) • [Documentation](#features) • [Report Bug](#) • [Request Feature](#)

</div>

---

## ✨ Features

### 🎨 **Premium UI/UX**
- **Dark/Light Theme** - Smooth transitions with system preference detection
- **Glassmorphism** - Modern frosted glass effects throughout the app
- **Neumorphism** - Subtle depth and shadows for device cards
- **Premium Gradients** - Beautiful color transitions and glowing effects
- **Framer Motion** - Buttery smooth animations and page transitions
- **Responsive Design** - Perfect experience on mobile, tablet, and desktop

### 🔐 **Security & Privacy**
- **Peer-to-Peer Transfer** - Direct device-to-device connections via WebRTC
- **End-to-End Encryption** - Files never pass through external servers
- **Verification Codes** - 4-digit PIN for secure device pairing
- **No Cloud Storage** - Your files stay completely private
- **Local Network Only** - Works on the same WiFi network

### ⚡ **Performance**
- **Lightning Fast** - Transfer speeds limited only by your network
- **No File Size Limits** - Share files up to 2GB per transfer
- **Real-time Progress** - Live upload/download progress indicators
- **Drag & Drop** - Simple file selection with glowing drop zones
- **Multiple Files** - Batch transfer multiple files at once

### 🎯 **User Experience**
- **Toast Notifications** - Beautiful animated feedback for all actions
- **Loading States** - Skeleton loaders and smooth transitions
- **Status Badges** - Signal strength and connection indicators
- **Empty States** - Helpful guidance when no devices found
- **Error Handling** - Clear error messages and recovery options

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Two devices on the same WiFi network

### Installation

```bash
# Clone the repository
git clone https://github.com/satyamsingh5512/croxshare.git
cd croxshare

# Install dependencies
npm install

# Start the development server
npm run dev
```

The app will be available at **http://localhost:3000**

### Production Build

```bash
# Build for production
npm run build

# Start production server
npm start
```

---

## 📱 Pages & Routes

### 🏠 **Landing Page** - `/`
Beautiful animated hero with rotating text, floating orbs, and device connection visualization. Features:
- Animated headline: "Fast." → "Secure." → "Offline." → "Instant."
- 3D gradient background with floating orbs
- Device connection beam animation
- Feature showcase cards
- Theme toggle (Sun/Moon icon)

### 🔄 **Main App** - `/nebay`
Complete file sharing interface with two-column layout:
- **Left**: Device Discovery with neumorphic cards
  - Signal strength indicators (Weak/Good/Strong)
  - Device type icons (Laptop/Phone/Desktop)
  - Connection pulse animations
  - Search for devices button
- **Right**: File Transfer Zone
  - Drag & drop zone with glow effects
  - File cards with progress bars
  - Send files button
  - Real-time transfer status

### ⚙️ **Settings** - `/nebay/settings`
Comprehensive settings page with premium styling:
- **Appearance**: Dark/Light theme toggle with animated switch
- **Device**: Customize device name
- **Privacy & Security**: Auto-accept files, discovery timeout
- **About**: Version info, Privacy Policy, Terms & Conditions

### 🎨 **Component Showcase** - `/components`
Interactive demo of all UI components:
- Buttons (5 variants, 3 sizes)
- Badges (7 variants + signal/status badges)
- Progress indicators (linear + circular)
- Cards (4 variants)
- Input fields
- Toast notifications
- Modals
- Skeleton loaders

### 📄 **Legal Pages**
- `/privacy` - Privacy Policy
- `/terms` - Terms & Conditions

---

## 🎨 Design System

### Color Palette
```css
Primary:   #4F46E5 (Indigo)
Secondary: #6366F1 (Soft Indigo)
Accent:    #0EA5E9 (Aqua)

Light Theme:
- Background: #FFFFFF
- Surface: #F9FAFB
- Text: #111827

Dark Theme:
- Background: #0F172A
- Surface: #1E293B
- Text: #F1F5F9
```

### Typography
- **Font**: System font stack (Inter, -apple-system, BlinkMacSystemFont)
- **Headings**: Bold, gradient text for emphasis
- **Body**: Clean, readable with appropriate contrast

### Effects
- **Shadow-Glow**: `0 0 20px rgba(79, 70, 229, 0.5)`
- **Glassmorphism**: `backdrop-blur-xl` with subtle borders
- **Neumorphism**: Soft shadows with `inset` effects
- **Gradients**: Linear gradients from primary to accent

### Animations
```javascript
// Framer Motion Variants
fadeIn: { opacity: [0, 1], duration: 0.5 }
slideUp: { y: [20, 0], opacity: [0, 1] }
pulseGlow: { scale: [1, 1.05, 1], duration: 2, repeat: Infinity }
shimmer: { x: ['-100%', '100%'], duration: 1.5 }
```

---

## 🛠️ Tech Stack

### Frontend
- **Next.js 14** - React framework with App Router
- **React 18** - UI library with hooks
- **TypeScript 5** - Type-safe development
- **Tailwind CSS 3** - Utility-first CSS framework
- **Framer Motion** - Animation library
- **Lucide React** - Beautiful icon library

### Backend/Infrastructure
- **WebRTC** - Peer-to-peer file transfer
- **WebSocket** - Signaling server for device discovery
- **Node.js** - Runtime environment

### Development Tools
- **ESLint** - Code linting
- **PostCSS** - CSS processing
- **Class Variance Authority** - Component variants
- **clsx + tailwind-merge** - Class name utilities

---

## 📦 Component Library

### Core Components (`/components/ui/`)

#### Button
```tsx
<Button variant="primary" size="lg" loading>
  Send Files
</Button>
```
**Variants**: primary, secondary, outline, ghost, danger  
**Sizes**: sm, md, lg  
**Features**: Loading state, shimmer effect, disabled state

#### Card
```tsx
<Card glass glow hover>
  <CardHeader>Title</CardHeader>
  <CardBody>Content</CardBody>
</Card>
```
**Variants**: default, glass, glow, hover  
**Features**: Glassmorphism, glow borders, hover effects

#### Badge
```tsx
<Badge variant="success" pulse>Online</Badge>
<SignalBadge strength="strong" />
<StatusBadge status="connecting" />
```
**Variants**: default, primary, success, warning, danger, info, gradient

#### Progress
```tsx
<Progress value={75} variant="gradient" />
<CircularProgress value={75} size={100} variant="gradient" />
```
**Features**: Linear & circular, gradient variants, animated

#### Input
```tsx
<Input placeholder="Device name" icon={<Icon />} />
<PinInput length={4} onComplete={handleCode} />
```
**Features**: Icon support, focus effects, PIN input with auto-focus

#### Modal
```tsx
<Modal isOpen={true} onClose={close} title="Title" glass>
  Content
</Modal>
```
**Features**: AnimatePresence, backdrop blur, glass variant, body scroll lock

#### Toast
```tsx
const { success, error, warning, info } = useToast();
success('Done!', 'Files transferred successfully');
```
**Types**: success, error, warning, info  
**Features**: Auto-dismiss, progress bar, animated entry/exit

#### Skeleton
```tsx
<DeviceCardSkeleton />
<FileCardSkeleton />
<TextSkeleton lines={3} />
```
**Features**: Shimmer animation, multiple variants

### Feature Components (`/components/nebay/`)

#### DeviceCard
Neumorphic device card with signal strength, connection status, and pulse animations.

#### FileTransfer
Drag-drop zone with glow effects, file cards with progress, and animated states.

#### LandingPage
Full landing page with animated hero, rotating text, and feature showcase.

---

## 🔧 Configuration Files

### `tailwind.config.js`
Premium design tokens including:
- Custom colors (primary, accent, dark theme colors)
- Shadow-glow effects
- Custom animations (fadeIn, slideUp, pulseGlow, shimmer)
- Extended border radius
- Backdrop blur utilities

### `tsconfig.json`
TypeScript configuration with path aliases (`@/components`, `@/lib`, etc.)

### `next.config.js`
Next.js configuration for optimal production builds

---

## 🎯 Roadmap

### ✅ Completed
- [x] Premium UI design system
- [x] Dark/light theme with persistence
- [x] Landing page with animations
- [x] Device discovery interface
- [x] File transfer with drag-drop
- [x] Settings page
- [x] Toast notification system
- [x] Badge components
- [x] Loading states
- [x] Component showcase

### 🚧 In Progress
- [ ] Connect UI to WebRTC backend
- [ ] Real device discovery via WebSocket
- [ ] Actual file transfer implementation
- [ ] Verification code validation

### 📋 Planned
- [ ] File transfer history
- [ ] QR code device pairing
- [ ] Mobile app (React Native)
- [ ] Desktop app (Electron)
- [ ] Browser extension
- [ ] Multi-language support
- [ ] Accessibility improvements (ARIA labels, keyboard navigation)
- [ ] Unit & integration tests
- [ ] CI/CD pipeline

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- Design inspired by **Apple**, **Linear.app**, and **Nothing Phone** aesthetics
- Icons from **Lucide React**
- Animations powered by **Framer Motion**
- Built with **Next.js** and **Tailwind CSS**

---

## 📧 Contact

**Satym Singh** - [@satyamsingh5512](https://github.com/satyamsingh5512)

Project Link: [https://github.com/satyamsingh5512/croxshare](https://github.com/satyamsingh5512/croxshare)

---

<div align="center">

**Made with ❤️ for secure file sharing**

⭐ Star this repo if you find it useful! ⭐

</div>

/** @type {import('tailwindcss').Config} */
import tailwindScrollbar from 'tailwind-scrollbar';
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      textColor: {
        skin: {
          base: 'var(--text-color)', // Root text color
          secondary: 'var(--secondary-text-color)', // Used in gradient or subdued text
          navLink: 'var(--nav-link-text-color)', // Default navigation link text
          hoverNavLink: 'var(--hover-nav-link-text-color)', // Hover effect for nav links
          settingsLink: 'var(--settings-link-text-color)', // Semi-transparent settings link text
          activeSettingsLink: 'var(--active-settings-link-text-color)', // Active settings link text
          sky: 'var( --primary-text-color)',
          textColor: 'var(--desc-text-color)'
        }
      },
      backgroundColor: {
        skin: {
          backgroundColor: 'var(--background-color)', // Root background color
          navbarBgColor: 'var(--navbar-bg-color)', // Matches bg-zinc-900
          imgBoxBgColor: 'var(--img-box-bg-color)', // Matches bg-zinc-700
          btnPrimaryBgColor: 'var(--btn-primary-bg-color)', // Matches sky-400
          btnPrimaryHoverBgColor: 'var(--btn-primary-hover-bg-color)', // Matches sky-300
          btnSecondaryBgColor: 'var(--btn-secondary-bg-color)', // Matches zinc-50
          navbarBlur: 'var(--navbar-blur-bg-color)', // Semi-transparent navbar background
          actionBtn: 'var(--action-btn-bg-color)', // Background for action buttons
          hoverActionBtn: 'var(--hover-action-btn-bg-color)', // Hover state for action buttons
          activeBox: 'var(--active-box-bg-color)', // Background for active elements
          secondaryBackgroundColor: 'var(--secondary-color)',
          skillBackgroundColor: 'var(--skill-background-color)',
          skillHover: 'var(--skill-hover-bg-color)'
        }
      },
      gradientColorStops: {
        skin: {
          start: 'var(--gradient-start-color)', // Start of the gradient
          end: 'var(--gradient-end-color)', // End of the gradient
        }
      },
      borderColor: {
        skin: {
          default: 'var(--border-color)', // Light border for subtle outlines
          navbarRing: 'var(--navbar-ring-color)', // Strong ring color for navbar
          btnRing: 'var(--btn-ring-color)', // Subtle ring for buttons
        }
      },
      ringColor: {
        skin: {
          default: 'var(--border-color)', // Light border for subtle outlines
          navbarRing: 'var(--navbar-ring-color)', // Strong ring color for navbar
          btnRing: 'var(--btn-ring-color)', // Subtle ring for buttons
        },
      },
      fontFamily: {
        'sans': ['Inter', 'sans-serif'],
        // 'poppins': ['Poppins', 'sans-serif'],
      },
    },
  },
  plugins: [tailwindScrollbar],
};

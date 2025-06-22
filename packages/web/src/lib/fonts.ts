export const fonts = [
  "BigBlue TerminalPlus",
  "Courier",
  "Fira Code VF",
  "IBM Plex Mono",
  "Inconsolata",
  "JetBrains Mono",
  "jgs_Font",
  "Monaco",
  "Monocraft Nerd Font",
  "OpenDyslexicMono",
  "Roboto Mono",
  "Steps Mono",
  "Syne Mono",
  "Ubuntu Mono",
  "VT323",
];

const fontStylesheets: { [fontFamily: string]: string } = {
  "BigBlue TerminalPlus": "/assets/fonts/BigBlue/stylesheet.css",
  "Fira Code VF": "/assets/fonts/FiraCode/stylesheet.css",
  "IBM Plex Mono": "/assets/fonts/IBM Plex Mono/stylesheet.css",
  "JetBrains Mono": "/assets/fonts/JetBrains/stylesheet.css",
  jgs_Font: "/assets/fonts/JGS/stylesheet.css",
  "Monocraft Nerd Font": "/assets/fonts/Monocraft/stylesheet.css",
  OpenDyslexicMono: "/assets/fonts/OpenDyslexic/stylesheet.css",
  "Roboto Mono": "/assets/fonts/RobotoMono/stylesheet.css",
  "Steps Mono": "/assets/fonts/StepsMono/stylesheet.css",
  "Syne Mono": "/assets/fonts/SyneMono/stylesheet.css",
  "Ubuntu Mono": "/assets/fonts/UbuntuMono/stylesheet.css",
  VT323: "/assets/fonts/VT323/stylesheet.css",
};

const loadedFonts = new Set<string>();

export const loadFont = async (fontFamily: string): Promise<void> => {
  if (loadedFonts.has(fontFamily)) return;

  // If the font does not have a stylesheets, we assume it's a system font
  if (!fontStylesheets[fontFamily]) {
    loadedFonts.add(fontFamily);
    return;
  }

  try {
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = fontStylesheets[fontFamily];

    // Wait for the stylesheet to load
    await new Promise((resolve, reject) => {
      link.onload = resolve;
      link.onerror = reject;
      document.head.appendChild(link);
    });

    loadedFonts.add(fontFamily);
  } catch (error) {
    console.warn(`Failed to load font: ${fontFamily}`, error);
  }
};

export default fonts;

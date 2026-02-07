/**
 * Font loading utility for canvas rendering
 * Ensures fonts are loaded before canvas operations
 */

const FONT_DEFINITIONS = [
  { name: 'BlackMango-Bold', url: '/fonts/BlackMango-Bold.otf', format: 'opentype' },
  { name: 'Bodoni 72 Smallcaps', url: '/fonts/Bodoni 72 Smallcaps Book.ttf', format: 'truetype' },
  { name: 'Bright', url: '/fonts/Bright TTF.ttf', format: 'truetype' },
  { name: 'Farmhouse', url: '/fonts/Farmhouse.ttf', format: 'truetype' },
  { name: 'Futura', url: '/fonts/Futura.ttc', format: 'truetype-collection' },
  { name: 'Greycliff CF Thin', url: '/fonts/Greycliff_CF_Thin.otf', format: 'opentype' },
  { name: 'SignPainter', url: '/fonts/SignPainter.ttc', format: 'truetype-collection' },
  { name: 'Sloop Script Three', url: '/fonts/Sloop-ScriptThree.ttf', format: 'truetype' },
];

/**
 * Preload fonts using FontFace API (more reliable for production)
 */
export const preloadFontsWithFontFace = async () => {
  if (!window.FontFace) {
    console.warn('FontFace API not available, using fallback method');
    return false;
  }

  const loadableFonts = FONT_DEFINITIONS.filter(
    (fontDef) => fontDef.format !== 'truetype-collection'
  );

  const fontPromises = loadableFonts.map(async (fontDef) => {
    try {
      // Check if font is already loaded
      const fontString = `16px "${fontDef.name}"`;
      if (document.fonts && document.fonts.check(fontString)) {
        return true;
      }

      // Load font using FontFace API (skip .ttc collections; not widely supported)
      const fontFace = new FontFace(
        fontDef.name,
        `url(${window.location.origin}${fontDef.url}) format('${fontDef.format}')`
      );

      await fontFace.load();
      document.fonts.add(fontFace);
      
      console.log(`Font loaded: ${fontDef.name}`);
      return true;
    } catch (error) {
      console.error(`Failed to load font ${fontDef.name}:`, error);
      return false;
    }
  });

  const results = await Promise.all(fontPromises);
  const allLoaded = results.every(r => r);
  
  if (allLoaded) {
    console.log('All fonts loaded successfully');
  } else {
    console.warn('Some fonts failed to load:', results);
  }

  return allLoaded;
};

/**
 * Preload fonts by creating hidden elements (fallback method)
 */
export const preloadFontsWithElements = async (fontFamilies = []) => {
  const fontsToLoad = fontFamilies.length > 0 
    ? fontFamilies.map(f => f.replace(/'/g, '').replace(/,.*$/g, '').trim())
    : FONT_DEFINITIONS.map(f => f.name);

  const preloadElements = [];

  fontsToLoad.forEach(fontName => {
    const testEl = document.createElement('span');
    testEl.style.fontFamily = `"${fontName}", Arial, sans-serif`;
    testEl.style.position = 'absolute';
    testEl.style.visibility = 'hidden';
    testEl.style.fontSize = '48px';
    testEl.style.whiteSpace = 'nowrap';
    testEl.textContent = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    testEl.setAttribute('data-font-preload', fontName);
    document.body.appendChild(testEl);
    preloadElements.push(testEl);
    
    // Force layout calculation
    void testEl.offsetWidth;
  });

  // Wait for fonts to load
  if (document.fonts && document.fonts.ready) {
    await document.fonts.ready;
  }

  // Additional wait
  await new Promise(resolve => setTimeout(resolve, 500));

  // Verify fonts are loaded
  let allLoaded = true;
  fontsToLoad.forEach(fontName => {
    const fontString = `16px "${fontName}"`;
    const isLoaded = document.fonts && document.fonts.check 
      ? document.fonts.check(fontString)
      : true; // Assume loaded if API not available
    
    if (!isLoaded) {
      console.warn(`Font not loaded: ${fontName}`);
      allLoaded = false;
    }
  });

  // Clean up
  preloadElements.forEach(el => {
    try {
      document.body.removeChild(el);
    } catch (e) {
      // Element might already be removed
    }
  });

  return allLoaded;
};

/**
 * Wait for specific fonts to be loaded
 */
export const waitForFonts = async (fontFamilies, maxWaitTime = 10000) => {
  if (!fontFamilies || fontFamilies.length === 0) return true;

  const cleanFonts = fontFamilies.map(f => 
    f.replace(/'/g, '').replace(/,.*$/g, '').trim()
  );

  // Try FontFace API first
  const fontFaceLoaded = await preloadFontsWithFontFace();
  if (fontFaceLoaded) {
    // Verify specific fonts are loaded
    const allLoaded = cleanFonts.every(fontName => {
      const fontString = `16px "${fontName}"`;
      return document.fonts && document.fonts.check 
        ? document.fonts.check(fontString)
        : true;
    });

    if (allLoaded) {
      await new Promise(resolve => setTimeout(resolve, 200));
      return true;
    }
  }

  // Fallback to element method
  return await preloadFontsWithElements(cleanFonts);
};

/**
 * Check if a specific font is loaded
 */
export const isFontLoaded = (fontFamily) => {
  if (!document.fonts || !document.fonts.check) {
    return true; // Assume loaded if API not available
  }

  const cleanFont = fontFamily
    .replace(/'/g, '')
    .replace(/,.*$/g, '')
    .trim();

  const fontString = `16px "${cleanFont}"`;
  return document.fonts.check(fontString);
};

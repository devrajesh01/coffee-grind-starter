export interface CoffeeProfile {
  id: string;
  name: string;
  tagline: string;
  origin: {
    region: string;
    altitude: string;
    process: string;
    farm: string;
  };
  roast: {
    level: string;
    description: string;
    intensity: number; // 1-5
    temp: string;
  };
  flavor: {
    primary: string;
    notes: string[];
    acidity: string;
    body: string;
  };
  cupColor: number;
  lipColor: number;
}

export const coffeeProfiles: CoffeeProfile[] = [
  {
    id: 'colombia',
    name: 'Huila Reserve',
    tagline: 'Balanced sweetness & silky body',
    origin: {
      region: 'Huila, Colombia',
      altitude: '1,850m MASL',
      process: 'Washed Extended Fermentation',
      farm: 'Finca Las Flores'
    },
    roast: {
      level: 'Medium Roast',
      description: 'Slow-roasted in small batches to preserve chocolate & caramel notes',
      intensity: 3,
      temp: '204°F / 95°C'
    },
    flavor: {
      primary: 'Chocolate & Toasted Hazelnut',
      notes: ['Dark Cacao', 'Golden Caramel', 'Toasted Hazelnut', 'Red Apple'],
      acidity: 'Mild & Crisp',
      body: 'Silky Smooth'
    },
    cupColor: 0xa95d3d, // warm terracotta
    lipColor: 0xd6b99d  // cream sand glaze
  },
  {
    id: 'ethiopia',
    name: 'Yirgacheffe Blossom',
    tagline: 'Floral aromatics & sparkling clarity',
    origin: {
      region: 'Yirgacheffe, Ethiopia',
      altitude: '2,100m MASL',
      process: 'Natural Sun-Dried on Raised Beds',
      farm: 'Konga Station'
    },
    roast: {
      level: 'Light Roast',
      description: 'Delicate roast unlocking ethereal jasmine & citrus floral notes',
      intensity: 2,
      temp: '198°F / 92°C'
    },
    flavor: {
      primary: 'Jasmine & Bergamot',
      notes: ['White Jasmine', 'Sweet Bergamot', 'Meyer Lemon', 'Wild Honey'],
      acidity: 'Vibrant Citric',
      body: 'Tea-like & Clean'
    },
    cupColor: 0x4a6356, // earthy sage green
    lipColor: 0xe8e2d2  // warm ivory glaze
  },
  {
    id: 'guatemala',
    name: 'Antigua Volcán',
    tagline: 'Deep richness & smoky cocoa notes',
    origin: {
      region: 'Antigua, Guatemala',
      altitude: '1,650m MASL',
      process: 'Full Washed & Sun Dried',
      farm: 'San Sebastián Estate'
    },
    roast: {
      level: 'Medium-Dark Roast',
      description: 'Rich volcanic soil profile developed for intense espresso & pour-over',
      intensity: 4,
      temp: '208°F / 97°C'
    },
    flavor: {
      primary: 'Smoky Dark Cocoa',
      notes: ['85% Dark Chocolate', 'Roasted Almond', 'Brown Sugar', 'Cardamom'],
      acidity: 'Low & Rounded',
      body: 'Full & Velvety'
    },
    cupColor: 0x2b2927, // dark charcoal ceramic
    lipColor: 0xc89868  // toasted ochre rim
  },
  {
    id: 'costa-rica',
    name: 'Tarrazú Honey',
    tagline: 'Stonefruit sweetness & golden honey glaze',
    origin: {
      region: 'Tarrazú, Costa Rica',
      altitude: '1,900m MASL',
      process: 'Yellow Honey Process',
      farm: 'Cerro Paldo'
    },
    roast: {
      level: 'Medium-Light Roast',
      description: 'Retains natural pulp sweetness during slow sun-drying',
      intensity: 3,
      temp: '202°F / 94°C'
    },
    flavor: {
      primary: 'Stonefruit & Honeycomb',
      notes: ['Ripe Nectarine', 'Orange Blossom Honey', 'Graham Cracker', 'Vanilla'],
      acidity: 'Juicy & Bright',
      body: 'Creamy & Syrupy'
    },
    cupColor: 0x8a4b32, // deep terracotta clay
    lipColor: 0xf3e5d0  // buttermilk glaze
  }
];

export const grindContent = {
  brand: 'POUR / PLAY',
  nav: ['Home', 'Story', 'Contact Us'],
  signIn: 'Sign in',
  eyebrow: 'SECTION 1 — GRIND',
  heading: 'GRIND',
  caption: 'From whole bean to the perfect grind.',
  next: 'SCROLL TO EXPLORE',
  footer: 'CRAFTED FOR THE RITUAL',
};

export const siteContent = {
  brand: 'POUR / PLAY',
  nav: [
    { label: 'Home', href: '#section-grind' },
    { label: 'Ritual', href: '#section-pour' },
    { label: 'Origins', href: '#section-sip' },
    { label: 'Contact Us', href: '#contact' }
  ],
  signIn: 'Sign Up',
  scenes: [
    {
      id: 'grind',
      eyebrow: 'SECTION 1 — GRIND',
      title: 'GRIND',
      subtitle: 'Precision 48mm Conical Burr',
      description: 'From whole single-origin bean into uniform micron-consistent particles. Every micron matters.'
    },
    {
      id: 'pour',
      eyebrow: 'SECTION 2 — POUR',
      title: 'POUR',
      subtitle: 'The 45-Second Golden Bloom',
      description: 'Slow helical water stream at 95°C gently saturating freshly ground bed, releasing aromatic CO₂.'
    },
    {
      id: 'sip',
      eyebrow: 'SECTION 3 — SIP',
      title: 'SIP',
      headline: 'FIND YOUR CUP',
      subtitle: 'Artisan Wheel-Thrown Stoneware',
      description: 'Pure tactile delight. Discover single-origin roast notes tailored to your morning ritual.'
    }
  ]
};

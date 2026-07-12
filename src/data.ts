import { Laptop, Testimonial } from './types';

export const ACTIVE_LAPTOPS: Laptop[] = [
  {
    id: 'lap-001',
    name: 'Apple MacBook Pro 14" (M1 Pro)',
    brand: 'Apple',
    year: 2021,
    price: 950,
    originalPrice: 1999,
    condition: 'Very Clean',
    batteryHealth: 89,
    batteryNote: '89% Health • 142 Cycles • Healthy',
    specs: {
      cpu: 'Apple M1 Pro (8-Core CPU / 14-Core GPU)',
      ram: '16GB LPDDR5 Unified Memory',
      storage: '512GB Superfast NVMe SSD',
      screen: '14.2" Liquid Retina XDR (3024 x 1964) 120Hz ProMotion',
      graphics: 'Integrated 14-Core Apple GPU'
    },
    image: 'https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?auto=format&fit=crop&w=800&q=80',
    additionalImages: [
      'https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1603302576837-37561b2e2302?auto=format&fit=crop&w=800&q=80'
    ],
    stockCount: 1, // Only 1 left triggers low stock
    useCategory: 'Design',
    description: 'Stunning space gray MacBook Pro in pristine condition. Zero visible scratches on screen or casing. Comes with original Apple 67W USB-C fast charger. Fully tested and certified.',
    serialNumber: 'C02HG89HQ05D',
    inspectionPassed: true
  },
  {
    id: 'lap-002',
    name: 'Lenovo ThinkPad T14 Gen 2',
    brand: 'Lenovo',
    year: 2021,
    price: 480,
    originalPrice: 1249,
    condition: 'Clean',
    batteryHealth: 91,
    batteryNote: '91% Health • 82 Cycles • Excellent',
    specs: {
      cpu: 'Intel Core i7-1165G7 (Up to 4.70 GHz)',
      ram: '16GB DDR4 (Up to 48GB upgradable)',
      storage: '512GB PCIe NVMe M.2 SSD',
      screen: '14" FHD (1920 x 1080) IPS, Anti-Glare',
      graphics: 'Intel Iris Xe Graphics'
    },
    image: 'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?auto=format&fit=crop&w=800&q=80',
    additionalImages: [
      'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1541807084-5c52b6b3adef?auto=format&fit=crop&w=800&q=80'
    ],
    stockCount: 2, // 2 left
    useCategory: 'Work',
    description: 'Classic professional black ThinkPad chassis with the legendary comfortable keyboard. Extremely reliable. Minor surface scuffs on the top cover, keyboard and display are absolutely spotless.',
    serialNumber: 'PC1X9K2L',
    inspectionPassed: true
  },
  {
    id: 'lap-003',
    name: 'Dell XPS 13 9310 Touch',
    brand: 'Dell',
    year: 2021,
    price: 680,
    originalPrice: 1499,
    condition: 'Very Clean',
    batteryHealth: 87,
    batteryNote: '87% Health • Normal wear • Reliable',
    specs: {
      cpu: 'Intel Core i7-1185G7 (11th Gen Evo platform)',
      ram: '16GB LPDDR4x dual-channel',
      storage: '1TB NVMe PCIe Gen3 SSD',
      screen: '13.4" 4K UHD+ (3840 x 2400) InfinityEdge Touchscreen',
      graphics: 'Intel Iris Xe Graphics'
    },
    image: 'https://images.unsplash.com/photo-1593642632823-8f785ba67e45?auto=format&fit=crop&w=800&q=80',
    additionalImages: [
      'https://images.unsplash.com/photo-1593642632823-8f785ba67e45?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1496181130204-7552cc145cdb?auto=format&fit=crop&w=800&q=80'
    ],
    stockCount: 1, // Only 1 left
    useCategory: 'Design',
    description: 'Platinum silver exterior with black carbon fiber palmrest. Incredible borderless 4K touch display with infinite colors. Perfect for graphic designers and students alike.',
    serialNumber: '8FJKZ03',
    inspectionPassed: true
  },
  {
    id: 'lap-004',
    name: 'HP EliteBook 840 G8',
    brand: 'HP',
    year: 2021,
    price: 390,
    originalPrice: 1150,
    condition: 'Good',
    batteryHealth: 84,
    batteryNote: '84% Health • Solid runtime • Verified',
    specs: {
      cpu: 'Intel Core i5-1145G7 vPro Processor',
      ram: '16GB DDR4 3200MHz RAM',
      storage: '256GB PCIe NVMe SSD',
      screen: '14" FHD (1920 x 1080) IPS, Anti-Glare',
      graphics: 'Intel UHD Graphics'
    },
    image: 'https://images.unsplash.com/photo-1541807084-5c52b6b3adef?auto=format&fit=crop&w=800&q=80',
    additionalImages: [
      'https://images.unsplash.com/photo-1541807084-5c52b6b3adef?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1603302576837-37561b2e2302?auto=format&fit=crop&w=800&q=80'
    ],
    stockCount: 4,
    useCategory: 'School',
    description: 'Premium aluminum build with high corporate-grade security. Lightweight, robust, and ideal for office work or university projects. Light scratches on the outer lid, but internally excellent.',
    serialNumber: '5CG1248H7Z',
    inspectionPassed: true
  },
  {
    id: 'lap-005',
    name: 'Apple MacBook Air 13" (M1)',
    brand: 'Apple',
    year: 2020,
    price: 540,
    originalPrice: 999,
    condition: 'Very Clean',
    batteryHealth: 92,
    batteryNote: '92% Health • 98 Cycles • Excellent',
    specs: {
      cpu: 'Apple M1 (8-core CPU / 7-core GPU)',
      ram: '8GB Unified RAM',
      storage: '256GB SSD Storage',
      screen: '13.3" Retina Display (2560 x 1600) with True Tone',
      graphics: 'Integrated 7-Core Apple GPU'
    },
    image: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=800&q=80',
    additionalImages: [
      'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1496181130204-7552cc145cdb?auto=format&fit=crop&w=800&q=80'
    ],
    stockCount: 3,
    useCategory: 'School',
    description: 'Fanless, completely silent operation. Space Gray. Absolute battery champion that easily lasts a full day. Screen glass, keyboard and aluminum body are in outstanding shape.',
    serialNumber: 'FVFDK3L5Q05D',
    inspectionPassed: true
  },
  {
    id: 'lap-006',
    name: 'Lenovo ThinkPad X1 Carbon Gen 8',
    brand: 'Lenovo',
    year: 2020,
    price: 520,
    originalPrice: 1599,
    condition: 'Very Clean',
    batteryHealth: 88,
    batteryNote: '88% Health • Lightweight leader',
    specs: {
      cpu: 'Intel Core i7-10610U vPro (10th Gen)',
      ram: '16GB LPDDR3 soldered',
      storage: '512GB PCIe NVMe SSD',
      screen: '14" FHD (1920 x 1080) IPS, Low Power, 400 nits',
      graphics: 'Intel UHD Graphics'
    },
    image: 'https://images.unsplash.com/photo-1525547719571-a2d4ac8945e2?auto=format&fit=crop&w=800&q=80',
    additionalImages: [
      'https://images.unsplash.com/photo-1525547719571-a2d4ac8945e2?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?auto=format&fit=crop&w=800&q=80'
    ],
    stockCount: 1, // Only 1 left
    useCategory: 'Work',
    description: 'Weighing only 2.4 lbs, this premium carbon-fiber business laptop combines ultimate durability with power. Excellent condition, with deep matte black finish completely intact.',
    serialNumber: 'PF2K8N1M',
    inspectionPassed: true
  },
  {
    id: 'lap-007',
    name: 'HP Spectre x360 Convertible',
    brand: 'HP',
    year: 2021,
    price: 640,
    originalPrice: 1399,
    condition: 'Very Clean',
    batteryHealth: 90,
    batteryNote: '90% Health • 115 Cycles • Excellent',
    specs: {
      cpu: 'Intel Core i7-1165G7 (11th Gen)',
      ram: '16GB LPDDR4x RAM',
      storage: '512GB NVMe M.2 SSD + 32GB Optane',
      screen: '13.3" FHD (1920 x 1080) IPS Multi-Touch x360',
      graphics: 'Intel Iris Xe Graphics'
    },
    image: 'https://images.unsplash.com/photo-1496181130204-7552cc145cdb?auto=format&fit=crop&w=800&q=80',
    additionalImages: [
      'https://images.unsplash.com/photo-1496181130204-7552cc145cdb?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1541807084-5c52b6b3adef?auto=format&fit=crop&w=800&q=80'
    ],
    stockCount: 2,
    useCategory: 'Design',
    description: 'Stunning Nightfall Black with Copper Accent luxury convertible 2-in-1 laptop. Rotates 360 degrees for tablet use. Complete with HP active stylus pen and protective leather sleeve.',
    serialNumber: 'CND1058X7Y',
    inspectionPassed: true
  },
  {
    id: 'lap-008',
    name: 'Dell Latitude 7420 Business',
    brand: 'Dell',
    year: 2021,
    price: 430,
    originalPrice: 1200,
    condition: 'Clean',
    batteryHealth: 86,
    batteryNote: '86% Health • Checked & secure',
    specs: {
      cpu: 'Intel Core i5-1135G7 Processor',
      ram: '16GB LPDDR4x Memory',
      storage: '256GB PCIe NVMe Class 35 SSD',
      screen: '14" FHD (1920 x 1080) ComfortView Plus WVA',
      graphics: 'Intel Iris Xe Graphics'
    },
    image: 'https://images.unsplash.com/photo-1603302576837-37561b2e2302?auto=format&fit=crop&w=800&q=80',
    additionalImages: [
      'https://images.unsplash.com/photo-1603302576837-37561b2e2302?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1593642632823-8f785ba67e45?auto=format&fit=crop&w=800&q=80'
    ],
    stockCount: 5,
    useCategory: 'Work',
    description: 'High-end enterprise business laptop. Highly durable carbon-fiber hybrid shell. Clean cosmetic appearance with very minor scratching on sides. Quiet, super-responsive cooling.',
    serialNumber: '9JKX62D',
    inspectionPassed: true
  }
];

export const SOLD_LAPTOPS: Laptop[] = [
  {
    id: 'sold-001',
    name: 'Apple MacBook Pro 16" (Intel i7)',
    brand: 'Apple',
    year: 2019,
    price: 620,
    condition: 'Clean',
    batteryHealth: 83,
    batteryNote: '83% Health • Certified Good',
    specs: {
      cpu: '2.6GHz 6-core Intel Core i7',
      ram: '16GB DDR4 RAM',
      storage: '512GB Flash SSD',
      screen: '16" Retina display with True Tone',
      graphics: 'AMD Radeon Pro 5300M (4GB GDDR6)'
    },
    image: 'https://images.unsplash.com/photo-1603302576837-37561b2e2302?auto=format&fit=crop&w=800&q=80',
    additionalImages: [],
    stockCount: 0,
    useCategory: 'Design',
    description: 'Sold item. Classic premium 16-inch workhorse.',
    serialNumber: 'C02Z612DMD6W',
    inspectionPassed: true,
    isSold: true,
    buyerName: 'David K.',
    buyerFeedback: 'Arrived in exactly the condition described. Screen looks spotless and battery easily lasts 6+ hours of heavy Chrome usage. Excellent service and secure delivery.',
    deliveredDate: 'Delivered 2 days ago'
  },
  {
    id: 'sold-002',
    name: 'Lenovo ThinkPad X1 Carbon Gen 7',
    brand: 'Lenovo',
    year: 2019,
    price: 390,
    condition: 'Very Clean',
    batteryHealth: 85,
    batteryNote: '85% Health • Checked',
    specs: {
      cpu: 'Intel Core i7-8665U vPro',
      ram: '16GB RAM',
      storage: '512GB NVMe SSD',
      screen: '14" FHD IPS low-power anti-glare',
      graphics: 'Intel UHD Graphics 620'
    },
    image: 'https://images.unsplash.com/photo-1525547719571-a2d4ac8945e2?auto=format&fit=crop&w=800&q=80',
    additionalImages: [],
    stockCount: 0,
    useCategory: 'Work',
    description: 'Sold item. Featherlight carbon fiber build.',
    serialNumber: 'PF1K2B90',
    inspectionPassed: true,
    isSold: true,
    buyerName: 'Sarah M.',
    buyerFeedback: 'Keyboard looks and feels brand new, not greasy at all! Delivery was fast and tracking was transparent. Really impressed with the quality checks.',
    deliveredDate: 'Delivered yesterday'
  },
  {
    id: 'sold-003',
    name: 'HP Pavilion 15 Core i5',
    brand: 'HP',
    year: 2021,
    price: 340,
    condition: 'Good',
    batteryHealth: 81,
    batteryNote: '81% Health • Verified',
    specs: {
      cpu: 'Intel Core i5-1135G7 (11th Gen)',
      ram: '8GB DDR4 RAM',
      storage: '512GB NVMe M.2 SSD',
      screen: '15.6" FHD IPS Micro-edge',
      graphics: 'Intel Iris Xe Graphics'
    },
    image: 'https://images.unsplash.com/photo-1593642702821-c8da6771f0c6?auto=format&fit=crop&w=800&q=80',
    additionalImages: [],
    stockCount: 0,
    useCategory: 'School',
    description: 'Sold item. Large high-definition student daily helper.',
    serialNumber: '5CD142H9JK',
    inspectionPassed: true,
    isSold: true,
    buyerName: 'Marcus T.',
    buyerFeedback: 'Perfect companion for college lectures and writing assignments. Disclosed minor scratch on the underside is barely noticeable. Unbeatable value!',
    deliveredDate: 'Delivered 3 days ago'
  }
];

export const TESTIMONIALS: Testimonial[] = [
  {
    id: 't-001',
    name: 'Dr. Evelyn Peters',
    role: 'Freelance Architect & Researcher',
    quote: 'Finding used tech you can trust is hard. They gave me the exact serial number, battery report, and photographs of the MacBook. It arrived spotless and operates like clockwork.',
    rating: 5,
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=120&h=120&q=80',
    verifiedPurchase: true,
    laptopBought: 'Apple MacBook Pro 14" (2021)'
  },
  {
    id: 't-002',
    name: 'Samuel Adebayo',
    role: 'Software Engineering Lead',
    quote: 'I needed a solid Linux sandbox machine so I picked up a ThinkPad T14. The battery was guaranteed at 91% and it hit that target perfectly. Clean thermal paste, zero dust inside. Outstanding service.',
    rating: 5,
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=120&h=120&q=80',
    verifiedPurchase: true,
    laptopBought: 'Lenovo ThinkPad T14'
  },
  {
    id: 't-003',
    name: 'Clara Jenkins',
    role: 'Computer Science Student',
    quote: 'Being a student on a tight budget made me anxious about used devices. The 3-day verification guarantee gave me the peace of mind I needed. The HP Elitebook is lightweight and works beautifully.',
    rating: 5,
    avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=120&h=120&q=80',
    verifiedPurchase: true,
    laptopBought: 'HP EliteBook 840 G8'
  }
];

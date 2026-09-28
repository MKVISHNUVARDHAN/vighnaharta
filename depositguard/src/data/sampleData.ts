import { Property, RoomType } from '../types';

export const ROOM_METADATA: Record<RoomType, { name: string; icon: string; defaultChecklist: string[] }> = {
  living: {
    name: 'Living Room',
    icon: 'Sofa',
    defaultChecklist: [
      'Walls & Ceiling paint condition',
      'Ceiling fan & speed regulator',
      'Floor tiles & skirting boards',
      'Switchboards & power sockets',
      'Main entry door lock & handle',
      'Curtain rods & window glass'
    ]
  },
  master_bedroom: {
    name: 'Master Bedroom',
    icon: 'BedDouble',
    defaultChecklist: [
      'Wardrobe sliding tracks & locks',
      'AC unit & remote cooling test',
      'Bedroom door latch & keys',
      'Bed frame & headboard condition',
      'Window mosquito net & latches',
      'Ceiling lights & switchboards'
    ]
  },
  guest_bedroom: {
    name: 'Guest Bedroom',
    icon: 'Bed',
    defaultChecklist: [
      'Wall paint & nail holes',
      'Ceiling fan & lights',
      'Wardrobe doors & shelves',
      'Window glass & safety latch',
      'Floor condition & electrical sockets'
    ]
  },
  kitchen: {
    name: 'Kitchen',
    icon: 'UtensilsCrossed',
    defaultChecklist: [
      'Granite countertop & sink silicone',
      'Water tap flow & drain leak check',
      'Modular cabinet hinges & baskets',
      'Chimney suction & baffle filter',
      'Gas pipeline/cylinder space',
      'Exhaust fan operation'
    ]
  },
  bathroom: {
    name: 'Bathroom',
    icon: 'Bath',
    defaultChecklist: [
      'Geyser heating & thermostat',
      'Jaguar/Plumbing taps & shower',
      'Toilet flush mechanism & seat cover',
      'Exhaust fan & switch',
      'Tile grouting & slope towards drain',
      'Mirror & vanity cabinet'
    ]
  },
  balcony: {
    name: 'Balcony',
    icon: 'Sun',
    defaultChecklist: [
      'Safety grill & paint coat',
      'Balcony sliding glass door lock',
      'Floor tiles & rain drain outlet',
      'Clothes drying pulley/rods',
      'Exterior wall seepage/cracks'
    ]
  },
  other: {
    name: 'Utility & Foyer',
    icon: 'Sparkles',
    defaultChecklist: [
      'Washing machine water inlet tap',
      'Utility floor drain trap',
      'Shoe rack & foyer electricals',
      'Circuit breaker/MCB distribution box',
      'Door bell & intercom unit'
    ]
  }
};

export const QUICK_TAGS = [
  'Wall crack already present',
  'Fan regulator knob loose',
  'Water tap lime scale / minor drip',
  'Paint peeling / moisture patch',
  'Cabinet hinge loose',
  'Tile hairline crack',
  'Nail holes from previous tenant',
  'AC tested & fully working',
  'Pristine & freshly cleaned',
  'Slight scuff on skirting board'
];

export const INITIAL_PROPERTIES: Property[] = [
  {
    id: 'prop-1',
    title: 'Apt 402 — Prestige Lakeside Habitat',
    address: 'Flat 402, Tower 7, Prestige Lakeside Habitat, Varthur - Whitefield Main Road',
    city: 'Bengaluru',
    state: 'Karnataka',
    pincode: '560087',
    rentAmount: 38000,
    depositAmount: 150000,
    moveInDate: '2025-07-15',
    moveOutDate: '2026-07-14',
    tenantName: 'Rahul Sharma',
    tenantPhone: '+91 98765 43210',
    tenantEmail: 'rahul.sharma@gmail.com',
    landlordName: 'Rajesh Murthy',
    landlordPhone: '+91 98450 12345',
    landlordEmail: 'rajesh.murthy@realty.in',
    status: 'settlement_in_progress',
    createdAt: '2025-07-10T10:00:00.000Z',
    moveInReport: {
      inspectionDate: '2025-07-15T10:30:00.000Z',
      completedAt: '2025-07-15T12:45:00.000Z',
      signedByTenant: true,
      tenantSignature: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="150" height="40"><path d="M10,25 Q35,5 60,25 T110,20 T140,25" fill="none" stroke="%230b1d3a" stroke-width="2"/></svg>',
      tenantSignDate: '15 Jul 2025, 12:48 PM IST',
      signedByLandlord: true,
      landlordSignature: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="150" height="40"><path d="M10,20 Q50,35 90,15 T135,28" fill="none" stroke="%230b1d3a" stroke-width="2"/></svg>',
      landlordSignDate: '15 Jul 2025, 01:15 PM IST',
      rooms: {
        living: {
          roomId: 'living',
          roomName: 'Living Room',
          isCompleted: true,
          overallCondition: 'minor_wear',
          generalNotes: 'Small scuff on skirting board behind main door. Ceiling fan and regulator tested OK. Curtains rods sturdy.',
          checklist: [
            { key: 'item-1', label: 'Walls & Ceiling paint condition', checked: true },
            { key: 'item-2', label: 'Ceiling fan & speed regulator', checked: true },
            { key: 'item-3', label: 'Floor tiles & skirting boards', checked: false },
            { key: 'item-4', label: 'Switchboards & power sockets', checked: true },
            { key: 'item-5', label: 'Main entry door lock & handle', checked: true }
          ],
          media: [
            {
              id: 'm1',
              type: 'photo',
              url: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=900&q=80',
              timestamp: '2025-07-15T10:35:12.000Z',
              displayDate: '15 Jul 2025, 10:35 AM IST',
              notes: 'Living room overview at move-in. Clean vitrified tiles, skirting scuff pre-existing behind foyer door.',
              condition: 'minor_wear',
              quickTags: ['Wall crack already present', 'Slight scuff on skirting board'],
              geoTag: 'Bengaluru, KA • 12.9498° N, 77.7471° E'
            },
            {
              id: 'm2',
              type: 'photo',
              url: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=900&q=80',
              timestamp: '2025-07-15T10:42:00.000Z',
              displayDate: '15 Jul 2025, 10:42 AM IST',
              notes: 'Ceiling fan regulator knob has slight wiggle, operational at all speeds.',
              condition: 'minor_wear',
              quickTags: ['Fan regulator knob loose'],
              geoTag: 'Bengaluru, KA • 12.9498° N, 77.7471° E'
            }
          ]
        },
        kitchen: {
          roomId: 'kitchen',
          roomName: 'Kitchen',
          isCompleted: true,
          overallCondition: 'minor_wear',
          generalNotes: 'Chimney suction functional. Lower shelf beneath sink has minor water swelling from prior tenant. Faucet working fine.',
          checklist: [
            { key: 'item-1', label: 'Granite countertop & sink silicone', checked: true },
            { key: 'item-2', label: 'Water tap flow & drain leak check', checked: true },
            { key: 'item-3', label: 'Modular cabinet hinges & baskets', checked: false },
            { key: 'item-4', label: 'Chimney suction & baffle filter', checked: true }
          ],
          media: [
            {
              id: 'm3',
              type: 'photo',
              url: 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&w=900&q=80',
              timestamp: '2025-07-15T11:05:00.000Z',
              displayDate: '15 Jul 2025, 11:05 AM IST',
              notes: 'Modular kitchen counter and overhead cabinets. Lower sink cabinet has minor moisture swelling noted at move-in.',
              condition: 'minor_wear',
              quickTags: ['Cabinet hinge loose', 'Pristine & freshly cleaned'],
              geoTag: 'Bengaluru, KA • 12.9498° N, 77.7471° E'
            }
          ]
        },
        master_bedroom: {
          roomId: 'master_bedroom',
          roomName: 'Master Bedroom',
          isCompleted: true,
          overallCondition: 'pristine',
          generalNotes: 'Wardrobe sliding doors smooth. AC cooling tested at 22°C. Paint immaculate with no nail marks.',
          checklist: [
            { key: 'item-1', label: 'Wardrobe sliding tracks & locks', checked: true },
            { key: 'item-2', label: 'AC unit & remote cooling test', checked: true },
            { key: 'item-3', label: 'Bedroom door latch & keys', checked: true }
          ],
          media: [
            {
              id: 'm4',
              type: 'photo',
              url: 'https://images.unsplash.com/photo-1616594039964-ae9021a400a0?auto=format&fit=crop&w=900&q=80',
              timestamp: '2025-07-15T11:30:00.000Z',
              displayDate: '15 Jul 2025, 11:30 AM IST',
              notes: 'Master bedroom spotless. AC unit clean with working remote control.',
              condition: 'pristine',
              quickTags: ['AC tested & fully working', 'Pristine & freshly cleaned'],
              geoTag: 'Bengaluru, KA • 12.9498° N, 77.7471° E'
            }
          ]
        },
        guest_bedroom: {
          roomId: 'guest_bedroom',
          roomName: 'Guest Bedroom',
          isCompleted: true,
          overallCondition: 'pristine',
          generalNotes: 'Ceiling lights all functioning, wardrobe shelves clean.',
          checklist: [
            { key: 'item-1', label: 'Wall paint & nail holes', checked: true },
            { key: 'item-2', label: 'Ceiling fan & lights', checked: true }
          ],
          media: [
            {
              id: 'm5',
              type: 'photo',
              url: 'https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?auto=format&fit=crop&w=900&q=80',
              timestamp: '2025-07-15T11:50:00.000Z',
              displayDate: '15 Jul 2025, 11:50 AM IST',
              notes: 'Clean guest room condition.',
              condition: 'pristine',
              quickTags: ['Pristine & freshly cleaned'],
              geoTag: 'Bengaluru, KA • 12.9498° N, 77.7471° E'
            }
          ]
        },
        bathroom: {
          roomId: 'bathroom',
          roomName: 'Bathroom',
          isCompleted: true,
          overallCondition: 'minor_wear',
          generalNotes: 'Geyser working. Jaguar faucet has slight hard water lime scale marks. Drain flow tested fine.',
          checklist: [
            { key: 'item-1', label: 'Geyser heating & thermostat', checked: true },
            { key: 'item-2', label: 'Jaguar/Plumbing taps & shower', checked: true },
            { key: 'item-3', label: 'Exhaust fan & switch', checked: true }
          ],
          media: [
            {
              id: 'm6',
              type: 'photo',
              url: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=900&q=80',
              timestamp: '2025-07-15T12:10:00.000Z',
              displayDate: '15 Jul 2025, 12:10 PM IST',
              notes: 'Master bath fixture condition. Jaguar tap has lime scale near aerator.',
              condition: 'minor_wear',
              quickTags: ['Water tap lime scale / minor drip'],
              geoTag: 'Bengaluru, KA • 12.9498° N, 77.7471° E'
            }
          ]
        },
        balcony: {
          roomId: 'balcony',
          roomName: 'Balcony',
          isCompleted: true,
          overallCondition: 'minor_wear',
          generalNotes: 'Exterior safety grill painted. Minor paint flaking on outer pillar due to monsoon splash.',
          checklist: [
            { key: 'item-1', label: 'Safety grill & paint coat', checked: true },
            { key: 'item-2', label: 'Floor tiles & rain drain outlet', checked: true }
          ],
          media: [
            {
              id: 'm7',
              type: 'photo',
              url: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=900&q=80',
              timestamp: '2025-07-15T12:25:00.000Z',
              displayDate: '15 Jul 2025, 12:25 PM IST',
              notes: 'Balcony railing and exterior wall view. Minor exterior paint peeling on top ledge.',
              condition: 'minor_wear',
              quickTags: ['Paint peeling / moisture patch'],
              geoTag: 'Bengaluru, KA • 12.9498° N, 77.7471° E'
            }
          ]
        },
        other: {
          roomId: 'other',
          roomName: 'Utility & Foyer',
          isCompleted: true,
          overallCondition: 'pristine',
          generalNotes: 'Washing machine inlet tap and MCB distribution board checked and functioning.',
          checklist: [
            { key: 'item-1', label: 'Washing machine water inlet tap', checked: true },
            { key: 'item-2', label: 'Circuit breaker/MCB distribution box', checked: true }
          ],
          media: [
            {
              id: 'm8',
              type: 'photo',
              url: 'https://images.unsplash.com/photo-1540518614846-7ede433c4550?auto=format&fit=crop&w=900&q=80',
              timestamp: '2025-07-15T12:35:00.000Z',
              displayDate: '15 Jul 2025, 12:35 PM IST',
              notes: 'Utility area tap and drainage clear.',
              condition: 'pristine',
              quickTags: ['Pristine & freshly cleaned'],
              geoTag: 'Bengaluru, KA • 12.9498° N, 77.7471° E'
            }
          ]
        }
      }
    },
    moveOutReport: {
      inspectionDate: '2026-07-14T14:00:00.000Z',
      completedAt: '2026-07-14T16:15:00.000Z',
      signedByTenant: true,
      tenantSignature: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="150" height="40"><path d="M10,25 Q35,5 60,25 T110,20 T140,25" fill="none" stroke="%230b1d3a" stroke-width="2"/></svg>',
      tenantSignDate: '14 Jul 2026, 04:20 PM IST',
      signedByLandlord: false,
      rooms: {
        living: {
          roomId: 'living',
          roomName: 'Living Room',
          isCompleted: true,
          overallCondition: 'damaged',
          generalNotes: 'Dark friction scuff marks on North wall from moving L-shaped sofa. Landlord claims full room painting; tenant disputes fair wear & tear.',
          checklist: [
            { key: 'item-1', label: 'Walls & Ceiling paint condition', checked: false },
            { key: 'item-2', label: 'Ceiling fan & speed regulator', checked: true },
            { key: 'item-3', label: 'Floor tiles & skirting boards', checked: true },
            { key: 'item-4', label: 'Switchboards & power sockets', checked: true }
          ],
          media: [
            {
              id: 'mo1',
              type: 'photo',
              url: 'https://images.unsplash.com/photo-1583847268964-b28dc8f51f92?auto=format&fit=crop&w=900&q=80',
              timestamp: '2026-07-14T14:20:00.000Z',
              displayDate: '14 Jul 2026, 02:20 PM IST',
              notes: 'Move-out: North wall has 2 noticeable scuff lines from sofa backing. No deep plaster damage.',
              condition: 'damaged',
              quickTags: ['Paint peeling / moisture patch'],
              geoTag: 'Bengaluru, KA • 12.9498° N, 77.7471° E'
            }
          ]
        },
        kitchen: {
          roomId: 'kitchen',
          roomName: 'Kitchen',
          isCompleted: true,
          overallCondition: 'damaged',
          generalNotes: 'Lower cabinet right door hinge came loose and screw stripped from wood. Chimney baffle filter has oil residue needing deep clean.',
          checklist: [
            { key: 'item-1', label: 'Granite countertop & sink silicone', checked: true },
            { key: 'item-2', label: 'Water tap flow & drain leak check', checked: true },
            { key: 'item-3', label: 'Modular cabinet hinges & baskets', checked: false },
            { key: 'item-4', label: 'Chimney suction & baffle filter', checked: false }
          ],
          media: [
            {
              id: 'mo2',
              type: 'photo',
              url: 'https://images.unsplash.com/photo-1507089947368-19c1da9775ae?auto=format&fit=crop&w=900&q=80',
              timestamp: '2026-07-14T14:45:00.000Z',
              displayDate: '14 Jul 2026, 02:45 PM IST',
              notes: 'Move-out: Cabinet hinge unseated; deep cleaning required on hob & chimney filter.',
              condition: 'damaged',
              quickTags: ['Cabinet hinge loose'],
              geoTag: 'Bengaluru, KA • 12.9498° N, 77.7471° E'
            }
          ]
        },
        master_bedroom: {
          roomId: 'master_bedroom',
          roomName: 'Master Bedroom',
          isCompleted: true,
          overallCondition: 'pristine',
          generalNotes: 'Handed back in pristine condition. AC remote intact and cooling verified. Wardrobe cleaned.',
          checklist: [
            { key: 'item-1', label: 'Wardrobe sliding tracks & locks', checked: true },
            { key: 'item-2', label: 'AC unit & remote cooling test', checked: true }
          ],
          media: [
            {
              id: 'mo3',
              type: 'photo',
              url: 'https://images.unsplash.com/photo-1616594039964-ae9021a400a0?auto=format&fit=crop&w=900&q=80',
              timestamp: '2026-07-14T15:10:00.000Z',
              displayDate: '14 Jul 2026, 03:10 PM IST',
              notes: 'Move-out: Master bedroom clean, undamaged.',
              condition: 'pristine',
              quickTags: ['Pristine & freshly cleaned'],
              geoTag: 'Bengaluru, KA • 12.9498° N, 77.7471° E'
            }
          ]
        },
        guest_bedroom: {
          roomId: 'guest_bedroom',
          roomName: 'Guest Bedroom',
          isCompleted: true,
          overallCondition: 'pristine',
          generalNotes: 'No changes. Handed over clean.',
          checklist: [
            { key: 'item-1', label: 'Wall paint & nail holes', checked: true }
          ],
          media: [
            {
              id: 'mo4',
              type: 'photo',
              url: 'https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?auto=format&fit=crop&w=900&q=80',
              timestamp: '2026-07-14T15:25:00.000Z',
              displayDate: '14 Jul 2026, 03:25 PM IST',
              notes: 'Clean and tidy guest room.',
              condition: 'pristine',
              quickTags: ['Pristine & freshly cleaned'],
              geoTag: 'Bengaluru, KA • 12.9498° N, 77.7471° E'
            }
          ]
        },
        bathroom: {
          roomId: 'bathroom',
          roomName: 'Bathroom',
          isCompleted: true,
          overallCondition: 'pristine',
          generalNotes: 'Clean, geyser and flush valve working properly.',
          checklist: [
            { key: 'item-1', label: 'Geyser heating & thermostat', checked: true },
            { key: 'item-2', label: 'Jaguar/Plumbing taps & shower', checked: true }
          ],
          media: [
            {
              id: 'mo5',
              type: 'photo',
              url: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=900&q=80',
              timestamp: '2026-07-14T15:40:00.000Z',
              displayDate: '14 Jul 2026, 03:40 PM IST',
              notes: 'Move-out bathroom inspected. Fully cleaned.',
              condition: 'pristine',
              quickTags: ['Pristine & freshly cleaned'],
              geoTag: 'Bengaluru, KA • 12.9498° N, 77.7471° E'
            }
          ]
        },
        balcony: {
          roomId: 'balcony',
          roomName: 'Balcony',
          isCompleted: true,
          overallCondition: 'minor_wear',
          generalNotes: 'Potted plants removed. Outer pillar paint wear remains similar to move-in.',
          checklist: [
            { key: 'item-1', label: 'Safety grill & paint coat', checked: true },
            { key: 'item-2', label: 'Floor tiles & rain drain outlet', checked: true }
          ],
          media: [
            {
              id: 'mo6',
              type: 'photo',
              url: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=900&q=80',
              timestamp: '2026-07-14T15:55:00.000Z',
              displayDate: '14 Jul 2026, 03:55 PM IST',
              notes: 'Balcony tiles washed and clear.',
              condition: 'minor_wear',
              quickTags: ['Paint peeling / moisture patch'],
              geoTag: 'Bengaluru, KA • 12.9498° N, 77.7471° E'
            }
          ]
        },
        other: {
          roomId: 'other',
          roomName: 'Utility & Foyer',
          isCompleted: true,
          overallCondition: 'pristine',
          generalNotes: 'Utility area clear and dry.',
          checklist: [
            { key: 'item-1', label: 'Washing machine water inlet tap', checked: true }
          ],
          media: [
            {
              id: 'mo7',
              type: 'photo',
              url: 'https://images.unsplash.com/photo-1540518614846-7ede433c4550?auto=format&fit=crop&w=900&q=80',
              timestamp: '2026-07-14T16:05:00.000Z',
              displayDate: '14 Jul 2026, 04:05 PM IST',
              notes: 'Utility room inspected.',
              condition: 'pristine',
              quickTags: ['Pristine & freshly cleaned'],
              geoTag: 'Bengaluru, KA • 12.9498° N, 77.7471° E'
            }
          ]
        }
      }
    },
    settlement: {
      totalDeposit: 150000,
      totalDeductionsClaimed: 17000,
      totalDeductionsAgreed: 6500,
      finalRefundAmount: 143500,
      status: 'disputed',
      settlementDate: '2026-07-16T12:00:00.000Z',
      tenantSigned: true,
      tenantSignature: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="150" height="40"><path d="M10,25 Q35,5 60,25 T110,20 T140,25" fill="none" stroke="%230b1d3a" stroke-width="2"/></svg>',
      tenantSignDate: '16 Jul 2026, 01:20 PM IST',
      landlordSigned: false,
      paymentMethod: 'UPI',
      paymentRef: 'UPI/20260716/9876543210',
      deductions: [
        {
          id: 'ded-1',
          title: 'Kitchen Cabinet Hinge Repair',
          roomRef: 'Kitchen',
          landlordClaimAmount: 1500,
          tenantCounterAmount: 1500,
          agreedAmount: 1500,
          reason: 'Carpenter visit fee & replacement of stainless steel soft-close hydraulic hinges.',
          evidencePhotoUrl: 'https://images.unsplash.com/photo-1507089947368-19c1da9775ae?auto=format&fit=crop&w=400&q=80',
          status: 'accepted',
          tenantNotes: 'Accepted. Hinge loosened during tenancy.'
        },
        {
          id: 'ded-2',
          title: 'Kitchen Chimney & Counter Deep Cleaning',
          roomRef: 'Kitchen',
          landlordClaimAmount: 3500,
          tenantCounterAmount: 2500,
          agreedAmount: 2500,
          reason: 'Urban Company professional kitchen degreasing & chimney filter chemical wash.',
          evidencePhotoUrl: 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&w=400&q=80',
          status: 'counter_offered',
          tenantNotes: 'Counter-offered ₹2,500 based on Urban Company quote. Landlord verbally concurred.'
        },
        {
          id: 'ded-3',
          title: 'Living Room Wall Complete Repainting Claim',
          roomRef: 'Living Room',
          landlordClaimAmount: 12000,
          tenantCounterAmount: 2500,
          agreedAmount: 2500,
          reason: 'Landlord claimed complete Asian Paints Royale repaint of living room due to sofa scuffs.',
          evidencePhotoUrl: 'https://images.unsplash.com/photo-1583847268964-b28dc8f51f92?auto=format&fit=crop&w=400&q=80',
          status: 'disputed',
          tenantNotes: 'DISPUTED with Move-In Report: Skirting board had pre-existing wear. Indian Tenancy Act protects reasonable wear & tear. Tenant agreed to pay ₹2,500 for spot touch-up only.'
        }
      ]
    }
  },
  {
    id: 'prop-2',
    title: 'Flat 204 — Godrej Platinum',
    address: 'Flat 204, Tower B, Godrej Platinum, Hebbal Outer Ring Road',
    city: 'Bengaluru',
    state: 'Karnataka',
    pincode: '560024',
    rentAmount: 52000,
    depositAmount: 250000,
    moveInDate: '2026-09-01',
    tenantName: 'Priya Iyer',
    tenantPhone: '+91 97400 55667',
    tenantEmail: 'priya.iyer@techcorp.com',
    landlordName: 'Anil Kulkarni',
    landlordPhone: '+91 99801 88220',
    landlordEmail: 'anil.kulkarni@investments.in',
    status: 'move_in_completed',
    createdAt: '2026-08-25T09:00:00.000Z',
    moveInReport: {
      inspectionDate: '2026-09-01T11:00:00.000Z',
      completedAt: '2026-09-01T12:30:00.000Z',
      signedByTenant: true,
      signedByLandlord: true,
      tenantSignDate: '01 Sep 2026, 12:35 PM IST',
      landlordSignDate: '01 Sep 2026, 01:10 PM IST',
      rooms: {
        living: {
          roomId: 'living',
          roomName: 'Living Room',
          isCompleted: true,
          overallCondition: 'pristine',
          generalNotes: 'Flawless condition at handover.',
          checklist: [],
          media: []
        },
        master_bedroom: {
          roomId: 'master_bedroom',
          roomName: 'Master Bedroom',
          isCompleted: true,
          overallCondition: 'pristine',
          generalNotes: 'All fixtures verified.',
          checklist: [],
          media: []
        },
        guest_bedroom: {
          roomId: 'guest_bedroom',
          roomName: 'Guest Bedroom',
          isCompleted: true,
          overallCondition: 'pristine',
          generalNotes: 'Pristine.',
          checklist: [],
          media: []
        },
        kitchen: {
          roomId: 'kitchen',
          roomName: 'Kitchen',
          isCompleted: true,
          overallCondition: 'pristine',
          generalNotes: 'Pristine modular units.',
          checklist: [],
          media: []
        },
        bathroom: {
          roomId: 'bathroom',
          roomName: 'Bathroom',
          isCompleted: true,
          overallCondition: 'pristine',
          generalNotes: 'All plumbing dry and tested.',
          checklist: [],
          media: []
        },
        balcony: {
          roomId: 'balcony',
          roomName: 'Balcony',
          isCompleted: true,
          overallCondition: 'pristine',
          generalNotes: 'Clean balcony.',
          checklist: [],
          media: []
        },
        other: {
          roomId: 'other',
          roomName: 'Utility & Foyer',
          isCompleted: true,
          overallCondition: 'pristine',
          generalNotes: 'Complete.',
          checklist: [],
          media: []
        }
      }
    },
    settlement: {
      totalDeposit: 250000,
      totalDeductionsClaimed: 0,
      totalDeductionsAgreed: 0,
      finalRefundAmount: 250000,
      status: 'pending',
      deductions: [],
      tenantSigned: false,
      landlordSigned: false
    }
  }
];

export const createEmptyRoomInspection = (roomId: RoomType): import('../types').RoomInspection => {
  const meta = ROOM_METADATA[roomId];
  return {
    roomId,
    roomName: meta.name,
    isCompleted: false,
    media: [],
    generalNotes: '',
    overallCondition: 'pristine',
    checklist: meta.defaultChecklist.map((label, idx) => ({
      key: `check-${roomId}-${idx}`,
      label,
      checked: true
    }))
  };
};

export const createEmptyInspectionData = (): import('../types').InspectionData => {
  const rooms: any = {};
  (Object.keys(ROOM_METADATA) as RoomType[]).forEach((key) => {
    rooms[key] = createEmptyRoomInspection(key);
  });
  return {
    inspectionDate: new Date().toISOString(),
    signedByTenant: false,
    signedByLandlord: false,
    rooms
  };
};

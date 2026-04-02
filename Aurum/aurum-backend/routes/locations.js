const express = require('express');
const router  = express.Router();

// Static location data — update to match real business
const locations = [
  {
    id: 'milan',
    name: 'Aurum Milano',
    address: '12 Via della Luce',
    city: 'Milan',
    country: 'Italy',
    postcode: '20121',
    phone: '+39 02 8765 4321',
    email: 'milano@aurum-ristorante.com',
    coordinates: { lat: 45.4654219, lng: 9.1859243 },
    hours: {
      tuesday:  { open: '12:00', close: '15:00', dinner: { open: '19:00', close: '23:30' } },
      wednesday:{ open: '12:00', close: '15:00', dinner: { open: '19:00', close: '23:30' } },
      thursday: { open: '12:00', close: '15:00', dinner: { open: '19:00', close: '23:30' } },
      friday:   { open: '12:00', close: '15:00', dinner: { open: '19:00', close: '23:30' } },
      saturday: { open: '12:00', close: '15:00', dinner: { open: '19:00', close: '23:30' } },
      sunday:   { open: '12:00', close: '15:00', dinner: null },
      monday:   null,
    },
    mapEmbed: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2797.9!2d9.1859!3d45.4654!',
    googleMapsUrl: 'https://maps.google.com/?q=Aurum+Ristorante+Milan',
    wazeUrl: 'https://waze.com/ul?q=Aurum+Ristorante+Milan',
    parking: 'Valet parking available Thursday–Sunday evenings. Public garage on Via Brera (200m).',
  },
  {
    id: 'paris',
    name: 'Aurum Paris',
    address: '5 Rue Saint-Honoré',
    city: 'Paris',
    country: 'France',
    postcode: '75001',
    phone: '+33 1 4265 1234',
    email: 'paris@aurum-ristorante.com',
    coordinates: { lat: 48.8601, lng: 2.3477 },
    hours: {
      tuesday:  { open: '12:00', close: '14:30', dinner: { open: '19:00', close: '23:00' } },
      wednesday:{ open: '12:00', close: '14:30', dinner: { open: '19:00', close: '23:00' } },
      thursday: { open: '12:00', close: '14:30', dinner: { open: '19:00', close: '23:00' } },
      friday:   { open: '12:00', close: '14:30', dinner: { open: '19:00', close: '23:00' } },
      saturday: { open: '12:00', close: '14:30', dinner: { open: '19:00', close: '23:00' } },
      sunday:   { open: '12:00', close: '14:30', dinner: null },
      monday:   null,
    },
    mapEmbed: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2624.4!2d2.3477!3d48.8601!',
    googleMapsUrl: 'https://maps.google.com/?q=Aurum+Ristorante+Paris',
    wazeUrl: 'https://waze.com/ul?q=Aurum+Ristorante+Paris',
    parking: 'Parking Louvre Rivoli (3 min walk). Metro: Louvre–Rivoli (Line 1).',
  },
];

// GET /api/locations — all locations
router.get('/', (req, res) => {
  res.json({ success: true, locations });
});

// GET /api/locations/:id — single location
router.get('/:id', (req, res) => {
  const loc = locations.find(l => l.id === req.params.id);
  if (!loc) return res.status(404).json({ success: false, message: 'Location not found' });
  res.json({ success: true, location: loc });
});

// GET /api/locations/:id/hours — is restaurant open right now?
router.get('/:id/hours', (req, res) => {
  const loc = locations.find(l => l.id === req.params.id);
  if (!loc) return res.status(404).json({ success: false, message: 'Location not found' });

  const now  = new Date();
  const days = ['sunday','monday','tuesday','wednesday','thursday','friday','saturday'];
  const day  = days[now.getDay()];
  const todayHours = loc.hours[day];
  const timeStr = `${String(now.getHours()).padStart(2,'0')}:${String(now.getMinutes()).padStart(2,'0')}`;

  let isOpen = false;
  let currentSession = null;

  if (todayHours) {
    const inLunch = timeStr >= todayHours.open && timeStr <= todayHours.close;
    const inDinner = todayHours.dinner && timeStr >= todayHours.dinner.open && timeStr <= todayHours.dinner.close;
    if (inLunch) { isOpen = true; currentSession = 'lunch'; }
    if (inDinner) { isOpen = true; currentSession = 'dinner'; }
  }

  res.json({
    success: true,
    location: loc.name,
    isOpen,
    currentSession,
    today: day,
    todayHours,
    currentTime: timeStr,
  });
});

module.exports = router;

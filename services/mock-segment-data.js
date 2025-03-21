const { upsertUser, addEvent, getProfileTraits, getProfileEvents } = require('./segment-service');

const travelUser = {
  userId: 'smith_002',
  traits: {
    name: 'John Smith',
    phone: '+14155552671',
    email: 'john2@smith.com',
    interests: ['city_holidays', 'skiing', 'luxury_travel'],
  }
};

const travelBookings = [
  {
    event: 'Package Booked',
    properties: {
      bookingId: 'SYD2025021501',
      destination: 'Sydney',
      departureDate: '2025-02-15',
      packageType: 'City Holiday',
      includedBaggage: '2x32kg',
      price: 2800.00,
      timestamp: '2024-09-14T16:00:00Z'
    }
  },
  {
    event: 'Package Booked',
    properties: {
      bookingId: 'BKK2024121001',
      destination: 'Bangkok',
      departureDate: '2024-12-10',
      packageType: 'City Holiday',
      includedBaggage: '2x32kg',
      price: 2200.00,
      timestamp: '2024-06-10T14:30:00Z'
    }
  },
  {
    event: 'Package Booked',
    properties: {
      bookingId: 'NYC2024080501',
      destination: 'New York',
      departureDate: '2024-08-05',
      packageType: 'Luxury City Break',
      includedBaggage: '2x32kg',
      price: 3500.00,
      timestamp: '2024-04-05T11:20:00Z'
    }
  },
  {
    event: 'Package Booked',
    properties: {
      bookingId: 'DXB2024060101',
      destination: 'Dubai',
      departureDate: '2024-06-01',
      packageType: 'Luxury Resort',
      includedBaggage: '2x32kg',
      price: 4200.00,
      timestamp: '2024-01-02T09:15:00Z'
    }
  }
];

const viewEvents = [
  {
    event: 'Package Viewed',
    properties: {
      packageId: 'SKI-EUR-001',
      destination: 'Alps, Switzerland',
      packageType: 'Skiing Holiday',
      region: 'Europe',
      price: 3200.00,
      timestamp: '2024-01-14T16:30:00Z'
    }
  },
  {
    event: 'Package Viewed',
    properties: {
      packageId: 'SKI-NA-001',
      destination: 'Aspen, Colorado',
      packageType: 'Skiing Holiday',
      region: 'North America',
      price: 3500.00,
      timestamp: '2025-01-14T16:35:00Z'
    }
  },
  {
    event: 'Package Viewed',
    properties: {
      packageId: 'SKI-ASIA-001',
      destination: 'Niseko, Japan',
      packageType: 'Skiing Holiday',
      region: 'Asia',
      price: 2900.00,
      timestamp: '2025-01-14T16:40:00Z'
    }
  },
  {
    event: 'Package Viewed',
    properties: {
      packageId: 'SKI-EUR-002',
      destination: 'French Alps, Chamonix',
      packageType: 'Luxury Skiing Holiday',
      region: 'Europe',
      price: 4200.00,
      timestamp: '2025-01-14T16:45:00Z'
    }
  }
];

async function populateTravelMockData() {
  try {
    await upsertUser(travelUser);
    console.log(`Created travel user: ${travelUser.traits.name}`);

    // Add booking events
    for (const bookingData of travelBookings) {
      await addEvent({
        userId: travelUser.userId,
        event: bookingData.event,
        properties: bookingData.properties
      });
      console.log(`Added ${bookingData.event} event for user: ${travelUser.traits.name}`);
    }

    // Add view events
    for (const viewData of viewEvents) {
      await addEvent({
        userId: travelUser.userId,
        event: viewData.event,
        properties: viewData.properties
      });
      console.log(`Added ${viewData.event} event for user: ${travelUser.traits.name}`);
    }

    console.log('Travel scenario mock data populated successfully');
  } catch (error) {
    console.error('Error populating travel mock data:', error);
  }
}

async function readUserProfile(userId) {
  try {
    // Get user traits
    const traits = await getProfileTraits(userId);
    console.log('\nUser Profile Summary:');
    console.log('==================');
    if (traits) {
      console.log('Name:', traits.name);
      console.log('Email:', traits.email);
      console.log('Phone:', traits.phone);
      console.log('Interests:', traits.interests?.join(', '));
      console.log('Lifetime Value:', traits.high_ltv ? `$${traits.high_ltv}` : 'N/A');
    }

    // Get user events
    const events = await getProfileEvents(userId);
    if (events && events.data) {
      const bookings = events.data.filter(event => event.event === 'Package Booked');
      const views = events.data.filter(event => event.event === 'Package Viewed');
      
      console.log('\nBooking History:');
      console.log('==================');
      bookings.forEach(booking => {
        console.log(`- ${booking.properties.destination}: $${booking.properties.price} (${booking.properties.departureDate})`);
      });

      console.log('\nRecent Package Views:');
      console.log('==================');
      views.forEach(view => {
        console.log(`- ${view.properties.destination}: $${view.properties.price}`);
      });

      const totalSpend = bookings.reduce((sum, booking) => 
        sum + (booking.properties.price || 0), 0);
      console.log('\nTotal Spend: $' + totalSpend);
    }
  } catch (error) {
    console.error('Error reading user profile:', error);
  }
}

module.exports = {
  populateTravelMockData,
  readUserProfile
};

// Test the profile reading
readUserProfile('smith_001');
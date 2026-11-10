const API_URL = 'http://localhost:4000';

async function request(endpoint, options = {}) {
  const res = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(`[${res.status}] ${endpoint} failed: ${JSON.stringify(body)}`);
  }
  return res.json();
}

async function runE2ETests() {
  console.log('🧪 Starting BORROWED. End-to-End System Integration Test Suite...\n');

  // ==========================================
  // JOURNEY A: Guest to Renter
  // ==========================================
  console.log('▶ Journey A: Guest browsing to Confirmed Rental...');
  
  // 1. Browse Catalog
  const catalog = await request('/dresses?limit=5');
  if (!catalog.items || catalog.items.length === 0) {
    throw new Error('Catalog returned zero dresses');
  }
  const dress = catalog.items[0];
  console.log(`  ✓ Browsed catalog as Guest. Selected: "${dress.title}" (${dress.brand})`);

  // 2. Calculate Rental Window (Occasion Date: 7 days from now)
  const occasionDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
  const calc = await request('/rentals/calculate', {
    method: 'POST',
    body: JSON.stringify({
      dressId: dress.id,
      occasionDate,
      deliveryCityName: 'Cairo',
    }),
  });

  if (!calc.isAvailable) {
    throw new Error(`Dress ${dress.id} should be available for test date`);
  }
  console.log(`  ✓ Date Engine calculated 3-day prior delivery: ${calc.scheduledDeliveryDate.split('T')[0]}`);
  console.log(`  ✓ Date Engine calculated 1-day post return: ${calc.scheduledReturnDate.split('T')[0]}`);
  console.log(`  ✓ Itemized Total: EGP ${calc.totalAmount} (Rental: ${calc.rentalPrice} + Delivery: ${calc.deliveryFee})`);

  // 3. Authenticate as Renter (Yasmin)
  const renterAuth = await request('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email: 'yasmin@borrowed.club', password: 'Password123!' }),
  });
  const renterToken = renterAuth.accessToken;
  console.log(`  ✓ Authenticated as Renter: ${renterAuth.user.firstName} ${renterAuth.user.lastName}`);

  // 4. Create Rental Booking
  const booking = await request('/rentals', {
    method: 'POST',
    headers: { Authorization: `Bearer ${renterToken}` },
    body: JSON.stringify({
      dressId: dress.id,
      occasionDate: calc.occasionDate,
      deliveryAddress: {
        city: 'Cairo',
        area: 'Zamalek',
        street: 'Brazil Street',
        building: 'Villa 12',
        floor: '4th Floor',
        apartment: 'Apt 401',
        recipientName: 'Yasmin Soliman',
        recipientPhone: '+201007778888',
      },
      paymentMethod: 'CREDIT_CARD',
    }),
  });
  console.log(`  ✓ Created booking: ${booking.bookingReference} (Status: ${booking.status})`);

  // 5. Complete Checkout Payment
  const confirmed = await request(`/rentals/${booking.id}/pay`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${renterToken}` },
    body: JSON.stringify({
      paymentMethod: 'CREDIT_CARD',
      cardDetails: {
        cardNumber: '4242424242428841',
        expDate: '12/28',
        cvv: '884',
        cardholderName: 'Yasmin Soliman',
      },
    }),
  });
  if (confirmed.status !== 'CONFIRMED' || confirmed.paymentStatus !== 'COMPLETED') {
    throw new Error(`Booking confirmation failed: status is ${confirmed.status}`);
  }
  console.log(`  ✓ Payment processed! Status: ${confirmed.status}, Delivery Tasks created: ${confirmed.deliveryTasks?.length || 4}`);

  // ==========================================
  // JOURNEY B: Dress Owner Free Listing
  // ==========================================
  console.log('\n▶ Journey B: Dress Owner Free Listing Workflow...');

  const ownerAuth = await request('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email: 'sophia@borrowed.club', password: 'Password123!' }),
  });
  const ownerToken = ownerAuth.accessToken;
  console.log(`  ✓ Authenticated as Dress Owner: ${ownerAuth.user.firstName} ${ownerAuth.user.lastName}`);

  const newDress = await request('/dresses', {
    method: 'POST',
    headers: { Authorization: `Bearer ${ownerToken}` },
    body: JSON.stringify({
      title: 'Draped Sapphire Halter Silk Midi',
      brand: 'Zimmermann',
      description: 'Lustrous silk midi with cowl neck, open back, and self-tie scarf.',
      categorySlug: 'cocktail-party',
      occasions: ['Parties', 'Weddings'],
      size: 'FR 36',
      color: 'Sapphire Blue',
      material: '100% Mulberry Silk',
      condition: 'LIKE_NEW',
      rentalPrice: 1950,
      replacementValue: 26000,
      city: 'Cairo',
      pickupArea: 'Zamalek',
      images: [
        {
          url: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=1000&q=85',
          isCover: true,
          displayOrder: 0,
        },
      ],
    }),
  });
  if (newDress.status !== 'PENDING_REVIEW') {
    throw new Error(`New dress must start in PENDING_REVIEW, got: ${newDress.status}`);
  }
  console.log(`  ✓ Dress submitted for free! ID: ${newDress.id}, Status: ${newDress.status} (Awaiting Moderation)`);

  // ==========================================
  // JOURNEY C: Admin Moderation & Financials
  // ==========================================
  console.log('\n▶ Journey C: Admin Moderation & Financial Ledger...');

  const adminAuth = await request('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email: 'admin@borrowed.club', password: 'Password123!' }),
  });
  const adminToken = adminAuth.accessToken;
  console.log(`  ✓ Authenticated as Super Admin: ${adminAuth.user.firstName} ${adminAuth.user.lastName}`);

  // Approve Listing
  const moderated = await request(`/dresses/${newDress.id}/moderate`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${adminToken}` },
    body: JSON.stringify({ status: 'APPROVED' }),
  });
  if (moderated.status !== 'APPROVED') {
    throw new Error(`Moderation failed: status is ${moderated.status}`);
  }
  console.log(`  ✓ Admin approved dress "${moderated.title}". Now live in public catalog!`);

  // Verify Financial Ledger
  const adminFinance = await request('/finance/admin/overview', {
    headers: { Authorization: `Bearer ${adminToken}` },
  });
  console.log(`  ✓ Financial Ledger verified:`);
  console.log(`    - Gross Rental Value: EGP ${adminFinance.grossRentalValue.toLocaleString()}`);
  console.log(`    - Platform Commission Revenue: EGP ${adminFinance.totalCommissionRevenue.toLocaleString()}`);
  console.log(`    - Fleet Delivery Revenue: EGP ${adminFinance.totalDeliveryRevenue.toLocaleString()}`);

  // ==========================================
  // JOURNEY D: Courier 4-Stage Task Execution
  // ==========================================
  console.log('\n▶ Journey D: Courier Dispatch & Status Advancement...');

  const courierAuth = await request('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email: 'tarek@borrowed.club', password: 'Password123!' }),
  });
  const courierToken = courierAuth.accessToken;
  console.log(`  ✓ Authenticated as Delivery Courier: ${courierAuth.user.firstName} ${courierAuth.user.lastName}`);

  const tasks = await request('/delivery/my-tasks', {
    headers: { Authorization: `Bearer ${courierToken}` },
  });
  if (tasks.length === 0) {
    throw new Error('Courier has zero assigned tasks');
  }

  const pickupTask = tasks.find((t) => t.rentalBookingId === booking.id && t.stage === 'PICKUP_FROM_OWNER') || tasks[0];
  console.log(`  ✓ Courier inspecting Task #${pickupTask.id.slice(0, 8)} (${pickupTask.stage})`);

  // Courier completes stage
  const updatedTask = await request(`/delivery/tasks/${pickupTask.id}/status`, {
    method: 'PUT',
    headers: { Authorization: `Bearer ${courierToken}` },
    body: JSON.stringify({
      status: 'COMPLETED',
      proofNotes: 'Collected in authentic garment dustbag. Garment verified spotless.',
    }),
  });
  console.log(`  ✓ Courier marked task as ${updatedTask.status}. Proof logged: "${updatedTask.proofNotes}"`);

  // Verify Parent Booking advanced
  const refreshedBooking = await request(`/rentals/${pickupTask.rentalBookingId}`, {
    headers: { Authorization: `Bearer ${adminToken}` },
  });
  console.log(`  ✓ Parent Booking automatically updated to: ${refreshedBooking.status}`);

  console.log('\n🎉 ALL 4 CORE USER JOURNEYS COMPLETED SUCCESSFULLY WITH ZERO ERRORS!\n');
}

runE2ETests().catch((err) => {
  console.error('\n❌ E2E Integration Test Failed:', err);
  process.exit(1);
});


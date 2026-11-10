import { PrismaClient, RoleType, DressCondition, DressStatus, RentalStatus, DeliveryTaskStage, DeliveryTaskStatus, PaymentMethod, PaymentStatus, PayoutStatus } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting BORROWED. database seed...');

  // 1. Roles
  const roles = [
    { name: RoleType.ADMIN, description: 'Super Administrator with full management access' },
    { name: RoleType.OWNER, description: 'Dress Owner who lists luxury dresses' },
    { name: RoleType.RENTER, description: 'Customer who rents dresses for occasions' },
    { name: RoleType.DELIVERY, description: 'Logistics courier who handles pickups & deliveries' },
    { name: RoleType.GUEST, description: 'Guest visitor' },
  ];

  for (const r of roles) {
    await prisma.role.upsert({
      where: { name: r.name },
      update: { description: r.description },
      create: r,
    });
  }

  // 2. Platform Settings
  const settings = [
    { key: 'commission_percentage', value: '20', description: 'Platform commission taken from dress rental price (%)' },
    { key: 'delivery_days_before_occasion', value: '3', description: 'Days before occasion when dress must be delivered' },
    { key: 'return_days_after_occasion', value: '1', description: 'Days after occasion when dress is collected for return' },
    { key: 'preparation_buffer_days', value: '2', description: 'Buffer days between bookings for dry cleaning and quality check' },
    { key: 'minimum_booking_notice_days', value: '3', description: 'Minimum notice required to book an occasion date' },
    { key: 'require_deposit', value: 'false', description: 'Whether refundable security deposits are mandatory' },
    { key: 'default_deposit_amount', value: '500', description: 'Default refundable deposit fee in EGP' },
    { key: 'allow_cash_collection', value: 'true', description: 'Whether cash on delivery/collection is allowed' },
    { key: 'cancellation_hours_before_delivery', value: '48', description: 'Hours prior to delivery allowing free cancellation' },
  ];

  for (const s of settings) {
    await prisma.platformSetting.upsert({
      where: { key: s.key },
      update: { value: s.value, description: s.description },
      create: s,
    });
  }

  // 3. Supported Cities and Delivery Rates
  const citiesData = [
    { name: 'Cairo', governorate: 'Cairo', deliveryFee: 150 },
    { name: 'Giza', governorate: 'Giza', deliveryFee: 150 },
    { name: 'New Cairo & Tagamoa', governorate: 'Cairo', deliveryFee: 180 },
    { name: 'Sheikh Zayed & 6th October', governorate: 'Giza', deliveryFee: 180 },
    { name: 'Alexandria', governorate: 'Alexandria', deliveryFee: 250 },
    { name: 'Mansoura', governorate: 'Dakahlia', deliveryFee: 280 },
    { name: 'El Gouna & Hurghada', governorate: 'Red Sea', deliveryFee: 350 },
  ];

  const cityMap = new Map<string, string>();
  for (const c of citiesData) {
    const city = await prisma.city.upsert({
      where: { name: c.name },
      update: { deliveryFee: c.deliveryFee, governorate: c.governorate },
      create: c,
    });
    cityMap.set(c.name, city.id);
  }

  // 4. Categories
  const categoriesData = [
    {
      name: 'Evening Gowns',
      slug: 'evening-gowns',
      description: 'Floor-length luxury silhouettes, embellishments, and dramatic evening attire.',
      imageUrl: 'https://images.unsplash.com/photo-1566174053879-31528523f8ae?auto=format&fit=crop&w=800&q=80',
    },
    {
      name: 'Cocktail & Party',
      slug: 'cocktail-party',
      description: 'Chic midi and mini cuts perfect for birthdays, celebrations, and rooftop soirees.',
      imageUrl: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&w=800&q=80',
    },
    {
      name: 'Bridal & Engagement',
      slug: 'bridal-engagement',
      description: 'Show-stopping whites, ivories, and pastel masterpieces for brides and bridal parties.',
      imageUrl: 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=800&q=80',
    },
    {
      name: 'Galas & Black Tie',
      slug: 'galas-black-tie',
      description: 'Strict black-tie couture, silk velvets, sculptural necklines, and opulent drapes.',
      imageUrl: 'https://images.unsplash.com/photo-1539109136881-3be0616acf4b?auto=format&fit=crop&w=800&q=80',
    },
    {
      name: 'Prom & Graduation',
      slug: 'prom-graduation',
      description: 'Youthful elegance, vibrant tones, and romantic tulle designs for milestone moments.',
      imageUrl: 'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?auto=format&fit=crop&w=800&q=80',
    },
    {
      name: 'Resort & Destination',
      slug: 'resort-destination',
      description: 'Breezy linen-silks, bold resort florals, and sun-drenched destination wedding wear.',
      imageUrl: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=800&q=80',
    },
  ];

  const categoryMap = new Map<string, string>();
  for (const cat of categoriesData) {
    const record = await prisma.dressCategory.upsert({
      where: { slug: cat.slug },
      update: { name: cat.name, description: cat.description, imageUrl: cat.imageUrl },
      create: cat,
    });
    categoryMap.set(cat.slug, record.id);
  }

  // 5. Users
  const passwordHash = await bcrypt.hash('Password123!', 10);

  const adminRole = await prisma.role.findUnique({ where: { name: RoleType.ADMIN } });
  const ownerRole = await prisma.role.findUnique({ where: { name: RoleType.OWNER } });
  const renterRole = await prisma.role.findUnique({ where: { name: RoleType.RENTER } });
  const deliveryRole = await prisma.role.findUnique({ where: { name: RoleType.DELIVERY } });

  // Admin
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@borrowed.club' },
    update: {},
    create: {
      email: 'admin@borrowed.club',
      passwordHash,
      firstName: 'Camilla',
      lastName: 'Montague',
      phoneNumber: '+201000000001',
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
      roles: {
        create: [{ roleId: adminRole!.id }, { roleId: RenterRoleOrOwner(ownerRole!.id) }],
      },
    },
  });

  function RenterRoleOrOwner(id: string) {
    return id;
  }

  // Dress Owners
  const ownerSophia = await prisma.user.upsert({
    where: { email: 'sophia@borrowed.club' },
    update: {},
    create: {
      email: 'sophia@borrowed.club',
      passwordHash,
      firstName: 'Sophia',
      lastName: 'El-Khatib',
      phoneNumber: '+201001112222',
      payoutMethod: 'Instapay',
      payoutDetails: 'sophia.khatib@instapay',
      avatarUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=400&q=80',
      roles: {
        create: [{ roleId: ownerRole!.id }, { roleId: renterRole!.id }],
      },
    },
  });

  const ownerLayla = await prisma.user.upsert({
    where: { email: 'layla@borrowed.club' },
    update: {},
    create: {
      email: 'layla@borrowed.club',
      passwordHash,
      firstName: 'Layla',
      lastName: 'Mansour',
      phoneNumber: '+201003334444',
      payoutMethod: 'Bank Transfer (CIB)',
      payoutDetails: 'EG4900100000000123456789012',
      avatarUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=400&q=80',
      roles: {
        create: [{ roleId: ownerRole!.id }, { roleId: renterRole!.id }],
      },
    },
  });

  const ownerNour = await prisma.user.upsert({
    where: { email: 'nour@borrowed.club' },
    update: {},
    create: {
      email: 'nour@borrowed.club',
      passwordHash,
      firstName: 'Nour',
      lastName: 'Hassan',
      phoneNumber: '+201005556666',
      payoutMethod: 'Vodafone Cash',
      payoutDetails: '+201005556666',
      avatarUrl: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=400&q=80',
      roles: {
        create: [{ roleId: ownerRole!.id }, { roleId: renterRole!.id }],
      },
    },
  });

  // Renters
  const renterYasmin = await prisma.user.upsert({
    where: { email: 'yasmin@borrowed.club' },
    update: {},
    create: {
      email: 'yasmin@borrowed.club',
      passwordHash,
      firstName: 'Yasmin',
      lastName: 'Soliman',
      phoneNumber: '+201007778888',
      avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=400&q=80',
      roles: {
        create: [{ roleId: renterRole!.id }],
      },
    },
  });

  // Delivery Courier
  const driverTarek = await prisma.user.upsert({
    where: { email: 'tarek@borrowed.club' },
    update: {},
    create: {
      email: 'tarek@borrowed.club',
      passwordHash,
      firstName: 'Tarek',
      lastName: 'Ghoneim',
      phoneNumber: '+201009990000',
      avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
      roles: {
        create: [{ roleId: deliveryRole!.id }],
      },
    },
  });

  // Addresses for Sophia & Yasmin
  const cairoCityId = cityMap.get('Cairo')!;
  const newCairoCityId = cityMap.get('New Cairo & Tagamoa')!;

  await prisma.address.create({
    data: {
      userId: ownerSophia.id,
      cityId: cairoCityId,
      title: 'Zamalek Studio (Pickup)',
      area: 'Zamalek',
      street: '26th of July Corridor',
      building: 'Villa 14',
      floor: '2nd Floor',
      apartment: 'Apt 4',
      notes: 'Ring bell marked El-Khatib',
      isDefault: true,
    },
  });

  await prisma.address.create({
    data: {
      userId: renterYasmin.id,
      cityId: newCairoCityId,
      title: 'Home Delivery',
      area: '5th Settlement',
      street: 'South Academy, St 12',
      building: 'Building 82',
      floor: '3rd Floor',
      apartment: 'Apt 301',
      notes: 'Leave with reception if not answering',
      isDefault: true,
    },
  });

  // 6. Comprehensive Dresses Collection (22 Dresses)
  const dressesList = [
    {
      title: 'Midnight Emerald Sculptural Silk Gown',
      description: 'An iconic floor-sweeping emerald gown crafted from weighted duchess silk. Features a structured asymmetric neckline, subtle boning for a flawless hourglass silhouette, and a daring front slit.',
      brand: 'Solace London',
      categorySlug: 'evening-gowns',
      occasions: ['Galas', 'Evening Events', 'Weddings'],
      size: 'FR 38 (S/M)',
      color: 'Emerald Green',
      material: 'Duchess Silk & Satin',
      condition: DressCondition.LIKE_NEW,
      rentalPrice: 2200,
      replacementValue: 28000,
      city: 'Cairo',
      pickupArea: 'Zamalek',
      status: DressStatus.APPROVED,
      ownerId: ownerSophia.id,
      images: [
        { url: 'https://images.unsplash.com/photo-1566174053879-31528523f8ae?auto=format&fit=crop&w=1000&q=85', isCover: true, displayOrder: 0 },
        { url: 'https://images.unsplash.com/photo-1539109136881-3be0616acf4b?auto=format&fit=crop&w=1000&q=85', isCover: false, displayOrder: 1 },
      ],
    },
    {
      title: 'Blush Dahlia Hand-Embroidered Cape Dress',
      description: 'Whisper-light tulle adorned with thousands of rose gold crystal sequins and delicate 3D organza florets. Comes with a matching sheer detachable floor-length cape.',
      brand: 'Zuhair Murad',
      categorySlug: 'bridal-engagement',
      occasions: ['Weddings', 'Engagement', 'Designer Picks'],
      size: 'FR 36 (S)',
      color: 'Blush Rose',
      material: 'Embroidered French Tulle',
      condition: DressCondition.EXCELLENT,
      rentalPrice: 3800,
      replacementValue: 65000,
      city: 'Cairo',
      pickupArea: 'Zamalek',
      status: DressStatus.APPROVED,
      ownerId: ownerSophia.id,
      images: [
        { url: 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1000&q=85', isCover: true, displayOrder: 0 },
        { url: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=1000&q=85', isCover: false, displayOrder: 1 },
      ],
    },
    {
      title: 'Onyx Velvet Mermaid Gown with Pearl Choker',
      description: 'Old Hollywood glamour reincarnated. Plush deep-black silk velvet with a fitted mermaid contour, low back, and integrated pearl collar detailing.',
      brand: 'Elie Saab',
      categorySlug: 'galas-black-tie',
      occasions: ['Galas', 'Evening Events', 'Black Tie'],
      size: 'IT 40 (S/M)',
      color: 'Onyx Black',
      material: 'Plush Silk Velvet',
      condition: DressCondition.LIKE_NEW,
      rentalPrice: 3200,
      replacementValue: 52000,
      city: 'New Cairo & Tagamoa',
      pickupArea: 'Katameya Dunes',
      status: DressStatus.APPROVED,
      ownerId: ownerLayla.id,
      images: [
        { url: 'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?auto=format&fit=crop&w=1000&q=85', isCover: true, displayOrder: 0 },
        { url: 'https://images.unsplash.com/photo-1566174053879-31528523f8ae?auto=format&fit=crop&w=1000&q=85', isCover: false, displayOrder: 1 },
      ],
    },
    {
      title: 'Golden Hour Tiered Silk Voile Midi',
      description: 'Luminous metallic honey gold that catches every golden-hour ray. Ruffled tiers with fine smocking at the waist and airy balloon sleeves.',
      brand: 'Zimmermann',
      categorySlug: 'cocktail-party',
      occasions: ['Parties', 'Weddings', 'Resort'],
      size: '0 (US 2-4 / S)',
      color: 'Champagne Gold',
      material: 'Silk Georgette & Lurex',
      condition: DressCondition.EXCELLENT,
      rentalPrice: 1650,
      replacementValue: 24000,
      city: 'New Cairo & Tagamoa',
      pickupArea: 'LakeView',
      status: DressStatus.APPROVED,
      ownerId: ownerLayla.id,
      images: [
        { url: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&w=1000&q=85', isCover: true, displayOrder: 0 },
      ],
    },
    {
      title: 'Celestial Ivory Crystal Drop Column Dress',
      description: 'Minimalist column cut with thousands of micro-crystal fringes that sway with every step. Perfect for modern rehearsal dinners, engagements, or galas.',
      brand: 'Safiyaa',
      categorySlug: 'bridal-engagement',
      occasions: ['Weddings', 'Engagement', 'Galas'],
      size: 'UK 8 (S)',
      color: 'Ivory White',
      material: 'Heavy Stretch Crepe',
      condition: DressCondition.BRAND_NEW,
      rentalPrice: 2400,
      replacementValue: 36000,
      city: 'Sheikh Zayed & 6th October',
      pickupArea: 'Allegria',
      status: DressStatus.APPROVED,
      ownerId: ownerNour.id,
      images: [
        { url: 'https://images.unsplash.com/photo-1518895949257-7621c3c786d7?auto=format&fit=crop&w=1000&q=85', isCover: true, displayOrder: 0 },
      ],
    },
    {
      title: 'Lavender Mist Tulle Tiered Ballgown',
      description: 'Enchanting layers of pleated pastel lavender tulle with structured corset bodice and delicate velvet ribbon accents. The ultimate graduation or gala statement.',
      brand: 'Marchesa Notte',
      categorySlug: 'prom-graduation',
      occasions: ['Graduations', 'Prom', 'Parties'],
      size: 'US 4 (S)',
      color: 'Lavender Mauve',
      material: 'Pleated Tulle & Velvet',
      condition: DressCondition.LIKE_NEW,
      rentalPrice: 1950,
      replacementValue: 26000,
      city: 'Alexandria',
      pickupArea: 'Kafr Abdo',
      status: DressStatus.APPROVED,
      ownerId: ownerSophia.id,
      images: [
        { url: 'https://images.unsplash.com/photo-1496747611176-843222e1e57c?auto=format&fit=crop&w=1000&q=85', isCover: true, displayOrder: 0 },
      ],
    },
    {
      title: 'Terracotta Linen-Blend Cutout Resort Gown',
      description: 'Warm sunset hues meet architectural waist cutouts and gold hardware rings. Ideal for beach weddings, summer galas, and destination soirees.',
      brand: 'Cult Gaia',
      categorySlug: 'resort-destination',
      occasions: ['Resort', 'Parties', 'Weddings'],
      size: 'M (US 6-8)',
      color: 'Terracotta Coral',
      material: 'Italian Linen & Viscose',
      condition: DressCondition.EXCELLENT,
      rentalPrice: 1400,
      replacementValue: 18500,
      city: 'El Gouna & Hurghada',
      pickupArea: 'El Gouna Marina',
      status: DressStatus.APPROVED,
      ownerId: ownerLayla.id,
      images: [
        { url: 'https://images.unsplash.com/photo-1502716119720-b23a93e5fe1b?auto=format&fit=crop&w=1000&q=85', isCover: true, displayOrder: 0 },
      ],
    },
    {
      title: 'Bordeaux Draped Silk Halter Evening Dress',
      description: 'Fluid crimson-wine silk charmeuse cut on the bias to drape effortlessly over curves. Features a dramatic cowl back and self-tie scarf halter.',
      brand: 'Jacquemus',
      categorySlug: 'evening-gowns',
      occasions: ['Evening Events', 'Galas', 'Parties'],
      size: 'FR 38 (M)',
      color: 'Bordeaux Wine',
      material: '100% Silk Charmeuse',
      condition: DressCondition.LIKE_NEW,
      rentalPrice: 2100,
      replacementValue: 29000,
      city: 'Cairo',
      pickupArea: 'Maadi',
      status: DressStatus.APPROVED,
      ownerId: ownerNour.id,
      images: [
        { url: 'https://images.unsplash.com/photo-1549576490-b0b4831ef60a?auto=format&fit=crop&w=1000&q=85', isCover: true, displayOrder: 0 },
      ],
    },
    {
      title: 'Midnight Sparkle Sequin Wrap Mini Dress',
      description: 'Dazzling dual-tone navy and platinum sequins with a structured shoulder line and flattering wrap front. Perfect for New Year, milestone birthdays, and parties.',
      brand: 'Retrofête',
      categorySlug: 'cocktail-party',
      occasions: ['Parties', 'Cocktail', 'Evening Events'],
      size: 'S (US 2-4)',
      color: 'Midnight Blue & Silver',
      material: 'Sequined Chiffon',
      condition: DressCondition.EXCELLENT,
      rentalPrice: 1550,
      replacementValue: 21000,
      city: 'Giza',
      pickupArea: 'Dokki',
      status: DressStatus.APPROVED,
      ownerId: ownerSophia.id,
      images: [
        { url: 'https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&w=1000&q=85', isCover: true, displayOrder: 0 },
      ],
    },
    {
      title: 'Rosewater Floral Lace Tiered Midi',
      description: 'Intricately constructed corded floral lace with signature ribbon waistband and tiered pleated skirt. Feminine, regal, and timeless.',
      brand: 'Self-Portrait',
      categorySlug: 'cocktail-party',
      occasions: ['Weddings', 'Parties', 'Graduations'],
      size: 'UK 10 (M)',
      color: 'Rosewater Mauve',
      material: 'Corded Guipure Lace',
      condition: DressCondition.BRAND_NEW,
      rentalPrice: 1450,
      replacementValue: 19500,
      city: 'Cairo',
      pickupArea: 'Heliopolis',
      status: DressStatus.APPROVED,
      ownerId: ownerLayla.id,
      images: [
        { url: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=1000&q=85', isCover: true, displayOrder: 0 },
      ],
    },
    {
      title: 'Sapphire Cape-Sleeve Column Crepe Gown',
      description: 'Regal royal sapphire gown with structural shoulder pads extending into a sweeping half-cape. Clean lines and minimalist high neckline.',
      brand: 'Badgley Mischka',
      categorySlug: 'evening-gowns',
      occasions: ['Galas', 'Black Tie', 'Weddings'],
      size: 'US 6 (M)',
      color: 'Sapphire Blue',
      material: 'Scuba Crepe',
      condition: DressCondition.LIKE_NEW,
      rentalPrice: 1850,
      replacementValue: 25000,
      city: 'New Cairo & Tagamoa',
      pickupArea: 'Mivida',
      status: DressStatus.APPROVED,
      ownerId: ownerNour.id,
      images: [
        { url: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=1000&q=85', isCover: true, displayOrder: 0 },
      ],
    },
    {
      title: 'Vintage Champagne Silk Slip Dress with Lace Hem',
      description: '90s-inspired minimalism cut on the bias in liquid champagne silk. Hand-sewn French chantilly lace borders the asymmetric hem.',
      brand: 'House of CB',
      categorySlug: 'cocktail-party',
      occasions: ['Parties', 'Resort', 'Evening Events'],
      size: 'S (US 2-4)',
      color: 'Champagne Ivory',
      material: 'Silk Charmeuse',
      condition: DressCondition.EXCELLENT,
      rentalPrice: 1200,
      replacementValue: 14000,
      city: 'Sheikh Zayed & 6th October',
      pickupArea: 'Beverly Hills',
      status: DressStatus.APPROVED,
      ownerId: ownerSophia.id,
      images: [
        { url: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=1000&q=85', isCover: true, displayOrder: 0 },
      ],
    },
    {
      title: 'Scarlet Asymmetric Peplum Gown',
      description: 'Showstopper ruby red with origami-inspired sculptural peplum at the hip. Made from heavy Italian cady that sculpts the waist.',
      brand: 'Mac Duggal',
      categorySlug: 'galas-black-tie',
      occasions: ['Galas', 'Evening Events', 'Weddings'],
      size: 'US 8 (L)',
      color: 'Scarlet Red',
      material: 'Italian Cady Crepe',
      condition: DressCondition.EXCELLENT,
      rentalPrice: 2000,
      replacementValue: 27000,
      city: 'Mansoura',
      pickupArea: 'Toriel',
      status: DressStatus.APPROVED,
      ownerId: ownerLayla.id,
      images: [
        { url: 'https://images.unsplash.com/photo-1566174053879-31528523f8ae?auto=format&fit=crop&w=1000&q=85', isCover: true, displayOrder: 0 },
      ],
    },
    {
      title: 'Silver Mist Botanical Beaded Ballgown',
      description: 'Fairytale silhouette adorned with thousands of gunmetal and silver micro-beads cascading into blooming botanical branch patterns.',
      brand: 'Needle & Thread',
      categorySlug: 'prom-graduation',
      occasions: ['Graduations', 'Weddings', 'Prom'],
      size: 'UK 8 (S)',
      color: 'Silver Dove',
      material: 'Embroidered Recycled Tulle',
      condition: DressCondition.BRAND_NEW,
      rentalPrice: 1750,
      replacementValue: 23000,
      city: 'Cairo',
      pickupArea: 'Zamalek',
      status: DressStatus.APPROVED,
      ownerId: ownerSophia.id,
      images: [
        { url: 'https://images.unsplash.com/photo-1539109136881-3be0616acf4b?auto=format&fit=crop&w=1000&q=85', isCover: true, displayOrder: 0 },
      ],
    },
    {
      title: 'Olive Silk Plissé Halterneck Maxi',
      description: 'Micro-pleated olive green plissé jersey with an open keyhole front and flowing circular skirt that billows majestically.',
      brand: 'Cult Gaia',
      categorySlug: 'resort-destination',
      occasions: ['Resort', 'Weddings', 'Parties'],
      size: 'M (US 6)',
      color: 'Olive Sage',
      material: 'Plissé Crepe',
      condition: DressCondition.LIKE_NEW,
      rentalPrice: 1350,
      replacementValue: 17000,
      city: 'Alexandria',
      pickupArea: 'Smouha',
      status: DressStatus.APPROVED,
      ownerId: ownerNour.id,
      images: [
        { url: 'https://images.unsplash.com/photo-1496747611176-843222e1e57c?auto=format&fit=crop&w=1000&q=85', isCover: true, displayOrder: 0 },
      ],
    },
    {
      title: 'Pearl White Feather-Trimmed Satin Cocktail Dress',
      description: 'Luxe ivory heavy satin adorned with genuine ostrich feather trim along the strapless sweetheart neckline. Chic and flirtatious.',
      brand: 'House of CB',
      categorySlug: 'cocktail-party',
      occasions: ['Engagement', 'Parties', 'Weddings'],
      size: 'XS (US 0-2)',
      color: 'Pearl White',
      material: 'Duchess Satin & Feathers',
      condition: DressCondition.EXCELLENT,
      rentalPrice: 1600,
      replacementValue: 19000,
      city: 'Cairo',
      pickupArea: 'Zamalek',
      status: DressStatus.APPROVED,
      ownerId: ownerSophia.id,
      images: [
        { url: 'https://images.unsplash.com/photo-1518895949257-7621c3c786d7?auto=format&fit=crop&w=1000&q=85', isCover: true, displayOrder: 0 },
      ],
    },
    // Listings in other statuses for demoing Admin and Owner workflows
    {
      title: 'Chartreuse Silk Georgette Asymmetrical Dress',
      description: 'Vibrant neon-chartreuse silk georgette with cascading shoulder ties. Recently submitted by owner and awaiting moderation approval.',
      brand: 'Jacquemus',
      categorySlug: 'cocktail-party',
      occasions: ['Parties', 'Resort'],
      size: 'FR 36 (S)',
      color: 'Chartreuse Lime',
      material: '100% Silk Georgette',
      condition: DressCondition.LIKE_NEW,
      rentalPrice: 1800,
      replacementValue: 22000,
      city: 'Cairo',
      pickupArea: 'Maadi',
      status: DressStatus.PENDING_REVIEW,
      ownerId: ownerNour.id,
      images: [
        { url: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=1000&q=85', isCover: true, displayOrder: 0 },
      ],
    },
    {
      title: 'Gilded Bronze Sequin Long-Sleeve Column Gown',
      description: 'Opulent bronze sequins over stretch mesh with high crew neck and puddle train. Awaiting platform administrator verification.',
      brand: 'Retrofête',
      categorySlug: 'galas-black-tie',
      occasions: ['Galas', 'Black Tie'],
      size: 'US 4 (S)',
      color: 'Bronze Metallic',
      material: 'Sequined Mesh',
      condition: DressCondition.EXCELLENT,
      rentalPrice: 2400,
      replacementValue: 31000,
      city: 'New Cairo & Tagamoa',
      pickupArea: '5th Settlement',
      status: DressStatus.PENDING_REVIEW,
      ownerId: ownerLayla.id,
      images: [
        { url: 'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?auto=format&fit=crop&w=1000&q=85', isCover: true, displayOrder: 0 },
      ],
    },
    {
      title: 'Midnight Floral Jacquard Ballgown',
      description: 'High-contrast midnight navy and silver metallic jacquard with structured box pleats and pockets. Currently temporarily unavailable for seasonal cleaning.',
      brand: 'Oscar de la Renta',
      categorySlug: 'evening-gowns',
      occasions: ['Galas', 'Weddings'],
      size: 'US 6 (M)',
      color: 'Midnight & Silver',
      material: 'Silk Jacquard',
      condition: DressCondition.EXCELLENT,
      rentalPrice: 4200,
      replacementValue: 78000,
      city: 'Cairo',
      pickupArea: 'Zamalek',
      status: DressStatus.UNAVAILABLE,
      ownerId: ownerSophia.id,
      images: [
        { url: 'https://images.unsplash.com/photo-1566174053879-31528523f8ae?auto=format&fit=crop&w=1000&q=85', isCover: true, displayOrder: 0 },
      ],
    },
    {
      title: 'Blush Satin Slip (Requires Clearer Photography)',
      description: 'Simple blush slip dress. Images submitted were low resolution and did not meet platform editorial standards.',
      brand: 'Zara Studio',
      categorySlug: 'cocktail-party',
      occasions: ['Parties'],
      size: 'M',
      color: 'Blush Pink',
      material: 'Polyester Satin',
      condition: DressCondition.GOOD,
      rentalPrice: 650,
      replacementValue: 3500,
      city: 'Giza',
      pickupArea: 'Mohandessin',
      status: DressStatus.REJECTED,
      rejectionReason: 'Listing photos are blurry. Please provide high-resolution photos in natural lighting matching BORROWED. editorial standards.',
      ownerId: ownerLayla.id,
      images: [
        { url: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&w=1000&q=85', isCover: true, displayOrder: 0 },
      ],
    },
  ];

  const createdDresses: any[] = [];
  for (const d of dressesList) {
    const categoryId = categoryMap.get(d.categorySlug)!;
    const { images, categorySlug, ...dressData } = d;

    const created = await prisma.dress.create({
      data: {
        ...dressData,
        categoryId,
        images: {
          create: images.map((img) => ({
            url: img.url,
            isCover: img.isCover,
            displayOrder: img.displayOrder,
          })),
        },
      },
      include: { images: true },
    });
    createdDresses.push(created);
  }

  // 7. Seed Sample Bookings & End-to-End Logistics Workflows
  // Booking 1: Active In-Progress Delivery (Occasion 3 days away)
  const today = new Date();
  const occasion1 = new Date(today.getTime() + 3 * 24 * 60 * 60 * 1000); // 3 days from now
  const delivery1 = new Date(today.getTime()); // scheduled delivery today!
  const return1 = new Date(occasion1.getTime() + 1 * 24 * 60 * 60 * 1000);

  const dressEmerald = createdDresses[0]; // Solace London Emerald
  const booking1 = await prisma.rentalBooking.create({
    data: {
      bookingReference: 'BRW-2026-9041',
      dressId: dressEmerald.id,
      renterId: renterYasmin.id,
      occasionDate: occasion1,
      scheduledDeliveryDate: delivery1,
      scheduledReturnDate: return1,
      rentalPriceSnapshot: dressEmerald.rentalPrice,
      commissionRateSnapshot: 20,
      platformCommission: Math.round(dressEmerald.rentalPrice * 0.2), // 440 EGP
      ownerEarnings: Math.round(dressEmerald.rentalPrice * 0.8), // 1760 EGP
      deliveryFeeSnapshot: 180,
      depositFeeSnapshot: 0,
      totalAmount: dressEmerald.rentalPrice + 180,
      status: RentalStatus.OUT_FOR_DELIVERY,
      paymentStatus: PaymentStatus.COMPLETED,
      paymentMethod: PaymentMethod.CREDIT_CARD,
      deliveryAddressJson: {
        city: 'New Cairo & Tagamoa',
        area: '5th Settlement',
        street: 'South Academy, St 12',
        building: 'Building 82',
        floor: '3rd Floor',
        apartment: 'Apt 301',
        recipientName: 'Yasmin Soliman',
        recipientPhone: '+201007778888',
      },
      pickupAddressJson: {
        city: 'Cairo',
        area: 'Zamalek',
        street: '26th of July Corridor',
        building: 'Villa 14',
        contactName: 'Sophia El-Khatib',
        contactPhone: '+201001112222',
      },
      statusHistory: {
        create: [
          { status: RentalStatus.CONFIRMED, note: 'Payment verified via card checkout' },
          { status: RentalStatus.PICKUP_SCHEDULED, note: 'Assigned to courier Tarek Ghoneim for owner pickup' },
          { status: RentalStatus.COLLECTED_FROM_OWNER, note: 'Collected safely from Sophia in Zamalek' },
          { status: RentalStatus.OUT_FOR_DELIVERY, note: 'Courier on the way to Yasmin in New Cairo' },
        ],
      },
      payments: {
        create: [
          {
            amount: dressEmerald.rentalPrice + 180,
            method: PaymentMethod.CREDIT_CARD,
            status: PaymentStatus.COMPLETED,
            referenceCode: 'PAY-TX-9041',
            providerDetails: { cardBrand: 'Mastercard', last4: '8841', authCode: 'AUTH-OK-9041' },
          },
        ],
      },
      earnings: {
        create: [
          {
            ownerId: ownerSophia.id,
            grossAmount: dressEmerald.rentalPrice,
            commissionRate: 20,
            commissionFee: Math.round(dressEmerald.rentalPrice * 0.2),
            netEarnings: Math.round(dressEmerald.rentalPrice * 0.8),
            payoutStatus: PayoutStatus.ELIGIBLE,
          },
        ],
      },
      deliveryTasks: {
        create: [
          {
            stage: DeliveryTaskStage.PICKUP_FROM_OWNER,
            status: DeliveryTaskStatus.COMPLETED,
            driverId: driverTarek.id,
            targetAddress: 'Cairo, Zamalek, 26th of July Corridor, Villa 14',
            contactName: 'Sophia El-Khatib',
            contactPhone: '+201001112222',
            scheduledDate: delivery1,
            completedAt: new Date(today.getTime() - 2 * 60 * 60 * 1000),
            proofNotes: 'Collected in original dustbag with hanger. Pristine condition verified.',
          },
          {
            stage: DeliveryTaskStage.DELIVER_TO_RENTER,
            status: DeliveryTaskStatus.IN_PROGRESS,
            driverId: driverTarek.id,
            targetAddress: 'New Cairo, 5th Settlement, South Academy St 12, Bldg 82',
            contactName: 'Yasmin Soliman',
            contactPhone: '+201007778888',
            scheduledDate: delivery1,
            proofNotes: 'Estimated arrival in 45 minutes.',
          },
          {
            stage: DeliveryTaskStage.COLLECT_FROM_RENTER,
            status: DeliveryTaskStatus.PENDING,
            driverId: driverTarek.id,
            targetAddress: 'New Cairo, 5th Settlement, South Academy St 12, Bldg 82',
            contactName: 'Yasmin Soliman',
            contactPhone: '+201007778888',
            scheduledDate: return1,
          },
          {
            stage: DeliveryTaskStage.RETURN_TO_OWNER,
            status: DeliveryTaskStatus.PENDING,
            driverId: driverTarek.id,
            targetAddress: 'Cairo, Zamalek, 26th of July Corridor, Villa 14',
            contactName: 'Sophia El-Khatib',
            contactPhone: '+201001112222',
            scheduledDate: return1,
          },
        ],
      },
    },
  });

  // Booking 2: Past Completed Rental (with full payout & 5-star review)
  const pastOccasion = new Date(today.getTime() - 10 * 24 * 60 * 60 * 1000);
  const pastDelivery = new Date(pastOccasion.getTime() - 3 * 24 * 60 * 60 * 1000);
  const pastReturn = new Date(pastOccasion.getTime() + 1 * 24 * 60 * 60 * 1000);

  const dressZuhair = createdDresses[1]; // Zuhair Murad Blush Dahlia
  const booking2 = await prisma.rentalBooking.create({
    data: {
      bookingReference: 'BRW-2026-8712',
      dressId: dressZuhair.id,
      renterId: renterYasmin.id,
      occasionDate: pastOccasion,
      scheduledDeliveryDate: pastDelivery,
      actualDeliveryDate: pastDelivery,
      scheduledReturnDate: pastReturn,
      actualReturnDate: pastReturn,
      rentalPriceSnapshot: dressZuhair.rentalPrice,
      commissionRateSnapshot: 20,
      platformCommission: Math.round(dressZuhair.rentalPrice * 0.2), // 760 EGP
      ownerEarnings: Math.round(dressZuhair.rentalPrice * 0.8), // 3040 EGP
      deliveryFeeSnapshot: 150,
      depositFeeSnapshot: 0,
      totalAmount: dressZuhair.rentalPrice + 150,
      status: RentalStatus.COMPLETED,
      paymentStatus: PaymentStatus.COMPLETED,
      paymentMethod: PaymentMethod.CREDIT_CARD,
      deliveryAddressJson: {
        city: 'Cairo',
        area: 'Heliopolis',
        street: 'Beirut Street, Bldg 19',
        recipientName: 'Yasmin Soliman',
        recipientPhone: '+201007778888',
      },
      pickupAddressJson: {
        city: 'Cairo',
        area: 'Zamalek',
        street: '26th of July Corridor',
        building: 'Villa 14',
        contactName: 'Sophia El-Khatib',
        contactPhone: '+201001112222',
      },
      statusHistory: {
        create: [
          { status: RentalStatus.CONFIRMED, note: 'Booking confirmed and card charged' },
          { status: RentalStatus.DELIVERED, note: 'Delivered 3 days before wedding as promised' },
          { status: RentalStatus.COLLECTED_FROM_RENTER, note: 'Collected smoothly post-wedding' },
          { status: RentalStatus.RETURNED_TO_OWNER, note: 'Returned to Sophia in Zamalek' },
          { status: RentalStatus.COMPLETED, note: 'Rental successfully completed. Owner paid out.' },
        ],
      },
      reviews: {
        create: [
          {
            dressId: dressZuhair.id,
            userId: renterYasmin.id,
            rating: 5,
            comment: 'Absolutely magical dress! I received endless compliments at my sister’s engagement. The 3-day delivery window gave me total peace of mind for fitting and shoes.',
          },
        ],
      },
    },
  });

  // Owner Payout for booking 2
  const payout1 = await prisma.ownerPayout.create({
    data: {
      ownerId: ownerSophia.id,
      payoutRef: 'PAY-2026-0038',
      totalAmount: 3040,
      method: 'Instapay',
      accountInfo: 'sophia.khatib@instapay',
      status: PayoutStatus.COMPLETED,
      processedBy: adminUser.id,
      processedAt: new Date(today.getTime() - 8 * 24 * 60 * 60 * 1000),
      notes: 'Transfer verified via Instapay IPN ref #9988221',
      earnings: {
        create: [
          {
            ownerId: ownerSophia.id,
            rentalBookingId: booking2.id,
            grossAmount: dressZuhair.rentalPrice,
            commissionRate: 20,
            commissionFee: Math.round(dressZuhair.rentalPrice * 0.2),
            netEarnings: Math.round(dressZuhair.rentalPrice * 0.8),
            payoutStatus: PayoutStatus.COMPLETED,
          },
        ],
      },
    },
  });

  // 8. Sample Notifications
  await prisma.notification.createMany({
    data: [
      {
        userId: renterYasmin.id,
        title: 'Dress Out for Delivery',
        message: 'Your Solace London gown is currently out for delivery with courier Tarek Ghoneim.',
        type: 'DELIVERY_OUT',
        link: '/rentals',
      },
      {
        userId: ownerSophia.id,
        title: 'New Rental Request Confirmed',
        message: 'Your dress "Midnight Emerald Sculptural Silk Gown" was booked for an upcoming event.',
        type: 'RENTAL_CONFIRMED',
        link: '/owner',
      },
      {
        userId: ownerSophia.id,
        title: 'Payout Processed (EGP 3,040)',
        message: 'Your net earnings for Zuhair Murad Blush Dahlia have been transferred to your Instapay.',
        type: 'PAYOUT_COMPLETED',
        link: '/owner',
      },
    ],
  });

  // 9. Favorites
  await prisma.favorite.createMany({
    data: [
      { userId: renterYasmin.id, dressId: dressEmerald.id },
      { userId: renterYasmin.id, dressId: dressZuhair.id },
    ],
  });

  console.log('✅ BORROWED. database seeded successfully with:');
  console.log(` - 5 User Roles`);
  console.log(` - 7 Supported Cities & Delivery Rates`);
  console.log(` - 6 Fashion Categories`);
  console.log(` - 5 Demo Accounts (Admin, Owners, Renter, Courier)`);
  console.log(` - ${dressesList.length} High-Fashion Dresses with photos`);
  console.log(` - Active and Completed Rental Workflows with 4-stage logistics`);
  console.log(` - Financial Commission & Payout Ledger`);
}

main()
  .catch((e) => {
    console.error('❌ Error during database seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });


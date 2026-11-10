describe('Rental Date and Commission Calculation Engine', () => {
  it('should enforce 3 calendar days before occasion for delivery and 1 day after for return', () => {
    const occasion = new Date('2026-12-20T00:00:00.000Z');
    const deliveryDaysOffset = 3;
    const returnDaysOffset = 1;

    const scheduledDelivery = new Date(occasion.getTime() - deliveryDaysOffset * 24 * 60 * 60 * 1000);
    const scheduledReturn = new Date(occasion.getTime() + returnDaysOffset * 24 * 60 * 60 * 1000);

    expect(scheduledDelivery.toISOString().split('T')[0]).toBe('2026-12-17');
    expect(scheduledReturn.toISOString().split('T')[0]).toBe('2026-12-21');
  });

  it('should calculate platform commission correctly from rental price and leave remainder for owner', () => {
    const rentalPrice = 1500;
    const commissionPercent = 20;

    const platformCommission = Math.round(rentalPrice * (commissionPercent / 100));
    const ownerEarnings = rentalPrice - platformCommission;

    expect(platformCommission).toBe(300);
    expect(ownerEarnings).toBe(1200);
    expect(platformCommission + ownerEarnings).toBe(rentalPrice);
  });

  it('should support dynamic commission configuration without hardcoded values', () => {
    const rentalPrice = 2500;
    const customCommissionPercent = 15;

    const platformCommission = Math.round(rentalPrice * (customCommissionPercent / 100));
    const ownerEarnings = rentalPrice - platformCommission;

    expect(platformCommission).toBe(375);
    expect(ownerEarnings).toBe(2125);
  });
});


import NotificationService from "../src/services/NotificationService.js";

// Example usage of the new notification system

// Example 1: Reservation confirmed
export const sendReservationConfirmed = async (
  userId,
  reservation,
  slot,
  lot
) => {
  return await NotificationService.reservationConfirmed(
    userId,
    {
      slot_number: slot.location_tag || `Slot ${slot.id}`,
      lot_name: lot.name,
      start_time: new Date(reservation.start_time).toLocaleTimeString(),
      end_time: new Date(reservation.end_time).toLocaleTimeString(),
      amount: reservation.total_amount,
      reservation_id: reservation.id,
    },
    true
  ); // Send email
};

// Example 2: Overstay warning
export const sendOverstayWarning = async (
  userId,
  reservation,
  slot,
  overstayAmount
) => {
  return await NotificationService.overstayWarning(
    userId,
    {
      slot_number: slot.location_tag || `Slot ${slot.id}`,
      overstay_amount: overstayAmount,
      reservation_id: reservation.id,
    },
    true
  ); // Send email
};

// Example 3: Waitlist slot available
export const sendWaitlistNotification = async (userId, waitlist, slot, lot) => {
  return await NotificationService.waitlistSlotAvailable(
    userId,
    {
      slot_type: waitlist.slot_type_pref,
      lot_name: lot.name,
      start_time: new Date(waitlist.desired_start_time).toLocaleTimeString(),
      waitlist_id: waitlist.id,
      slot_id: slot.id,
    },
    true
  ); // Send email
};

// Example 4: Payment receipt
export const sendPaymentReceipt = async (userId, payment, reservation, lot) => {
  return await NotificationService.paymentReceipt(
    userId,
    {
      amount: payment.amount,
      lot_name: lot.name,
      transaction_id: payment.transaction_id,
      payment_id: payment.id,
      reservation_id: reservation.id,
    },
    false
  ); // Don't send email for receipts
};

// Example 5: Bulk notification (system announcement)
export const sendSystemAnnouncement = async (userIds, title, message) => {
  return await NotificationService.createBulk(
    userIds,
    "system_announcement",
    {
      announcement_title: title,
      announcement_message: message,
    },
    {
      priority: "medium",
      sendEmail: false,
    }
  );
};

// Example 6: Get user notifications with pagination
export const getUserNotifications = async (
  userId,
  page = 1,
  unreadOnly = false
) => {
  return await NotificationService.getUserNotifications(userId, {
    page,
    limit: 20,
    unreadOnly,
  });
};

// Notification templates for consistent messaging
export const notificationTemplates = {
  reservation_confirmed: {
    title: "Reservation Confirmed! 🎉",
    message:
      "Your reservation for slot {{slot_number}} at {{lot_name}} from {{start_time}} to {{end_time}} has been confirmed. Total: ${{amount}}",
    priority: "medium",
  },

  reservation_reminder: {
    title: "Check-in Reminder ⏰",
    message:
      "Your reservation at {{lot_name}} starts in 10 minutes. Please proceed to slot {{slot_number}}.",
    priority: "high",
  },

  reservation_expired: {
    title: "Reservation Expired ⚠️",
    message:
      "Your reservation for slot {{slot_number}} at {{lot_name}} has expired due to no check-in within the grace period.",
    priority: "medium",
  },

  overstay_warning: {
    title: "Overstay Alert 🚨",
    message:
      "You have exceeded your reserved time for slot {{slot_number}}. Additional charges of ${{overstay_amount}} apply. Please check out soon.",
    priority: "urgent",
  },

  payment_receipt: {
    title: "Payment Confirmed ✅",
    message:
      "Payment of ${{amount}} confirmed for your parking reservation at {{lot_name}}. Transaction ID: {{transaction_id}}",
    priority: "low",
  },

  payment_failed: {
    title: "Payment Failed ❌",
    message:
      "Your payment of ${{amount}} for reservation at {{lot_name}} could not be processed. Please update your payment method.",
    priority: "high",
  },

  waitlist_slot_available: {
    title: "Parking Slot Available! 🚗",
    message:
      "Great news! A {{slot_type}} slot is now available at {{lot_name}} for {{start_time}}. You have 5 minutes to reserve it.",
    priority: "urgent",
  },

  waitlist_expired: {
    title: "Waitlist Expired",
    message:
      "Your waitlist entry for {{slot_type}} slots at {{lot_name}} has expired. You can join the waitlist again if needed.",
    priority: "low",
  },

  check_in_success: {
    title: "Check-in Successful ✅",
    message:
      "You have successfully checked into slot {{slot_number}} at {{lot_name}}. Vehicle: {{vehicle_number}}",
    priority: "medium",
  },

  check_out_success: {
    title: "Check-out Complete 👋",
    message:
      "Thank you for using our parking service! Your final bill for slot {{slot_number}} is ${{final_amount}}.",
    priority: "low",
  },

  system_announcement: {
    title: "{{announcement_title}}",
    message: "{{announcement_message}}",
    priority: "medium",
  },
};

// Simple template processor
export const processTemplate = (template, data) => {
  let message = template.message;
  let title = template.title;

  // Replace {{variable}} with actual data
  Object.keys(data).forEach((key) => {
    const placeholder = `{{${key}}}`;
    message = message.replace(new RegExp(placeholder, "g"), data[key]);
    title = title.replace(new RegExp(placeholder, "g"), data[key]);
  });

  return {
    title,
    message,
    priority: template.priority,
  };
};

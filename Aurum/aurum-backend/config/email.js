const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host:   process.env.EMAIL_HOST,
  port:   parseInt(process.env.EMAIL_PORT) || 587,
  secure: false,
  auth:   { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
});

const goldBar = `<div style="height:2px;background:linear-gradient(90deg,#C9A84C,#E8C96A,#C9A84C);margin:24px 0;"></div>`;
const baseTemplate = (content) => `
<!DOCTYPE html><html><head><meta charset="UTF-8">
<style>
  @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;1,400&family=Montserrat:wght@300;400&display=swap');
  body{margin:0;padding:0;background:#0A0A0A;font-family:'Montserrat',sans-serif;font-weight:300;}
</style></head>
<body>
<table width="100%" cellpadding="0" cellspacing="0" style="background:#0A0A0A;padding:40px 20px;">
<tr><td align="center">
<table width="600" cellpadding="0" cellspacing="0" style="background:#111111;border:0.5px solid rgba(201,168,76,0.3);">
  <tr><td style="padding:40px;text-align:center;border-bottom:0.5px solid rgba(201,168,76,0.15);">
    <div style="font-family:'Cormorant Garamond',serif;font-size:36px;font-weight:300;color:#C9A84C;letter-spacing:0.12em;">AURUM</div>
    <div style="font-size:10px;letter-spacing:0.3em;text-transform:uppercase;color:#888;margin-top:4px;">Ristorante</div>
  </td></tr>
  <tr><td style="padding:40px;color:#F7F3EC;">${content}</td></tr>
  <tr><td style="padding:20px 40px;border-top:0.5px solid rgba(201,168,76,0.15);text-align:center;">
    <div style="font-size:10px;letter-spacing:0.15em;color:#555;">© 2026 Aurum Ristorante · 12 Via della Luce, Milano</div>
    <div style="font-size:10px;color:#555;margin-top:6px;">+39 02 8765 4321 · reservations@aurum-ristorante.com</div>
  </td></tr>
</table>
</td></tr></table>
</body></html>`;

const emailService = {

  async sendReservationConfirmation(reservation) {
    const dateStr = new Date(reservation.date).toLocaleDateString('en-GB', { weekday:'long', year:'numeric', month:'long', day:'numeric' });
    const content = `
      <p style="font-size:12px;letter-spacing:0.3em;text-transform:uppercase;color:#C9A84C;margin:0 0 12px;">Reservation Confirmed</p>
      <h1 style="font-family:'Cormorant Garamond',serif;font-size:32px;font-weight:300;color:#F7F3EC;margin:0 0 8px;">Thank you, ${reservation.firstName}.</h1>
      <p style="font-size:13px;color:#aaa;line-height:1.8;margin:0 0 24px;">We look forward to welcoming you at Aurum. Your reservation details are below.</p>
      ${goldBar}
      <table width="100%" cellpadding="0" cellspacing="0">
        <tr><td style="padding:10px 0;border-bottom:0.5px solid rgba(255,255,255,0.06);">
          <span style="font-size:10px;letter-spacing:0.2em;text-transform:uppercase;color:#C9A84C;">Date</span><br>
          <span style="font-size:15px;color:#F7F3EC;font-family:'Cormorant Garamond',serif;">${dateStr}</span>
        </td></tr>
        <tr><td style="padding:10px 0;border-bottom:0.5px solid rgba(255,255,255,0.06);">
          <span style="font-size:10px;letter-spacing:0.2em;text-transform:uppercase;color:#C9A84C;">Time</span><br>
          <span style="font-size:15px;color:#F7F3EC;font-family:'Cormorant Garamond',serif;">${reservation.time}</span>
        </td></tr>
        <tr><td style="padding:10px 0;border-bottom:0.5px solid rgba(255,255,255,0.06);">
          <span style="font-size:10px;letter-spacing:0.2em;text-transform:uppercase;color:#C9A84C;">Guests</span><br>
          <span style="font-size:15px;color:#F7F3EC;font-family:'Cormorant Garamond',serif;">${reservation.guests} ${reservation.guests === 1 ? 'Guest' : 'Guests'}</span>
        </td></tr>
        <tr><td style="padding:10px 0;">
          <span style="font-size:10px;letter-spacing:0.2em;text-transform:uppercase;color:#C9A84C;">Confirmation ID</span><br>
          <span style="font-size:15px;color:#F7F3EC;font-family:'Cormorant Garamond',serif;letter-spacing:0.1em;">${reservation.confirmationId}</span>
        </td></tr>
      </table>
      ${goldBar}
      ${reservation.requests ? `<p style="font-size:12px;color:#aaa;line-height:1.7;"><strong style="color:#C9A84C;">Special requests noted:</strong> ${reservation.requests}</p>` : ''}
      <p style="font-size:12px;color:#aaa;line-height:1.8;margin-top:20px;">To modify or cancel your reservation, please call us at <span style="color:#C9A84C;">+39 02 8765 4321</span> or reply to this email at least 24 hours in advance.</p>
      <div style="margin-top:28px;text-align:center;">
        <a href="https://wa.me/390287654321" style="display:inline-block;background:#C9A84C;color:#000;font-size:10px;letter-spacing:0.2em;text-transform:uppercase;padding:14px 32px;text-decoration:none;">WhatsApp Us</a>
      </div>`;
    return transporter.sendMail({
      from:    process.env.EMAIL_FROM,
      to:      reservation.email,
      subject: `Reservation Confirmed · Aurum Ristorante · ${dateStr}`,
      html:    baseTemplate(content),
    });
  },

  async sendOwnerNotification(reservation) {
    const dateStr = new Date(reservation.date).toLocaleDateString('en-GB', { weekday:'long', year:'numeric', month:'long', day:'numeric' });
    const content = `
      <p style="font-size:12px;letter-spacing:0.3em;text-transform:uppercase;color:#C9A84C;">New Reservation</p>
      <h2 style="font-family:'Cormorant Garamond',serif;font-size:28px;font-weight:300;color:#F7F3EC;margin:8px 0 20px;">${reservation.firstName} ${reservation.lastName}</h2>
      ${goldBar}
      <table width="100%" cellpadding="8" cellspacing="0" style="font-size:13px;color:#F7F3EC;">
        <tr style="border-bottom:0.5px solid rgba(255,255,255,0.06);"><td style="color:#888;width:40%;">Date</td><td>${dateStr}</td></tr>
        <tr style="border-bottom:0.5px solid rgba(255,255,255,0.06);"><td style="color:#888;">Time</td><td>${reservation.time}</td></tr>
        <tr style="border-bottom:0.5px solid rgba(255,255,255,0.06);"><td style="color:#888;">Guests</td><td>${reservation.guests}</td></tr>
        <tr style="border-bottom:0.5px solid rgba(255,255,255,0.06);"><td style="color:#888;">Email</td><td>${reservation.email}</td></tr>
        <tr style="border-bottom:0.5px solid rgba(255,255,255,0.06);"><td style="color:#888;">Phone</td><td>${reservation.phone || '—'}</td></tr>
        <tr style="border-bottom:0.5px solid rgba(255,255,255,0.06);"><td style="color:#888;">Occasion</td><td>${reservation.occasion}</td></tr>
        <tr><td style="color:#888;">Requests</td><td>${reservation.requests || '—'}</td></tr>
      </table>
      ${goldBar}
      <p style="font-size:11px;color:#555;">Confirmation ID: ${reservation.confirmationId}</p>`;
    return transporter.sendMail({
      from:    process.env.EMAIL_FROM,
      to:      process.env.NOTIFY_EMAIL,
      subject: `🍽 New Reservation – ${reservation.firstName} ${reservation.lastName} · ${dateStr} · ${reservation.guests} guests`,
      html:    baseTemplate(content),
    });
  },

  async sendContactReply(contact) {
    const content = `
      <p style="font-size:12px;letter-spacing:0.3em;text-transform:uppercase;color:#C9A84C;">We received your message</p>
      <h2 style="font-family:'Cormorant Garamond',serif;font-size:28px;font-weight:300;color:#F7F3EC;">Thank you, ${contact.name}.</h2>
      ${goldBar}
      <p style="font-size:13px;color:#aaa;line-height:1.8;">Our team will respond to your enquiry within 24 hours. For urgent matters, please call us directly at <span style="color:#C9A84C;">+39 02 8765 4321</span>.</p>
      <div style="margin-top:24px;padding:20px;background:rgba(201,168,76,0.05);border-left:2px solid #C9A84C;">
        <p style="font-size:11px;letter-spacing:0.15em;text-transform:uppercase;color:#C9A84C;margin:0 0 8px;">Your message</p>
        <p style="font-size:13px;color:#aaa;line-height:1.7;margin:0;font-style:italic;">${contact.message}</p>
      </div>`;
    return transporter.sendMail({
      from:    process.env.EMAIL_FROM,
      to:      contact.email,
      subject: 'We received your message · Aurum Ristorante',
      html:    baseTemplate(content),
    });
  },

  async verifyConnection() {
    return transporter.verify();
  }
};

module.exports = emailService;

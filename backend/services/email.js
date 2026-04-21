const { Resend } = require('resend');

const resend = new Resend(process.env.RESEND_API_KEY);
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';

const enviarVerificacion = async ({ nombre, email, token }) => {
  const link = `${FRONTEND_URL}/verificar-email?token=${token}`;

  await resend.emails.send({
    from: 'NexLink <onboarding@resend.dev>',
    to: email,
    subject: 'Confirma tu cuenta en NexLink',
    html: `
      <div style="font-family: system-ui, sans-serif; max-width: 520px; margin: 0 auto; padding: 40px 24px;">
        <div style="text-align: center; margin-bottom: 32px;">
          <span style="font-size: 22px; font-weight: 800; color: #0F172A;">NexLink</span>
        </div>
        <h1 style="font-size: 24px; font-weight: 800; color: #0F172A; margin-bottom: 8px;">
          Hola, ${nombre} 👋
        </h1>
        <p style="font-size: 15px; color: #64748B; line-height: 1.6; margin-bottom: 32px;">
          Confirma tu email para activar tu cuenta y acceder al marketplace de beneficios.
        </p>
        <div style="text-align: center; margin-bottom: 32px;">
          <a href="${link}" style="display: inline-block; background: linear-gradient(135deg,#4F46E5,#7C3AED); color: white; text-decoration: none; padding: 14px 32px; border-radius: 10px; font-size: 15px; font-weight: 700;">
            Confirmar mi email
          </a>
        </div>
        <p style="font-size: 13px; color: #94A3B8;">
          Este link expira en <strong>24 horas</strong>. Si no te registraste en NexLink, ignora este email.
        </p>
        <hr style="border: none; border-top: 1px solid #E2E8F0; margin: 32px 0;">
        <p style="font-size: 12px; color: #CBD5E1; text-align: center;">© 2024 NexLink</p>
      </div>
    `,
  });
};

const enviarBienvenida = async ({ nombre, email, empresa }) => {
  await resend.emails.send({
    from: 'NexLink <onboarding@resend.dev>',
    to: email,
    subject: `¡Bienvenido a NexLink, ${nombre}!`,
    html: `
      <div style="font-family: system-ui, sans-serif; max-width: 520px; margin: 0 auto; padding: 40px 24px;">
        <h1 style="font-size: 24px; font-weight: 800; color: #0F172A;">¡Tu cuenta está activada! 🎉</h1>
        <p style="font-size: 15px; color: #64748B; line-height: 1.6;">
          Hola <strong>${nombre}</strong>, tu cuenta de colaborador de <strong>${empresa}</strong> ha sido activada exitosamente.
        </p>
        <div style="text-align: center; margin: 32px 0;">
          <a href="${FRONTEND_URL}/login" style="display: inline-block; background: linear-gradient(135deg,#4F46E5,#7C3AED); color: white; text-decoration: none; padding: 14px 32px; border-radius: 10px; font-size: 15px; font-weight: 700;">
            Ir al Marketplace
          </a>
        </div>
        <hr style="border: none; border-top: 1px solid #E2E8F0; margin: 32px 0;">
        <p style="font-size: 12px; color: #CBD5E1; text-align: center;">© 2024 NexLink</p>
      </div>
    `,
  });
};

module.exports = { enviarVerificacion, enviarBienvenida };

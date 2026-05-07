import { Resend } from 'resend'

// Initialize Resend only if API key exists
const resend = process.env.RESEND_API_KEY 
  ? new Resend(process.env.RESEND_API_KEY)
  : null

export async function sendEmail({
  to,
  subject,
  html,
}: {
  to: string
  subject: string
  html: string
}) {
  if (!resend) {
    console.log(`⚠️ Email not sent - RESEND_API_KEY missing. To: ${to}, Subject: ${subject}`)
    return { success: false, message: "Email not configured" }
  }

  try {
    await resend.emails.send({
      from: 'EnerShare <noreply@enershare.com>',
      to,
      subject,
      html,
    })
    console.log(`✅ Email sent to ${to}`)
    return { success: true }
  } catch (error) {
    console.error('Email send error:', error)
    return { success: false, error }
  }
}

export function getSaleEmailTemplate(buyerName: string, amount: number, price: number, total: number) {
  const afterFee = total * 0.98
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background: linear-gradient(135deg, #00C853, #00B0FF); padding: 20px; text-align: center; border-radius: 10px 10px 0 0;">
        <h1 style="color: white; margin: 0;">Energy Sold!</h1>
      </div>
      <div style="border: 1px solid #e0e0e0; border-top: none; padding: 20px; border-radius: 0 0 10px 10px;">
        <p>Hello,</p>
        <p><strong>${buyerName}</strong> purchased energy from you!</p>
        <div style="background: #f5f5f5; padding: 15px; border-radius: 8px; margin: 20px 0;">
          <p style="margin: 5px 0;"><strong>Amount:</strong> ${amount} kWh</p>
          <p style="margin: 5px 0;"><strong>Price:</strong> ₦${price}/kWh</p>
          <p style="margin: 5px 0;"><strong>Total:</strong> ₦${total.toLocaleString()}</p>
          <p style="margin: 5px 0;"><strong>After fee:</strong> ₦${afterFee.toLocaleString()}</p>
        </div>
        <a href="${process.env.NEXTAUTH_URL}/dashboard" style="display: inline-block; background: #00C853; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px;">View Dashboard</a>
      </div>
    </div>
  `
}

export function getPurchaseEmailTemplate(sellerName: string, amount: number, price: number, total: number) {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background: linear-gradient(135deg, #00C853, #00B0FF); padding: 20px; text-align: center; border-radius: 10px 10px 0 0;">
        <h1 style="color: white; margin: 0;">Purchase Confirmed!</h1>
      </div>
      <div style="border: 1px solid #e0e0e0; border-top: none; padding: 20px; border-radius: 0 0 10px 10px;">
        <p>Hello,</p>
        <p>You successfully purchased energy from <strong>${sellerName}</strong>!</p>
        <div style="background: #f5f5f5; padding: 15px; border-radius: 8px; margin: 20px 0;">
          <p style="margin: 5px 0;"><strong>Amount:</strong> ${amount} kWh</p>
          <p style="margin: 5px 0;"><strong>Price:</strong> ₦${price}/kWh</p>
          <p style="margin: 5px 0;"><strong>Total:</strong> ₦${total.toLocaleString()}</p>
        </div>
        <a href="${process.env.NEXTAUTH_URL}/dashboard" style="display: inline-block; background: #00C853; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px;">View Dashboard</a>
      </div>
    </div>
  `
}

export function getWelcomeEmailTemplate(name: string) {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background: linear-gradient(135deg, #00C853, #00B0FF); padding: 20px; text-align: center; border-radius: 10px 10px 0 0;">
        <h1 style="color: white; margin: 0;">Welcome to EnerShare!</h1>
      </div>
      <div style="border: 1px solid #e0e0e0; border-top: none; padding: 20px; border-radius: 0 0 10px 10px;">
        <p>Hello ${name},</p>
        <p>Welcome to Africa's first peer-to-peer energy trading platform!</p>
        <p>Here's how to get started:</p>
        <ol style="margin: 20px 0; padding-left: 20px;">
          <li>Complete your profile</li>
          <li>Add funds to your wallet</li>
          <li>Start buying and selling energy</li>
        </ol>
        <a href="${process.env.NEXTAUTH_URL}/dashboard" style="display: inline-block; background: #00C853; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px;">Go to Dashboard</a>
      </div>
    </div>
  `
}

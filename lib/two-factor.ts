import speakeasy from "speakeasy"
import QRCode from "qrcode"

export function generateTwoFactorSecret(email: string, appName: string) {
  const secret = speakeasy.generateSecret({
    name: `${appName} (${email})`,
    issuer: appName,
  })

  return {
    secret: secret.base32,
    otpAuthUrl: secret.otpauth_url,
  }
}

export async function generateQRCode(otpAuthUrl: string): Promise<string> {
  return QRCode.toDataURL(otpAuthUrl)
}

export function verifyTwoFactorToken(secret: string, token: string): boolean {
  return speakeasy.totp.verify({
    secret,
    encoding: "base32",
    token,
    window: 2, // Allow 2 time steps (60 seconds) of tolerance
  })
}

export function verificationEmailTemplate(
    verificationCode: string,
) {
    return `
      <div style="font-family: sans-serif;">
        <h2>Email Verification</h2>
  
        <p>Your verification code is:</p>
  
        <h1>${verificationCode}</h1>
  
        <p>This code will expire soon.</p>
      </div>
    `;
}
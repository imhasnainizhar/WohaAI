export function verificationEmailTemplate(
  verificationCode: string,
) {
  return `
      <div style="
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
        max-width: 600px;
        margin: 0 auto;
        padding: 40px 24px;
        background-color: #ffffff;
        color: #111827;
      ">
        <div style="
          text-align: center;
          margin-bottom: 32px;
        ">
          <div style="
            display: inline-block;
            width: 48px;
            height: 48px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            border-radius: 12px;
            margin-bottom: 16px;
          "></div>
          <h1 style="
            font-size: 28px;
            font-weight: 700;
            margin: 0 0 8px 0;
            color: #111827;
          ">
            Verify Your Email
          </h1>
          <p style="
            font-size: 16px;
            color: #6b7280;
            margin: 0;
          ">
            Complete your registration
          </p>
        </div>

        <div style="
          background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
          padding: 32px;
          border-radius: 16px;
          text-align: center;
          margin: 32px 0;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
        ">
          <p style="
            font-size: 14px;
            font-weight: 600;
            color: #4b5563;
            margin: 0 0 16px 0;
            text-transform: uppercase;
            letter-spacing: 0.05em;
          ">
            Your Verification Code
          </p>
          <div style="
            font-size: 42px;
            font-weight: 800;
            letter-spacing: 12px;
            color: #111827;
            background: #ffffff;
            padding: 20px 32px;
            border-radius: 12px;
            display: inline-block;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
          ">
            ${verificationCode}
          </div>
        </div>

        <div style="
          background-color: #fef3c7;
          border-left: 4px solid #f59e0b;
          padding: 16px;
          border-radius: 8px;
          margin: 24px 0;
        ">
          <p style="
            font-size: 14px;
            line-height: 1.6;
            color: #92400e;
            margin: 0;
          ">
            <strong>Important:</strong> This code will expire in 10 minutes for security reasons.
          </p>
        </div>

        <p style="
          font-size: 15px;
          line-height: 1.6;
          color: #4b5563;
          margin: 24px 0;
        ">
          If you didn't create an account with us, you can safely ignore this email.
        </p>

        <div style="
          border-top: 1px solid #e5e7eb;
          padding-top: 24px;
          margin-top: 32px;
          text-align: center;
        ">
          <p style="
            font-size: 13px;
            color: #9ca3af;
            margin: 0;
          ">
            © 2025 WohaAI. All rights reserved.
          </p>
        </div>
      </div>
    `;
}
export function changePasswordEmailTemplate(
    resetPasswordCode: string,
  ) {
    return `
      <div
        style="
          font-family: Arial, sans-serif;
          max-width: 600px;
          margin: 0 auto;
          padding: 24px;
          background-color: #ffffff;
          color: #111827;
        "
      >
        <h1
          style="
            font-size: 24px;
            margin-bottom: 16px;
          "
        >
          Reset Your Password
        </h1>
  
        <p
          style="
            font-size: 16px;
            line-height: 1.6;
            margin-bottom: 16px;
          "
        >
          We received a request to reset your password.
        </p>
  
        <p
          style="
            font-size: 16px;
            line-height: 1.6;
            margin-bottom: 24px;
          "
        >
          Use the verification code below to continue:
        </p>
  
        <div
          style="
            background-color: #f3f4f6;
            padding: 16px;
            border-radius: 8px;
            text-align: center;
            margin-bottom: 24px;
          "
        >
          <span
            style="
              font-size: 32px;
              font-weight: bold;
              letter-spacing: 6px;
              color: #111827;
            "
          >
            ${resetPasswordCode}
          </span>
        </div>
  
        <p
          style="
            font-size: 14px;
            line-height: 1.6;
            color: #6b7280;
            margin-bottom: 12px;
          "
        >
          This code will expire shortly for security reasons.
        </p>
  
        <p
          style="
            font-size: 14px;
            line-height: 1.6;
            color: #6b7280;
          "
        >
          If you did not request a password reset,
          you can safely ignore this email.
        </p>
      </div>
    `;
  }
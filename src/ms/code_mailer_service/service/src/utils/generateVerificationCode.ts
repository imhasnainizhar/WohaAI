export default function generateVerificationCode(length = 6): string {
    return Math.random().toString().slice(2, 2 + length);
}
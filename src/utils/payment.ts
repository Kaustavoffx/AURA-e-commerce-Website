import crypto from "crypto";

// ============================================================
//  Mock Payment Gateway Utility
// ============================================================

/**
 * Basic Luhn algorithm implementation to validate credit card formats.
 */
function passesLuhnCheck(cardNumber: string): boolean {
  const digits = cardNumber.replace(/\D/g, "");
  if (digits.length === 0) return false;

  let sum = 0;
  let isEven = false;

  for (let i = digits.length - 1; i >= 0; i--) {
    let digit = parseInt(digits.charAt(i), 10);

    if (isEven) {
      digit *= 2;
      if (digit > 9) {
        digit -= 9;
      }
    }

    sum += digit;
    isEven = !isEven;
  }

  return sum % 10 === 0;
}

/**
 * Simulates processing a credit card transaction with artificial latency.
 *
 * @param cardNumber The raw credit card string (spaces allowed)
 * @param amount The total transaction amount to process
 * @returns A simulated transaction ID if successful. Throws if invalid or declined.
 */
export async function processMockPayment(
  cardNumber: string,
  amount: number
): Promise<string> {
  return new Promise((resolve, reject) => {
    // 1. Simulate Network Latency (2 seconds)
    setTimeout(() => {
      try {
        const sanitizedCard = cardNumber.replace(/\s+/g, "");

        // 2. Format & Luhn Check
        if (!passesLuhnCheck(sanitizedCard)) {
          throw new Error("Invalid credit card number format (Luhn check failed).");
        }

        // 3. Strict match against our "test" card
        if (sanitizedCard !== "4444444444444444") {
          throw new Error("Payment declined: Only the test card ending in 4444 is accepted.");
        }

        // 4. Basic amount check
        if (amount <= 0) {
          throw new Error("Payment declined: Invalid transaction amount.");
        }

        // 5. Generate a mock transaction ID
        const transactionId = `txn_mock_${crypto.randomBytes(8).toString("hex")}`;
        
        resolve(transactionId);
      } catch (error) {
        reject(error);
      }
    }, 2000);
  });
}

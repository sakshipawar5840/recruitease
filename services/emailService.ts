
export const sendEmail = async (to: string, subject: string, body: string): Promise<boolean> => {
  console.log(`[Mock Email Service] Sending email to: ${to}`);
  console.log(`[Mock Email Service] Subject: ${subject}`);
  console.log(`[Mock Email Service] Body: ${body}`);
  
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  console.log(`[Mock Email Service] Email sent successfully.`);
  return true;
};

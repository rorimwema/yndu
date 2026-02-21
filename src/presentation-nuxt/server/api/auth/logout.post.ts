// Logout API route — clears session
export default defineEventHandler(async (event) => {
  await clearUserSession(event);
  return { message: 'Logged out successfully' };
});

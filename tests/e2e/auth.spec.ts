import { test, expect } from '@playwright/test';

test.describe('Authentication', () => {
  test.describe('Public Pages', () => {
    test('should display login page', async ({ page }) => {
      await page.goto('/login');
      
      await expect(page).toHaveTitle(/login|sign in/i);
      await expect(page.getByRole('heading', { name: /login|sign in/i })).toBeVisible();
      await expect(page.getByLabel(/email/i)).toBeVisible();
      await expect(page.getByLabel(/password/i)).toBeVisible();
      await expect(page.getByRole('button', { name: /login|sign in/i })).toBeVisible();
    });

    test('should display register page', async ({ page }) => {
      await page.goto('/register');
      
      await expect(page).toHaveTitle(/register|sign up/i);
      await expect(page.getByRole('heading', { name: /register|sign up|create account/i })).toBeVisible();
      await expect(page.getByLabel(/name/i)).toBeVisible();
      await expect(page.getByLabel(/email/i)).toBeVisible();
      await expect(page.getByLabel(/password/i)).toBeVisible();
    });

    test('should navigate from login to register', async ({ page }) => {
      await page.goto('/login');
      
      const registerLink = page.getByRole('link', { name: /register|sign up|create account/i });
      await registerLink.click();
      
      await expect(page).toHaveURL(/.*register.*/);
    });

    test('should display forgot password page', async ({ page }) => {
      await page.goto('/forgot-password');
      
      await expect(page.getByRole('heading', { name: /forgot password/i })).toBeVisible();
      await expect(page.getByLabel(/email/i)).toBeVisible();
    });
  });

  test.describe('Form Validation', () => {
    test('should show error for empty login form', async ({ page }) => {
      await page.goto('/login');
      
      // Try to submit empty form
      await page.getByRole('button', { name: /login|sign in/i }).click();
      
      // Should show validation error
      await expect(page.getByText(/email is required|invalid email/i)).toBeVisible();
    });

    test('should show error for invalid email format', async ({ page }) => {
      await page.goto('/login');
      
      await page.getByLabel(/email/i).fill('invalid-email');
      await page.getByLabel(/password/i).fill('password123');
      await page.getByRole('button', { name: /login|sign in/i }).click();
      
      await expect(page.getByText(/invalid email/i)).toBeVisible();
    });
  });

  test.describe('Protected Routes', () => {
    test('should redirect unauthenticated user from dashboard to login', async ({ page }) => {
      await page.goto('/dashboard');
      
      // Should be redirected to login
      await expect(page).toHaveURL(/.*login.*/);
    });

    test('should redirect unauthenticated user from profile to login', async ({ page }) => {
      await page.goto('/profile');
      
      await expect(page).toHaveURL(/.*login.*/);
    });
  });

  test.describe('Google OAuth', () => {
    test('should have Google login button', async ({ page }) => {
      await page.goto('/login');
      
      const googleButton = page.getByRole('button', { name: /google|continue with google/i });
      await expect(googleButton).toBeVisible();
    });
  });
});

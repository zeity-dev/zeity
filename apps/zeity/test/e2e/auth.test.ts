import { expect, test } from '@nuxt/test-utils/playwright';

test.describe('Authentication', () => {
  test.describe('Login Page', () => {
    test('should load login page', async ({ page, goto }) => {
      await goto('/auth', { waitUntil: 'hydration' });

      await expect(page).toHaveURL('/auth');
      await expect(page.getByRole('tab', { name: 'Login' })).toHaveAttribute(
        'data-state',
        'active',
      );
    });

    test('should display login form elements', async ({ page, goto }) => {
      await goto('/auth', { waitUntil: 'hydration' });

      // Check for email input
      await expect(page.locator('input[type="email"]')).toBeVisible();

      await page.getByRole('button', { name: 'Continue' }).click();

      // Check for password input
      await expect(page.locator('input[type="password"], input[name*="password"]')).toBeVisible();

      // Check for submit button
      await expect(page.locator('button[type="submit"]')).toBeVisible();
    });

    test('should show validation error for invalid email', async ({ page, goto }) => {
      await goto('/auth', { waitUntil: 'hydration' });

      // Fill with invalid email
      const emailInput = page.locator('input[type="email"]');
      const emailInputId = await emailInput.getAttribute('id');
      await emailInput.fill('invalid-email');
      await emailInput.blur();

      await expect(page.locator(`#${emailInputId}-error`)).toBeVisible();
      await expect(page.locator(`#${emailInputId}-error`)).toContainText('Invalid email address');
    });

    test('should show validation error for short password', async ({ page, goto }) => {
      await goto('/auth', { waitUntil: 'hydration' });

      // Fill with valid email but short password
      const emailInput = page.locator('input[type="email"]');
      await emailInput.fill('test@example.com');

      await page.getByRole('button', { name: 'Continue' }).click();

      const passwordInput = page.locator('input[type="password"], input[name*="password"]');
      const passwordInputId = await passwordInput.getAttribute('id');
      await passwordInput.fill('1');
      await passwordInput.blur();

      await expect(page.locator(`#${passwordInputId}-error`)).toBeVisible();
      await expect(page.locator(`#${passwordInputId}-error`)).toContainText(
        'Too small: expected string to have >=8 characters',
      );
    });
  });

  test.describe('Navigation', () => {
    test('should keep entered email when navigating to forgot password page', async ({
      page,
      goto,
    }) => {
      await goto('/auth', { waitUntil: 'hydration' });
      await expect(page).toHaveURL('/auth');

      await page.locator('input[type="email"]').fill('test@example.com');

      await page.getByRole('button', { name: 'Continue' }).click();

      const passwordInput = page.locator('input[type="password"], input[name*="password"]');
      const passwordInputId = await passwordInput.getAttribute('id');

      await expect(page.locator(`#${passwordInputId}-hint`)).toBeVisible();

      await page.locator(`#${passwordInputId}-hint a`).click();

      await expect(page).toHaveURL(url => url.pathname === '/auth/forgot-password');

      // Check that email input is still filled with the entered email
      const emailInput = page.locator('input[type="email"]');
      await expect(emailInput).toHaveValue('test@example.com');
    });

    test('should navigate to registration page', async ({ page, goto }) => {
      await goto('/auth', { waitUntil: 'hydration' });
      await expect(page).toHaveURL('/auth');

      await expect(page.getByRole('tab', { name: 'Login' })).toHaveAttribute(
        'data-state',
        'active',
      );

      await page.getByRole('tab', { name: 'Register' }).click();

      await expect(page).toHaveURL('/auth?tab=register');

      await expect(page.getByRole('tab', { name: 'Register' })).toHaveAttribute(
        'data-state',
        'active',
      );
    });

    test('should navigate from registration page to login page', async ({ page, goto }) => {
      await goto('/auth?tab=register', { waitUntil: 'hydration' });

      await expect(page.getByRole('tab', { name: 'Register' })).toHaveAttribute(
        'data-state',
        'active',
      );

      await page.getByRole('tab', { name: 'Login' }).click();

      await expect(page).toHaveURL('/auth?tab=login');

      await expect(page.getByRole('tab', { name: 'Login' })).toHaveAttribute(
        'data-state',
        'active',
      );
    });
  });
});

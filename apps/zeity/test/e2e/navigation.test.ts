import { expect, test } from '@nuxt/test-utils/playwright';

test('should redirect to /time', async ({ page, goto }) => {
  await goto('/', { waitUntil: 'hydration' });

  // should be redirected to /time
  await expect(page).toHaveURL('/time');
});

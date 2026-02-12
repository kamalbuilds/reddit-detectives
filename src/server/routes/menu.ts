import { Hono } from 'hono';
import type { UiResponse } from '@devvit/web/shared';
import { context } from '@devvit/web/server';
import { createMysteryPost } from '../core/post';

export const menu = new Hono();

menu.post('/create-mystery', async (c) => {
  try {
    const post = await createMysteryPost();

    return c.json<UiResponse>(
      {
        navigateTo: `https://reddit.com/r/${context.subredditName}/comments/${post.id}`,
      },
      200
    );
  } catch (error) {
    console.error(`Error creating mystery post: ${error}`);
    return c.json<UiResponse>(
      {
        showToast: 'Failed to create mystery post',
      },
      400
    );
  }
});

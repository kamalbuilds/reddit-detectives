import { reddit } from '@devvit/web/server';
import { getCurrentDayNumber, getMysteryForDay } from '../../shared/mysteries';

export const createMysteryPost = async () => {
  const dayNumber = getCurrentDayNumber();
  const mystery = getMysteryForDay(dayNumber);

  return await reddit.submitCustomPost({
    title: `Karma Kriminals #${dayNumber}: ${mystery.title}`,
  });
};

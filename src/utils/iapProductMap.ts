
export type ProgramLike = {
  id: string;
  name: string;
  duration_days: number;
};

// Map the existing program durations to Apple product IDs
// 21 → 1 month, 49 → 2 months, 108 → 3 months
const DURATION_TO_PRODUCT_ID: Record<number, string> = {
  21: 'care.yogi.app.membership.monthly',
  49: 'care.yogi.app.membership.2month',
  108: 'care.yogi.app.membership.quarterly',
};

export const getAppleProductIdForProgram = (program: ProgramLike | undefined): string | undefined => {
  if (!program) return undefined;
  return DURATION_TO_PRODUCT_ID[program.duration_days];
};

export const getPlanLabelForProgram = (program: ProgramLike | undefined): string => {
  if (!program) return '';
  switch (program.duration_days) {
    case 21:
      return '1 Month';
    case 49:
      return '2 Months';
    case 108:
      return '3 Months';
    default:
      return `${program.duration_days} Days`;
  }
};

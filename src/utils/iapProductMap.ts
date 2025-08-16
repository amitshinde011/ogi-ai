
export type ProgramLike = {
  id: string;
  name: string;
  duration_days: number;
};

// Map the existing program durations to Apple product IDs
// 30 → 1 month, 60 → 2 months, 90 → 3 months
const DURATION_TO_PRODUCT_ID: Record<number, string> = {
  30: 'care.yogi.app.membership.monthly',
  60: 'care.yogi.app.membership.2month',
  90: 'care.yogi.app.membership.quarterly',
};

export const getAppleProductIdForProgram = (program: ProgramLike | undefined): string | undefined => {
  if (!program) return undefined;
  return DURATION_TO_PRODUCT_ID[program.duration_days];
};

export const getPlanLabelForProgram = (program: ProgramLike | undefined): string => {
  if (!program) return '';
  switch (program.duration_days) {
    case 30:
      return '1 Month';
    case 60:
      return '2 Months';
    case 90:
      return '3 Months';
    default:
      return `${program.duration_days} Days`;
  }
};

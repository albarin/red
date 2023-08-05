export const FluidKeys = ['dry', 'sticky', 'creamy', 'watery', 'egg white'] as const;
export type Fluid = (typeof FluidKeys)[number];
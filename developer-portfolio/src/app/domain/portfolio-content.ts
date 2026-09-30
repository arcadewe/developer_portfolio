export interface PortfolioProject {
  readonly title: string;
  readonly summary: string;
  readonly stack: readonly string[];
  readonly sprite: string;
}

export const portfolioContent = {
  name: 'YOUR NAME',
  role: 'Frontend developer',
  intro: 'I build clear, thoughtful digital experiences with a little extra personality.',
  skills: ['Angular', 'TypeScript', 'JavaScript', 'HTML & CSS', 'Git', 'Responsive UI'],
  projects: [
    { title: 'Project one', summary: 'A polished product experience with a focus on useful flows and accessible interfaces.', stack: ['Angular', 'TypeScript'], sprite: 'sprite-46-1.png' },
    { title: 'Project two', summary: 'A fast, responsive web app that turns a complex idea into a friendly workflow.', stack: ['JavaScript', 'CSS'], sprite: 'sprite-40-1.png' },
    { title: 'Project three', summary: 'A small experiment in playful interaction, visual systems, and reusable components.', stack: ['HTML', 'Web design'], sprite: 'sprite-20-1.png' },
  ] satisfies readonly PortfolioProject[],
} as const;
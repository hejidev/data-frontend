import { Reveal } from './Reveal';

export function SectionHeading({
  eyebrow,
  title,
  description,
  align = 'center',
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  align?: 'center' | 'left';
}) {
  return (
    <Reveal className={align === 'center' ? 'mx-auto max-w-2xl text-center' : 'max-w-2xl'}>
      {eyebrow && (
        <span className="inline-block rounded-full bg-teal-600/10 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-teal-700 dark:text-teal-300">
          {eyebrow}
        </span>
      )}
      <h2 className="mt-4 font-(family-name:--font-display) text-3xl font-bold tracking-tight sm:text-4xl">
        {title}
      </h2>
      {description && <p className="mt-3 text-muted-foreground">{description}</p>}
    </Reveal>
  );
}
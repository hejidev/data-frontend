'use client';

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Skeleton } from '@/components/ui/skeleton';
import type { FaqDto } from '@/lib/content-api';

export function FaqList({ items }: { items: FaqDto[] }) {
  return (
    <Accordion type="single" collapsible className="space-y-3">
      {items.map((f) => (
        <AccordionItem key={f._id} value={f._id} className="rounded-2xl border bg-card px-5 last:border-b">
          <AccordionTrigger className="text-left font-semibold hover:no-underline">{f.question}</AccordionTrigger>
          <AccordionContent className="text-muted-foreground">{f.answer}</AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
}

export function FaqSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: rows }).map((_, i) => (
        <Skeleton key={i} className="h-16 rounded-2xl" />
      ))}
    </div>
  );
}
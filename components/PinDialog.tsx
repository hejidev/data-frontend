'use client';

import { useCallback, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';

/** `const { ask, dialog } = usePinPrompt();` then `const pin = await ask();` (null if cancelled). Render {dialog}. */
export function usePinPrompt() {
  const [open, setOpen] = useState(false);
  const [pin, setPin] = useState('');
  const resolver = useRef<((v: string | null) => void) | null>(null);

  const ask = useCallback(
    () =>
      new Promise<string | null>((resolve) => {
        resolver.current = resolve;
        setPin('');
        setOpen(true);
      }),
    []
  );

  const finish = (value: string | null) => {
    setOpen(false);
    resolver.current?.(value);
    resolver.current = null;
  };

  const dialog = (
    <Dialog open={open} onOpenChange={(o) => !o && finish(null)}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Enter your transaction PIN</DialogTitle>
          <DialogDescription>Confirm this purchase with your 4–6 digit PIN.</DialogDescription>
        </DialogHeader>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (pin.length >= 4) finish(pin);
          }}
          className="space-y-4"
        >
          <Input
            autoFocus
            type="password"
            inputMode="numeric"
            autoComplete="off"
            maxLength={6}
            value={pin}
            onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))}
            className="text-center text-2xl tracking-[0.5em]"
            aria-label="Transaction PIN"
          />
          <Button type="submit" disabled={pin.length < 4} className="w-full bg-teal-600 text-white hover:bg-teal-700">
            Confirm
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );

  return { ask, dialog };
}
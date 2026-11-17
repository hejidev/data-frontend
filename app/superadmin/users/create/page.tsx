'use client';

import { FormEvent, useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
import { ApiError, api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function CreateUserPage() {
  const [form, setForm] = useState({
    full_name: '',
    email: '',
    phone: '',
    password: '',
    role: 'user',
  });

  const create = useMutation({
    mutationFn: () => api.users.create(form),
    onSuccess: () => {
      toast.success('User created');
      setForm({
        full_name: '',
        email: '',
        phone: '',
        password: '',
        role: 'user',
      });
    },
    onError: (err) =>
      toast.error(err instanceof ApiError ? err.message : 'Failed'),
  });

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    create.mutate();
  }

  return (
    <div className="mx-auto max-w-xl space-y-6">
      <div>
        <h1 className="font-[family-name:var(--font-display)] text-3xl font-bold">
          Create user
        </h1>
        <p className="text-slate-600">
          Create approved users or promote staff (admin/superadmin).
        </p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>New account</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSubmit} className="space-y-3">
            {(['full_name', 'email', 'phone', 'password'] as const).map((key) => (
              <div key={key} className="space-y-2">
                <Label className="capitalize">{key.replace('_', ' ')}</Label>
                <Input
                  type={key === 'password' ? 'password' : 'text'}
                  required={key !== 'phone'}
                  value={form[key]}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, [key]: e.target.value }))
                  }
                />
              </div>
            ))}
            <div className="space-y-2">
              <Label>Role</Label>
              <Select
                value={form.role}
                onValueChange={(role) => setForm((f) => ({ ...f, role }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="user">User</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="superadmin">Superadmin</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button
              type="submit"
              className="bg-[#0f766e] hover:bg-[#0d9488]"
              disabled={create.isPending}
            >
              Create
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import AuthGuard from "@/app/components/AuthGuard";

async function getPlans() {
  const response = await fetch('/api/plans');
  if (!response.ok) throw new Error('Failed to fetch plans');
  return response.json();
}

async function purchaseSubscription(data: any) {
  const response = await fetch('/api/subscriptions/purchase', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error('Failed to purchase subscription');
  return response.json();
}

export default function SubscriptionsPage() {
  const [selectedPlan, setSelectedPlan] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const queryClient = useQueryClient();

  const { data: plansData, isLoading } = useQuery({
    queryKey: ['plans'],
    queryFn: getPlans,
  });

  const purchaseMutation = useMutation({
    mutationFn: purchaseSubscription,
    onSuccess: (data) => {
      toast.success(data.message);
      queryClient.invalidateQueries({ queryKey: ['wallet'] });
      setSelectedPlan('');
      setPhoneNumber('');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to purchase subscription');
    },
  });

  const handlePurchase = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPlan || !phoneNumber) {
      toast.error('Please select a plan and enter phone number');
      return;
    }
    purchaseMutation.mutate({
      planId: selectedPlan,
      phoneNumber,
      paymentMethod: 'wallet',
    });
  };

  const plans = plansData?.plans || [];

  return (
    <AuthGuard role="user">
      <div className="min-h-screen bg-muted/40 p-6">
        <div className="max-w-6xl mx-auto space-y-6">
          <div>
            <h1 className="text-3xl font-bold">Subscriptions</h1>
            <p className="text-muted-foreground">Purchase data and airtime subscriptions</p>
          </div>

          {isLoading ? (
            <p>Loading plans...</p>
          ) : (
            <>
              {/* Purchase Form */}
              <Card>
                <CardHeader>
                  <CardTitle>Purchase Subscription</CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handlePurchase} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Select Plan</label>
                      <Select value={selectedPlan} onValueChange={setSelectedPlan}>
                        <SelectTrigger>
                          <SelectValue placeholder="Choose a plan" />
                        </SelectTrigger>
                        <SelectContent>
                          {plans.map((plan: any) => (
                            <SelectItem key={plan._id} value={plan._id}>
                              {plan.provider} - {plan.name} - ₦{plan.price}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">Phone Number</label>
                      <Input
                        type="tel"
                        placeholder="Enter phone number"
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value)}
                      />
                    </div>

                    <Button
                      type="submit"
                      disabled={purchaseMutation.isPending}
                      className="w-full"
                    >
                      {purchaseMutation.isPending ? 'Processing...' : 'Purchase'}
                    </Button>
                  </form>
                </CardContent>
              </Card>

              {/* Available Plans */}
              <Card>
                <CardHeader>
                  <CardTitle>Available Plans</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {plans.map((plan: any) => (
                      <div
                        key={plan._id}
                        className="border rounded-lg p-4 hover:border-blue-500 transition cursor-pointer"
                        onClick={() => setSelectedPlan(plan._id)}
                      >
                        <div className="font-bold text-lg">{plan.provider}</div>
                        <div className="text-2xl font-bold">{plan.name}</div>
                        <div className="text-muted-foreground">{plan.dataSize}</div>
                        <div className="text-sm text-muted-foreground">
                          {plan.duration} {plan.durationUnit}
                        </div>
                        <div className="text-xl font-bold mt-2">₦{plan.price}</div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </div>
      </div>
    </AuthGuard>
  );
}

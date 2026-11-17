import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function SubscriptionCard() {
  return (
    <Card className="md:col-span-2">
      <CardHeader>
        <CardTitle>Subscription</CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="flex justify-between items-center">
          <div>
            <p className="font-semibold">Starter Plan</p>
            <p className="text-muted-foreground text-sm">
              ₦5,000 / month
            </p>
          </div>
          <Badge>Active</Badge>
        </div>

        <div className="text-sm text-muted-foreground">
          Next billing date: <strong>30 June 2025</strong>
        </div>
      </CardContent>

      <CardFooter className="flex gap-3">
        <Button>Upgrade Plan</Button>
        <Button variant="outline">Cancel</Button>
      </CardFooter>
    </Card>
  );
}

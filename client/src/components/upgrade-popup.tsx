import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check, X, Sparkles, Crown, Zap } from "lucide-react";
import { useLocation } from "wouter";

interface UpgradePopupProps {
  isOpen: boolean;
  onClose: () => void;
  reason: string;
  currentLimit?: number;
  currentUsage?: number;
  feature: 'courses' | 'students';
}

export default function UpgradePopup({ 
  isOpen, 
  onClose, 
  reason, 
  currentLimit, 
  currentUsage,
  feature 
}: UpgradePopupProps) {
  const [, setLocation] = useLocation();

  const handleUpgrade = () => {
    // Navigate to pricing page or payment flow
    setLocation('/pricing');
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <div className="flex items-center justify-center mb-4">
            <div className="p-3 bg-gradient-to-br from-purple-500 to-purple-600 rounded-full">
              <Crown className="h-8 w-8 text-white" />
            </div>
          </div>
          <DialogTitle className="text-2xl text-center">Upgrade to Pro</DialogTitle>
          <DialogDescription className="text-center text-base">
            {reason}
          </DialogDescription>
        </DialogHeader>

        {currentLimit && currentUsage && (
          <div className="text-center my-4">
            <div className="inline-flex items-center gap-2 bg-yellow-50 border border-yellow-200 rounded-lg px-4 py-2">
              <Zap className="h-4 w-4 text-yellow-600" />
              <span className="text-sm">
                You've reached {currentUsage} out of {currentLimit} {feature === 'courses' ? 'courses' : 'students per course'} on Free tier
              </span>
            </div>
          </div>
        )}

        <div className="grid md:grid-cols-2 gap-4 mt-6">
          {/* Free Plan */}
          <Card className="relative border-gray-200">
            <CardContent className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-semibold">Free</h3>
                  <p className="text-2xl font-bold mt-1">$0<span className="text-sm font-normal text-gray-600">/month</span></p>
                </div>
                <Badge variant="secondary">Current Plan</Badge>
              </div>
              
              <ul className="space-y-3">
                <li className="flex items-start gap-2">
                  <Check className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <span className="text-sm">3 document uploads per month</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <span className="text-sm">Basic AI course generation</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <span className="text-sm font-semibold text-orange-600">Up to 10 learners per course</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <span className="text-sm font-semibold text-orange-600">Up to 3 published courses</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <span className="text-sm">Basic analytics</span>
                </li>
              </ul>
            </CardContent>
          </Card>

          {/* Pro Plan */}
          <Card className="relative border-purple-500 border-2 shadow-lg">
            <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
              <Badge className="bg-gradient-to-r from-purple-500 to-purple-600 text-white">
                <Sparkles className="h-3 w-3 mr-1" />
                Most Popular
              </Badge>
            </div>
            <CardContent className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-semibold">Pro</h3>
                  <p className="text-2xl font-bold mt-1">$29<span className="text-sm font-normal text-gray-600">/month</span></p>
                </div>
              </div>
              
              <ul className="space-y-3">
                <li className="flex items-start gap-2">
                  <Check className="h-4 w-4 text-purple-500 mt-0.5 flex-shrink-0" />
                  <span className="text-sm font-semibold">Unlimited document uploads</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="h-4 w-4 text-purple-500 mt-0.5 flex-shrink-0" />
                  <span className="text-sm">Advanced AI course generation</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="h-4 w-4 text-purple-500 mt-0.5 flex-shrink-0" />
                  <span className="text-sm font-semibold text-purple-600">Unlimited learners</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="h-4 w-4 text-purple-500 mt-0.5 flex-shrink-0" />
                  <span className="text-sm font-semibold text-purple-600">Unlimited courses</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="h-4 w-4 text-purple-500 mt-0.5 flex-shrink-0" />
                  <span className="text-sm">Advanced analytics & insights</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="h-4 w-4 text-purple-500 mt-0.5 flex-shrink-0" />
                  <span className="text-sm">Priority support</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="h-4 w-4 text-purple-500 mt-0.5 flex-shrink-0" />
                  <span className="text-sm">Custom branding</span>
                </li>
              </ul>

              <Button 
                onClick={handleUpgrade}
                className="w-full mt-6 bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700"
              >
                Upgrade to Pro
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            Need more? Check out our{" "}
            <button 
              onClick={() => setLocation('/pricing')}
              className="text-purple-600 hover:underline font-medium"
            >
              Enterprise plan
            </button>
            {" "}for custom solutions
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
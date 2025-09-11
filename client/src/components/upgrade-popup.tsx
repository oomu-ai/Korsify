import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check, X, Sparkles, Crown, Zap, AlertCircle } from "lucide-react";
import { useLocation } from "wouter";

interface UpgradePopupProps {
  isOpen: boolean;
  onClose: () => void;
  reason: string;
  currentLimit?: number;
  currentUsage?: number;
  feature?: 'courses' | 'students';
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
      <DialogContent className="max-w-xl p-0 overflow-hidden">
        {/* Error Message Banner */}
        <div className="bg-red-50 border-b border-red-200 px-6 py-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-red-600 mt-0.5" />
            <div>
              <h3 className="font-semibold text-red-900">Upgrade Required</h3>
              <p className="text-sm text-red-700 mt-1">{reason}</p>
              {currentLimit && currentUsage && (
                <p className="text-sm text-red-600 mt-2">
                  You've used {currentUsage} out of {currentLimit} {feature === 'courses' ? 'published courses' : 'students per course'}
                </p>
              )}
            </div>
          </div>
        </div>

        <div className="p-6">
          {/* Pro Plan Card */}
          <Card className="relative border-2 border-blue-500 shadow-xl">
            <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
              <Badge className="bg-blue-500 text-white px-4 py-1 text-sm font-semibold">
                Most Popular
              </Badge>
            </div>
            <CardContent className="p-8">
              <div className="text-center mb-6">
                <h3 className="text-2xl font-bold">Pro</h3>
                <div className="mt-4">
                  <span className="text-4xl font-bold">$29</span>
                  <span className="text-gray-600">/month</span>
                </div>
              </div>
              
              <ul className="space-y-4 mb-8">
                <li className="flex items-center gap-3">
                  <div className="flex-shrink-0 w-5 h-5 rounded-full bg-green-500 flex items-center justify-center">
                    <Check className="h-3 w-3 text-white" />
                  </div>
                  <span className="text-gray-700">Unlimited document uploads</span>
                </li>
                <li className="flex items-center gap-3">
                  <div className="flex-shrink-0 w-5 h-5 rounded-full bg-green-500 flex items-center justify-center">
                    <Check className="h-3 w-3 text-white" />
                  </div>
                  <span className="text-gray-700">Advanced AI course generation</span>
                </li>
                <li className="flex items-center gap-3">
                  <div className="flex-shrink-0 w-5 h-5 rounded-full bg-green-500 flex items-center justify-center">
                    <Check className="h-3 w-3 text-white" />
                  </div>
                  <span className="text-gray-700">Unlimited learners</span>
                </li>
                <li className="flex items-center gap-3">
                  <div className="flex-shrink-0 w-5 h-5 rounded-full bg-green-500 flex items-center justify-center">
                    <Check className="h-3 w-3 text-white" />
                  </div>
                  <span className="text-gray-700">Unlimited courses</span>
                </li>
                <li className="flex items-center gap-3">
                  <div className="flex-shrink-0 w-5 h-5 rounded-full bg-green-500 flex items-center justify-center">
                    <Check className="h-3 w-3 text-white" />
                  </div>
                  <span className="text-gray-700">Advanced analytics & insights</span>
                </li>
                <li className="flex items-center gap-3">
                  <div className="flex-shrink-0 w-5 h-5 rounded-full bg-green-500 flex items-center justify-center">
                    <Check className="h-3 w-3 text-white" />
                  </div>
                  <span className="text-gray-700">Priority support</span>
                </li>
                <li className="flex items-center gap-3">
                  <div className="flex-shrink-0 w-5 h-5 rounded-full bg-green-500 flex items-center justify-center">
                    <Check className="h-3 w-3 text-white" />
                  </div>
                  <span className="text-gray-700">Custom branding</span>
                </li>
              </ul>

              <Button 
                onClick={handleUpgrade}
                className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-3"
                size="lg"
              >
                Start Pro Trial
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="px-6 pb-6">
          <div className="text-center">
            <button 
              onClick={onClose}
              className="text-sm text-gray-600 hover:text-gray-800 underline"
            >
              Continue with Free plan limitations
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

interface UpgradeModalProps {
  open: boolean
  onClose: () => void
  currentUsage: number
  limit: number
}

export function UpgradeModal({ open, onClose, currentUsage, limit }: UpgradeModalProps) {
  const packages = [
    {
      name: 'Basic',
      price: '$29',
      widgets: '10 widgets',
      companies: '3 companies',
      popular: false
    },
    {
      name: 'Platinum',
      price: '$99',
      widgets: '50 widgets',
      companies: '10 companies',
      popular: true
    },
    {
      name: 'Pro',
      price: '$299',
      widgets: 'Unlimited widgets',
      companies: 'Unlimited companies',
      popular: false
    }
  ]

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Upgrade Your Plan</DialogTitle>
          <DialogDescription>
            You've reached your limit of {limit} widgets. Upgrade to create more!
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="rounded-lg bg-gray-50 p-4 text-sm">
            <div className="font-medium mb-1">Current Usage</div>
            <div className="text-gray-600">
              {currentUsage} / {limit} widgets used
            </div>
          </div>

          <div className="grid gap-3">
            {packages.map((pkg) => (
              <div
                key={pkg.name}
                className={`relative rounded-lg border p-4 ${
                  pkg.popular ? 'border-blue-500 bg-blue-50/50' : 'border-gray-200'
                }`}
              >
                {pkg.popular && (
                  <div className="absolute -top-2 right-4 rounded-full bg-blue-500 px-2 py-0.5 text-xs text-white">
                    Popular
                  </div>
                )}
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-semibold text-lg">{pkg.name}</div>
                    <div className="text-sm text-gray-600 mt-1">
                      {pkg.widgets} • {pkg.companies}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold">{pkg.price}</div>
                    <div className="text-xs text-gray-500">/month</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Maybe Later
          </Button>
          <Button onClick={() => {
            // TODO: Implement upgrade flow
            alert('Upgrade functionality coming soon!')
          }}>
            Contact Sales
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

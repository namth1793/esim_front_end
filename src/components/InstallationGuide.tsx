import { QrCode, FileText, Settings, Power } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

const installOptions = [
  {
    icon: QrCode,
    title: "Install by QR Code",
    description: "Scan to install instantly",
    content: (
      <div className="space-y-4">
        <div className="mx-auto flex h-48 w-48 items-center justify-center rounded-xl border-2 border-dashed border-border bg-muted">
          <p className="text-sm text-muted-foreground text-center px-4">
            QR code will appear here after purchase
          </p>
        </div>
        <div className="space-y-2 text-sm text-muted-foreground">
          <p className="font-medium text-foreground">Steps:</p>
          <ol className="list-decimal list-inside space-y-1">
            <li>Go to Settings → Cellular/Mobile Data</li>
            <li>Tap "Add eSIM" or "Add Cellular Plan"</li>
            <li>Select "Use QR Code"</li>
            <li>Scan the QR code above</li>
            <li>Confirm and activate the plan</li>
          </ol>
        </div>
      </div>
    ),
  },
  {
    icon: FileText,
    title: "Download PDF Guide",
    description: "Step-by-step instructions",
    content: (
      <div className="space-y-4">
        <p className="text-sm text-muted-foreground">
          Download a detailed installation guide for your device.
        </p>
        <div className="grid gap-3 sm:grid-cols-2">
          <button className="rounded-lg border border-border p-4 text-left transition-colors hover:bg-muted">
            <p className="font-medium text-foreground">📱 iOS Guide</p>
            <p className="text-xs text-muted-foreground">iPhone XS and later</p>
          </button>
          <button className="rounded-lg border border-border p-4 text-left transition-colors hover:bg-muted">
            <p className="font-medium text-foreground">🤖 Android Guide</p>
            <p className="text-xs text-muted-foreground">Pixel 3 and later, Samsung S20+</p>
          </button>
        </div>
        <p className="text-xs text-muted-foreground">
          PDF will be available after purchase.
        </p>
      </div>
    ),
  },
  {
    icon: Settings,
    title: "Manual Installation",
    description: "Enter details manually",
    content: (
      <div className="space-y-4">
        <div className="space-y-3">
          <div className="rounded-lg bg-muted p-3">
            <p className="text-xs font-medium text-muted-foreground mb-1">SM-DP+ Address</p>
            <p className="font-mono text-sm text-foreground">Available after purchase</p>
          </div>
          <div className="rounded-lg bg-muted p-3">
            <p className="text-xs font-medium text-muted-foreground mb-1">Activation Code</p>
            <p className="font-mono text-sm text-foreground">Available after purchase</p>
          </div>
        </div>
        <div className="space-y-2 text-sm text-muted-foreground">
          <p className="font-medium text-foreground">Manual Steps:</p>
          <ol className="list-decimal list-inside space-y-1">
            <li>Go to Settings → Cellular/Mobile Data</li>
            <li>Tap "Add eSIM" → "Enter Details Manually"</li>
            <li>Enter the SM-DP+ address and activation code</li>
            <li>Confirm and activate</li>
          </ol>
        </div>
      </div>
    ),
  },
  {
    icon: Power,
    title: "Activate Your eSIM",
    description: "Enable upon arrival",
    content: (
      <div className="space-y-4 text-sm text-muted-foreground">
        <p className="font-medium text-foreground">After arriving at your destination:</p>
        <ol className="list-decimal list-inside space-y-2">
          <li>Go to Settings → Cellular/Mobile Data</li>
          <li>Enable the eSIM data plan you installed</li>
          <li>Turn off your primary line's data roaming (to avoid charges)</li>
          <li>Set the eSIM as the default line for data</li>
          <li>Enable Data Roaming for the eSIM if prompted</li>
        </ol>
        <div className="rounded-lg border border-border bg-muted/50 p-3">
          <p className="font-medium text-foreground mb-1">💡 Tip</p>
          <p>Install the eSIM before you travel, then simply activate it when you land. This ensures seamless connectivity.</p>
        </div>
      </div>
    ),
  },
];

const InstallationGuide = () => {
  return (
    <div>
      <h3 className="mb-4 font-display text-lg font-semibold text-foreground">
        eSIM Installation Guide
      </h3>
      <div className="grid gap-3 sm:grid-cols-2">
        {installOptions.map((option) => (
          <Dialog key={option.title}>
            <DialogTrigger asChild>
              <button className="flex items-start gap-3 rounded-xl border border-border bg-card p-4 text-left transition-all hover:shadow-card hover:border-primary/30">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                  <option.icon className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="font-medium text-card-foreground text-sm">{option.title}</p>
                  <p className="text-xs text-muted-foreground">{option.description}</p>
                </div>
              </button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle className="font-display flex items-center gap-2">
                  <option.icon className="h-5 w-5 text-primary" />
                  {option.title}
                </DialogTitle>
              </DialogHeader>
              {option.content}
            </DialogContent>
          </Dialog>
        ))}
      </div>
    </div>
  );
};

export default InstallationGuide;

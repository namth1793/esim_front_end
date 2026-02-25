import { Android, Apple } from "lucide-react";
import { useState } from "react";

interface InstallationGuideProps {
  iccid: string;
  qrCode: string;
}

const InstallationGuide = ({ iccid, qrCode }: InstallationGuideProps) => {
  const [device, setDevice] = useState<'ios' | 'android'>('ios');

  return (
    <div className="space-y-6">
      {/* Device selector */}
      <div className="flex gap-2 p-1 bg-secondary/30 rounded-lg">
        <button
          onClick={() => setDevice('ios')}
          className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-md transition-colors ${
            device === 'ios' ? 'bg-primary text-primary-foreground' : 'hover:bg-secondary'
          }`}
        >
          <Apple className="h-4 w-4" />
          iOS
        </button>
        <button
          onClick={() => setDevice('android')}
          className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-md transition-colors ${
            device === 'android' ? 'bg-primary text-primary-foreground' : 'hover:bg-secondary'
          }`}
        >
          <Android className="h-4 w-4" />
          Android
        </button>
      </div>

      {/* QR Code */}
      <div className="flex justify-center">
        <div className="p-4 bg-white rounded-xl">
          <img src={qrCode} alt="eSIM QR" className="w-40 h-40" />
        </div>
      </div>

      {/* Instructions */}
      {device === 'ios' ? (
        <div className="space-y-4">
          <h3 className="font-medium">📱 Install on iOS</h3>
          <ol className="space-y-3 text-sm text-muted-foreground">
            <li className="flex gap-2">
              <span className="font-bold text-primary">1.</span>
              <span>Go to <strong>Settings</strong> → <strong>Cellular</strong> → <strong>Add Cellular Plan</strong></span>
            </li>
            <li className="flex gap-2">
              <span className="font-bold text-primary">2.</span>
              <span>Scan the QR code above or enter details manually</span>
            </li>
            <li className="flex gap-2">
              <span className="font-bold text-primary">3.</span>
              <span>Label your plan (e.g., "Travel eSIM") and tap <strong>Continue</strong></span>
            </li>
            <li className="flex gap-2">
              <span className="font-bold text-primary">4.</span>
              <span>Wait for activation (usually 1-2 minutes)</span>
            </li>
          </ol>
        </div>
      ) : (
        <div className="space-y-4">
          <h3 className="font-medium">🤖 Install on Android</h3>
          <ol className="space-y-3 text-sm text-muted-foreground">
            <li className="flex gap-2">
              <span className="font-bold text-primary">1.</span>
              <span>Go to <strong>Settings</strong> → <strong>Network & Internet</strong> → <strong>Mobile Network</strong></span>
            </li>
            <li className="flex gap-2">
              <span className="font-bold text-primary">2.</span>
              <span>Tap <strong>Add eSIM</strong> or <strong>Download eSIM</strong></span>
            </li>
            <li className="flex gap-2">
              <span className="font-bold text-primary">3.</span>
              <span>Scan QR code or enter activation code</span>
            </li>
            <li className="flex gap-2">
              <span className="font-bold text-primary">4.</span>
              <span>Follow prompts to complete installation</span>
            </li>
          </ol>
        </div>
      )}

      {/* ICCID */}
      <div className="mt-6 p-4 bg-secondary/20 rounded-lg">
        <p className="text-xs text-muted-foreground mb-1">ICCID (for support)</p>
        <p className="font-mono text-sm">{iccid}</p>
      </div>
    </div>
  );
};

export default InstallationGuide;
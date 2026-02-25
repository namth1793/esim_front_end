import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Check, Copy, Download } from "lucide-react";
import { useState } from "react";

interface EsimQrModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  iccid: string;
  qrCode: string;
  activationLink: string;
}

const EsimQrModal = ({ open, onOpenChange, iccid, qrCode, activationLink }: EsimQrModalProps) => {
  const [copied, setCopied] = useState(false);

  const copyToClipboard = async (text: string) => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadQR = () => {
    const link = document.createElement('a');
    link.href = qrCode;
    link.download = `esim-${iccid}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center">Your eSIM is Ready! 🎉</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* QR Code */}
          <div className="flex justify-center">
            <div className="p-4 bg-white rounded-xl">
              <img 
                src={qrCode} 
                alt="eSIM QR Code" 
                className="w-48 h-48 object-contain"
              />
            </div>
          </div>

          {/* ICCID */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-muted-foreground">ICCID</label>
            <div className="flex items-center gap-2 p-3 bg-secondary/30 rounded-lg">
              <code className="flex-1 text-sm font-mono">{iccid}</code>
              <button
                onClick={() => copyToClipboard(iccid)}
                className="p-2 hover:bg-secondary rounded-md transition-colors"
              >
                {copied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
              </button>
            </div>
          </div>

          {/* Activation Link */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-muted-foreground">Activation Link</label>
            <div className="flex items-center gap-2">
              <a 
                href={activationLink} 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex-1 text-sm text-primary hover:underline truncate"
              >
                {activationLink}
              </a>
              <Button
                variant="outline"
                size="sm"
                onClick={() => copyToClipboard(activationLink)}
              >
                Copy
              </Button>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <Button onClick={downloadQR} variant="outline" className="flex-1">
              <Download className="mr-2 h-4 w-4" />
              Download QR
            </Button>
            <Button 
              onClick={() => window.open(activationLink, '_blank')} 
              className="flex-1 bg-gradient-cta"
            >
              Activate Now
            </Button>
          </div>

          <p className="text-xs text-center text-muted-foreground">
            Scan QR code or click activation link to install eSIM on your device
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default EsimQrModal;
import React, { useState, useRef, useCallback, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Camera, Loader2, ShieldCheck, ShieldAlert, RefreshCw } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface SelfieVerificationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onVerified: () => void;
  onDenied: () => void;
}

type VerifyState = "camera" | "capturing" | "verifying" | "verified" | "denied" | "error";

const SelfieVerificationDialog: React.FC<SelfieVerificationDialogProps> = ({
  open,
  onOpenChange,
  onVerified,
  onDenied,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [state, setState] = useState<VerifyState>("camera");
  const [cameraReady, setCameraReady] = useState(false);

  const startCamera = useCallback(async () => {
    try {
      setCameraReady(false);
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user", width: 480, height: 480 },
        audio: false,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.onloadedmetadata = () => {
          videoRef.current?.play();
          setCameraReady(true);
        };
      }
    } catch (err) {
      console.error("Camera error:", err);
      toast.error("Camera access denied. Please allow camera permissions.");
      setState("error");
    }
  }, []);

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    setCameraReady(false);
  }, []);

  useEffect(() => {
    if (open) {
      setState("camera");
      // Small delay to let dialog render
      const timer = setTimeout(() => startCamera(), 300);
      return () => clearTimeout(timer);
    } else {
      stopCamera();
    }
  }, [open, startCamera, stopCamera]);

  const captureAndVerify = async () => {
    if (!videoRef.current || !canvasRef.current) return;

    setState("capturing");
    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.drawImage(video, 0, 0);

    // Convert to base64 JPEG
    const dataUrl = canvas.toDataURL("image/jpeg", 0.8);
    const base64 = dataUrl.split(",")[1];

    stopCamera();
    setState("verifying");

    try {
      const { data, error } = await supabase.functions.invoke("verify-gender", {
        body: { image_base64: base64 },
      });

      if (error) throw error;

      if (data.verified) {
        setState("verified");
        setTimeout(() => onVerified(), 1200);
      } else {
        setState("denied");
        const reason =
          !data.is_real_face
            ? "No clear face detected. Please take a proper selfie."
            : data.detected_gender === "male"
            ? "This group is for women only. Gender verification failed."
            : "Verification inconclusive. Please try again with better lighting.";
        toast.error(reason);
      }
    } catch (err) {
      console.error("Verification error:", err);
      setState("error");
      toast.error("Verification failed. Please try again.");
    }
  };

  const retry = () => {
    setState("camera");
    startCamera();
  };

  const handleClose = (v: boolean) => {
    if (!v) {
      stopCamera();
      if (state === "denied") onDenied();
    }
    onOpenChange(v);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-sm rounded-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-sm">
            <Camera className="w-4 h-4 text-primary" />
            Selfie Verification
          </DialogTitle>
          <DialogDescription className="text-xs">
            Women-only groups require a live selfie for gender verification. No gallery uploads allowed.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Camera / Preview */}
          <div className="relative w-full aspect-square rounded-2xl overflow-hidden bg-muted flex items-center justify-center">
            {(state === "camera" || state === "capturing") && (
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover mirror"
                style={{ transform: "scaleX(-1)" }}
              />
            )}
            {state === "camera" && !cameraReady && (
              <div className="absolute inset-0 flex items-center justify-center bg-muted">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
              </div>
            )}
            {state === "verifying" && (
              <div className="flex flex-col items-center gap-3">
                <Loader2 className="w-10 h-10 animate-spin text-primary" />
                <p className="text-sm font-medium">Verifying...</p>
              </div>
            )}
            {state === "verified" && (
              <div className="flex flex-col items-center gap-3 text-green-600">
                <ShieldCheck className="w-12 h-12" />
                <p className="text-sm font-semibold">Verified ✓</p>
              </div>
            )}
            {state === "denied" && (
              <div className="flex flex-col items-center gap-3 text-destructive">
                <ShieldAlert className="w-12 h-12" />
                <p className="text-sm font-semibold">Verification Failed</p>
              </div>
            )}
            {state === "error" && (
              <div className="flex flex-col items-center gap-3 text-muted-foreground">
                <ShieldAlert className="w-10 h-10" />
                <p className="text-sm">Something went wrong</p>
              </div>
            )}
          </div>

          <canvas ref={canvasRef} className="hidden" />

          {/* Actions */}
          {state === "camera" && (
            <Button
              className="w-full bg-gradient-primary text-white rounded-xl h-11"
              onClick={captureAndVerify}
              disabled={!cameraReady}
            >
              <Camera className="w-4 h-4 mr-2" />
              Capture Selfie
            </Button>
          )}
          {(state === "denied" || state === "error") && (
            <div className="flex gap-2">
              <Button
                variant="outline"
                className="flex-1 rounded-xl h-10"
                onClick={() => handleClose(false)}
              >
                Cancel
              </Button>
              <Button
                className="flex-1 bg-gradient-primary text-white rounded-xl h-10"
                onClick={retry}
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Retry
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SelfieVerificationDialog;

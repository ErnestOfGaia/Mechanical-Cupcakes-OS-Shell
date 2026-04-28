"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { motion } from "framer-motion";
import { ArrowLeft, Heart, Upload, Send, ImageIcon, Pen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import PostcardFlip from "@/components/postcard-flip";

export default function ComposeView() {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);
  const [message, setMessage] = useState("");
  const [imagePreview, setImagePreview] = useState("");
  const [cloudStoragePath, setCloudStoragePath] = useState("");
  const [uploading, setUploading] = useState(false);
  const [sending, setSending] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e?.target?.files?.[0];
    if (!file) return;

    if ((file?.size ?? 0) > 10 * 1024 * 1024) {
      toast.error("Image must be under 10MB");
      return;
    }

    // Show local preview
    const reader = new FileReader();
    reader.onload = (ev: ProgressEvent<FileReader>) => {
      setImagePreview(ev?.target?.result as string ?? "");
    };
    reader.readAsDataURL(file);

    // Upload to server
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const uploadRes = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });
      const uploadData = await uploadRes?.json?.();
      if (!uploadRes?.ok || !uploadData?.cloud_storage_path) {
        throw new Error(uploadData?.error ?? "Upload failed");
      }

      setCloudStoragePath(uploadData.cloud_storage_path ?? "");
      toast.success("Image uploaded!");
    } catch (err: any) {
      console.error(err);
      toast.error("Failed to upload image");
      setImagePreview("");
    } finally {
      setUploading(false);
    }
  };

  const handleSend = async () => {
    if (!message?.trim?.()) {
      toast.error("Write a message first!");
      return;
    }
    setSending(true);
    try {
      const res = await fetch("/api/postcards", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: message?.trim?.() ?? "",
          cloudStoragePath: cloudStoragePath || "",
          isPublic: true,
          imageUrl: cloudStoragePath ? `/api/files/${cloudStoragePath}` : "",
        }),
      });
      const data = await res?.json?.();
      if (data?.success) {
        toast.success("Postcard sent! 💌");
        router.push("/mailbox");
      } else {
        toast.error(data?.error ?? "Failed to send");
      }
    } catch (err: any) {
      console.error(err);
      toast.error("Failed to send postcard");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 to-rose-50">
      <header className="sticky top-0 z-50 bg-white/70 backdrop-blur-md border-b border-rose-100">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={() => router.push("/mailbox")}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <Heart className="w-5 h-5 text-rose-500" fill="currentColor" />
          <span className="font-display font-bold text-rose-700">New Postcard</span>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-6">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          {/* Preview toggle */}
          {showPreview && (imagePreview || message) ? (
            <div className="mb-6">
              <PostcardFlip
                imageUrl={imagePreview}
                message={message}
                senderName="you"
                date={new Date().toISOString()}
              />
              <div className="text-center mt-3">
                <Button variant="ghost" size="sm" onClick={() => setShowPreview(false)}>
                  Back to editing
                </Button>
              </div>
            </div>
          ) : (
            <>
              {/* Image Upload */}
              <div className="bg-white/70 rounded-xl p-6 shadow-sm border border-rose-100 mb-6">
                <h2 className="text-lg font-display font-semibold mb-3 flex items-center gap-2">
                  <ImageIcon className="w-5 h-5 text-rose-500" />
                  Postcard Image
                </h2>
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleImageUpload}
                />
                {imagePreview ? (
                  <div className="relative aspect-video rounded-lg overflow-hidden bg-amber-100">
                    <Image
                      src={imagePreview}
                      alt="Postcard preview"
                      fill
                      className="object-cover"
                      unoptimized
                    />
                    <button
                      onClick={() => fileRef?.current?.click?.()}
                      className="absolute bottom-2 right-2 bg-white/80 text-sm px-3 py-1 rounded-full hover:bg-white transition-colors"
                    >
                      Change
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => fileRef?.current?.click?.()}
                    disabled={uploading}
                    className="w-full aspect-video rounded-lg border-2 border-dashed border-rose-200 bg-rose-50/50 hover:bg-rose-50 transition-colors flex flex-col items-center justify-center gap-3"
                  >
                    {uploading ? (
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-rose-500" />
                    ) : (
                      <>
                        <Upload className="w-10 h-10 text-rose-300" />
                        <span className="text-sm text-muted-foreground">Click to upload an image</span>
                        <span className="text-xs text-muted-foreground">JPG, PNG, GIF up to 10MB</span>
                      </>
                    )}
                  </button>
                )}
              </div>

              {/* Message */}
              <div className="bg-white/70 rounded-xl p-6 shadow-sm border border-rose-100 mb-6">
                <h2 className="text-lg font-display font-semibold mb-3 flex items-center gap-2">
                  <Pen className="w-5 h-5 text-rose-500" />
                  Your Message
                </h2>
                <Textarea
                  value={message}
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setMessage(e?.target?.value ?? "")}
                  placeholder="Write something sweet..."
                  className="min-h-[150px] resize-none font-serif text-base bg-amber-50/50 border-amber-200 focus:border-rose-300"
                  maxLength={2000}
                />
                <p className="text-xs text-muted-foreground mt-2 text-right">
                  {message?.length ?? 0}/2000
                </p>
              </div>
            </>
          )}

          {/* Actions */}
          <div className="flex gap-3 justify-center">
            {!showPreview && (imagePreview || message) && (
              <Button
                variant="outline"
                onClick={() => setShowPreview(true)}
                className="border-rose-200"
              >
                Preview
              </Button>
            )}
            <Button
              onClick={handleSend}
              disabled={sending || !message?.trim?.()}
              loading={sending}
              className="bg-rose-500 hover:bg-rose-600 text-white px-8"
            >
              <Send className="w-4 h-4 mr-2" />
              {sending ? "Sending..." : "Send Postcard"}
            </Button>
          </div>
        </motion.div>
      </main>
    </div>
  );
}

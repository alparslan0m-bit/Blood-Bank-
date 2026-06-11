import { useState } from "react";
import { Image as ImageIcon, FileText } from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { getCheckImageUrl } from "@/features/checks/api/checks-api";
import type { CheckImage } from "@/types/database";

interface CheckImageGalleryProps {
  images: CheckImage[];
}

export function CheckImageGallery({ images }: CheckImageGalleryProps) {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  return (
    <>
      <div className="rounded-md bg-canvas shadow-level-2 p-lg border border-hairline">
        <h3 className="text-body-md font-semibold text-ink mb-lg border-b border-hairline pb-sm flex items-center gap-sm">
          <ImageIcon className="h-5 w-5 text-mute" />
          Check Verification Images
        </h3>

        {images.length > 0 ? (
          <div className="grid grid-cols-2 gap-sm">
            {images.map((img) => {
              const url = getCheckImageUrl(img.file_path);
              return (
                <button
                  key={img.id}
                  onClick={() => setSelectedImage(url)}
                  className="group relative h-24 rounded-sm border border-hairline bg-canvas-soft overflow-hidden hover:border-hairline-strong transition-colors text-left"
                >
                  <img
                    src={url}
                    alt={img.type}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <ImageIcon className="h-5 w-5 text-white" />
                  </div>
                  <div className="absolute bottom-1 left-1 bg-black/60 px-xxs py-0.5 rounded-[2px] text-[8px] text-white uppercase font-mono">
                    {img.type}
                  </div>
                </button>
              );
            })}
          </div>
        ) : (
          <div className="py-lg text-center text-caption text-mute bg-canvas-soft rounded-sm border border-dashed border-hairline flex flex-col items-center justify-center">
            <FileText className="h-8 w-8 text-mute/50 mb-2" />
            No scan/form images uploaded
          </div>
        )}
      </div>

      {selectedImage && (
        <Dialog
          open={!!selectedImage}
          onOpenChange={(open) => !open && setSelectedImage(null)}
        >
          <DialogContent className="max-w-3xl p-0 overflow-hidden bg-transparent border-none shadow-none">
            <img
              src={selectedImage}
              alt="Verification scan detail"
              className="w-full h-auto object-contain max-h-[85vh] rounded-md"
            />
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}

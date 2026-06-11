import { useState } from "react";
import { Image as ImageIcon, FileText } from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { getCheckImageUrl } from "@/features/checks/api/checks-api";
import { formatDateTime } from "@/lib/utils";
import { cn } from "@/lib/utils";
import type { CheckImage } from "@/types/database";

interface CheckImageGalleryProps {
  images: CheckImage[];
  embedded?: boolean;
}

export function CheckImageGallery({
  images,
  embedded = false,
}: CheckImageGalleryProps) {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const gallery = (
    <>
      {images.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-md">
          {images.map((img) => {
            const url = getCheckImageUrl(img.file_path);
            return (
              <button
                key={img.id}
                type="button"
                onClick={() => setSelectedImage(url)}
                className="group flex flex-col rounded-sm border border-hairline bg-canvas-soft overflow-hidden hover:border-hairline-strong transition-colors text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-link focus-visible:ring-offset-2"
              >
                <div className="relative aspect-[4/3] overflow-hidden">
                  <img
                    src={url}
                    alt={img.type}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <ImageIcon className="h-6 w-6 text-white" />
                  </div>
                </div>
                <div className="p-sm space-y-xxs border-t border-hairline bg-canvas">
                  <span className="text-caption font-mono uppercase tracking-wider text-ink">
                    {img.type}
                  </span>
                  <span className="block text-[10px] font-mono text-mute">
                    {formatDateTime(img.uploaded_at)}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      ) : (
        <div className="py-xl text-center text-caption text-mute bg-canvas-soft rounded-sm border border-dashed border-hairline flex flex-col items-center justify-center">
          <FileText className="h-8 w-8 text-mute/50 mb-2" />
          No scan/form images uploaded
        </div>
      )}

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

  if (embedded) {
    return gallery;
  }

  return (
    <div
      className={cn(
        "rounded-md bg-canvas shadow-level-2 p-lg border border-hairline",
      )}
    >
      <h3 className="text-body-md font-semibold text-ink mb-lg border-b border-hairline pb-sm flex items-center gap-sm">
        <ImageIcon className="h-5 w-5 text-mute" />
        Check Verification Images
      </h3>
      {gallery}
    </div>
  );
}

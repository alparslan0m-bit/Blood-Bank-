import { Link } from "react-router-dom";
import { Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { DonorWithBloodType } from "@/types/database";

interface CheckDonorCardProps {
  donor: DonorWithBloodType | null | undefined;
  donorId: string;
}

export function CheckDonorCard({ donor, donorId }: CheckDonorCardProps) {
  return (
    <div className="rounded-md bg-canvas shadow-level-2 p-lg border border-hairline">
      <div className="flex items-center justify-between mb-lg border-b border-hairline pb-sm">
        <h3 className="text-body-md font-semibold text-ink flex items-center gap-sm">
          <Heart className="h-5 w-5 text-mute" />
          Donor Profile
        </h3>
        <Link to={`/donors/${donorId}`}>
          <Button variant="ghost" size="sm" className="text-caption">
            View File
          </Button>
        </Link>
      </div>
      {donor ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-md">
          <div className="space-y-xs">
            <span className="text-[10px] font-mono text-mute uppercase">
              Full Name
            </span>
            <p className="text-body-sm font-medium text-ink">{donor.full_name}</p>
          </div>
          <div className="space-y-xs">
            <span className="text-[10px] font-mono text-mute uppercase">
              National Identification
            </span>
            <p className="text-body-sm font-medium text-ink">
              {donor.national_id}
            </p>
          </div>
          <div className="space-y-xs">
            <span className="text-[10px] font-mono text-mute uppercase">
              Contact Phone
            </span>
            <p className="text-body-sm font-medium text-ink">{donor.phone}</p>
          </div>
          <div className="space-y-xs">
            <span className="text-[10px] font-mono text-mute uppercase">
              Age & Gender
            </span>
            <p className="text-body-sm font-medium text-ink">
              {donor.age} years · {donor.gender}
            </p>
          </div>
          <div className="space-y-xs md:col-span-2">
            <span className="text-[10px] font-mono text-mute uppercase">
              Registered Address
            </span>
            <p className="text-body-sm text-body">{donor.address}</p>
          </div>
        </div>
      ) : (
        <span className="text-caption text-mute">
          No donor information assigned.
        </span>
      )}
    </div>
  );
}

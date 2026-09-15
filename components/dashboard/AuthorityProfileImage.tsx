"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

type AuthorityProfileImageProps = {
  userId: string;
  currentImageUrl: string | null;
  initials: string;
};

export default function AuthorityProfileImage({
  userId,
  currentImageUrl,
  initials,
}: AuthorityProfileImageProps) {
  const router = useRouter();
  const supabase = createClient();

  const fileInputRef = useRef<HTMLInputElement>(null);

  const [imageUrl, setImageUrl] = useState(
    currentImageUrl
  );

  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  async function handleImageChange(
    event: React.ChangeEvent<HTMLInputElement>
  ) {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    setError("");

    if (!file.type.startsWith("image/")) {
      setError("Please select an image file.");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError("Image size must be less than 5 MB.");
      return;
    }

    setUploading(true);

    try {
      const extension =
        file.name.split(".").pop()?.toLowerCase() ||
        "jpg";

      const filePath = `${userId}/avatar-${Date.now()}.${extension}`;

      const { error: uploadError } =
        await supabase.storage
          .from("profile-images")
          .upload(filePath, file, {
            cacheControl: "3600",
            upsert: false,
            contentType: file.type,
          });

      if (uploadError) {
        throw new Error(uploadError.message);
      }

      const {
        data: { publicUrl },
      } = supabase.storage
        .from("profile-images")
        .getPublicUrl(filePath);

      const { error: profileError } =
        await supabase
          .from("profiles")
          .update({
            avatar_url: publicUrl,
            avatar_path: filePath,
            updated_at: new Date().toISOString(),
          })
          .eq("id", userId);

      if (profileError) {
        await supabase.storage
          .from("profile-images")
          .remove([filePath]);

        throw new Error(profileError.message);
      }

      setImageUrl(publicUrl);

      router.refresh();
    } catch (uploadError) {
      console.error(
        "Profile image upload error:",
        uploadError
      );

      setError(
        uploadError instanceof Error
          ? uploadError.message
          : "Unable to upload profile image."
      );
    } finally {
      setUploading(false);

      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  }

  return (
    <div className="profile-image-wrapper">
      <div className="profile-avatar">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt="Profile"
            className="profile-avatar-image"
          />
        ) : (
          initials
        )}
      </div>

      <button
        type="button"
        className="profile-camera-button"
        onClick={() => fileInputRef.current?.click()}
        disabled={uploading}
        aria-label="Change profile photo"
      >
        {uploading ? "..." : "📷"}
      </button>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleImageChange}
        hidden
      />

      <button
        type="button"
        className="profile-change-photo-button"
        onClick={() => fileInputRef.current?.click()}
        disabled={uploading}
      >
        {uploading
          ? "Uploading..."
          : "Change Photo"}
      </button>

      {error && (
        <p className="profile-image-error">
          {error}
        </p>
      )}
    </div>
  );
}
import { useTranslations } from "next-intl";
import { updateUserProfile } from "../utils/api";
import { useAuth } from "@/contexts/authcontext";
import { useState } from "react";

export default function EditProfile({ open, onClose }) {
  const { user, token } = useAuth();
  const t = useTranslations("EditProfile");
  const [uploading, setUploading] = useState(false);
  const [bio, setBio] = useState(user.bio || "");
  const [avatar, setAvatar] = useState(user.avatar || "");
  const handleAvatar = async (e) => {
    const image = e.target.files[0];

    const formData = new FormData();
    formData.append("file", image);

    setUploading(true);

    const res = await fetch("/api/upload_pp", {
      method: "POST",
      body: formData,
    });

    const data = await res.json();
    setAvatar(data.url);
    setUploading(false);
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!bio && !avatar) {
      return;
    }

    try {
      await updateUserProfile(bio, avatar, token);
      // refresh page
      window.location.reload();
    } catch (error) {
      console.error("Failed to update profile:", error);
      // Handle error (e.g., show an error message)
    }
  };
  return (
    <div
      id="slide-up-animated-modal"
      className={
        open
          ? "fixed inset-0 z-[9999] flex items-center justify-center"
          : "hidden"
      }
      style={{ background: "rgba(0,0,0,0.5)" }}
      role="dialog"
      tabIndex="-1"
    >
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg mx-4 relative animate-fade-in">
        <div className="modal-content p-6">
          <div className="modal-header flex items-center justify-between mb-4">
            <h3 className="modal-title text-xl font-bold">{t("title")}</h3>
            <button
              type="button"
              className="btn btn-text btn-circle btn-sm"
              aria-label="Close"
              onClick={onClose}
            >
              <span className="icon-[tabler--x] size-4"></span>
            </button>
          </div>
          <div className="modal-body">
            <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
              <div className="form-control">
                <label className="label">
                  <span className="label-text">{t("profilePicture")}</span>
                </label>
                <div className="p-4">
                  {avatar && (
                    <div className="mt-4 flex justify-center">
                      <img
                        src={avatar}
                        alt="uploaded"
                        className="w-32 h-32 rounded-full object-cover border"
                      />
                    </div>
                  )}
                  {uploading && (
                    <div className="loading loading-spinner loading-lg mx-auto"></div>
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    className="input mt-2"
                    onChange={handleAvatar}
                  />
                </div>
              </div>
              <div className="form-control">
                <label className="label">
                  <span className="label-text">{t("username")}</span>
                </label>
                <input
                  type="text"
                  className="input input-bordered"
                  name="username"
                  disabled={true}
                  defaultValue={user.username}
                />
              </div>
              <div className="form-control">
                <label className="label">
                  <span className="label-text">{t("bio")}</span>
                </label>
                <textarea
                  className="textarea textarea-bordered"
                  placeholder={t("bioPlaceholder")}
                  name="bio"
                  onChange={(e) => setBio(e.target.value)}
                  value={bio}
                ></textarea>
              </div>
              <div className="modal-footer flex justify-end gap-2 mt-6">
                <button
                  type="button"
                  className="btn btn-soft btn-secondary"
                  onClick={onClose}
                >
                  {t("cancel")}
                </button>
                <button
                  className="btn btn-primary"
                  onClick={handleSubmit}
                  disabled={uploading}
                >
                  {t("saveChanges")}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

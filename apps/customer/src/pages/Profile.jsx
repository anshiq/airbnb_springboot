import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { authApi } from "../api/auth";
import { api } from "../api/client";

const TABS = ["profile", "security", "become-host"];

export default function Profile() {
  const { user, updateUser } = useAuth();
  const [activeTab, setActiveTab] = useState("profile");

  // Profile form
  const [profileForm, setProfileForm] = useState({
    firstName: user?.firstName || "",
    lastName: user?.lastName || "",
    phone: user?.phone || "",
    bio: user?.bio || "",
    profilePhotoUrl: user?.profilePhotoUrl || "",
  });
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileSuccess, setProfileSuccess] = useState("");
  const [profileError, setProfileError] = useState("");

  // Password form
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState("");
  const [passwordError, setPasswordError] = useState("");

  // Become host form
  const [hostForm, setHostForm] = useState({
    governmentIdUrl: "",
    bio: user?.bio || "",
    reason: "",
  });
  const [hostSaving, setHostSaving] = useState(false);
  const [hostSuccess, setHostSuccess] = useState("");
  const [hostError, setHostError] = useState("");

  async function handleProfileSave(e) {
    e.preventDefault();
    setProfileError("");
    setProfileSuccess("");
    setProfileSaving(true);
    try {
      await updateUser({
        firstName: profileForm.firstName,
        lastName: profileForm.lastName,
        phone: profileForm.phone || undefined,
        bio: profileForm.bio || undefined,
        profilePhotoUrl: profileForm.profilePhotoUrl || undefined,
      });
      setProfileSuccess("Profile updated successfully.");
    } catch (err) {
      setProfileError(err.message || "Failed to update profile.");
    } finally {
      setProfileSaving(false);
    }
  }

  async function handlePasswordSave(e) {
    e.preventDefault();
    setPasswordError("");
    setPasswordSuccess("");
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordError("New passwords do not match.");
      return;
    }
    if (passwordForm.newPassword.length < 8) {
      setPasswordError("New password must be at least 8 characters.");
      return;
    }
    setPasswordSaving(true);
    try {
      await authApi.changePassword(
        passwordForm.currentPassword,
        passwordForm.newPassword,
      );
      setPasswordSuccess("Password changed successfully.");
      setPasswordForm({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (err) {
      setPasswordError(err.message || "Failed to change password.");
    } finally {
      setPasswordSaving(false);
    }
  }

  async function handleHostApplication(e) {
    e.preventDefault();
    setHostError("");
    setHostSuccess("");
    setHostSaving(true);
    try {
      await api.post("/admin/host-applications", {
        governmentIdUrl: hostForm.governmentIdUrl,
        bio: hostForm.bio,
        reason: hostForm.reason,
      });
      setHostSuccess(
        "Your host application has been submitted! We'll review it within 2-3 business days.",
      );
    } catch (err) {
      setHostError(err.message || "Failed to submit application.");
    } finally {
      setHostSaving(false);
    }
  }

  const tabLabels = {
    profile: "Profile",
    security: "Security",
    "become-host": "Become a Host",
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="flex items-center gap-4 mb-8">
        <div className="w-16 h-16 rounded-full bg-rose-500 flex items-center justify-center text-white font-bold text-2xl">
          {user?.firstName?.[0]?.toUpperCase() || "U"}
        </div>
        <div>
          <h1 className="text-xl font-bold text-gray-900">
            {user?.firstName} {user?.lastName}
          </h1>
          <p className="text-sm text-gray-500">{user?.email}</p>
          {user?.role && (
            <span className="text-xs bg-rose-50 text-rose-600 px-2 py-0.5 rounded-full font-medium mt-1 inline-block capitalize">
              {user.role.toLowerCase()}
            </span>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200 mb-6 overflow-x-auto">
        {TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2.5 text-sm font-medium whitespace-nowrap transition-colors ${
              activeTab === tab
                ? "border-b-2 border-rose-500 text-rose-600"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            {tabLabels[tab]}
          </button>
        ))}
      </div>

      {activeTab === "profile" && (
        <form onSubmit={handleProfileSave} className="space-y-5">
          {profileSuccess && (
            <div className="p-3 bg-green-50 border border-green-200 rounded-lg text-sm text-green-700">
              {profileSuccess}
            </div>
          )}
          {profileError && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
              {profileError}
            </div>
          )}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                First Name
              </label>
              <input
                type="text"
                value={profileForm.firstName}
                onChange={(e) =>
                  setProfileForm((f) => ({ ...f, firstName: e.target.value }))
                }
                required
                className="input-field"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Last Name
              </label>
              <input
                type="text"
                value={profileForm.lastName}
                onChange={(e) =>
                  setProfileForm((f) => ({ ...f, lastName: e.target.value }))
                }
                required
                className="input-field"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Phone
            </label>
            <input
              type="tel"
              value={profileForm.phone}
              onChange={(e) =>
                setProfileForm((f) => ({ ...f, phone: e.target.value }))
              }
              placeholder="+91 9876543210"
              className="input-field"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Bio
            </label>
            <textarea
              value={profileForm.bio}
              onChange={(e) =>
                setProfileForm((f) => ({ ...f, bio: e.target.value }))
              }
              rows={3}
              placeholder="Tell others a little about yourself…"
              className="input-field resize-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Profile Photo URL
            </label>
            <input
              type="url"
              value={profileForm.profilePhotoUrl}
              onChange={(e) =>
                setProfileForm((f) => ({
                  ...f,
                  profilePhotoUrl: e.target.value,
                }))
              }
              placeholder="https://…"
              className="input-field"
            />
            {profileForm.profilePhotoUrl && (
              <img
                src={profileForm.profilePhotoUrl}
                alt="Preview"
                className="mt-2 w-16 h-16 rounded-full object-cover"
                onError={(e) => {
                  e.target.style.display = "none";
                }}
              />
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              type="email"
              value={user?.email || ""}
              disabled
              className="input-field bg-gray-50 text-gray-500 cursor-not-allowed"
            />
            <p className="text-xs text-gray-400 mt-1">
              Email cannot be changed.
            </p>
          </div>
          <button
            type="submit"
            disabled={profileSaving}
            className="btn-primary py-2.5 px-6"
          >
            {profileSaving ? "Saving…" : "Save changes"}
          </button>
        </form>
      )}

      {activeTab === "security" && (
        <form onSubmit={handlePasswordSave} className="space-y-5">
          {passwordSuccess && (
            <div className="p-3 bg-green-50 border border-green-200 rounded-lg text-sm text-green-700">
              {passwordSuccess}
            </div>
          )}
          {passwordError && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
              {passwordError}
            </div>
          )}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Current Password
            </label>
            <input
              type="password"
              value={passwordForm.currentPassword}
              onChange={(e) =>
                setPasswordForm((f) => ({
                  ...f,
                  currentPassword: e.target.value,
                }))
              }
              required
              placeholder="••••••••"
              className="input-field"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              New Password
            </label>
            <input
              type="password"
              value={passwordForm.newPassword}
              onChange={(e) =>
                setPasswordForm((f) => ({ ...f, newPassword: e.target.value }))
              }
              required
              placeholder="Min. 8 characters"
              className="input-field"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Confirm New Password
            </label>
            <input
              type="password"
              value={passwordForm.confirmPassword}
              onChange={(e) =>
                setPasswordForm((f) => ({
                  ...f,
                  confirmPassword: e.target.value,
                }))
              }
              required
              placeholder="Repeat new password"
              className="input-field"
            />
          </div>
          <button
            type="submit"
            disabled={passwordSaving}
            className="btn-primary py-2.5 px-6"
          >
            {passwordSaving ? "Updating…" : "Update password"}
          </button>
        </form>
      )}

      {activeTab === "become-host" && (
        <div>
          {user?.role === "HOST" || user?.role === "ADMIN" ? (
            <div className="text-center py-12">
              <div className="text-5xl mb-4">🏠</div>
              <h2 className="text-lg font-bold text-gray-900 mb-2">
                You're already a host!
              </h2>
              <p className="text-gray-500 text-sm">
                You can manage your properties through the host dashboard.
              </p>
            </div>
          ) : hostSuccess ? (
            <div className="text-center py-12">
              <div className="text-5xl mb-4">🎉</div>
              <h2 className="text-lg font-bold text-gray-900 mb-2">
                Application submitted!
              </h2>
              <p className="text-gray-500 text-sm">{hostSuccess}</p>
            </div>
          ) : (
            <form onSubmit={handleHostApplication} className="space-y-5">
              <div className="p-4 bg-rose-50 rounded-xl mb-2">
                <h2 className="font-semibold text-gray-900 mb-1">
                  Become a StayFinder host
                </h2>
                <p className="text-sm text-gray-600">
                  Start earning by listing your property. Submit your
                  application and we'll get back to you within 2–3 business
                  days.
                </p>
              </div>
              {hostError && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
                  {hostError}
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Government ID URL
                  <span className="text-rose-500 ml-1">*</span>
                </label>
                <input
                  type="url"
                  value={hostForm.governmentIdUrl}
                  onChange={(e) =>
                    setHostForm((f) => ({
                      ...f,
                      governmentIdUrl: e.target.value,
                    }))
                  }
                  required
                  placeholder="Link to your uploaded ID document"
                  className="input-field"
                />
                <p className="text-xs text-gray-400 mt-1">
                  Upload your ID to a secure service and paste the URL here.
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Your bio
                </label>
                <textarea
                  value={hostForm.bio}
                  onChange={(e) =>
                    setHostForm((f) => ({ ...f, bio: e.target.value }))
                  }
                  rows={3}
                  placeholder="Tell guests about yourself…"
                  className="input-field resize-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Why do you want to be a host?
                  <span className="text-rose-500 ml-1">*</span>
                </label>
                <textarea
                  value={hostForm.reason}
                  onChange={(e) =>
                    setHostForm((f) => ({ ...f, reason: e.target.value }))
                  }
                  rows={4}
                  required
                  placeholder="Tell us about your property and why you want to host…"
                  className="input-field resize-none"
                />
              </div>
              <button
                type="submit"
                disabled={hostSaving}
                className="btn-primary py-2.5 px-6"
              >
                {hostSaving ? "Submitting…" : "Submit application"}
              </button>
            </form>
          )}
        </div>
      )}
    </div>
  );
}

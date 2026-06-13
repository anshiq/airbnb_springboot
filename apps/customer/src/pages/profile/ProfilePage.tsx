import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { usersApi } from "@/api/users";
import { authApi } from "@/api/auth";
import { useAuth } from "@/store/authStore";
import Spinner from "@/components/common/Spinner";
import { getInitials, formatDate } from "@/utils/format";

export default function ProfilePage() {
  const { user, updateUser } = useAuth();
  const [profileSuccess, setProfileSuccess] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState("");
  const [profileError, setProfileError] = useState("");
  const [passwordError, setPasswordError] = useState("");

  const { data: profile, isLoading } = useQuery({
    queryKey: ["profile"],
    queryFn: usersApi.getMe,
  });

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [bio, setBio] = useState("");

  const [curPwd, setCurPwd] = useState("");
  const [newPwd, setNewPwd] = useState("");
  const [confPwd, setConfPwd] = useState("");

  // Pre-fill once loaded
  const onProfileLoad = (p: typeof profile) => {
    if (!p) return;
    setFirstName((f) => f || p.firstName);
    setLastName((l) => l || p.lastName);
    setPhone((ph) => (ph || p.phone) ?? "");
    setBio((b) => (b || p.bio) ?? "");
  };
  if (profile && !firstName) onProfileLoad(profile);

  const profileMutation = useMutation({
    mutationFn: () =>
      usersApi.updateProfile({
        firstName,
        lastName,
        phone: phone || undefined,
        bio: bio || undefined,
      }),
    onSuccess: (data) => {
      setProfileSuccess("Profile updated!");
      updateUser({ firstName: data.firstName, lastName: data.lastName });
      setTimeout(() => setProfileSuccess(""), 3000);
    },
    onError: (e) =>
      setProfileError(e instanceof Error ? e.message : "Update failed"),
  });

  const passwordMutation = useMutation({
    mutationFn: () =>
      authApi.changePassword({ currentPassword: curPwd, newPassword: newPwd }),
    onSuccess: () => {
      setPasswordSuccess("Password changed!");
      setCurPwd("");
      setNewPwd("");
      setConfPwd("");
      setTimeout(() => setPasswordSuccess(""), 3000);
    },
    onError: (e) =>
      setPasswordError(e instanceof Error ? e.message : "Change failed"),
  });

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError("");
    if (newPwd !== confPwd) {
      setPasswordError("Passwords do not match");
      return;
    }
    if (newPwd.length < 8) {
      setPasswordError("Min 8 characters");
      return;
    }
    passwordMutation.mutate();
  };

  if (isLoading)
    return (
      <div className="flex justify-center py-32">
        <Spinner size="lg" className="text-brand-500" />
      </div>
    );

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Profile</h1>

      {/* Avatar + account info */}
      <div className="flex items-center gap-4 mb-8 p-5 bg-white border border-gray-200 rounded-2xl">
        <div className="w-16 h-16 rounded-full bg-brand-500 text-white flex items-center justify-center text-xl font-bold flex-shrink-0">
          {user ? getInitials(user.firstName, user.lastName) : "?"}
        </div>
        <div>
          <p className="font-semibold text-gray-900">
            {profile?.firstName} {profile?.lastName}
          </p>
          <p className="text-sm text-gray-500">{profile?.email}</p>
          <div className="flex items-center gap-2 mt-1">
            <span
              className={`text-xs px-2 py-0.5 rounded-full font-medium ${profile?.emailVerified ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"}`}
            >
              {profile?.emailVerified ? "✓ Verified" : "⚠ Unverified"}
            </span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 font-medium">
              {profile?.role}
            </span>
          </div>
          {profile?.createdAt && (
            <p className="text-xs text-gray-400 mt-1">
              Member since {formatDate(profile.createdAt)}
            </p>
          )}
        </div>
      </div>

      {/* Edit profile */}
      <div className="bg-white border border-gray-200 rounded-2xl p-6 mb-5">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Personal information
        </h2>
        {profileSuccess && (
          <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-xl text-sm text-green-700">
            {profileSuccess}
          </div>
        )}
        {profileError && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">
            {profileError}
          </div>
        )}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            setProfileError("");
            profileMutation.mutate();
          }}
          className="space-y-4"
        >
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                First name
              </label>
              <input
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className="input-base"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Last name
              </label>
              <input
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className="input-base"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Phone
            </label>
            <input
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              type="tel"
              className="input-base"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Bio
            </label>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              rows={3}
              className="input-base resize-none"
              placeholder="Tell hosts a bit about yourself"
            />
          </div>
          <button
            type="submit"
            disabled={profileMutation.isPending}
            className="btn-primary"
          >
            {profileMutation.isPending ? "Saving…" : "Save changes"}
          </button>
        </form>
      </div>

      {/* Change password */}
      <div className="bg-white border border-gray-200 rounded-2xl p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Change password
        </h2>
        {passwordSuccess && (
          <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-xl text-sm text-green-700">
            {passwordSuccess}
          </div>
        )}
        {passwordError && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">
            {passwordError}
          </div>
        )}
        <form onSubmit={handlePasswordSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Current password
            </label>
            <input
              type="password"
              value={curPwd}
              onChange={(e) => setCurPwd(e.target.value)}
              className="input-base"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              New password
            </label>
            <input
              type="password"
              value={newPwd}
              onChange={(e) => setNewPwd(e.target.value)}
              className="input-base"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Confirm new password
            </label>
            <input
              type="password"
              value={confPwd}
              onChange={(e) => setConfPwd(e.target.value)}
              className="input-base"
              required
            />
          </div>
          <button
            type="submit"
            disabled={passwordMutation.isPending}
            className="btn-primary"
          >
            {passwordMutation.isPending ? "Updating…" : "Update password"}
          </button>
        </form>
      </div>
    </div>
  );
}

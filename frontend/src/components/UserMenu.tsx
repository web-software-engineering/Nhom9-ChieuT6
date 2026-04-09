import { useEffect, useRef, useState } from "react";
import { jwtDecode } from "jwt-decode";
import { ChevronDown, LogOut, PencilLine, User } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

type AuthPayload = {
  email?: string;
  name?: string;
  username?: string;
  role?: string;
};

type AuthProfile = {
  authenticated: boolean;
  displayName: string;
  email: string;
};

type UserMenuProps = {
  loginHref?: string;
  variant?: "store" | "admin";
};

const DISPLAY_NAME_KEY = "authDisplayName";
const PROFILE_UPDATED_EVENT = "auth-profile-updated";
const AUTH_PROFILE_KEY = "authUserProfile";

function formatNameFromEmail(email: string) {
  const raw = email.split("@")[0] || "";
  const readable = raw.replace(/[._-]+/g, " ").trim();

  if (!readable) {
    return "Người dùng";
  }

  return readable
    .split(/\s+/)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function readAuthProfile(): AuthProfile {
  const token = localStorage.getItem("accessToken");

  if (!token) {
    return {
      authenticated: false,
      displayName: "",
      email: "",
    };
  }

  let payload: AuthPayload = {};
  let localProfile: Partial<{
    name: string;
    email: string;
    role: string;
    username: string;
  }> = {};

  try {
    payload = jwtDecode<AuthPayload>(token);
  } catch {
    payload = {};
  }

  try {
    localProfile = JSON.parse(localStorage.getItem(AUTH_PROFILE_KEY) || "{}");
  } catch {
    localProfile = {};
  }

  const storedName = localStorage.getItem(DISPLAY_NAME_KEY)?.trim() || "";
  const email = localProfile.email || payload.email || "";
  const fallbackName =
    localProfile.name ||
    payload.name ||
    localProfile.username ||
    payload.username ||
    formatNameFromEmail(email);
  const displayName = storedName || fallbackName;

  return {
    authenticated: true,
    displayName,
    email,
  };
}

export default function UserMenu({
  loginHref = "/login",
  variant = "store",
}: UserMenuProps) {
  const navigate = useNavigate();
  const menuRef = useRef<HTMLDivElement | null>(null);
  const [profile, setProfile] = useState<AuthProfile>(() => readAuthProfile());
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const syncProfile = () => {
      setProfile(readAuthProfile());
    };

    const handleOutsideClick = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setMenuOpen(false);
      }
    };

    window.addEventListener(PROFILE_UPDATED_EVENT, syncProfile);
    window.addEventListener("storage", syncProfile);
    document.addEventListener("mousedown", handleOutsideClick);
    document.addEventListener("keydown", handleEscape);

    return () => {
      window.removeEventListener(PROFILE_UPDATED_EVENT, syncProfile);
      window.removeEventListener("storage", syncProfile);
      document.removeEventListener("mousedown", handleOutsideClick);
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  const refreshProfile = () => {
    window.dispatchEvent(new Event(PROFILE_UPDATED_EVENT));
  };

  const handleLogout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem(DISPLAY_NAME_KEY);
    localStorage.removeItem(AUTH_PROFILE_KEY);
    refreshProfile();
    setMenuOpen(false);
    navigate(loginHref, { replace: true });
  };

  const buttonClasses =
    variant === "admin"
      ? "border border-slate-200 bg-slate-50 text-slate-700 hover:bg-white"
      : "border border-slate-200 bg-white text-slate-700 hover:bg-slate-50";

  if (!profile.authenticated) {
    return (
      <Link to={loginHref} className={`pill-tab ${buttonClasses}`}>
        <User className="h-4 w-4" />
        <span>Đăng nhập</span>
      </Link>
    );
  }

  return (
    <div ref={menuRef} className="relative">
      <button
        type="button"
        onClick={() => setMenuOpen((value) => !value)}
        className={`pill-tab max-w-[220px] ${buttonClasses}`}
      >
        <span className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-slate-900 text-xs font-bold text-white">
          {profile.displayName.charAt(0).toUpperCase()}
        </span>
        <span className="hidden max-w-[110px] truncate sm:inline">
          {profile.displayName}
        </span>
        <ChevronDown className="h-4 w-4" />
      </button>

      {menuOpen && (
        <div className="absolute right-0 top-full z-50 mt-3 w-72 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl shadow-slate-900/10">
          <div className="border-b border-slate-100 px-4 py-4">
            <div className="flex items-center gap-3">
              <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-900 text-sm font-bold text-white">
                {profile.displayName.charAt(0).toUpperCase()}
              </span>
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-slate-900">
                  {profile.displayName}
                </p>
                <p className="truncate text-xs text-slate-500">
                  {profile.email}
                </p>
              </div>
            </div>
            {variant === "admin" && (
              <div className="mt-3">
                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                  Khu quản trị
                </span>
              </div>
            )}
          </div>

          <div className="p-2">
            <button
              type="button"
              onClick={() => {
                setMenuOpen(false);
                navigate("/profile");
              }}
              className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              <PencilLine className="h-4 w-4 text-teal-700" />
              Sửa hồ sơ
            </button>
            <button
              type="button"
              onClick={handleLogout}
              className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-sm font-semibold text-red-600 transition hover:bg-red-50"
            >
              <LogOut className="h-4 w-4" />
              Đăng xuất
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

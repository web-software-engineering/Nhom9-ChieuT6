import { useEffect, useMemo, useState } from "react";

const API_URL = (
  import.meta.env.VITE_API_URL || "http://localhost:5000"
).replace(/\/+$/, "");

export default function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const facebookLoginUrl = useMemo(() => `${API_URL}/auth/facebook`, []);

  const fetchCurrentUser = async () => {
    setLoading(true);
    setError("");

    try {
      const res = await fetch(`${API_URL}/api/user`, {
        credentials: "include",
      });

      if (res.status === 401) {
        setUser(null);
        return;
      }

      if (!res.ok) {
        throw new Error(`Failed to fetch user: ${res.status}`);
      }

      const data = await res.json();
      setUser(data.user || null);
    } catch (err) {
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCurrentUser();
  }, []);

  const handleLogout = async () => {
    setError("");
    try {
      const res = await fetch(`${API_URL}/auth/logout`, {
        method: "POST",
        credentials: "include",
      });

      if (!res.ok) {
        throw new Error(`Logout failed: ${res.status}`);
      }

      setUser(null);
    } catch (err) {
      setError(err.message || "Logout failed");
    }
  };

  return (
    <main className="page">
      <section className="card">
        <h1>Facebook Login Demo (MERN)</h1>
        <p className="subtitle">
          React frontend + Express/Passport backend + MongoDB session/user
          store.
        </p>

        {loading && <p className="info">Checking session...</p>}

        {!loading && !user && (
          <a className="btn btn-facebook" href={facebookLoginUrl}>
            Login with Facebook
          </a>
        )}

        {!loading && user && (
          <div className="userBox">
            {user.avatar ? (
              <img src={user.avatar} alt="avatar" className="avatar" />
            ) : (
              <div className="avatar placeholder">
                {user.displayName?.[0] || "U"}
              </div>
            )}

            <div>
              <p>
                <strong>Name:</strong> {user.displayName}
              </p>
              <p>
                <strong>Email:</strong>{" "}
                {user.email || "No email returned by Facebook"}
              </p>
              <p>
                <strong>ID:</strong> {user.id}
              </p>
            </div>

            <button className="btn btn-logout" onClick={handleLogout}>
              Logout
            </button>
          </div>
        )}

        {error && <p className="error">{error}</p>}

        <button className="btn btn-refresh" onClick={fetchCurrentUser}>
          Refresh Current User (/api/user)
        </button>
      </section>
    </main>
  );
}

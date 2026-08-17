import { useEffect, useState } from "react";

import {
  createUser,
  deleteUser,
  getUsers,
  updateUser,
  type User,
} from "../../lib/slvslsApi";


function formatDate(value: string) {
  if (!value) return "";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleDateString("en-IN");
}


function Users() {
  /* ==========================================================
     DATA
  ========================================================== */

  const [users, setUsers] = useState<User[]>([]);

  /* ==========================================================
     UI
  ========================================================== */

  const [showForm, setShowForm] = useState(false);
  const [editingUser, setEditingUser] =
    useState<User | null>(null);

  const [viewingUser, setViewingUser] =
    useState<User | null>(null);

  /* ==========================================================
     FORM
  ========================================================== */

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("USER");
  const [userStatus, setUserStatus] =
    useState("ACTIVE");

  /* ==========================================================
     STATUS
  ========================================================== */

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  /* ==========================================================
     LOAD
  ========================================================== */

  async function loadUsers() {
    try {
      setLoading(true);
      setError("");

      const rows = await getUsers();

      setUsers(rows);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to load users.",
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadUsers();
  }, []);

  /* ==========================================================
     FORM HELPERS
  ========================================================== */

  function resetForm() {
    setUsername("");
    setPassword("");
    setRole("USER");
    setUserStatus("ACTIVE");
    setEditingUser(null);
  }


  function openAddForm() {
    setError("");
    setSuccess("");
    setViewingUser(null);

    resetForm();
    setShowForm(true);
  }


  function openEditForm(user: User) {
    setError("");
    setSuccess("");
    setViewingUser(null);

    setEditingUser(user);
    setUsername(user.username);
    setPassword("");
    setRole(user.role);
    setUserStatus(user.status);

    setShowForm(true);
  }


  function closeForm() {
    setShowForm(false);
    setEditingUser(null);
    resetForm();
  }

  /* ==========================================================
     SAVE
  ========================================================== */

  async function handleSave(
    event: React.FormEvent,
  ) {
    event.preventDefault();

    if (!username.trim()) {
      setError("Please enter a username.");
      return;
    }

    if (!editingUser && !password) {
      setError("Please enter a password.");
      return;
    }

    if (password && password.length < 6) {
      setError(
        "Password must be at least 6 characters.",
      );
      return;
    }

    try {
      setSaving(true);
      setError("");
      setSuccess("");

      if (editingUser) {
        await updateUser(
          editingUser.user_id,
          {
            username: username.trim(),
            ...(password
              ? { password }
              : {}),
            role,
            status: userStatus,
          },
        );

        setSuccess(
          "User updated successfully.",
        );
      } else {
        await createUser({
          username: username.trim(),
          password,
          role,
          status: userStatus,
        });

        setSuccess(
          "User created successfully.",
        );
      }

      closeForm();
      await loadUsers();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to save user.",
      );
    } finally {
      setSaving(false);
    }
  }

  /* ==========================================================
     DELETE
  ========================================================== */

  async function handleDelete(user: User) {
    const confirmed = window.confirm(
      `Delete user "${user.username}"?\n\n` +
        `Role: ${user.role}\n` +
        `Status: ${user.status}`,
    );

    if (!confirmed) {
      return;
    }

    try {
      setError("");
      setSuccess("");

      await deleteUser(user.user_id);

      setSuccess(
        "User deleted successfully.",
      );

      if (
        viewingUser?.user_id === user.user_id
      ) {
        setViewingUser(null);
      }

      await loadUsers();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to delete user.",
      );
    }
  }

  /* ==========================================================
     STYLES
  ========================================================== */

  const primaryButton =
    "rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-blue-700 transition";

  const secondaryButton =
    "rounded-lg border border-slate-300 bg-white px-5 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 transition";

  const actionButton =
    "rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 transition";

  /* ==========================================================
     UI
  ========================================================== */

  return (
    <div className="p-6 space-y-6">

      {/* =====================================================
          HEADER
      ===================================================== */}

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            User Management
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            Manage system users, roles and account status.
          </p>
        </div>

        {!showForm && (
          <button
            type="button"
            onClick={openAddForm}
            className={primaryButton}
          >
            + Add User
          </button>
        )}

      </div>


      {/* =====================================================
          MESSAGES
      ===================================================== */}

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {success && (
        <div className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
          {success}
        </div>
      )}


      {/* =====================================================
          CREATE / EDIT FORM
      ===================================================== */}

      {showForm && (
        <form
          onSubmit={handleSave}
          className="rounded-xl border border-slate-200 bg-white p-6 space-y-6"
        >

          <div className="flex items-center justify-between gap-4">

            <h2 className="text-lg font-semibold text-slate-900">
              {editingUser
                ? "Edit User"
                : "Create New User"}
            </h2>

            <button
              type="button"
              onClick={closeForm}
              className="text-sm font-medium text-slate-500 hover:text-slate-900"
            >
              Cancel
            </button>

          </div>


          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">

            {/* Username */}

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Username
              </label>

              <input
                type="text"
                value={username}
                onChange={(event) =>
                  setUsername(event.target.value)
                }
                maxLength={50}
                autoComplete="username"
                className="w-full rounded-lg border border-slate-300 px-3 py-2.5 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                placeholder="Enter username"
              />
            </div>


            {/* Password */}

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Password
                {editingUser && (
                  <span className="ml-2 text-xs font-normal text-slate-400">
                    Leave blank to keep current password
                  </span>
                )}
              </label>

              <input
                type="password"
                value={password}
                onChange={(event) =>
                  setPassword(event.target.value)
                }
                minLength={6}
                maxLength={100}
                autoComplete={
                  editingUser
                    ? "new-password"
                    : "new-password"
                }
                className="w-full rounded-lg border border-slate-300 px-3 py-2.5 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                placeholder={
                  editingUser
                    ? "New password"
                    : "Enter password"
                }
              />
            </div>


            {/* Role */}

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Role
              </label>

              <select
                value={role}
                onChange={(event) =>
                  setRole(event.target.value)
                }
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              >
                <option value="USER">
                  USER
                </option>

                <option value="ADMIN">
                  ADMIN
                </option>
              </select>
            </div>


            {/* Status */}

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Status
              </label>

              <select
                value={userStatus}
                onChange={(event) =>
                  setUserStatus(event.target.value)
                }
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              >
                <option value="ACTIVE">
                  ACTIVE
                </option>

                <option value="INACTIVE">
                  INACTIVE
                </option>
              </select>
            </div>

          </div>


          <div className="flex justify-end gap-3">

            <button
              type="button"
              onClick={closeForm}
              className={secondaryButton}
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={saving}
              className={`${primaryButton} disabled:cursor-not-allowed disabled:opacity-60`}
            >
              {saving
                ? "Saving..."
                : editingUser
                  ? "Update User"
                  : "Create User"}
            </button>

          </div>

        </form>
      )}


      {/* =====================================================
          VIEW USER
      ===================================================== */}

      {viewingUser && !showForm && (
        <div className="rounded-xl border border-slate-200 bg-white p-6">

          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

            <div>
              <h2 className="text-lg font-semibold text-slate-900">
                User Details
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                User #{viewingUser.user_id}
              </p>
            </div>

            <button
              type="button"
              onClick={() =>
                setViewingUser(null)
              }
              className={secondaryButton}
            >
              Close
            </button>

          </div>


          <div className="mt-6 grid grid-cols-1 gap-5 md:grid-cols-2">

            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                Username
              </p>

              <p className="mt-1 font-medium text-slate-900">
                {viewingUser.username}
              </p>
            </div>


            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                Role
              </p>

              <p className="mt-1 font-medium text-slate-900">
                {viewingUser.role}
              </p>
            </div>


            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                Status
              </p>

              <p
                className={`mt-1 font-medium ${
                  viewingUser.status === "ACTIVE"
                    ? "text-green-600"
                    : "text-red-600"
                }`}
              >
                {viewingUser.status}
              </p>
            </div>


            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                Created
              </p>

              <p className="mt-1 font-medium text-slate-900">
                {formatDate(
                  viewingUser.created_at,
                )}
              </p>
            </div>


            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                Last Updated
              </p>

              <p className="mt-1 font-medium text-slate-900">
                {formatDate(
                  viewingUser.updated_at,
                )}
              </p>
            </div>

          </div>


          <div className="mt-6 flex justify-end gap-3">

            <button
              type="button"
              onClick={() =>
                openEditForm(viewingUser)
              }
              className={primaryButton}
            >
              Edit User
            </button>

          </div>

        </div>
      )}


      {/* =====================================================
          USERS TABLE
      ===================================================== */}

      {!showForm && !viewingUser && (
        <div className="rounded-xl border border-slate-200 bg-white overflow-hidden">

          <div className="border-b border-slate-200 px-6 py-4">

            <h2 className="font-semibold text-slate-900">
              Users
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              {users.length} user
              {users.length === 1
                ? ""
                : "s"}
            </p>

          </div>


          {loading ? (
            <div className="px-6 py-10 text-center text-sm text-slate-500">
              Loading users...
            </div>
          ) : users.length === 0 ? (
            <div className="px-6 py-10 text-center text-sm text-slate-500">
              No users found.
            </div>
          ) : (
            <div className="overflow-x-auto">

              <table className="min-w-full">

                <thead className="bg-slate-50">

                  <tr>

                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Username
                    </th>

                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Role
                    </th>

                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Status
                    </th>

                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Created
                    </th>

                    <th className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Actions
                    </th>

                  </tr>

                </thead>


                <tbody className="divide-y divide-slate-200">

                  {users.map((user) => (
                    <tr
                      key={user.user_id}
                      className="hover:bg-slate-50"
                    >

                      <td className="px-6 py-4">

                        <div className="font-medium text-slate-900">
                          {user.username}
                        </div>

                        <div className="mt-1 text-xs text-slate-400">
                          ID #{user.user_id}
                        </div>

                      </td>


                      <td className="px-6 py-4 text-sm text-slate-700">
                        {user.role}
                      </td>


                      <td className="px-6 py-4">

                        <span
                          className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${
                            user.status === "ACTIVE"
                              ? "bg-green-100 text-green-700"
                              : "bg-red-100 text-red-700"
                          }`}
                        >
                          {user.status}
                        </span>

                      </td>


                      <td className="px-6 py-4 text-sm text-slate-600">
                        {formatDate(
                          user.created_at,
                        )}
                      </td>


                      <td className="px-6 py-4">

                        <div className="flex justify-end gap-2">

                          <button
                            type="button"
                            onClick={() =>
                              setViewingUser(user)
                            }
                            className={actionButton}
                          >
                            View
                          </button>

                          <button
                            type="button"
                            onClick={() =>
                              openEditForm(user)
                            }
                            className={actionButton}
                          >
                            Edit
                          </button>

                          <button
                            type="button"
                            onClick={() =>
                              handleDelete(user)
                            }
                            className="rounded-lg border border-red-200 px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 transition"
                          >
                            Delete
                          </button>

                        </div>

                      </td>

                    </tr>
                  ))}

                </tbody>

              </table>

            </div>
          )}

        </div>
      )}

    </div>
  );
}


export default Users;

import { useEffect, useMemo, useState } from "react";

import {
  createLorry,
  deleteLorry,
  getLorries,
  updateLorry,
  type Lorry,
} from "../../lib/slvslsApi";


function Lorries() {
  /* ==========================================================
     DATA
  ========================================================== */

  const [lorries, setLorries] =
    useState<Lorry[]>([]);


  /* ==========================================================
     UI
  ========================================================== */

  const [showForm, setShowForm] =
    useState(false);

  const [editingLorry, setEditingLorry] =
    useState<Lorry | null>(null);

  const [viewingLorry, setViewingLorry] =
    useState<Lorry | null>(null);

  const [search, setSearch] =
    useState("");


  /* ==========================================================
     FORM
  ========================================================== */

  const [
    registrationNumber,
    setRegistrationNumber,
  ] = useState("");

  const [nickname, setNickname] =
    useState("");

  const [ownerName, setOwnerName] =
    useState("");


  /* ==========================================================
     STATUS
  ========================================================== */

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  const [error, setError] =
    useState("");

  const [success, setSuccess] =
    useState("");


  /* ==========================================================
     LOAD
  ========================================================== */

  async function loadLorries() {
    try {
      setLoading(true);
      setError("");

      const rows = await getLorries();

      setLorries(rows);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to load lorries.",
      );
    } finally {
      setLoading(false);
    }
  }


  useEffect(() => {
    loadLorries();
  }, []);


  /* ==========================================================
     FORM HELPERS
  ========================================================== */

  function resetForm() {
    setRegistrationNumber("");
    setNickname("");
    setOwnerName("");
    setEditingLorry(null);
  }


  function openAddForm() {
    setError("");
    setSuccess("");
    setViewingLorry(null);

    resetForm();
    setShowForm(true);
  }


  function openEditForm(lorry: Lorry) {
    setError("");
    setSuccess("");
    setViewingLorry(null);

    setEditingLorry(lorry);

    setRegistrationNumber(
      lorry.registration_number,
    );

    setNickname(
      lorry.nickname ?? "",
    );

    setOwnerName(
      lorry.owner_name,
    );

    setShowForm(true);
  }


  function closeForm() {
    setShowForm(false);
    setEditingLorry(null);
    resetForm();
  }


  /* ==========================================================
     SAVE
  ========================================================== */

  async function handleSave(
    event: React.FormEvent,
  ) {
    event.preventDefault();

    const registration =
      registrationNumber.trim();

    const owner =
      ownerName.trim();

    const nicknameValue =
      nickname.trim();


    if (!registration) {
      setError(
        "Please enter a registration number.",
      );
      return;
    }


    if (!owner) {
      setError(
        "Please enter the owner name.",
      );
      return;
    }


    try {
      setSaving(true);
      setError("");
      setSuccess("");


      if (editingLorry) {
        await updateLorry(
          editingLorry.lorry_id,
          {
            registration_number:
              registration,
            nickname:
              nicknameValue || null,
            owner_name: owner,
          },
        );

        setSuccess(
          "Lorry updated successfully.",
        );
      } else {
        await createLorry({
          registration_number:
            registration,
          nickname:
            nicknameValue || null,
          owner_name: owner,
        });

        setSuccess(
          "Lorry created successfully.",
        );
      }


      closeForm();

      await loadLorries();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to save lorry.",
      );
    } finally {
      setSaving(false);
    }
  }


  /* ==========================================================
     DELETE
  ========================================================== */

  async function handleDelete(
    lorry: Lorry,
  ) {
    const confirmed =
      window.confirm(
        `Delete lorry "${lorry.registration_number}"?\n\n` +
          `Owner: ${lorry.owner_name}` +
          `${
            lorry.nickname
              ? `\nNickname: ${lorry.nickname}`
              : ""
          }`,
      );


    if (!confirmed) {
      return;
    }


    try {
      setError("");
      setSuccess("");

      await deleteLorry(
        lorry.lorry_id,
      );

      setSuccess(
        "Lorry deleted successfully.",
      );


      if (
        viewingLorry?.lorry_id ===
        lorry.lorry_id
      ) {
        setViewingLorry(null);
      }


      await loadLorries();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to delete lorry.",
      );
    }
  }


  /* ==========================================================
     SEARCH
  ========================================================== */

  const filteredLorries =
    useMemo(() => {
      const keyword =
        search.trim().toLowerCase();

      if (!keyword) {
        return lorries;
      }

      return lorries.filter(
        (lorry) =>
          lorry.registration_number
            .toLowerCase()
            .includes(keyword) ||
          (lorry.nickname ?? "")
            .toLowerCase()
            .includes(keyword) ||
          lorry.owner_name
            .toLowerCase()
            .includes(keyword),
      );
    }, [lorries, search]);


  /* ==========================================================
     STYLES
  ========================================================== */

  const primaryButton =
    "rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-blue-700 transition";

  const secondaryButton =
    "rounded-lg border border-slate-300 bg-white px-5 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 transition";

  const actionButton =
    "rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 transition";

  const inputClass =
    "w-full rounded-lg border border-slate-300 px-3 py-2.5 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100";


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
            Lorry Management
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            Manage lorries, registration details and owners.
          </p>
        </div>


        {!showForm && (
          <button
            type="button"
            onClick={openAddForm}
            className={primaryButton}
          >
            + Add Lorry
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
              {editingLorry
                ? "Edit Lorry"
                : "Add New Lorry"}
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

            {/* Registration Number */}

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Registration Number
                <span className="ml-1 text-red-500">
                  *
                </span>
              </label>

              <input
                type="text"
                value={registrationNumber}
                onChange={(event) =>
                  setRegistrationNumber(
                    event.target.value,
                  )
                }
                maxLength={20}
                className={inputClass}
                placeholder="Enter registration number"
              />
            </div>


            {/* Nickname */}

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Nickname
              </label>

              <input
                type="text"
                value={nickname}
                onChange={(event) =>
                  setNickname(
                    event.target.value,
                  )
                }
                maxLength={50}
                className={inputClass}
                placeholder="Optional nickname"
              />
            </div>


            {/* Owner Name */}

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Owner Name
                <span className="ml-1 text-red-500">
                  *
                </span>
              </label>

              <input
                type="text"
                value={ownerName}
                onChange={(event) =>
                  setOwnerName(
                    event.target.value,
                  )
                }
                maxLength={100}
                className={inputClass}
                placeholder="Enter owner name"
              />
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
                : editingLorry
                  ? "Update Lorry"
                  : "Add Lorry"}
            </button>

          </div>

        </form>
      )}


      {/* =====================================================
          VIEW LORRY
      ===================================================== */}

      {viewingLorry &&
        !showForm && (
          <div className="rounded-xl border border-slate-200 bg-white p-6">

            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

              <div>
                <h2 className="text-lg font-semibold text-slate-900">
                  Lorry Details
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Lorry #{viewingLorry.lorry_id}
                </p>
              </div>


              <button
                type="button"
                onClick={() =>
                  setViewingLorry(null)
                }
                className={secondaryButton}
              >
                Close
              </button>

            </div>


            <div className="mt-6 grid grid-cols-1 gap-5 md:grid-cols-2">

              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                  Registration Number
                </p>

                <p className="mt-1 font-medium text-slate-900">
                  {
                    viewingLorry.registration_number
                  }
                </p>
              </div>


              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                  Nickname
                </p>

                <p className="mt-1 font-medium text-slate-900">
                  {
                    viewingLorry.nickname ||
                    "—"
                  }
                </p>
              </div>


              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                  Owner Name
                </p>

                <p className="mt-1 font-medium text-slate-900">
                  {viewingLorry.owner_name}
                </p>
              </div>


              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                  Lorry ID
                </p>

                <p className="mt-1 font-medium text-slate-900">
                  {viewingLorry.lorry_id}
                </p>
              </div>

            </div>


            <div className="mt-6 flex justify-end gap-3">

              <button
                type="button"
                onClick={() =>
                  openEditForm(
                    viewingLorry,
                  )
                }
                className={primaryButton}
              >
                Edit Lorry
              </button>

            </div>

          </div>
        )}


      {/* =====================================================
          LORRY LIST
      ===================================================== */}

      {!showForm &&
        !viewingLorry && (
          <div className="rounded-xl border border-slate-200 bg-white overflow-hidden">

            <div className="border-b border-slate-200 px-6 py-4">

              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">

                <div>
                  <h2 className="font-semibold text-slate-900">
                    Lorries
                  </h2>

                  <p className="mt-1 text-sm text-slate-500">
                    {filteredLorries.length} of{" "}
                    {lorries.length} lorry
                    {lorries.length === 1
                      ? ""
                      : "ies"}
                  </p>
                </div>


                {/* Search */}

                <div className="w-full md:w-80">

                  <label className="sr-only">
                    Search lorries
                  </label>

                  <input
                    type="search"
                    value={search}
                    onChange={(event) =>
                      setSearch(
                        event.target.value,
                      )
                    }
                    className={inputClass}
                    placeholder="Search registration, nickname or owner"
                  />

                </div>

              </div>

            </div>


            {loading ? (
              <div className="px-6 py-10 text-center text-sm text-slate-500">
                Loading lorries...
              </div>
            ) : filteredLorries.length === 0 ? (

              <div className="px-6 py-10 text-center text-sm text-slate-500">

                {search.trim()
                  ? "No lorries match your search."
                  : "No lorries found."}

              </div>

            ) : (

              <div className="overflow-x-auto">

                <table className="min-w-full">

                  <thead className="bg-slate-50">

                    <tr>

                      <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                        Registration Number
                      </th>

                      <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                        Nickname
                      </th>

                      <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                        Owner Name
                      </th>

                      <th className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">
                        Actions
                      </th>

                    </tr>

                  </thead>


                  <tbody className="divide-y divide-slate-200">

                    {filteredLorries.map(
                      (lorry) => (
                        <tr
                          key={lorry.lorry_id}
                          className="hover:bg-slate-50"
                        >

                          <td className="px-6 py-4">

                            <div className="font-medium text-slate-900">
                              {
                                lorry.registration_number
                              }
                            </div>

                            <div className="mt-1 text-xs text-slate-400">
                              ID #{lorry.lorry_id}
                            </div>

                          </td>


                          <td className="px-6 py-4 text-sm text-slate-700">
                            {
                              lorry.nickname ||
                              "—"
                            }
                          </td>


                          <td className="px-6 py-4 text-sm text-slate-700">
                            {lorry.owner_name}
                          </td>


                          <td className="px-6 py-4">

                            <div className="flex justify-end gap-2">

                              <button
                                type="button"
                                onClick={() =>
                                  setViewingLorry(
                                    lorry,
                                  )
                                }
                                className={
                                  actionButton
                                }
                              >
                                View
                              </button>


                              <button
                                type="button"
                                onClick={() =>
                                  openEditForm(
                                    lorry,
                                  )
                                }
                                className={
                                  actionButton
                                }
                              >
                                Edit
                              </button>


                              <button
                                type="button"
                                onClick={() =>
                                  handleDelete(
                                    lorry,
                                  )
                                }
                                className="rounded-lg border border-red-200 px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 transition"
                              >
                                Delete
                              </button>

                            </div>

                          </td>

                        </tr>
                      ),
                    )}

                  </tbody>

                </table>

              </div>

            )}

          </div>
        )}

    </div>
  );
}


export default Lorries;
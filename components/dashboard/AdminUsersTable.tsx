"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

type AdminUser = {
  id: string;
  full_name: string | null;
  email: string | null;
  account_status: string;
  created_at: string;
  complaint_count: number;
};

type AdminUsersTableProps = {
  users: AdminUser[];
};

export default function AdminUsersTable({
  users,
}: AdminUsersTableProps) {
  const supabase = createClient();

  const [search, setSearch] = useState("");
  const [userList, setUserList] = useState(users);
  const [updatingUserId, setUpdatingUserId] =
    useState<string | null>(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const filteredUsers = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) {
      return userList;
    }

    return userList.filter((user) => {
      const name =
        user.full_name?.toLowerCase() ?? "";

      const email =
        user.email?.toLowerCase() ?? "";

      return (
        name.includes(query) ||
        email.includes(query)
      );
    });
  }, [search, userList]);

  async function handleStatusChange(
    userId: string,
    currentStatus: string
  ) {
    const newStatus =
      currentStatus === "ACTIVE"
        ? "INACTIVE"
        : "ACTIVE";

    setUpdatingUserId(userId);
    setMessage("");
    setError("");

    const { error: rpcError } =
      await supabase.rpc(
        "admin_update_user_status",
        {
          p_user_id: userId,
          p_status: newStatus,
        }
      );

    if (rpcError) {
      console.error(
        "User status update error:",
        rpcError
      );

      setError(rpcError.message);
      setUpdatingUserId(null);
      return;
    }

    setUserList((currentUsers) =>
      currentUsers.map((user) =>
        user.id === userId
          ? {
              ...user,
              account_status: newStatus,
            }
          : user
      )
    );

    setMessage(
      `User account ${
        newStatus === "ACTIVE"
          ? "activated"
          : "deactivated"
      } successfully.`
    );

    setUpdatingUserId(null);
  }

  return (
    <>
      {/* SEARCH */}
      <div className="admin-users-toolbar">
        <div className="admin-users-search">
          <span>⌕</span>

          <input
            type="text"
            value={search}
            onChange={(event) =>
              setSearch(event.target.value)
            }
            placeholder="Search by name or email..."
            aria-label="Search users"
          />
        </div>

        <span className="admin-list-count">
          {filteredUsers.length}{" "}
          {filteredUsers.length === 1
            ? "User"
            : "Users"}
        </span>
      </div>

      {/* FEEDBACK */}
      {message && (
        <div className="admin-success-message">
          {message}
        </div>
      )}

      {error && (
        <div className="admin-error-message">
          {error}
        </div>
      )}

      {/* TABLE */}
      {filteredUsers.length > 0 ? (
        <div className="admin-users-table-wrapper">
          <table className="admin-users-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Status</th>
                <th>Complaints</th>
                <th>Joined</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {filteredUsers.map((user) => (
                <tr key={user.id}>
                  <td>
                    <strong>
                      {user.full_name ||
                        "Unnamed User"}
                    </strong>
                  </td>

                  <td>
                    {user.email ||
                      "Not available"}
                  </td>

                  <td>
                    <span
                      className={
                        user.account_status ===
                        "ACTIVE"
                          ? "admin-status-active"
                          : "admin-status-inactive"
                      }
                    >
                      {user.account_status ===
                      "ACTIVE"
                        ? "Active"
                        : "Inactive"}
                    </span>
                  </td>

                  <td>
                    {user.complaint_count}
                  </td>

                  <td>
                    {new Date(
                      user.created_at
                    ).toLocaleDateString(
                      "en-IN",
                      {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      }
                    )}
                  </td>

                  <td>
                    <div className="admin-user-actions">
                      <Link
                        href={`/admin/users/${user.id}`}
                        className="admin-view-button"
                      >
                        View
                      </Link>

                      <button
                        type="button"
                        className={
                          user.account_status ===
                          "ACTIVE"
                            ? "admin-deactivate-button"
                            : "admin-activate-button"
                        }
                        onClick={() =>
                          handleStatusChange(
                            user.id,
                            user.account_status
                          )
                        }
                        disabled={
                          updatingUserId === user.id
                        }
                      >
                        {updatingUserId ===
                        user.id
                          ? "Updating..."
                          : user.account_status ===
                            "ACTIVE"
                            ? "Deactivate"
                            : "Activate"}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="admin-empty-state">
          <h3>No users found</h3>

          <p>
            No registered users match your
            search.
          </p>
        </div>
      )}
    </>
  );
}
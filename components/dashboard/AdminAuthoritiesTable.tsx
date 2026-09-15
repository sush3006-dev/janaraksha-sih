"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

type AdminAuthority = {
    id: string;
    full_name: string | null;
    email: string | null;
    account_status: string;
    created_at: string;
    assigned_count: number;
    closed_count: number;
};

type AdminAuthoritiesTableProps = {
    authorities: AdminAuthority[];
};

export default function AdminAuthoritiesTable({
    authorities,
}: AdminAuthoritiesTableProps) {
    const supabase = createClient();

    const [search, setSearch] = useState("");
    const [authorityList, setAuthorityList] =
        useState(authorities);
    const [updatingId, setUpdatingId] =
        useState<string | null>(null);
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");

    const filteredAuthorities = useMemo(() => {
        const query = search.trim().toLowerCase();

        if (!query) {
            return authorityList;
        }

        return authorityList.filter((authority) => {
            const name =
                authority.full_name?.toLowerCase() ?? "";

            const email =
                authority.email?.toLowerCase() ?? "";

            return (
                name.includes(query) ||
                email.includes(query)
            );
        });
    }, [search, authorityList]);

    async function handleRoleChange(authorityId: string) {
        const confirmed = window.confirm(
            "Are you sure you want to change this authority back to a user?"
        );

        if (!confirmed) {
            return;
        }

        setUpdatingId(authorityId);
        setMessage("");
        setError("");

        const { error: rpcError } =
            await supabase.rpc("admin_update_user_role", {
                p_user_id: authorityId,
                p_role: "USER",
            });

        if (rpcError) {
            console.error(
                "Authority role update error:",
                rpcError
            );

            setError(rpcError.message);
            setUpdatingId(null);
            return;
        }

        setAuthorityList((currentAuthorities) =>
            currentAuthorities.filter(
                (authority) => authority.id !== authorityId
            )
        );

        setMessage(
            "Authority role changed to USER successfully."
        );

        setUpdatingId(null);
    }

    async function handleStatusChange(
        authorityId: string,
        currentStatus: string
    ) {
        const newStatus =
            currentStatus === "ACTIVE"
                ? "INACTIVE"
                : "ACTIVE";

        setUpdatingId(authorityId);
        setMessage("");
        setError("");

        const { error: rpcError } =
            await supabase.rpc(
                "admin_update_user_status",
                {
                    p_user_id: authorityId,
                    p_status: newStatus,
                }
            );

        if (rpcError) {
            console.error(
                "Authority status update error:",
                rpcError
            );

            setError(rpcError.message);
            setUpdatingId(null);
            return;
        }

        setAuthorityList((currentAuthorities) =>
            currentAuthorities.map((authority) =>
                authority.id === authorityId
                    ? {
                        ...authority,
                        account_status: newStatus,
                    }
                    : authority
            )
        );

        setMessage(
            `Authority account ${newStatus === "ACTIVE"
                ? "activated"
                : "deactivated"
            } successfully.`
        );

        setUpdatingId(null);
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
                        aria-label="Search authorities"
                    />
                </div>

                <span className="admin-list-count">
                    {filteredAuthorities.length}{" "}
                    {filteredAuthorities.length === 1
                        ? "Authority"
                        : "Authorities"}
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
            {filteredAuthorities.length > 0 ? (
                <div className="admin-users-table-wrapper">
                    <table className="admin-users-table">
                        <thead>
                            <tr>
                                <th>Name</th>
                                <th>Email</th>
                                <th>Status</th>
                                <th>Assigned</th>
                                <th>Closed</th>
                                <th>Joined</th>
                                <th>Actions</th>
                            </tr>
                        </thead>

                        <tbody>
                            {filteredAuthorities.map((authority) => (
                                <tr key={authority.id}>
                                    <td>
                                        <strong>
                                            {authority.full_name ||
                                                "Unnamed Authority"}
                                        </strong>
                                    </td>

                                    <td>
                                        {authority.email ||
                                            "Not available"}
                                    </td>

                                    <td>
                                        <span
                                            className={
                                                authority.account_status ===
                                                    "ACTIVE"
                                                    ? "admin-status-active"
                                                    : "admin-status-inactive"
                                            }
                                        >
                                            {authority.account_status ===
                                                "ACTIVE"
                                                ? "Active"
                                                : "Inactive"}
                                        </span>
                                    </td>

                                    <td>
                                        {authority.assigned_count}
                                    </td>

                                    <td>
                                        {authority.closed_count}
                                    </td>

                                    <td>
                                        {new Date(
                                            authority.created_at
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
                                                href={`/admin/authorities/${authority.id}`}
                                                className="admin-view-button"
                                            >
                                                View
                                            </Link>


                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            ) : (
                <div className="admin-empty-state">
                    <h3>No authorities found</h3>

                    <p>
                        No registered authorities match your
                        search.
                    </p>
                </div>
            )}
        </>
    );
}
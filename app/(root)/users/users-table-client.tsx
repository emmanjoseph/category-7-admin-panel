"use client"

import { useCallback, useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { UserDataTable } from "./user-data-table"
import { userColumns, User } from "./user-column"
import ConfirmDialog from "@/components/confirm-dialog";

async function apiFetch(url: string, options: RequestInit = {}) {
    const res = await fetch(url, {
        ...options,
        headers: {
            "Content-Type": "application/json",
            ...options.headers,
        },
    })
    const data = await res.json()
    if (!res.ok || !data.success) {
        throw new Error(data.message || "Request failed")
    }
    return data
}


export function UsersTableClient({ initialUsers }: { initialUsers: User[] }) {
    const router = useRouter()
    const [users, setUsers] = useState<User[]>(initialUsers)
    const [confirmDelete, setConfirmDelete] = useState<User | null>(null)

    const refreshUser = (id: number, patch: Partial<User>) => {
        setUsers((prev) => prev.map((u) => (u.id === id ? { ...u, ...patch } : u)))
    }

    const handlers = {
        onViewProfile: useCallback((user: User) => {
            router.push(`/users/${user.id}`)
        }, [router]),

        onEditUser: useCallback((user: User) => {
            router.push(`/users/${user.id}/edit`)
        }, [router]),

        onSuspendUser: useCallback(async (user: User) => {
            try {
                // Relative path → hits Next.js route handler, not backend directly
                await apiFetch(`/api/users/${user.id}`, {
                    method: "PATCH",
                    body: JSON.stringify({ isActive: false }),
                })
                refreshUser(user.id, { isActive: false })
                toast.success(`${user.fullName} suspended`)
            } catch (err: any) {
                toast.error(err.message)
            }
        }, []),

        onActivateUser: useCallback(async (user: User) => {
            try {
                await apiFetch(`/api/users/${user.id}`, {
                    method: "PATCH",
                    body: JSON.stringify({ isActive: true }),
                })
                refreshUser(user.id, { isActive: true })
                toast.success(`${user.fullName} reactivated`)
            } catch (err: any) {
                toast.error(err.message)
            }
        }, []),

        onDeleteUser: useCallback((user: User) => {
            setConfirmDelete(user)
        }, []),
    }

    const confirmDeleteUser = async () => {
        if (!confirmDelete) return
        try {
            await apiFetch(`/api/users/${confirmDelete.id}`, { method: "DELETE" })
            setUsers((prev) => prev.filter((u) => u.id !== confirmDelete.id))
            toast.success(`${confirmDelete.fullName} deleted`)
        } catch (err: any) {
            toast.error(err.message)
        } finally {
            setConfirmDelete(null)
        }
    }

    return (
        <>
            <UserDataTable columns={userColumns(handlers)} data={users} />

            {confirmDelete && (
                <ConfirmDialog
                    open={!!confirmDelete}
                    title={`Delete ${confirmDelete.fullName}?`}
                    description="This permanently deletes the user. This cannot be undone."
                    onConfirm={confirmDeleteUser}
                    onCancel={() => setConfirmDelete(null)}
                    destructive
                />
            )}
        </>
    )
}
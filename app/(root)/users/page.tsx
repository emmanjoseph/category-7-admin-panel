import React from 'react'
import { getUsers } from "@/lib/api";
import { UsersTableClient } from "@/app/(root)/users/users-table-client";

const Users = async () => {
    const users = await getUsers();

    return (
        <div className={'@container/main flex flex-1 flex-col gap-2'}>
            <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6 px-4 lg:px-6">
                <h1 className="text-base font-bold">Internet users</h1>
                <UsersTableClient initialUsers={users.data.users} />
            </div>
        </div>
    )
}

export default Users
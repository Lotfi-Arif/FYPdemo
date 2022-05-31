import { CheckIcon, XIcon } from "@heroicons/react/outline";
import { useApproveUserMutation, useRejectUserMutation } from "schema/generated/graphql";



const UserRow = (users) => {

    const [rejectUser] = useRejectUserMutation();
    const [approveUser] = useApproveUserMutation();

    const onRejectUser = async (id: string) => {
        try {
            await rejectUser({ variables: { id } })
        } catch (error) {
            console.log(error);

        }
    }

    const onApproveUser = async (id: string) => {
        try {
            await approveUser({ variables: { id } })
        } catch (error) {
            console.log(error);

        }
    }

    return (
        <>
            <tr className="border-b border-gray-200 hover:bg-gray-100">
                <td className="py-3 px-6 text-left">
                    <div className="flex items-center">
                        <div className="mr-2">

                        </div>
                        <span>{users.user.name}</span>
                    </div>
                </td>
                <td className="py-3 px-6 text-center">
                    <div className="flex items-center">
                        <div className="mr-2">

                        </div>
                        <span>{users.user.role}</span>
                    </div>
                </td>

                <td className="py-3 px-6 text-center">
                    <span className={"bg-yellow-200 text-purple-600 py-1 px-3 rounded-full text-xs"}>{users.user.accountStatus}</span>
                </td>
                <td className="py-3 px-6 text-center">
                    <div className="flex item-center justify-center">
                        <button className="w-4 mr-2 transform hover:text-purple-500 hover:scale-110" onClick={() => {
                            onApproveUser(users.user.id)
                        }}>
                            <CheckIcon />
                        </button>
                        <button className="w-4 mr-2 transform hover:text-purple-500 hover:scale-110" onClick={() => {
                            onRejectUser(users.user.id)
                        }}>
                            <XIcon />
                        </button>
                    </div>
                </td>
            </tr>
        </>
    );
}

export default UserRow;
import { EyeIcon, PencilIcon, TrashIcon } from "@heroicons/react/outline";
import Link from "next/link";
import { useRouter } from "next/router";
import { useDeleteEventMutation } from "schema/generated/graphql";


const EventRow = (events) => {


    const [deleteEvent] = useDeleteEventMutation();
    const router = useRouter();

    const onDelete = async (id: string) => {
        try {
            await deleteEvent({
                variables: {
                    where: { id }
                }
            })
        } catch (error) {
            console.log(error);

        }
    }

    return (
        <>
            <tr className="border-b border-gray-200 hover:bg-gray-100">
                <td className="py-3 px-6 text-left whitespace-nowrap">
                    <div className="flex items-center">
                        <div className="mr-2">
                            <img className="h-6 w-6" src={events.event.eventImageURL} alt="Event Image" />
                        </div>
                        <span className="font-medium">{events.event.title}</span>
                    </div>
                </td>
                <span className="text-gray-700 py-1 px-3 items-center table-caption">
                    {events.event.eventDetails}
                </span>
                <td className="py-3 px-6 text-center">
                    <div className="flex item-center justify-center">
                        <button className="w-4 mr-2 transform hover:text-purple-500 hover:scale-110">
                            <Link href={'/pages/admin/manageevents/viewEvent'} passHref>
                                <EyeIcon />
                            </Link>
                        </button>
                        <button className="w-4 mr-2 transform hover:text-purple-500 hover:scale-110">
                            <Link href={'/pages/admin/manageevents/editEvent'} passHref>
                                <PencilIcon />
                            </Link>
                        </button>
                        <button className="w-4 mr-2 transform hover:text-purple-500 hover:scale-110" onClick={() => {
                            onDelete(events.event.id)
                        }}>
                            <TrashIcon />
                        </button>
                    </div>
                </td>
            </tr>
        </>
    );
}

export default EventRow;
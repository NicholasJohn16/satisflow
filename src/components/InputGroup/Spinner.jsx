import { MdAdd } from "react-icons/md";
import { MdOutlineRemove } from "react-icons/md";

export default function Spinner({dispatch}) {
    return (
        <div className="input-spinner">
            <div onClick={() => dispatch(1)}>
                <MdAdd />
            </div>
            <div onClick={() => dispatch(-1)}>
                <MdOutlineRemove />
            </div>
        </div>
    )
}
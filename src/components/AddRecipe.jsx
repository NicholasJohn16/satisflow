import { useModal } from "../contexts/modal";

function AddRecipe() {
    const { openModal } = useModal();
    // const [colorMode, setColorMode] = useState('light');

    // window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', event => {
    //     setColorMode(event.matches ? "dark" : "light");
    // });

    return (
        <>
            <button className="default" onClick={() => openModal('recipes')}>Add Recipe</button>
        </>
    )

}

export default AddRecipe;


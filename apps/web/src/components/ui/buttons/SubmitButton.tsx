import Image from "next/image"


export default function SubmitButton() {
    return (
        <div
            className={
                `border border-solid border-primary rounded-full flex items-center
           justify-center cursor-pointer w-[35px] h-[35px] text-text-primary`
            }
        >
            <Image
                src={"/icons/arrow-up-stroke.png"}
                alt="Submit"
                width={30}
                height={30}
            />
        </div>
    )
}
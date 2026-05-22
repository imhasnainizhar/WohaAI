import ClassicButton from "@components/ui/buttons/classic-button";



export default function ConfirmPolicy() {
    return (
        <div className="w-full h-full flex items-center justify-center bg-bg-primary">
            <div className="flex flex-col items-center justify-center rounded-[16px] gap-[30px] w-[450px] h-[400px] p-4">
                <div className="w-full flex flex-col items-start justify-center gap-5">
                    <div className="w-full flex flex-col items-start justify-start gap-3">
                        <div>Policy & Terms Agreement</div>
                        <div>By clicking, You agree to our Privacy Policy and Terms of Use.</div>
                    </div>
                    <ClassicButton text="Agree & Continue" />
                </div>
            </div>
        </div>
    );
}
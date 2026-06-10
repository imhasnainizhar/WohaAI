import ClassicButton from "@/components/ui/buttons/ClassicButton";
import { RoundedInputField } from "@/components/input/fields/RoundedInputField";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useTheme } from "@/providers/ThemeProvider";
import { PasswordValidationRequestSchema, PasswordValidationRequest } from "@packages/contracts/auth";

export default function SignupPassword({ next }: { next: (next: any) => void }) {
    const { theme } = useTheme();
    const darkTheme = theme === "dark";

    const {
        register,
        handleSubmit,
        control,
        formState: { errors, isValid, isSubmitting },
    } = useForm<PasswordValidationRequest>({
        resolver: zodResolver(PasswordValidationRequestSchema),
    });

    return (
        <form className="w-full flex flex-col items-center justify-center gap-8"
            method="POST"
            onSubmit={handleSubmit(next)}
        >
            <div className="w-[85%] h-[50%]">
                <RoundedInputField
                    label="Password"
                    name="password"
                    register={register}
                    error={errors.password}
                    theme={darkTheme ? "dark" : "light"}
                />
            </div>
            <div className="w-[85%] h-[50%]">
                <RoundedInputField
                    label="Confirm Password"
                    name="confirmPassword"
                    register={register}
                    error={errors.confirmPassword}
                    theme={darkTheme ? "dark" : "light"}
                />
            </div>
            <ClassicButton text="Continue" />
        </form>
    )
}
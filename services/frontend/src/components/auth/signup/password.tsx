import ClassicButton from "@components/ui/buttons/classic-button";
import { RoundedInputField } from "@components/ui/input/fields/rounded";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { SignupPasswordInput, SignupPasswordSchema } from "@lib/schemas/signup";
import { useTheme } from "@providers/theme";

export default function Password(next: (next: any) => void) {
    const { theme } = useTheme();
    const darkTheme = theme === "dark";

    const {
        register,
        handleSubmit,
        control,
        formState: { errors, isValid, isSubmitting },
    } = useForm<SignupPasswordInput>({
        resolver: zodResolver(SignupPasswordSchema),
    });

    return (
        <form className="w-full flex flex-col items-center justify-center gap-8"
            method="POST"
            onSubmit={handleSubmit(next)}
        >
            <div className="w-[85%]">
                <RoundedInputField
                    label="Password"
                    name="password"
                    register={register}
                    error={errors.password}
                    theme={darkTheme ? "dark" : "light"}
                />
            </div>
            <div className="w-[85%]">
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
export type SigninForm = {
    usernameOrEmail: string;
    password?: string;
};

export type SignupForm = {
    username: string;
    email: string;
    password: string;
    confirmPassword: string;
};
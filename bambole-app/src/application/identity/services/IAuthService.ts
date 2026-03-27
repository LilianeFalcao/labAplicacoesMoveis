export interface IAuthService {
    signUp(email: string, password: string): Promise<{ id: string; email: string }>;
    signIn(email: string, password: string): Promise<{ id: string; email: string }>;
}

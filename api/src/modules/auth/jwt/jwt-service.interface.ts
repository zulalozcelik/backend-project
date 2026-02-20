export interface IJwtService {
    signAccessToken(payload: { sub: string }): Promise<string>;
}

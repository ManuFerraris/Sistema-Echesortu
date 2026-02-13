export interface TokenPayload {
    numero: number;    // ID del usuario
    username: string;
    rol: string;
    iat?: number;      // Issued At (cuándo se creó)
    exp?: number;      // Expiration (cuándo vence)
}
export interface ServiceResponse<T> {
    status: number;
    success: boolean;
    messages: string[]; // Siempre un array, para consistencia
    data?: T;
}
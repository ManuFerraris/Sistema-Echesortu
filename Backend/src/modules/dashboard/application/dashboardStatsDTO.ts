export interface DashboardStatsDTO {
    mes: number;
    anio: number;
    recaudacionTotal: number;
    porcentajeMorosidad: number;
    totalSociosActivos: number;
    actividadMasPopular: {
        nombre: string;
        cantidad: number;
    } | null;
}
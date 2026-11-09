interface Appointment {
    id: number;
    Service: Service;
    Subservice: SubService;
    num: number;
    personinfront: number;
    received: boolean;
    transfered: boolean;
    serve: boolean;
    missing: boolean;
    date: string;
    time: string;
    callTime: string;
    timeInMinutes: number;
    waitingTime: number;
    processingTime: number;
    createdAt: string;
}
/**
 * Détail complet d'un ticket, servi par `POST /appointment/details`.
 *
 * Les listes du rapport ne transportent qu'un sous-ensemble de colonnes (limite
 * de taille de réponse côté Cloud Run) : ces champs ne sont chargés qu'au
 * moment d'un export.
 */
interface AppointmentDetails {
    id: number;
    num: number;
    prefix: string;
    ticketRef: string | null;
    date: string;
    time: string;
    callTime: string | null;
    /** Heure de fin de traitement, posée à la clôture. */
    endTime: string | null;
    /** Clôturé par la fermeture de 19h et non par le conseiller. */
    autoClosed: boolean;
    serviceName: string;
    subserviceName: string;
    waitingTime: number;
    processingTime: number;
    received: boolean;
    serve: boolean;
    missing: boolean;
    transfered: boolean;
    putInWaiting: boolean | null;
    reasons: string | null;
    phone: string | null;
    /** Saisie du client sur la borne. */
    infoValues: Record<string, unknown>;
    infoLabels: Record<string, string>;
    /** Saisie du conseiller à la clôture. */
    closingValues: Record<string, unknown>;
    closingLabels: Record<string, string>;
}

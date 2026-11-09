/**
 * Résultat de la recherche de tickets (`POST /appointment/search`).
 *
 * `infoValues` porte les valeurs saisies sur la borne et `infoLabels` leur
 * intitulé au moment de la saisie : le cloud ne connaît pas le paramétrage des
 * services, c'est ce qui permet d'afficher et d'exporter les informations sous
 * leur libellé métier.
 */
interface TicketSearchResult {
    id: number;
    num: number;
    prefix: string;
    ticketRef: string | null;
    serviceName: string;
    /** Guichet / caisse ayant traité le ticket. Vide tant qu'il n'est pas appelé. */
    subserviceName: string;
    officeName: string;
    date: string;
    time: string;
    callTime: string | null;
    /** Heure de fin de traitement. Nulle tant que le ticket n'est pas clôturé. */
    endTime: string | null;
    /**
     * Clôturé par la fermeture de 19h et non par le conseiller : `endTime` vaut
     * alors l'heure de fermeture et non l'instant réel de fin de traitement.
     */
    autoClosed: boolean;
    waitingTime: number;
    processingTime: number;
    received: boolean;
    serve: boolean;
    missing: boolean;
    infoValues: Record<string, unknown>;
    infoLabels: Record<string, string>;
    /**
     * Informations saisies par le conseiller à la clôture (dossier complet,
     * commentaire, ...), paramétrées par service côté agence.
     */
    closingValues: Record<string, unknown>;
    closingLabels: Record<string, string>;
    createdAt: string;
}

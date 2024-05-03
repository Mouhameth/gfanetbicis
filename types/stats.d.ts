interface Stats {
    subServices: number;
    services: number;
    receives: number;
    waitings: number;
    appointments: number;
    appointmentsByService: Record[];
    serveAppointmentsByService: Record[],
    waitingAppointmentsByService: Record[],
    appointmentList: Appointment[];
    appointmentsByStatut: Record[];
    months: string[];
    weeks: string[];
    years: string[];
    meanWaitingTime: number;
    meanServingTime: number;
    totalInWaiting: number;
    totatlInServing: number;
    totalNotInWaiting: number;
    totatlNotInServing: number;
    meanWaitingTimeByService: Record[];
    meanServingTimeByService: Record[];
    totatlInWaitingByService: Record[];
    totatlNotInWaitingByService: Record[];
    totatlInServingByService: Record[];
    totatlNotInServingByService: Record[];
    appointmentsBySubService: Record[];
    serveAppointmentsBySubService: Record[];
    waitingAppointmentsBySubService: Record[];
    meanWaitingTimeBySubService: Record[];
    meanServingTimeBySubService: Record[];
    totatlInWaitingBySubService: Record[];
    totatlNotInWaitingBySubService: Record[];
    totatlInServingBySubService: Record[];
    totatlNotInServingBySubService: Record[];
    appointmentsByHourSlot: Record[];
    serveAppointmentsByHourSlot: Record[];
}

interface Record {
    name: string;
    amount: number;
}
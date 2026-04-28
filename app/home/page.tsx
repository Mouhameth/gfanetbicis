"use client";
import { RiFileExcel2Fill, RiLoader2Fill } from "react-icons/ri";
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    ArcElement,
    Legend
} from 'chart.js';
import { Doughnut, Line, Bar } from 'react-chartjs-2';
import Loader from "@/components/common/Loader";
import useSWR from "swr";
import useAxiosAuth from "@/hooks/useAxiosAuth";
import * as FileSaver from 'file-saver';
import XLSX from 'sheetjs-style';
import { useEffect, useState } from "react";
import { IoCheckmarkDoneCircleSharp, IoReload, IoTabletLandscape, IoTrendingUpOutline } from "react-icons/io5";
import { FaClipboardList, FaGraduationCap, FaRegCalendar, FaUsers } from "react-icons/fa";
import { CiCircleAlert, CiFilter } from "react-icons/ci";
import { Menu, MenuItem } from "@mui/material";
import { format } from 'date-fns';
import { fr } from "date-fns/locale/fr";
import toast from "react-hot-toast";
import { MdAdminPanelSettings, MdBarChart, MdOutlineSupportAgent, MdOutlineTimelapse, MdTimer } from "react-icons/md";
import 'chart.js/auto';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { HiOutlineBuildingOffice } from "react-icons/hi2";
import { BsChevronBarDown, BsChevronBarUp, BsStickyFill } from "react-icons/bs";
import { AiFillPieChart, AiOutlineClockCircle, AiOutlineWarning } from "react-icons/ai";
import { GoClock } from "react-icons/go";
import { IoIosTrendingUp } from "react-icons/io";
import useChangeHeaderTitle from "../hooks/useChangedHeader";
import { FaSquarePollVertical } from "react-icons/fa6";
import ChartDataLabels from 'chartjs-plugin-datalabels';


ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
    ArcElement,
    ChartDataLabels
);

type StatCardProps = {
    icon: React.ElementType;
    value: React.ReactNode;
    label: string;
    bgColor: string;
    iconColor: string;
};

const StatCard = ({ icon: Icon, value, label, bgColor, iconColor }: StatCardProps) => (
    <div className="bg-white rounded-lg shadow-sm border border-gray-100 flex flex-col items-center justify-center h-full hover:shadow-md transition-shadow duration-200">
        <div className={`w-12 h-12 ${bgColor} rounded-full flex items-center justify-center mb-1`}>
            <Icon className={`w-6 h-6 ${iconColor}`} />
        </div>
        <div className="text-center">
            <h3 className="text-lg font-bold text-gray-800 ">{value}</h3>
            <p className="text-[10px] text-gray-500">{label}</p>
        </div>
    </div>
);

const Report = () => {

    const url = `/appointment/stats/all`;
    const axiosAuth = useAxiosAuth();
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    const [startDate, setStartDate] = useState(new Date());
    const [endDate, setEndDate] = useState(null);
    const [formattedStartDate, setFormattedStartDate] = useState('');
    const [formattedEndDate, setFormattedEndDate] = useState('');
    const { data: result, isLoading, error } = useSWR(`${url}`, () => axiosAuth.post<AllStats>(url, JSON.stringify({ date: now.toLocaleDateString('fr-FR') })).then((res) => res.data));
    const useChangeTitle = useChangeHeaderTitle();
    const [currentDate, setCurrentDate] = useState('');
    const [description, setDescription] = useState('');
    const [waitingAppointmentsOfficeByHourSlot, setWaitingAppointmentsOfficeByHourSlot] = useState<Slot[]>([]);
    const [activeSection, setActiveSection] = useState<string | null>(null);

    useEffect(() => {
        useChangeTitle.onChanged("Tableau de bord");
    }, []); // Exécuté une seule fois au montage

    useEffect(() => {
        // Formatage de la date actuelle
        const date = new Date(new Date().getTime());
        const hours = String(date.getUTCHours()).padStart(2, '0');
        const minutes = String(date.getUTCMinutes()).padStart(2, '0');
        const seconds = String(date.getUTCSeconds()).padStart(2, '0');
        const pickedTime = `${hours}:${minutes}:${seconds}`;
        setCurrentDate(`Aujourd'hui : ${format(`${now.toLocaleDateString('fr-FR').split('/')[1]}/${now.toLocaleDateString('fr-FR').split('/')[0]}/${now.toLocaleDateString('fr-FR').split('/')[2]}`, 'EEEE dd MMMM yyyy', { locale: fr })} à ${pickedTime}`);
        setFormattedStartDate(format(startDate, 'dd/MM/yyyy'));
        setDescription(`Ceci represente l'ensemble des données pour toutes les agences pour la date d'aujourd'hui ${format(`${now.toLocaleDateString('fr-FR').split('/')[1]}/${now.toLocaleDateString('fr-FR').split('/')[0]}/${now.toLocaleDateString('fr-FR').split('/')[2]}`, 'EEEE dd MMMM yyyy', { locale: fr })} à ${pickedTime}`);
    }, [startDate]); // Dépend de startDate

    useEffect(() => {
        console.log(result);

        if (result?.appointmentsByHourSlot && result?.servingAppointmentsByHourSlot) {
            setWaitingAppointmentsOfficeByHourSlot(
                calculateWaitings(result.appointmentsByHourSlot, result.servingAppointmentsByHourSlot)
            );
        } else {
            setWaitingAppointmentsOfficeByHourSlot([]);
        }
    }, [result]);

    const toggleSection = (section: string) => {
        setActiveSection(activeSection === section ? null : section);
    };

    const emptyStats: AllStats = {
        subServices: 0,
        services: 0,
        appointmentsByOffice: [],
        serveAppointmentsByOffice: [],
        waitingAppointmentsByOffice: [],
        months: [],
        weeks: [],
        years: [],
        offices: 0,
        totalAppointments: 0,
        totalByOffices: [],
        appointmentsByHourSlot: [],
        servingAppointmentsByHourSlot: [],
        totalInTimeByOffice: [],
        totalNotInTimeByOffice: [],
        allAdmins: 0,
        allUsers: 0,
        meanWaitingTime: 0,
        meanServingTime: 0,
        totalInWaiting: 0,
        totatlInServing: 0,
        totalNotInWaiting: 0,
        totatlNotInServing: 0,
        waitings: 0,
        receives: 0,
        appointments: 0,
        meanWaitingTimeAndSubservices: [],
        globalServiceMetrics: []
    }

    const [filterStats, setFilterStats] = useState(emptyStats);
    const [filter, setFilter] = useState(false);
    const [ticketThreshold, setTicketThreshold] = useState(0);
    const [showTicketFilter, setShowTicketFilter] = useState(false);
    const [loading, setLoading] = useState(false);
    const [anchorWeekElFilter, setAnchorWeekElFilter] = useState(null);
    const openWeekMenuFilter = Boolean(anchorWeekElFilter);

    const [anchorMonthElFilter, setAnchorMonthElFilter] = useState(null);
    const openMonthMenuFilter = Boolean(anchorMonthElFilter);

    const [anchorYearElFilter, setAnchorYearElFilter] = useState(null);
    const openYearMenuFilter = Boolean(anchorYearElFilter);

    const [anchorRangeElFilter, setAnchorRangeElFilter] = useState(null);
    const openRangeMenuFilter = Boolean(anchorRangeElFilter);

    const handleWeekClickFilter = (event: any) => {
        setAnchorWeekElFilter(event.currentTarget);
    };

    const handleMonthClickFilter = (event: any) => {
        setAnchorMonthElFilter(event.currentTarget);
    };

    const handleYearClickFilter = (event: any) => {
        setAnchorYearElFilter(event.currentTarget);
    };

    const handleRangeClickFilter = (event: any) => {
        setAnchorRangeElFilter(event.currentTarget);
    };

    const handleFilter = async (date: string) => {
        setDescription(`Ceci represente l'ensemble des données de toutes les agences à la date du ${date}`)

        try {
            setFilter(true);
            setLoading(true);
            setCurrentDate(`L'année ${date}`);
            if (date.split('/').length === 2) {
                setCurrentDate(`Le mois de ${format(`${date.split('/')[0]}/01/${date.split('/')[1]}`, 'MMMM yyyy', { locale: fr })}`);
            }
            if (date.split('/').length === 3) {
                setCurrentDate(`La journée du ${format(`${date.split('/')[1]}/${date.split('/')[0]}/${date.split('/')[2]}`, 'EEEE dd MMMM yyyy', { locale: fr })}`);
            }

            const res = await axiosAuth.post<AllStats>(url, JSON.stringify({ date: date }));
            if (res.status == 200) {

                console.log(res.data);
                setFilterStats(res.data);
                setWaitingAppointmentsOfficeByHourSlot(calculateWaitings(res.data.appointmentsByHourSlot, res.data.servingAppointmentsByHourSlot));
            }
        } catch (error) {
            setFilter(false);
            toast.error('Une erreur est survenue, réessayer!', { duration: 3000, className: " text-xs" });
        } finally {
            setLoading(false);
            setAnchorMonthElFilter(null);
            setAnchorYearElFilter(null);
        }
    };

    const handleWeekFilter = async (start: string, end: string) => {
        setDescription(`Ceci represente l'ensemble des données de toutes les agences  de ${start} à ${end}`)
        try {
            setFilter(true);
            setLoading(true);
            setCurrentDate(`Entre le ${format(`${start.split('/')[1]}/${start.split('/')[0]}/${start.split('/')[2]}`, 'EEEE dd MMMM yyyy', { locale: fr })} et le ${format(`${end.split('/')[1]}/${end.split('/')[0]}/${end.split('/')[2]}`, 'EEEE dd MMMM yyyy', { locale: fr })}`);
            const res = await axiosAuth.post<AllStats>(`${url}/range`, JSON.stringify({ start: start, end: end }));
            if (res.status == 200) {
                setFilterStats(res.data);
                setWaitingAppointmentsOfficeByHourSlot(calculateWaitings(res.data.appointmentsByHourSlot, res.data.servingAppointmentsByHourSlot));
            }
        } catch (error) {
            setFilter(false);
            toast.error('Une erreur est survenue, réessayer!', { duration: 3000, className: " text-xs" });
        } finally {
            setLoading(false);
            setAnchorWeekElFilter(null);
        }
    }

    const onChange = (dates: any) => {
        const [start, end] = dates;
        setStartDate(start);
        setEndDate(end);
        setFormattedStartDate(format(start, 'dd/MM/yyyy'))
        if (end !== null) {
            setFormattedEndDate(format(end, 'dd/MM/yyyy'));
        }

    };

    const handleCloseWeekMenuFilter = () => {
        setAnchorWeekElFilter(null);
    };
    const handleCloseMonthMenuFilter = () => {
        setAnchorMonthElFilter(null);
    };
    const handleCloseYearMenuFilter = () => {
        setAnchorYearElFilter(null);
    };

    const handleCloseRangeMenuFilter = () => {
        setAnchorRangeElFilter(null);
    };

    const calculateWaitings = (receives: Slot[], serves: Slot[]): Slot[] => {
        const waitings: Slot[] = [];

        // Map pour stocker les waitings accumulés par bureau
        const accumulatedWaitings: Map<string, number> = new Map();

        // Parcourir chaque créneau horaire dans l'ordre chronologique
        receives.forEach(receiveSlot => {
            // Trouver le créneau correspondant dans les servis
            const serveSlot = serves.find(s => s.time === receiveSlot.time);

            // Calculer le total des reçus pour cette heure
            const totalReceived = receiveSlot.data.reduce((sum, office) => sum + office.amount, 0);

            // Calculer le total des servis pour cette heure
            const totalServed = serveSlot?.data.reduce((sum, office) => sum + office.amount, 0) || 0;

            // Si aucune activité (0 reçus ET 0 servis), ne pas afficher cette heure
            if (totalReceived === 0 && totalServed === 0) {
                return; // Passer à l'heure suivante
            }

            const waitingData: Rec[] = receiveSlot.data.map(receiveOffice => {
                // Récupérer les waitings accumulés de l'heure précédente
                const previousWaitings = accumulatedWaitings.get(receiveOffice.name) || 0;

                // Trouver combien ont été servis cette heure
                const serveOffice = serveSlot?.data.find(s => s.name === receiveOffice.name);
                const servedThisHour = serveOffice?.amount || 0;

                // Calcul : waitings précédents + nouveaux reçus - servis cette heure
                const currentWaitings = previousWaitings + receiveOffice.amount - servedThisHour;

                // S'assurer que les waitings ne deviennent pas négatifs
                const finalWaitings = Math.max(0, currentWaitings);

                // Mettre à jour les waitings accumulés pour la prochaine heure
                accumulatedWaitings.set(receiveOffice.name, finalWaitings);

                return {
                    name: receiveOffice.name,
                    amount: finalWaitings
                };
            });

            waitings.push({
                time: receiveSlot.time,
                data: waitingData
            });
        });

        return waitings;
    };

    const exportToExcel = async () => {
        // Récupération des données selon le filtre
        const stats = filter ? filterStats : result;

        if (!stats) return;

        // ====================
        // STYLES
        // ====================
        const styles = {
            title: {
                font: { bold: true, size: 18, color: { rgb: 'FF0000' } },
                alignment: { horizontal: 'center', vertical: 'center' }
            },
            description: {
                font: { italic: true, size: 14, color: { rgb: '0000FF' } },
                alignment: { horizontal: 'left', vertical: 'center' }
            },
            header: {
                font: { bold: true, size: 12, color: { rgb: 'FFFFFF' } },
                fill: { fgColor: { rgb: '4472C4' } },
                alignment: { horizontal: 'center', vertical: 'center' }
            },
            subHeader: {
                font: { bold: true, size: 11, color: { rgb: '000000' } },
                fill: { fgColor: { rgb: 'D9E1F2' } },
                alignment: { horizontal: 'center', vertical: 'center' }
            }
        };

        // ====================
        // UTILITAIRES
        // ====================
        const createStyledCell = (value: any, style: any) => ({ v: value, s: style });
        const createEmptyRow = () => ({ '': '' });

        // ====================
        // FEUILLE 1: DONNÉES GLOBALES
        // ====================
        const buildGlobalSheet = () => {
            const data: any[] = [];

            // Titre et description
            data.push({ '': createStyledCell('Données globales pour toutes les agences', styles.title) });
            data.push({ '': createStyledCell(description, styles.description) });
            data.push(createEmptyRow());

            // En-têtes
            data.push({
                'Agences': createStyledCell('Agences', styles.header),
                'Services': createStyledCell('Services', styles.header),
                'Points d\'appels': createStyledCell('Points d\'appels', styles.header),
                'Agents': createStyledCell('Agents', styles.header)
            });

            // Données
            data.push({
                'Agences': stats.offices || 0,
                'Services': stats.services || 0,
                'Points d\'appels': stats.subServices || 0,
                'Agents': stats.subServices || 0
            });

            return data;
        };

        // ====================
        // FEUILLE 2: TICKETS PAR AGENCE
        // ====================
        const buildTicketsByOfficeSheet = () => {
            const data: any[] = [];

            // Filtrage par seuil de tickets
            const filteredOffices = ticketThreshold === 0
                ? stats.appointmentsByOffice
                : stats.appointmentsByOffice.filter((office: any) => {
                    const inTime = stats.totalInTimeByOffice?.find((o: any) => o.name === office.name);
                    return (inTime?.receives ?? 0) >= ticketThreshold;
                });

            const focusLabel = ticketThreshold > 0
                ? ` — Focus agences ≥ ${ticketThreshold.toLocaleString()} tickets`
                : '';

            // Titre et description
            data.push({ '': createStyledCell(`Nombre de tickets par Agence${focusLabel}`, styles.title) });
            data.push({ '': createStyledCell(description, styles.description) });
            data.push(createEmptyRow());

            // Boucle sur les agences filtrées
            filteredOffices.forEach((office: any) => {
                // Nom de l'agence
                data.push({ '': createStyledCell(office.name, styles.subHeader) });

                // En-têtes des colonnes
                data.push({
                    'Reçu': createStyledCell('Reçu', styles.header),
                    'Traité': createStyledCell('Traité', styles.header),
                    'En attente': createStyledCell('En attente', styles.header)
                });

                // Données de l'agence (lookup par nom)
                const servedAmount = stats.serveAppointmentsByOffice?.find((o: any) => o.name === office.name)?.amount || 0;
                const waitingAmount = stats.waitingAppointmentsByOffice?.find((o: any) => o.name === office.name)?.amount || 0;

                data.push({
                    'Reçu': office.amount || 0,
                    'Traité': servedAmount,
                    'En attente': waitingAmount
                });

                // Ligne vide entre les agences
                data.push(createEmptyRow());
            });

            return data;
        };

        // ====================
        // CRÉATION DU FICHIER EXCEL
        // ====================
        try {
            // Créer les feuilles
            const globalData = buildGlobalSheet();
            const ticketsData = buildTicketsByOfficeSheet();

            // Convertir en worksheets
            const globalWs = XLSX.utils.json_to_sheet(globalData, { skipHeader: true });
            const ticketsWs = XLSX.utils.json_to_sheet(ticketsData, { skipHeader: true });

            // Ajuster la largeur des colonnes
            const setColumnWidths = (ws: any, widths: number[]) => {
                ws['!cols'] = widths.map(w => ({ wch: w }));
            };

            setColumnWidths(globalWs, [25, 25, 25, 25]);
            setColumnWidths(ticketsWs, [25, 25, 25]);

            // Créer le classeur
            const workbook = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(workbook, globalWs, 'Données Globales');
            XLSX.utils.book_append_sheet(workbook, ticketsWs, 'Tickets par Agence');

            // Exporter le fichier
            const buffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
            const blob = new Blob([buffer], {
                type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
            });

            // Générer un nom de fichier avec la date
            const date = new Date().toISOString().split('T')[0];
            const filename = `rapport_tickets_${date}.xlsx`;

            FileSaver.saveAs(blob, filename);

        } catch (error) {
            console.error('Erreur lors de l\'export Excel:', error);
            throw error;
        }
    };

    type AccordionItemProps = {
        section: string;
        title: string;
        icon: React.ElementType;
        children: React.ReactNode;
    };

    const AccordionItem = ({ section, title, icon: Icon, children }: AccordionItemProps) => {
        const isActive = activeSection === section;

        return (
            <div className="border border-gray-200 rounded-lg mb-4 overflow-hidden shadow-sm">
                <button
                    onClick={() => toggleSection(section)}
                    className="w-full px-6 py-4 text-left bg-gradient-to-r from-gray-50 to-gray-100 hover:from-gray-100 hover:to-gray-200 transition-all duration-200 flex items-center justify-between"
                >
                    <div className="flex items-center space-x-3">
                        <Icon className="w-5 h-5 text-gray-800" />
                        <span className="font-semibold text-gray-800">{title}</span>
                    </div>
                    {isActive ? (
                        <BsChevronBarUp className="w-5 h-5 text-gray-600" />
                    ) : (
                        <BsChevronBarDown className="w-5 h-5 text-gray-600" />
                    )}
                </button>

                {isActive && (
                    <div className="p-6 bg-white border-t border-gray-100 animate-in slide-in-from-top-2 duration-300">
                        {children}
                    </div>
                )}
            </div>
        );
    };

    const graphAccordions = () => (
        <div className=" w-full p-6 bg-gray-50 min-h-fit">
            <div className="mb-8">
                <h1 className="text-xl font-bold text-gray-800 mb-2">Tableau de bord d&apos;analyse</h1>
                <p className="text-gray-600">Analyse comparative des performances par agence</p>
            </div>

            {/* Section 1: Pourcentage des clients par Site */}
            <AccordionItem
                section="clientPercentage"
                title="Pourcentage des clients par agence"
                icon={AiFillPieChart}
            >
                <div className="space-y-4 h-[625px] flex justify-center">
                    {
                        filter == false ? <Doughnut
                            data={{
                                labels: result?.appointmentsByOffice.map(record => record.name),
                                datasets: [{
                                    label: 'Le nombre de tickets en pourcentage',
                                    data: result?.appointmentsByOffice.map(record => (record.amount * 100) / result.totalAppointments),
                                    backgroundColor: generateColorPalette(result?.appointmentsByOffice.length ?? 0),
                                    borderColor: generateColorPalette(result?.appointmentsByOffice.length ?? 0),
                                    borderWidth: 1
                                }]
                            }}
                        />
                            :
                            <Doughnut
                                data={{
                                    labels: filterStats?.appointmentsByOffice.map(record => record.name),
                                    datasets: [{
                                        label: 'Le nombre de tickets en pourcentage',
                                        data: filterStats?.appointmentsByOffice.map(record => (record.amount * 100) / filterStats.totalAppointments),
                                        backgroundColor: generateColorPalette(filterStats?.appointmentsByOffice.length),
                                        borderColor: generateColorPalette(filterStats?.appointmentsByOffice.length),
                                        borderWidth: 1
                                    }]
                                }}
                            />
                    }
                </div>
            </AccordionItem>

            {/* Section 2: Tableau comparatif général des agences */}
            <AccordionItem
                section="generalComparison"
                title="Tableau comparatif général des agences"
                icon={MdBarChart}
            >
                <div className="overflow-x-auto">
                    <table className="w-full table-fixed">
                        <thead>
                            <tr className=" bg-black">
                                <th className="w-1/2 px-3 py-4 text-left text-white text-xs font-semibold">Agence</th>
                                <th className="w-1/4 py-4 text-left text-white text-xs font-semibold">Temps Moyen d&rsquo;Attente %</th>
                                <th className="w-1/3 py-4 text-left text-white text-xs font-semibold">Temps Moyen de Ttraitement %</th>
                                <th className="w-1/4 py-4 text-left text-white text-xs font-semibold">Nombre Tickets %</th>
                            </tr>
                        </thead>
                        {filter == false ? <> {
                            result?.totalByOffices?.map((appointment) => (
                                <tr key={appointment.name} className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600">
                                    <td className='text-xs py-2 px-1 font-semibold'>
                                        {appointment.name}
                                    </td>
                                    <td className=' text-xs opacity-60'>
                                        {((appointment.meanWaitingTime / result.totalByOffices?.reduce((total, item) => total + item.meanWaitingTime, 0)) * 100).toFixed(1)}%
                                    </td>
                                    <td className=' text-xs opacity-60'>
                                        {((appointment.meanServingTime / result.totalByOffices?.reduce((total, item) => total + item.meanServingTime, 0)) * 100).toFixed(1)}%
                                    </td>
                                    <td className=' text-xs opacity-60'>
                                        {((appointment.receives / result.totalByOffices?.reduce((total, item) => total + item.receives, 0)) * 100).toFixed(1)}%
                                    </td>
                                </tr>
                            ))}
                            <tr className="bg-green-600 text-white ">
                                <td className='text-xs py-2 px-3 font-semibold'>
                                    Total
                                </td>
                                <td className=' text-xs'>
                                    {(result?.totalByOffices?.reduce((total, item) => total + item.receives, 0) / result?.totalByOffices?.reduce((total, item) => total + item.receives, 0)) * 100}%
                                </td>
                                <td className=' text-xs'>
                                    {(result?.totalByOffices?.reduce((total, item) => total + item.meanWaitingTime, 0) / result?.totalByOffices?.reduce((total, item) => total + item.meanWaitingTime, 0)) * 100}%
                                </td>
                                <td className=' text-xs'>
                                    {(result?.totalByOffices?.reduce((total, item) => total + item.meanServingTime, 0) / result?.totalByOffices?.reduce((total, item) => total + item.meanServingTime, 0)) * 100}%
                                </td>
                            </tr>
                        </> : <>
                            {
                                filterStats.totalByOffices?.map((appointment) => (
                                    <tr key={appointment.name} className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600">
                                        <td className='text-xs py-2 px-1 font-semibold'>
                                            {appointment.name}
                                        </td>
                                        <td className=' text-xs opacity-60'>
                                            {((appointment.meanWaitingTime / filterStats.totalByOffices?.reduce((total, item) => total + item.meanWaitingTime, 0)) * 100).toFixed(1)}%
                                        </td>
                                        <td className=' text-xs opacity-60'>
                                            {((appointment.meanServingTime / filterStats.totalByOffices?.reduce((total, item) => total + item.meanServingTime, 0)) * 100).toFixed(1)}%
                                        </td>
                                        <td className=' text-xs opacity-60'>
                                            {((appointment.receives / filterStats.totalByOffices?.reduce((total, item) => total + item.receives, 0)) * 100).toFixed(1)}%
                                        </td>
                                    </tr>
                                ))}
                            <tr className="bg-green-600 text-white ">
                                <td className='text-xs py-2 px-3 font-semibold'>
                                    Total
                                </td>
                                <td className=' text-xs'>
                                    {(filterStats.totalByOffices?.reduce((total, item) => total + item.receives, 0) / filterStats.totalByOffices?.reduce((total, item) => total + item.receives, 0)) * 100}%
                                </td>
                                <td className=' text-xs'>
                                    {(filterStats.totalByOffices?.reduce((total, item) => total + item.meanWaitingTime, 0) / filterStats.totalByOffices?.reduce((total, item) => total + item.meanWaitingTime, 0)) * 100}%
                                </td>
                                <td className=' text-xs'>
                                    {(filterStats.totalByOffices?.reduce((total, item) => total + item.meanServingTime, 0) / filterStats.totalByOffices?.reduce((total, item) => total + item.meanServingTime, 0)) * 100}%
                                </td>
                            </tr>
                        </>
                        }
                    </table>
                </div>
            </AccordionItem>

            {/* Section 3: Tableau comparatif général des affluences */}
            <AccordionItem
                section="affluenceComparison"
                title="Tableau comparatif général des affluences"
                icon={IoTrendingUpOutline}
            >
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="bg-black">
                                <th className="px-3 py-2 text-left text-white text-xs font-semibold whitespace-nowrap min-w-[60px]">Heure</th>
                                {
                                    result?.appointmentsByHourSlot[0].data.map((office) => (
                                        <th key={office.name} className="px-1 text-white text-xs font-semibold text-center" style={{ height: '90px', verticalAlign: 'bottom', paddingBottom: '8px' }}>
                                            <span style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)', display: 'inline-block', whiteSpace: 'nowrap' }}>{office.name}</span>
                                        </th>
                                    ))
                                }
                                <th className="px-3 py-2 bg-green-500 text-left text-white text-xs font-semibold whitespace-nowrap min-w-[50px]">Total</th>
                            </tr>
                        </thead>
                        {result && result.appointmentsByHourSlot.length > 0 && filter == false ? <> {
                            result?.appointmentsByHourSlot.map((appointment) => (
                                <tr key={appointment.time} className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600">
                                    <td className='text-xs py-2 px-1 font-semibold'>
                                        {appointment.time}
                                    </td>
                                    {
                                        appointment.data.map((office) => (
                                            <td key={office.name} className=' text-xs opacity-60'>
                                                {office.amount}
                                            </td>
                                        ))
                                    }
                                    <td className=' text-xs px-3 bg-green-500 text-white'>
                                        {appointment.data.reduce((total, item) => total + item.amount, 0)}
                                    </td>
                                </tr>
                            ))
                        }
                            <tr className="bg-green-600 text-white ">
                                <td className='text-xs py-2 px-3 font-semibold'>
                                    Total
                                </td>
                                {result.appointmentsByHourSlot[0].data.map((office, index) => {
                                    const total = result.appointmentsByHourSlot.reduce((sum, item) => {
                                        return sum + item.data[index].amount;
                                    }, 0);

                                    return (
                                        <td key={index} className='text-xs text-white'>
                                            {total}
                                        </td>
                                    );
                                })}
                                {
                                    <td className='text-xs px-3 text-white'>
                                        {
                                            result.appointmentsByHourSlot.reduce((sum, hourSlot) => {
                                                return sum + hourSlot.data.reduce((s, office) => s + office.amount, 0);
                                            }, 0)
                                        }
                                    </td>
                                }

                            </tr>
                        </> : <>
                            {
                                filterStats.appointmentsByHourSlot.map((appointment) => (
                                    <tr key={appointment.time} className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600">
                                        <td className='text-xs py-2 px-1 font-semibold'>
                                            {appointment.time}
                                        </td>
                                        {
                                            appointment.data.map((office) => (
                                                <td key={office.name} className=' text-xs opacity-60'>
                                                    {office.amount}
                                                </td>
                                            ))
                                        }
                                        <td className=' text-xs px-3 bg-green-500 text-white'>
                                            {appointment.data.reduce((total, item) => total + item.amount, 0)}
                                        </td>
                                    </tr>
                                ))
                            }
                            <tr className="bg-green-600 text-white ">
                                <td className='text-xs py-2 px-3 font-semibold'>
                                    Total
                                </td>
                                {filterStats.appointmentsByHourSlot[0].data.map((office, index) => {
                                    const total = filterStats.appointmentsByHourSlot.reduce((sum, item) => {
                                        return sum + item.data[index].amount;
                                    }, 0);

                                    return (
                                        <td key={index} className='text-xs text-white'>
                                            {total}
                                        </td>
                                    );
                                })}
                                {
                                    <td className='text-xs px-3 text-white'>
                                        {
                                            filterStats.appointmentsByHourSlot.reduce((sum, hourSlot) => {
                                                return sum + hourSlot.data.reduce((s, office) => s + office.amount, 0);
                                            }, 0)
                                        }
                                    </td>
                                }

                            </tr>
                        </>
                        }

                    </table>
                </div>
            </AccordionItem>

            {/* Section 4: Tableau comparatif général des attentes */}
            <AccordionItem
                section="waitingComparison"
                title="Tableau comparatif général des attentes"
                icon={GoClock}
            >
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="bg-black">
                                <th className="px-3 py-2 text-left text-white text-xs font-semibold whitespace-nowrap min-w-[60px]">Heure</th>
                                {
                                    result?.appointmentsByHourSlot[0].data.map((office) => (
                                        <th key={office.name} className="px-1 text-white text-xs font-semibold text-center" style={{ height: '90px', verticalAlign: 'bottom', paddingBottom: '8px' }}>
                                            <span style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)', display: 'inline-block', whiteSpace: 'nowrap' }}>{office.name}</span>
                                        </th>
                                    ))
                                }
                                <th className="px-3 py-2 bg-green-500 text-left text-white text-xs font-semibold whitespace-nowrap min-w-[50px]">Total</th>
                            </tr>
                        </thead>
                        {
                            waitingAppointmentsOfficeByHourSlot.length > 0 && waitingAppointmentsOfficeByHourSlot.map((appointment) => (
                                <tr key={appointment.time} className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600">
                                    <td className='text-xs py-2 px-1 font-semibold'>
                                        {appointment.time}
                                    </td>
                                    {
                                        appointment.data.map((office) => (
                                            <td key={office.name} className=' text-xs opacity-60'>
                                                {office.amount}
                                            </td>
                                        ))
                                    }
                                    <td className=' text-xs px-3 bg-green-500 text-white'>
                                        {appointment.data.reduce((total, item) => total + item.amount, 0)}
                                    </td>
                                </tr>
                            ))
                        }
                        <tr className="bg-green-600 text-white ">
                            <td className='text-xs py-2 px-3 font-semibold'>
                                Total
                            </td>
                            {waitingAppointmentsOfficeByHourSlot.length > 0 && waitingAppointmentsOfficeByHourSlot[0].data.map((office, index) => {
                                const total = waitingAppointmentsOfficeByHourSlot.reduce((sum, item) => {
                                    return sum + item.data[index].amount;
                                }, 0);

                                return (
                                    <td key={index} className='text-xs text-white'>
                                        {total}
                                    </td>
                                );
                            })}
                            {
                                <td className='text-xs px-3 text-white'>
                                    {
                                        waitingAppointmentsOfficeByHourSlot.reduce((sum, hourSlot) => {
                                            return sum + hourSlot.data.reduce((s, office) => s + office.amount, 0);
                                        }, 0)
                                    }
                                </td>
                            }

                        </tr>
                    </table>
                </div>
            </AccordionItem>

            {/* Section 5: Tableau comparatif général des traitements */}
            <AccordionItem
                section="treatmentComparison"
                title="Tableau comparatif général des traitements"
                icon={FaUsers}
            >
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="bg-black">
                                <th className="px-3 py-2 text-left text-white text-xs font-semibold whitespace-nowrap min-w-[60px]">Heure</th>
                                {
                                    result?.servingAppointmentsByHourSlot[0].data.map((office) => (
                                        <th key={office.name} className="px-1 text-white text-xs font-semibold text-center" style={{ height: '90px', verticalAlign: 'bottom', paddingBottom: '8px' }}>
                                            <span style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)', display: 'inline-block', whiteSpace: 'nowrap' }}>{office.name}</span>
                                        </th>
                                    ))
                                }
                                <th className="px-3 py-2 bg-green-500 text-left text-white text-xs font-semibold whitespace-nowrap min-w-[50px]">Total</th>
                            </tr>
                        </thead>
                        {result && result.servingAppointmentsByHourSlot.length > 0 && filter == false ? <> {
                            result.servingAppointmentsByHourSlot.map((appointment) => (
                                <tr key={appointment.time} className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600">
                                    <td className='text-xs py-2 px-1 font-semibold'>
                                        {appointment.time}
                                    </td>
                                    {
                                        appointment.data.map((office) => (
                                            <td key={office.name} className=' text-xs opacity-60'>
                                                {office.amount}
                                            </td>
                                        ))
                                    }
                                    <td className=' text-xs px-3 bg-green-500 text-white'>
                                        {appointment.data.reduce((total, item) => total + item.amount, 0)}
                                    </td>
                                </tr>
                            ))
                        }
                            <tr className="bg-green-600 text-white ">
                                <td className='text-xs py-2 px-3 font-semibold'>
                                    Total
                                </td>
                                {result.servingAppointmentsByHourSlot[0].data.map((office, index) => {
                                    const total = result.servingAppointmentsByHourSlot.reduce((sum, item) => {
                                        return sum + item.data[index].amount;
                                    }, 0);

                                    return (
                                        <td key={index} className='text-xs text-white'>
                                            {total}
                                        </td>
                                    );
                                })}
                                {
                                    <td className='text-xs px-3 text-white'>
                                        {
                                            result.servingAppointmentsByHourSlot.reduce((sum, hourSlot) => {
                                                return sum + hourSlot.data.reduce((s, office) => s + office.amount, 0);
                                            }, 0)
                                        }
                                    </td>
                                }

                            </tr>
                        </> : <>
                            {
                                filterStats.servingAppointmentsByHourSlot.map((appointment) => (
                                    <tr key={appointment.time} className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600">
                                        <td className='text-xs py-2 px-1 font-semibold'>
                                            {appointment.time}
                                        </td>
                                        {
                                            appointment.data.map((office) => (
                                                <td key={office.name} className=' text-xs opacity-60'>
                                                    {office.amount}
                                                </td>
                                            ))
                                        }
                                        <td className=' text-xs px-3 bg-green-500 text-white'>
                                            {appointment.data.reduce((total, item) => total + item.amount, 0)}
                                        </td>
                                    </tr>
                                ))
                            }
                            <tr className="bg-green-600 text-white ">
                                <td className='text-xs py-2 px-3 font-semibold'>
                                    Total
                                </td>
                                {filterStats.servingAppointmentsByHourSlot[0].data.map((office, index) => {
                                    const total = filterStats.servingAppointmentsByHourSlot.reduce((sum, item) => {
                                        return sum + item.data[index].amount;
                                    }, 0);

                                    return (
                                        <td key={index} className='text-xs text-white'>
                                            {total}
                                        </td>
                                    );
                                })}
                                {
                                    <td className='text-xs px-3 text-white'>
                                        {
                                            filterStats.servingAppointmentsByHourSlot.reduce((sum, hourSlot) => {
                                                return sum + hourSlot.data.reduce((s, office) => s + office.amount, 0);
                                            }, 0)
                                        }
                                    </td>
                                }

                            </tr>
                        </>
                        }
                    </table>
                </div>
            </AccordionItem>

            {/* Section 6: Opérations en normes */}
            <AccordionItem
                section="inStandardOperations"
                title="Tableau comparatif des agences - Opérations en normes"
                icon={IoIosTrendingUp}
            >
                <div className="overflow-x-auto">
                    <table className="w-full table-fixed">
                        <thead>
                            <tr className=" bg-black">
                                <th className="w-1/2 px-3 py-4 text-left text-white text-xs font-semibold">Agence</th>
                                <th className="w-1/4 py-4 text-left text-white text-xs font-semibold">Attente %</th>
                                <th className="w-1/3 py-4 text-left text-white text-xs font-semibold">Ttraitement %</th>
                                <th className="w-1/4 py-4 text-left text-white text-xs font-semibold">Nombre Tickets %</th>
                            </tr>
                        </thead>
                        {filter == false ? <> {
                            result?.totalInTimeByOffice?.map((appointment) => (
                                <tr key={appointment.name} className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600">
                                    <td className='text-xs py-2 px-1 font-semibold'>
                                        {appointment.name}
                                    </td>
                                    <td className=' text-xs opacity-60'>
                                        {((appointment.waitings / result.totalInTimeByOffice?.reduce((total, item) => total + item.waitings, 0)) * 100).toFixed(1)}%
                                    </td>
                                    <td className=' text-xs opacity-60'>
                                        {((appointment.serves / result.totalInTimeByOffice?.reduce((total, item) => total + item.serves, 0)) * 100).toFixed(1)}%
                                    </td>
                                    <td className=' text-xs opacity-60'>
                                        {((appointment.receives / result.totalInTimeByOffice?.reduce((total, item) => total + item.receives, 0)) * 100).toFixed(1)}%
                                    </td>
                                </tr>
                            ))}
                            <tr className="bg-green-600 text-white ">
                                <td className='text-xs py-2 px-3 font-semibold'>
                                    Total
                                </td>
                                <td className=' text-xs'>
                                    {(result?.totalInTimeByOffice?.reduce((total, item) => total + item.waitings, 0) / result?.totalInTimeByOffice?.reduce((total, item) => total + item.waitings, 0)) * 100}%
                                </td>
                                <td className=' text-xs'>
                                    {(result?.totalInTimeByOffice?.reduce((total, item) => total + item.serves, 0) / result?.totalInTimeByOffice?.reduce((total, item) => total + item.serves, 0)) * 100}%
                                </td>
                                <td className=' text-xs'>
                                    {(result?.totalInTimeByOffice?.reduce((total, item) => total + item.receives, 0) / result?.totalInTimeByOffice?.reduce((total, item) => total + item.receives, 0)) * 100}%
                                </td>
                            </tr>
                        </> : <>
                            {
                                filterStats.totalInTimeByOffice?.map((appointment) => (
                                    <tr key={appointment.name} className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600">
                                        <td className='text-xs py-2 px-1 font-semibold'>
                                            {appointment.name}
                                        </td>
                                        <td className=' text-xs opacity-60'>
                                            {((appointment.waitings / filterStats.totalInTimeByOffice?.reduce((total, item) => total + item.waitings, 0)) * 100).toFixed(1)}%
                                        </td>
                                        <td className=' text-xs opacity-60'>
                                            {((appointment.serves / filterStats.totalInTimeByOffice?.reduce((total, item) => total + item.serves, 0)) * 100).toFixed(1)}%
                                        </td>
                                        <td className=' text-xs opacity-60'>
                                            {((appointment.receives / filterStats.totalInTimeByOffice?.reduce((total, item) => total + item.receives, 0)) * 100).toFixed(1)}%
                                        </td>
                                    </tr>
                                ))}
                            <tr className="bg-green-600 text-white ">
                                <td className='text-xs py-2 px-3 font-semibold'>
                                    Total
                                </td>
                                <td className=' text-xs'>
                                    {(filterStats.totalInTimeByOffice?.reduce((total, item) => total + item.waitings, 0) / filterStats.totalInTimeByOffice?.reduce((total, item) => total + item.waitings, 0)) * 100}%
                                </td>
                                <td className=' text-xs'>
                                    {(filterStats.totalInTimeByOffice?.reduce((total, item) => total + item.serves, 0) / filterStats.totalInTimeByOffice?.reduce((total, item) => total + item.serves, 0)) * 100}%
                                </td>
                                <td className=' text-xs'>
                                    {(filterStats.totalInTimeByOffice?.reduce((total, item) => total + item.receives, 0) / filterStats.totalInTimeByOffice?.reduce((total, item) => total + item.receives, 0)) * 100}%
                                </td>
                            </tr>
                        </>
                        }
                    </table>
                </div>
            </AccordionItem>

            {/* Section 7: Opérations hors normes */}
            <AccordionItem
                section="outStandardOperations"
                title="Tableau comparatif des agences - Opérations hors normes"
                icon={CiCircleAlert}
            >
                <div className="overflow-x-auto">
                    <table className="w-full table-fixed">
                        <thead>
                            <tr className=" bg-black">
                                <th className="w-1/2 px-3 py-4 text-left text-white text-xs font-semibold">Agence</th>
                                <th className="w-1/4 py-4 text-left text-white text-xs font-semibold">Attente %</th>
                                <th className="w-1/3 py-4 text-left text-white text-xs font-semibold">Ttraitement %</th>
                                <th className="w-1/4 py-4 text-left text-white text-xs font-semibold">Nombre Tickets %</th>
                            </tr>
                        </thead>
                        {filter == false ? <> {
                            result?.totalNotInTimeByOffice?.map((appointment) => (
                                <tr key={appointment.name} className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600">
                                    <td className='text-xs py-2 px-1 font-semibold'>
                                        {appointment.name}
                                    </td>
                                    <td className=' text-xs opacity-60'>
                                        {((appointment.waitings / result.totalNotInTimeByOffice?.reduce((total, item) => total + item.waitings, 0)) * 100).toFixed(1)}%
                                    </td>
                                    <td className=' text-xs opacity-60'>
                                        {((appointment.serves / result.totalNotInTimeByOffice?.reduce((total, item) => total + item.serves, 0)) * 100).toFixed(1)}%
                                    </td>
                                    <td className=' text-xs opacity-60'>
                                        {((appointment.receives / result.totalNotInTimeByOffice?.reduce((total, item) => total + item.receives, 0)) * 100).toFixed(1)}%
                                    </td>
                                </tr>
                            ))}
                            <tr className="bg-green-600 text-white ">
                                <td className='text-xs py-2 px-3 font-semibold'>
                                    Total
                                </td>
                                <td className=' text-xs'>
                                    {(result?.totalNotInTimeByOffice?.reduce((total, item) => total + item.waitings, 0) / result?.totalNotInTimeByOffice?.reduce((total, item) => total + item.waitings, 0)) * 100}%
                                </td>
                                <td className=' text-xs'>
                                    {(result?.totalNotInTimeByOffice?.reduce((total, item) => total + item.serves, 0) / result?.totalNotInTimeByOffice?.reduce((total, item) => total + item.serves, 0)) * 100}%
                                </td>
                                <td className=' text-xs'>
                                    {(result?.totalNotInTimeByOffice?.reduce((total, item) => total + item.receives, 0) / result?.totalNotInTimeByOffice?.reduce((total, item) => total + item.receives, 0)) * 100}%
                                </td>
                            </tr>
                        </> : <>
                            {
                                filterStats.totalNotInTimeByOffice?.map((appointment) => (
                                    <tr key={appointment.name} className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600">
                                        <td className='text-xs py-2 px-1 font-semibold'>
                                            {appointment.name}
                                        </td>
                                        <td className=' text-xs opacity-60'>
                                            {((appointment.waitings / filterStats.totalNotInTimeByOffice?.reduce((total, item) => total + item.waitings, 0)) * 100).toFixed(1)}%
                                        </td>
                                        <td className=' text-xs opacity-60'>
                                            {((appointment.serves / filterStats.totalNotInTimeByOffice?.reduce((total, item) => total + item.serves, 0)) * 100).toFixed(1)}%
                                        </td>
                                        <td className=' text-xs opacity-60'>
                                            {((appointment.receives / filterStats.totalNotInTimeByOffice?.reduce((total, item) => total + item.receives, 0)) * 100).toFixed(1)}%
                                        </td>
                                    </tr>
                                ))
                            }
                            <tr className="bg-green-600 text-white ">
                                <td className='text-xs py-2 px-3 font-semibold'>
                                    Total
                                </td>
                                <td className=' text-xs'>
                                    {(filterStats.totalNotInTimeByOffice?.reduce((total, item) => total + item.waitings, 0) / filterStats.totalNotInTimeByOffice?.reduce((total, item) => total + item.waitings, 0)) * 100}%
                                </td>
                                <td className=' text-xs'>
                                    {(filterStats.totalNotInTimeByOffice?.reduce((total, item) => total + item.serves, 0) / filterStats.totalNotInTimeByOffice?.reduce((total, item) => total + item.serves, 0)) * 100}%
                                </td>
                                <td className=' text-xs'>
                                    {(filterStats.totalNotInTimeByOffice?.reduce((total, item) => total + item.receives, 0) / filterStats.totalNotInTimeByOffice?.reduce((total, item) => total + item.receives, 0)) * 100}%
                                </td>
                            </tr>
                        </>
                        }
                    </table>
                </div>
            </AccordionItem>
        </div>
    );

    const generateColorPalette = (numColors: number): string[] => {
        const colors = [];
        for (let i = 0; i < numColors; i++) {
            // Générer des couleurs aléatoires en utilisant des valeurs RGB
            const r = Math.floor(Math.random() * 256);
            const g = Math.floor(Math.random() * 256);
            const b = Math.floor(Math.random() * 256);
            colors.push(`rgb(${r}, ${g}, ${b})`);
        }
        return colors;
    };

    // Fonction pour convertir les minutes en format HH:MM:SS
    const formatMinutesToTime = (minutes: number): string => {
        const hours = Math.floor(minutes / 60);
        const mins = Math.floor(minutes % 60);
        const secs = Math.floor((minutes * 60) % 60);
        return `${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
    };

    const getReceivesByName = (name: string): number => {
        const data = filter === false ? result?.totalInTimeByOffice : filterStats?.totalInTimeByOffice;
        return data?.find(o => o.name === name)?.receives ?? 0;
    };

    const isAboveThreshold = (name: string): boolean => {
        if (ticketThreshold === 0) return true;
        return getReceivesByName(name) >= ticketThreshold;
    };

    const barColor = (name: string, baseColor: string): string =>
        isAboveThreshold(name) ? baseColor : 'rgba(200,200,200,0.2)';

    const pointColor = (name: string): string =>
        isAboveThreshold(name) ? 'rgba(0,0,0,1)' : 'rgba(200,200,200,0.3)';

    const isSunday = (date: Date) => {
        const today = new Date(date);
        const dayOfWeek = today.getDay();
        return dayOfWeek === 0;
    };


    if (isLoading || loading || !result) {
        return <Loader />
    }

    if (error) {
        return <p className=" text-center text-xs text-red-500">Vérifie votre connexion</p>
    }

    if ((filter && isSunday(startDate) && endDate === null) || (!filter && isSunday(now))) {
        return <div className=' h-screen bg-gray-200 w-full overflow-y-scroll rounded-t-xl px-4 py-3'>
            <div className=" w-full flex items-center justify-between">
                <div className="flex gap-3 items-center">
                    <button className=' bg-red-200 text-xs flex gap-2 items-center rounded-md py-2 px-3' aria-controls="fade-menu-filter" aria-haspopup="true" onClick={handleYearClickFilter}>
                        <CiFilter />
                        <p className=' font-semibold' >Filtrer par année</p>
                    </button>
                    <Menu
                        id="fade-menu-filter"
                        anchorEl={anchorYearElFilter}
                        keepMounted
                        open={openYearMenuFilter}
                        onClose={handleCloseYearMenuFilter}
                        className=' rounded-xl'
                    >
                        {
                            result?.years?.map((year) => (
                                <MenuItem key={year} onClick={() => handleFilter(year.toString())} className=' bg-gray-200 text-gray-500 mx-2 my-1 rounded-full text-xs text-center hover:bg-black hover:text-white'>{year}</MenuItem>
                            ))
                        }
                    </Menu>
                    <button className=' bg-green-200 text-xs flex gap-2 items-center rounded-md py-2 px-3' aria-controls="fade-menu-filter" aria-haspopup="true" onClick={handleMonthClickFilter}>
                        <CiFilter />
                        <p className=' font-semibold' >Filtrer par mois</p>
                    </button>
                    <Menu
                        id="fade-menu-filter"
                        anchorEl={anchorMonthElFilter}
                        keepMounted
                        open={openMonthMenuFilter}
                        onClose={handleCloseMonthMenuFilter}
                        className=' rounded-xl'
                    >
                        {
                            result?.months?.map((month) => (
                                <MenuItem key={month} onClick={() => handleFilter(format(month, 'MM/yyyy'))} className=' bg-gray-200 text-gray-500 mx-2 my-1 rounded-full text-xs text-center hover:bg-black hover:text-white'>{format(month, 'MMMM yyyy', { locale: fr })}</MenuItem>
                            ))
                        }
                    </Menu>
                    <button className=' bg-gray-300 text-xs flex gap-2 items-center rounded-md py-2 px-3' aria-controls="fade-menu-filter" aria-haspopup="true" onClick={handleWeekClickFilter}>
                        <CiFilter />
                        <p className=' font-semibold' >Filtrer par semaine</p>
                    </button>
                    <Menu
                        id="fade-menu-filter"
                        anchorEl={anchorWeekElFilter}
                        keepMounted
                        open={openWeekMenuFilter}
                        onClose={handleCloseWeekMenuFilter}
                        className=' rounded-xl'
                    >

                        <MenuItem onClick={() => handleWeekFilter(result.weeks[0].split('-')[0], result.weeks[0].split('-')[1])} className=' bg-gray-200 text-gray-500 mx-2 my-1 rounded-full text-xs text-center hover:bg-black hover:text-white'>Cette semaine</MenuItem>
                        <MenuItem onClick={() => handleWeekFilter(result.weeks[1].split('-')[0], result.weeks[1].split('-')[1])} className=' bg-gray-200 text-gray-500 mx-2 my-1 rounded-full text-xs text-center hover:bg-black hover:text-white'>La semaine passée</MenuItem>
                    </Menu>
                    <button className=' bg-yellow-200 text-xs flex gap-2 items-center rounded-md py-2 px-3' aria-controls="fade-menu-filter" aria-haspopup="true" onClick={handleRangeClickFilter}>
                        <CiFilter />
                        <p className=' font-semibold' >Filtrer par date</p>
                    </button>
                    <Menu
                        id="fade-menu-filter"
                        anchorEl={anchorRangeElFilter}
                        keepMounted
                        open={openRangeMenuFilter}
                        onClose={handleCloseRangeMenuFilter}
                        className=' rounded-xl'
                    >
                        <div className=" p-2">
                            <DatePicker
                                locale={fr}
                                selected={startDate}
                                onChange={onChange}
                                startDate={startDate}
                                endDate={endDate}
                                selectsRange
                                inline
                            />
                            <br />
                            <button onClick={() => {
                                if (endDate === null) {
                                    handleCloseRangeMenuFilter();
                                    handleFilter(formattedStartDate);
                                } else {
                                    handleCloseRangeMenuFilter();
                                    handleWeekFilter(formattedStartDate, formattedEndDate);
                                }
                            }} className=" w-full bg-black text-xs text-white py-2 rounded-md hover:bg-green-500">Valider</button>
                        </div>
                    </Menu>
                    <div className=" bg-blue-200 h-8 rounded-md flex items-center gap-2 px-3 text-xs font-semibold cursor-pointer" onClick={() => {
                        setFilter(false);
                        setCurrentDate(`Aujourd'hui : ${format(`${now.toLocaleDateString('fr-FR').split('/')[1]}/${now.toLocaleDateString('fr-FR').split('/')[0]}/${now.toLocaleDateString('fr-FR').split('/')[2]}`, 'EEEE dd MMMM yyyy', { locale: fr })}`);
                        setDescription(`Ceci represente l'ensemble des données de toutes les agences pour la date d'aujourd'hui ${new Date().toLocaleDateString('fr-FR')}`);
                        setWaitingAppointmentsOfficeByHourSlot(calculateWaitings(result.appointmentsByHourSlot, result.servingAppointmentsByHourSlot));
                    }}>
                        <IoReload />
                        <p>Aujourd&rsquo;hui</p>
                    </div>

                </div>

                <button onClick={exportToExcel} className=" bg-green-700 rounded-md py-2 px-3 text-white text-xs flex items-center gap-2"><RiFileExcel2Fill />Exporter</button>
            </div>

            <div className=" w-full mt-28  text-center">
                <div className="bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200 rounded-xl p-8 shadow-sm">
                    <div className="flex justify-center mb-4">
                        <div className="bg-amber-100 p-3 rounded-full">
                            <AiOutlineWarning className="w-8 h-8 text-amber-600" />
                        </div>
                    </div>

                    <h3 className="text-xl font-semibold text-gray-900 mb-3">
                        Données indisponibles pour : {currentDate}
                    </h3>

                    <p className="text-gray-600 mb-6 leading-relaxed">
                        Cette date correspond à un dimanche.
                    </p>
                </div>
            </div>
        </div>
    }

    if (filter && filterStats.appointments <= 70 && filterStats.appointments > 0) {
        return <div className=' h-screen bg-gray-200 w-full overflow-y-scroll rounded-t-xl px-4 py-3'>
            <div className=" w-full flex items-center justify-between">
                <div className="flex gap-3 items-center">
                    <button className=' bg-red-200 text-xs flex gap-2 items-center rounded-md py-2 px-3' aria-controls="fade-menu-filter" aria-haspopup="true" onClick={handleYearClickFilter}>
                        <CiFilter />
                        <p className=' font-semibold' >Filtrer par année</p>
                    </button>
                    <Menu
                        id="fade-menu-filter"
                        anchorEl={anchorYearElFilter}
                        keepMounted
                        open={openYearMenuFilter}
                        onClose={handleCloseYearMenuFilter}
                        className=' rounded-xl'
                    >
                        {
                            result?.years?.map((year) => (
                                <MenuItem key={year} onClick={() => handleFilter(year.toString())} className=' bg-gray-200 text-gray-500 mx-2 my-1 rounded-full text-xs text-center hover:bg-black hover:text-white'>{year}</MenuItem>
                            ))
                        }
                    </Menu>
                    <button className=' bg-green-200 text-xs flex gap-2 items-center rounded-md py-2 px-3' aria-controls="fade-menu-filter" aria-haspopup="true" onClick={handleMonthClickFilter}>
                        <CiFilter />
                        <p className=' font-semibold' >Filtrer par mois</p>
                    </button>
                    <Menu
                        id="fade-menu-filter"
                        anchorEl={anchorMonthElFilter}
                        keepMounted
                        open={openMonthMenuFilter}
                        onClose={handleCloseMonthMenuFilter}
                        className=' rounded-xl'
                    >
                        {
                            result?.months?.map((month) => (
                                <MenuItem key={month} onClick={() => handleFilter(format(month, 'MM/yyyy'))} className=' bg-gray-200 text-gray-500 mx-2 my-1 rounded-full text-xs text-center hover:bg-black hover:text-white'>{format(month, 'MMMM yyyy', { locale: fr })}</MenuItem>
                            ))
                        }
                    </Menu>
                    <button className=' bg-gray-300 text-xs flex gap-2 items-center rounded-md py-2 px-3' aria-controls="fade-menu-filter" aria-haspopup="true" onClick={handleWeekClickFilter}>
                        <CiFilter />
                        <p className=' font-semibold' >Filtrer par semaine</p>
                    </button>
                    <Menu
                        id="fade-menu-filter"
                        anchorEl={anchorWeekElFilter}
                        keepMounted
                        open={openWeekMenuFilter}
                        onClose={handleCloseWeekMenuFilter}
                        className=' rounded-xl'
                    >

                        <MenuItem onClick={() => handleWeekFilter(result.weeks[0].split('-')[0], result.weeks[0].split('-')[1])} className=' bg-gray-200 text-gray-500 mx-2 my-1 rounded-full text-xs text-center hover:bg-black hover:text-white'>Cette semaine</MenuItem>
                        <MenuItem onClick={() => handleWeekFilter(result.weeks[1].split('-')[0], result.weeks[1].split('-')[1])} className=' bg-gray-200 text-gray-500 mx-2 my-1 rounded-full text-xs text-center hover:bg-black hover:text-white'>La semaine passée</MenuItem>
                    </Menu>
                    <button className=' bg-yellow-200 text-xs flex gap-2 items-center rounded-md py-2 px-3' aria-controls="fade-menu-filter" aria-haspopup="true" onClick={handleRangeClickFilter}>
                        <CiFilter />
                        <p className=' font-semibold' >Filtrer par date</p>
                    </button>
                    <Menu
                        id="fade-menu-filter"
                        anchorEl={anchorRangeElFilter}
                        keepMounted
                        open={openRangeMenuFilter}
                        onClose={handleCloseRangeMenuFilter}
                        className=' rounded-xl'
                    >
                        <div className=" p-2">
                            <DatePicker
                                locale={fr}
                                selected={startDate}
                                onChange={onChange}
                                startDate={startDate}
                                endDate={endDate}
                                selectsRange
                                inline
                            />
                            <br />
                            <button onClick={() => {
                                if (endDate === null) {
                                    handleCloseRangeMenuFilter();
                                    handleFilter(formattedStartDate);
                                } else {
                                    handleCloseRangeMenuFilter();
                                    handleWeekFilter(formattedStartDate, formattedEndDate);
                                }
                            }} className=" w-full bg-black text-xs text-white py-2 rounded-md hover:bg-green-500">Valider</button>
                        </div>
                    </Menu>
                    <div className=" bg-blue-200 h-8 rounded-md flex items-center gap-2 px-3 text-xs font-semibold cursor-pointer" onClick={() => {
                        setFilter(false);
                        setCurrentDate(`Aujourd'hui : ${format(`${now.toLocaleDateString('fr-FR').split('/')[1]}/${now.toLocaleDateString('fr-FR').split('/')[0]}/${now.toLocaleDateString('fr-FR').split('/')[2]}`, 'EEEE dd MMMM yyyy', { locale: fr })}`);
                        setDescription(`Ceci represente l'ensemble des données de toutes les agences pour la date d'aujourd'hui ${new Date().toLocaleDateString('fr-FR')}`);
                        setWaitingAppointmentsOfficeByHourSlot(calculateWaitings(result.appointmentsByHourSlot, result.servingAppointmentsByHourSlot));
                    }}>
                        <IoReload />
                        <p>Aujourd&rsquo;hui</p>
                    </div>

                </div>

                <button onClick={exportToExcel} className=" bg-green-700 rounded-md py-2 px-3 text-white text-xs flex items-center gap-2"><RiFileExcel2Fill />Exporter</button>
            </div>

            <div className=" w-full mt-28  text-center">
                <div className="bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200 rounded-xl p-8 shadow-sm">
                    <div className="flex justify-center mb-4">
                        <div className="bg-amber-100 p-3 rounded-full">
                            <AiOutlineWarning className="w-8 h-8 text-amber-600" />
                        </div>
                    </div>

                    <h3 className="text-xl font-semibold text-gray-900 mb-3">
                        Données temporairement indisponibles pour : {currentDate}
                    </h3>

                    <p className="text-gray-600 mb-6 leading-relaxed">
                        Nous avons rencontré des difficultés techniques avec nos serveurs à cette date.
                        <br />
                        Nos équipes travaillent activement à synchroniser les données.
                    </p>

                    <div className="mt-6 pt-4 border-t border-amber-200">
                        <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
                            <AiOutlineClockCircle className="w-4 h-4" />
                            <span>Temps de résolution estimé : 24-48 heures</span>
                        </div>
                        <p className="text-xs text-gray-400 mt-2">
                            Si le problème persiste, contactez notre support technique
                        </p>
                    </div>
                </div>
            </div>
        </div>
    }

    if ((filter && filterStats.appointments == 0)) {
        return <div className=' h-screen bg-gray-200 w-full overflow-y-scroll rounded-t-xl px-4 py-3'>
            <div className=" w-full flex items-center justify-between">
                <div className="flex gap-3 items-center">
                    <button className=' bg-red-200 text-xs flex gap-2 items-center rounded-md py-2 px-3' aria-controls="fade-menu-filter" aria-haspopup="true" onClick={handleYearClickFilter}>
                        <CiFilter />
                        <p className=' font-semibold' >Filtrer par année</p>
                    </button>
                    <Menu
                        id="fade-menu-filter"
                        anchorEl={anchorYearElFilter}
                        keepMounted
                        open={openYearMenuFilter}
                        onClose={handleCloseYearMenuFilter}
                        className=' rounded-xl'
                    >
                        {
                            result?.years?.map((year) => (
                                <MenuItem key={year} onClick={() => handleFilter(year.toString())} className=' bg-gray-200 text-gray-500 mx-2 my-1 rounded-full text-xs text-center hover:bg-black hover:text-white'>{year}</MenuItem>
                            ))
                        }
                    </Menu>
                    <button className=' bg-green-200 text-xs flex gap-2 items-center rounded-md py-2 px-3' aria-controls="fade-menu-filter" aria-haspopup="true" onClick={handleMonthClickFilter}>
                        <CiFilter />
                        <p className=' font-semibold' >Filtrer par mois</p>
                    </button>
                    <Menu
                        id="fade-menu-filter"
                        anchorEl={anchorMonthElFilter}
                        keepMounted
                        open={openMonthMenuFilter}
                        onClose={handleCloseMonthMenuFilter}
                        className=' rounded-xl'
                    >
                        {
                            result?.months?.map((month) => (
                                <MenuItem key={month} onClick={() => handleFilter(format(month, 'MM/yyyy'))} className=' bg-gray-200 text-gray-500 mx-2 my-1 rounded-full text-xs text-center hover:bg-black hover:text-white'>{format(month, 'MMMM yyyy', { locale: fr })}</MenuItem>
                            ))
                        }
                    </Menu>
                    <button className=' bg-gray-300 text-xs flex gap-2 items-center rounded-md py-2 px-3' aria-controls="fade-menu-filter" aria-haspopup="true" onClick={handleWeekClickFilter}>
                        <CiFilter />
                        <p className=' font-semibold' >Filtrer par semaine</p>
                    </button>
                    <Menu
                        id="fade-menu-filter"
                        anchorEl={anchorWeekElFilter}
                        keepMounted
                        open={openWeekMenuFilter}
                        onClose={handleCloseWeekMenuFilter}
                        className=' rounded-xl'
                    >

                        <MenuItem onClick={() => handleWeekFilter(result.weeks[0].split('-')[0], result.weeks[0].split('-')[1])} className=' bg-gray-200 text-gray-500 mx-2 my-1 rounded-full text-xs text-center hover:bg-black hover:text-white'>Cette semaine</MenuItem>
                        <MenuItem onClick={() => handleWeekFilter(result.weeks[1].split('-')[0], result.weeks[1].split('-')[1])} className=' bg-gray-200 text-gray-500 mx-2 my-1 rounded-full text-xs text-center hover:bg-black hover:text-white'>La semaine passée</MenuItem>
                    </Menu>
                    <button className=' bg-yellow-200 text-xs flex gap-2 items-center rounded-md py-2 px-3' aria-controls="fade-menu-filter" aria-haspopup="true" onClick={handleRangeClickFilter}>
                        <CiFilter />
                        <p className=' font-semibold' >Filtrer par date</p>
                    </button>
                    <Menu
                        id="fade-menu-filter"
                        anchorEl={anchorRangeElFilter}
                        keepMounted
                        open={openRangeMenuFilter}
                        onClose={handleCloseRangeMenuFilter}
                        className=' rounded-xl'
                    >
                        <div className=" p-2">
                            <DatePicker
                                locale={fr}
                                selected={startDate}
                                onChange={onChange}
                                startDate={startDate}
                                endDate={endDate}
                                selectsRange
                                inline
                            />
                            <br />
                            <button onClick={() => {
                                if (endDate === null) {
                                    handleCloseRangeMenuFilter();
                                    handleFilter(formattedStartDate);
                                } else {
                                    handleCloseRangeMenuFilter();
                                    handleWeekFilter(formattedStartDate, formattedEndDate);
                                }
                            }} className=" w-full bg-black text-xs text-white py-2 rounded-md hover:bg-green-500">Valider</button>
                        </div>
                    </Menu>
                    <div className=" bg-blue-200 h-8 rounded-md flex items-center gap-2 px-3 text-xs font-semibold cursor-pointer" onClick={() => {
                        setFilter(false);
                        setCurrentDate(`Aujourd'hui : ${format(`${now.toLocaleDateString('fr-FR').split('/')[1]}/${now.toLocaleDateString('fr-FR').split('/')[0]}/${now.toLocaleDateString('fr-FR').split('/')[2]}`, 'EEEE dd MMMM yyyy', { locale: fr })}`);
                        setDescription(`Ceci represente l'ensemble des données de toutes les agences pour la date d'aujourd'hui ${new Date().toLocaleDateString('fr-FR')}`);
                        setWaitingAppointmentsOfficeByHourSlot(calculateWaitings(result.appointmentsByHourSlot, result.servingAppointmentsByHourSlot));
                    }}>
                        <IoReload />
                        <p>Aujourd&rsquo;hui</p>
                    </div>

                </div>

                <button onClick={exportToExcel} className=" bg-green-700 rounded-md py-2 px-3 text-white text-xs flex items-center gap-2"><RiFileExcel2Fill />Exporter</button>
            </div>

            <div className=" w-full mt-28  text-center">
                <div className="bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200 rounded-xl p-8 shadow-sm">
                    <div className="flex justify-center mb-4">
                        <div className="bg-amber-100 p-3 rounded-full">
                            <AiOutlineWarning className="w-8 h-8 text-amber-600" />
                        </div>
                    </div>

                    <h3 className="text-xl font-semibold text-gray-900 mb-3">
                        Données indisponibles pour : {currentDate}
                    </h3>

                    <p className="text-gray-600 mb-6 leading-relaxed">
                        Données non disponibles pour cette date. soit c&apos;est un jour férié, soit il y a eu un problème technique.
                        <br />
                        Veuillez réessayer plus tard ou contacter le support technique s&apos;il s&apos;agit d&apos;un problème.
                    </p>

                    <div className="mt-6 pt-4 border-t border-amber-200">
                        <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
                            <AiOutlineClockCircle className="w-4 h-4" />
                            <span>Temps de résolution estimé : 24-48 heures</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    }

    return (
        <div className=' h-screen bg-gray-200 w-full overflow-y-scroll rounded-t-xl px-4 py-3'>
            <div className=" w-full flex items-center justify-between">
                <div className="flex gap-3 items-center">
                    <button className=' bg-red-200 text-xs flex gap-2 items-center rounded-md py-2 px-3' aria-controls="fade-menu-filter" aria-haspopup="true" onClick={handleYearClickFilter}>
                        <CiFilter />
                        <p className=' font-semibold' >Filtrer par année</p>
                    </button>
                    <Menu
                        id="fade-menu-filter"
                        anchorEl={anchorYearElFilter}
                        keepMounted
                        open={openYearMenuFilter}
                        onClose={handleCloseYearMenuFilter}
                        className=' rounded-xl'
                    >
                        {
                            result?.years?.map((year) => (
                                <MenuItem key={year} onClick={() => handleFilter(year.toString())} className=' bg-gray-200 text-gray-500 mx-2 my-1 rounded-full text-xs text-center hover:bg-black hover:text-white'>{year}</MenuItem>
                            ))
                        }
                    </Menu>
                    <button className=' bg-green-200 text-xs flex gap-2 items-center rounded-md py-2 px-3' aria-controls="fade-menu-filter" aria-haspopup="true" onClick={handleMonthClickFilter}>
                        <CiFilter />
                        <p className=' font-semibold' >Filtrer par mois</p>
                    </button>
                    <Menu
                        id="fade-menu-filter"
                        anchorEl={anchorMonthElFilter}
                        keepMounted
                        open={openMonthMenuFilter}
                        onClose={handleCloseMonthMenuFilter}
                        className=' rounded-xl'
                    >
                        {
                            result?.months?.map((month) => (
                                <MenuItem key={month} onClick={() => handleFilter(format(month, 'MM/yyyy'))} className=' bg-gray-200 text-gray-500 mx-2 my-1 rounded-full text-xs text-center hover:bg-black hover:text-white'>{format(month, 'MMMM yyyy', { locale: fr })}</MenuItem>
                            ))
                        }
                    </Menu>
                    <button className=' bg-gray-300 text-xs flex gap-2 items-center rounded-md py-2 px-3' aria-controls="fade-menu-filter" aria-haspopup="true" onClick={handleWeekClickFilter}>
                        <CiFilter />
                        <p className=' font-semibold' >Filtrer par semaine</p>
                    </button>
                    <Menu
                        id="fade-menu-filter"
                        anchorEl={anchorWeekElFilter}
                        keepMounted
                        open={openWeekMenuFilter}
                        onClose={handleCloseWeekMenuFilter}
                        className=' rounded-xl'
                    >

                        <MenuItem onClick={() => handleWeekFilter(result.weeks[0].split('-')[0], result.weeks[0].split('-')[1])} className=' bg-gray-200 text-gray-500 mx-2 my-1 rounded-full text-xs text-center hover:bg-black hover:text-white'>Cette semaine</MenuItem>
                        <MenuItem onClick={() => handleWeekFilter(result.weeks[1].split('-')[0], result.weeks[1].split('-')[1])} className=' bg-gray-200 text-gray-500 mx-2 my-1 rounded-full text-xs text-center hover:bg-black hover:text-white'>La semaine passée</MenuItem>
                    </Menu>
                    <button className=' bg-yellow-200 text-xs flex gap-2 items-center rounded-md py-2 px-3' aria-controls="fade-menu-filter" aria-haspopup="true" onClick={handleRangeClickFilter}>
                        <CiFilter />
                        <p className=' font-semibold' >Filtrer par date</p>
                    </button>
                    <Menu
                        id="fade-menu-filter"
                        anchorEl={anchorRangeElFilter}
                        keepMounted
                        open={openRangeMenuFilter}
                        onClose={handleCloseRangeMenuFilter}
                        className=' rounded-xl'
                    >
                        <div className=" p-2">
                            <DatePicker
                                locale={fr}
                                selected={startDate}
                                onChange={onChange}
                                startDate={startDate}
                                endDate={endDate}
                                selectsRange
                                inline
                            />
                            <br />
                            <button onClick={() => {
                                if (endDate === null) {
                                    handleCloseRangeMenuFilter();
                                    handleFilter(formattedStartDate);
                                } else {
                                    handleCloseRangeMenuFilter();
                                    handleWeekFilter(formattedStartDate, formattedEndDate);
                                }
                            }} className=" w-full bg-black text-xs text-white py-2 rounded-md hover:bg-green-500">Valider</button>
                        </div>
                    </Menu>
                    <div className=" bg-blue-200 h-8 rounded-md flex items-center gap-2 px-3 text-xs font-semibold cursor-pointer" onClick={() => {
                        setFilter(false);
                        setCurrentDate(`Aujourd'hui : ${format(`${now.toLocaleDateString('fr-FR').split('/')[1]}/${now.toLocaleDateString('fr-FR').split('/')[0]}/${now.toLocaleDateString('fr-FR').split('/')[2]}`, 'EEEE dd MMMM yyyy', { locale: fr })}`);
                        setDescription(`Ceci represente l'ensemble des données de toutes les agences pour la date d'aujourd'hui ${new Date().toLocaleDateString('fr-FR')}`);
                        setWaitingAppointmentsOfficeByHourSlot(calculateWaitings(result.appointmentsByHourSlot, result.servingAppointmentsByHourSlot));
                    }}>
                        <IoReload />
                        <p>Aujourd&rsquo;hui</p>
                    </div>
                    <button
                        className={`h-8 text-xs flex gap-2 items-center rounded-md py-2 px-3 font-semibold transition-all ${ticketThreshold > 0 ? 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-md shadow-indigo-200' : 'bg-gray-300 text-gray-700 border border-gray-200 hover:from-indigo-100 hover:to-violet-100'}`}
                        onClick={() => setShowTicketFilter(v => !v)}
                    >
                        <MdBarChart />
                        <p>Focus agences{ticketThreshold > 0 ? ` ≥ ${ticketThreshold.toLocaleString()}` : ''}</p>
                    </button>

                </div>

                <button onClick={exportToExcel} className=" bg-green-700 rounded-md py-2 px-3 text-white text-xs flex items-center gap-2"><RiFileExcel2Fill />Exporter</button>
            </div>

            {/* Panneau filtre focus agences */}
            {showTicketFilter && (() => {
                const data = filter === false ? result?.totalInTimeByOffice : filterStats?.totalInTimeByOffice;
                if (!data || data.length === 0) return null;
                const aboveCount = ticketThreshold === 0 ? data.length : data.filter(o => o.receives >= ticketThreshold).length;
                const maxTickets = Math.max(...data.map(o => o.receives));
                return (
                    <div className="bg-white rounded-lg border border-gray-200 px-5 py-4 mb-2 shadow-sm">
                        <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-2">
                                <span className="text-sm font-semibold text-gray-700">Seuil minimum de tickets</span>
                                <span className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full ${ticketThreshold > 0 ? 'bg-gray-800 text-white' : 'bg-gray-100 text-gray-500'}`}>
                                    {ticketThreshold > 0 ? `${aboveCount} agence${aboveCount > 1 ? 's' : ''} ≥ ${ticketThreshold.toLocaleString()} tickets` : `Toutes les agences (${data.length})`}
                                </span>
                            </div>
                            <div className="flex items-center gap-3">
                                <span className="text-lg font-bold text-gray-800 w-20 text-right">
                                    {ticketThreshold === 0 ? '—' : ticketThreshold.toLocaleString()}
                                </span>
                                {ticketThreshold > 0 && (
                                    <button
                                        onClick={() => setTicketThreshold(0)}
                                        className="text-xs text-gray-400 hover:text-gray-700 underline transition-colors"
                                    >
                                        Réinitialiser
                                    </button>
                                )}
                            </div>
                        </div>
                        {(() => {
                            const inZone1 = ticketThreshold <= 100;
                            // Zone active = toujours dans les 75% gauche du track
                            const handlePos = inZone1
                                ? (ticketThreshold / 100) * 0.75
                                : ((ticketThreshold - 100) / 9900) * 0.75;
                            const compute = (e: React.PointerEvent<HTMLDivElement>) => {
                                const rect = e.currentTarget.getBoundingClientRect();
                                const pos = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
                                if (inZone1) {
                                    // Zone1 active : 0–75% = 0–100 (step 1), 75–100% = 100–10000 (step 50)
                                    if (pos <= 0.75) return Math.round((pos / 0.75) * 100);
                                    return Math.round((100 + ((pos - 0.75) / 0.25) * 9900) / 50) * 50;
                                } else {
                                    // Zone2 active : 0–75% = 100–10000 (step 50), 75–100% = 0–100 (step 1)
                                    if (pos <= 0.75) return Math.round((100 + (pos / 0.75) * 9900) / 50) * 50;
                                    return Math.round(((pos - 0.75) / 0.25) * 100);
                                }
                            };
                            return (
                                <>
                                    {/* Track bilinéaire */}
                                    <div
                                        className="relative w-full h-6 flex items-center cursor-pointer select-none my-2"
                                        onPointerDown={e => { setTicketThreshold(compute(e)); (e.currentTarget as HTMLDivElement).setPointerCapture(e.pointerId); }}
                                        onPointerMove={e => { if (e.buttons === 1) setTicketThreshold(compute(e)); }}
                                    >
                                        {/* Track fond */}
                                        <div className="absolute inset-x-0 h-2 rounded-full" style={{ overflow: 'hidden' }}>
                                            {/* Zone active (toujours à gauche, 75%) */}
                                            <div className="absolute h-full" style={{ left: 0, width: '75%', background: '#e0e7ff' }} />
                                            {/* Zone compressée (toujours à droite, 25%) */}
                                            <div className="absolute h-full" style={{ left: '75%', width: '25%', background: '#f3f4f6' }} />
                                            {/* Remplissage */}
                                            <div className="absolute h-full" style={{ width: `${handlePos * 100}%`, background: 'linear-gradient(to right, #6366f1, #4f46e5)', borderRadius: '9999px 0 0 9999px' }} />
                                        </div>
                                        {/* Séparateur fixe à 75% */}
                                        <div className="absolute h-4 w-px bg-gray-400" style={{ left: '75%', transform: 'translateX(-50%)' }} />
                                        {/* Tooltip valeur au-dessus du handle */}
                                        {ticketThreshold > 0 && (
                                            <div
                                                className="absolute -top-6 flex items-center justify-center"
                                                style={{ left: `calc(${handlePos * 100}% - 18px)`, pointerEvents: 'none' }}
                                            >
                                                <span className="text-[10px] font-bold text-white bg-indigo-600 rounded px-1.5 py-0.5 whitespace-nowrap shadow">
                                                    {ticketThreshold.toLocaleString()}
                                                </span>
                                                <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-indigo-600 rotate-45" />
                                            </div>
                                        )}
                                        {/* Handle */}
                                        <div
                                            className="absolute w-5 h-5 rounded-full border-2 border-white"
                                            style={{ left: `calc(${handlePos * 100}% - 10px)`, background: 'linear-gradient(135deg, #6366f1, #4f46e5)', pointerEvents: 'none', boxShadow: '0 2px 8px rgba(79,70,229,0.4)' }}
                                        />
                                    </div>
                                    {/* Labels — changent selon la zone active */}
                                    <div className="flex text-xs mt-0.5">
                                        <div className="flex justify-between font-medium text-indigo-500" style={{ width: '75%' }}>
                                            {inZone1 ? (
                                                <><span>0</span><span className="text-gray-400">50</span><span className="text-indigo-700">100</span></>
                                            ) : (
                                                <><span>100</span><span className="text-gray-400">5 050</span><span className="text-indigo-700">10 000</span></>
                                            )}
                                        </div>
                                        <div className="flex justify-center pl-1 text-gray-300" style={{ width: '25%' }}>
                                            <span>{inZone1 ? '10k →' : '← 100'}</span>
                                        </div>
                                    </div>
                                    {/* Badges */}
                                    <div className="flex mt-1.5">
                                        <div className="flex justify-center" style={{ width: '75%' }}>
                                            <span className="text-[10px] px-2 py-0.5 rounded-full font-medium bg-indigo-100 text-indigo-600">
                                                {inZone1 ? 'pas × 1  (0–100)' : 'pas × 50  (100–10 000)'}
                                            </span>
                                        </div>
                                        <div className="flex justify-center" style={{ width: '25%' }}>
                                            <span className="text-[10px] px-2 py-0.5 rounded-full font-medium bg-gray-100 text-gray-400">
                                                {inZone1 ? '× 50' : '× 1'}
                                            </span>
                                        </div>
                                    </div>
                                </>
                            );
                        })()}
                        {ticketThreshold > 0 && (
                            <p className="text-xs text-gray-400 mt-2 text-center">
                                Max observé : <span className="font-semibold text-gray-600">{maxTickets.toLocaleString()} tickets</span>
                            </p>
                        )}
                    </div>
                );
            })()}

            <div className="flex gap-2 items-center my-3">
                <FaRegCalendar />
                <p className=" text-xs font-bold">{currentDate}</p>
            </div>
            {/* Container principal avec hauteur 2/3 de l'écran */}
            <div className=" flex justify-center items-center">
                <FaSquarePollVertical size={40} className=" mr-1" />
                <div className="flex bg-white rounded-sm justify-between items-center ">

                    <div className="flex w-fit p-2 h-20 items-center justify-center gap-2 border-r-[1px]">
                        <div className=" w-8 h-8 bg-green-500 bg-opacity-20 rounded-full flex justify-center items-center">
                            <IoCheckmarkDoneCircleSharp className=" text-green-600" />
                        </div>
                        <div>
                            <h2 className=" text-xs font-bold">
                                {filter === false ? result?.receives : filterStats.receives}
                            </h2>
                            <div className=" flex items-center gap-2">
                                <p className=" text-xs opacity-60">
                                    Traités
                                </p>
                                <p className=" text-xs text-green-500 font-semibold">
                                    {filter === false ? `${result?.receives ? `${((result?.receives / result?.appointments) * 100).toFixed()}%` : '0%'}` : `${filterStats?.receives ? `${((filterStats?.receives / filterStats?.appointments) * 100).toFixed()}%` : '0%'}`}
                                </p>
                            </div>
                        </div>
                    </div>
                    <div className="flex w-fit px-2 py-2 items-center justify-center gap-4 border-r-[1px]">
                        <div className=" w-8 h-8 bg-red-500 bg-opacity-20 rounded-full flex justify-center items-center">
                            <RiLoader2Fill className=" text-red-600" />
                        </div>
                        <div>
                            <h2 className=" text-xs font-bold">
                                {filter === false ? result?.waitings : filterStats.waitings}
                            </h2>
                            <div className=" flex items-center gap-2">
                                <p className=" text-xs opacity-60">
                                    {filter === false ? `En attente` : `Non appelés`}
                                </p>
                                <p className=" text-xs text-red-500 font-semibold">
                                    {filter === false ? `${result?.waitings ? `${((result?.waitings / result?.appointments) * 100).toFixed()}%` : '0%'}` : `${filterStats?.waitings ? `${((filterStats?.waitings / filterStats?.appointments) * 100).toFixed()}%` : '0%'}`}
                                </p>
                            </div>
                        </div>
                    </div>
                    <div className="flex w-fit h-20 p-2 items-center justify-center gap-4 border-r-[1px]">
                        <div className=" w-8 h-8 bg-yellow-500 bg-opacity-20 rounded-full flex justify-center items-center">
                            <BsStickyFill className=" text-yellow-600" />
                        </div>
                        <div>
                            <h2 className=" text-xs font-bold">
                                {filter === false ? result?.appointments : filterStats.appointments}
                            </h2>
                            <p className=" text-xs opacity-60">
                                Total
                            </p>
                        </div>
                    </div>

                    <div className="flex w-fit h-20 p-2 items-center justify-center gap-2 border-r-[1px]">
                        <div className=" w-12 h-12 bg-red-400 bg-opacity-10 rounded-full flex justify-center items-center">
                            <MdOutlineTimelapse className=" text-red-500" />
                        </div>
                        <div>
                            <h2 className=" text-xs font-bold">
                                {filter === false ? format(result?.meanWaitingTime * 60 * 1000, 'HH:mm:ss') : format(filterStats?.meanWaitingTime * 60 * 1000, 'HH:mm:ss')}
                            </h2>
                            <p className=" text-xs opacity-60">
                                Attente moyenne
                            </p>
                        </div>
                    </div>
                    <div className="flex w-fit h-20 p-2 items-center justify-center gap-2 border-r-[1px]">
                        <div className=" w-12 h-12 bg-green-400 bg-opacity-10 rounded-full flex justify-center items-center">
                            <MdOutlineTimelapse className=" text-green-500" />
                        </div>
                        <div>
                            <h2 className=" text-xs font-bold">
                                {filter === false ? format(result?.meanServingTime * 60 * 1000, 'HH:mm:ss') : format(filterStats?.meanServingTime * 60 * 1000, 'HH:mm:ss')}
                            </h2>
                            <p className=" text-xs opacity-60">
                                Traitement moyen
                            </p>
                        </div>
                    </div>
                    <div className=" w-fit h-20 p-2 gap-2 border-r-[1px]">
                        <div>
                            <p className=" text-xs opacity-60 text-center pb-1 ">
                                Attente optimale
                            </p>
                            <div className=" flex justify-between px-2 gap-2 pb-1">
                                <div className=" text-center">
                                    <p className=" text-xs opacity-60">
                                        Ticket
                                    </p>
                                    <h2 className=" text-sm font-bold text-green-500">
                                        {filter === false ? result?.totalInWaiting : filterStats.totalInWaiting}
                                    </h2>
                                    <div className=" flex items-center gap-2">
                                        <p className=" text-xs opacity-60">
                                            Oui
                                        </p>
                                        <p className=" text-xs text-green-500 font-semibold">
                                            {filter === false ? `${result?.totalInWaiting ? `${((result?.totalInWaiting / result?.totalAppointments) * 100).toFixed()}%` : '0%'}` : `${filterStats?.totalInWaiting ? `${((filterStats?.totalInWaiting / filterStats?.totalAppointments) * 100).toFixed()}%` : '0%'}`}
                                        </p>
                                    </div>
                                </div>
                                <div className="border-r-[1px]"></div>
                                <div className=" text-center">
                                    <p className=" text-xs opacity-60">
                                        Ticket
                                    </p>
                                    <h2 className=" text-sm font-bold text-red-500">
                                        {filter === false ? result?.totalNotInWaiting : filterStats.totalNotInWaiting}
                                    </h2>
                                    <div className=" flex items-center gap-2">
                                        <p className=" text-xs opacity-60">
                                            Non
                                        </p>
                                        <p className=" text-xs text-red-500 font-semibold">
                                            {filter === false ? `${result?.totalNotInWaiting ? `${((result?.totalNotInWaiting / result?.totalAppointments) * 100).toFixed()}%` : '0%'}` : `${filterStats?.totalNotInWaiting ? `${((filterStats?.totalNotInWaiting / filterStats?.totalAppointments) * 100).toFixed()}%` : '0%'}`}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className=" w-fit h-20 p-2 gap-2 border-r-[1px]">
                        <div>
                            <p className=" text-xs opacity-60 text-center pb-1">
                                Traitement optimal
                            </p>
                            <div className=" flex justify-between gap-2 px-2">
                                <div className=" text-center">
                                    <p className=" text-xs opacity-60">
                                        Ticket
                                    </p>
                                    <h2 className=" text-sm font-bold text-green-500">
                                        {filter === false ? result?.totatlInServing : filterStats.totatlInServing}
                                    </h2>
                                    <div className=" flex items-center gap-2">
                                        <p className=" text-xs opacity-60">
                                            Oui
                                        </p>
                                        <p className=" text-xs text-green-500 font-semibold">
                                            {filter === false ? `${result?.totatlInServing ? `${((result?.totatlInServing / result?.totalAppointments) * 100).toFixed()}%` : '0%'}` : `${filterStats?.totatlInServing ? `${((filterStats?.totatlInServing / filterStats?.totalAppointments) * 100).toFixed()}%` : '0%'}`}
                                        </p>
                                    </div>
                                </div>
                                <div className="border-r-[1px]"></div>
                                <div className=" text-center">
                                    <p className=" text-xs opacity-60">
                                        Ticket
                                    </p>
                                    <h2 className=" text-sm font-bold text-red-500">
                                        {filter === false ? result?.totatlNotInServing : filterStats.totatlNotInServing}
                                    </h2>
                                    <div className=" flex items-center gap-2">
                                        <p className=" text-xs opacity-60">
                                            Non
                                        </p>
                                        <p className=" text-xs text-red-500 font-semibold">
                                            {filter === false ? `${result?.totatlNotInServing ? `${((result?.totatlNotInServing / result?.totalAppointments) * 100).toFixed()}%` : '0%'}` : `${filterStats?.totatlNotInServing ? `${((filterStats?.totatlNotInServing / filterStats?.totalAppointments) * 100).toFixed()}%` : '0%'}`}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className=" w-4 bg-black h-20">
                </div>
            </div>
            <div className="flex gap-3 h-fit my-3">
                {/* Section Synthèse - 1/3 de la largeur */}
                <div className="w-1/5 flex flex-col">
                    <div className="bg-gradient-to-r from-gray-800 to-gray-900 text-white py-3 px-4 rounded-t-lg">
                        <h2 className="text-sm font-semibold text-center">Synthèse</h2>
                    </div>

                    <div className="flex-1 bg-white rounded-b-lg shadow-sm border border-gray-100 p-2">
                        <div className="grid grid-cols-2 gap-1 h-full">
                            <StatCard
                                icon={HiOutlineBuildingOffice}
                                value={filter === false ? result?.offices : filterStats.offices}
                                label="Agences"
                                bgColor="bg-red-50"
                                iconColor="text-red-600"
                            />
                            <StatCard
                                icon={FaClipboardList}
                                value={filter === false ? result?.services : filterStats.services}
                                label="Services"
                                bgColor="bg-blue-50"
                                iconColor="text-blue-600"
                            />
                            <StatCard
                                icon={IoTabletLandscape}
                                value={filter === false ? result?.subServices : filterStats.subServices}
                                label="Points d'appels"
                                bgColor="bg-cyan-50"
                                iconColor="text-cyan-600"
                            />
                            <StatCard
                                icon={MdOutlineSupportAgent}
                                value={filter === false ? result?.subServices : filterStats.subServices}
                                label="Agents"
                                bgColor="bg-sky-50"
                                iconColor="text-sky-600"
                            />
                            <StatCard
                                icon={MdAdminPanelSettings}
                                value={filter === false ? result?.allAdmins : filterStats.allAdmins}
                                label="Superviseurs"
                                bgColor="bg-gray-50"
                                iconColor="text-gray-600"
                            />
                            <StatCard
                                icon={FaGraduationCap}
                                value={filter === false ? result?.allUsers : filterStats.allUsers}
                                label="Chefs d'agence"
                                bgColor="bg-green-50"
                                iconColor="text-green-600"
                            />
                        </div>
                    </div>
                </div>

                {/* Section Graphique - 2/3 de la largeur */}
                <div className="w-4/5 flex flex-col">
                    <div className="bg-gradient-to-r from-gray-800 to-gray-900 text-white py-3 px-4 rounded-t-lg">
                        <h2 className="text-sm font-semibold text-center">Visualisation du flux des clients par Agence</h2>
                    </div>
                    <div className="flex-1 bg-white rounded-b-lg shadow-sm border border-gray-100 pt-12 px-2 overflow-x-auto">
                        {(() => {
                            const allowed = new Set(
                                result?.totalInTimeByOffice
                                    ?.filter(o => ticketThreshold === 0 || o.receives >= ticketThreshold)
                                    .map(o => o.name) ?? []
                            );
                            const f = <T extends { name: string }>(arr: T[]) =>
                                ticketThreshold === 0 ? arr : arr.filter(r => allowed.has(r.name));
                            return filter == false ? <Line
                            data={{
                                labels: f(result.appointmentsByOffice).map(record => record.name),
                                datasets: [
                                    {
                                        label: 'Nombre de ticket prise',
                                        data: f(result.appointmentsByOffice).map(record => record.amount),
                                        borderColor: 'rgba(0, 0, 0, 1)',
                                        backgroundColor: 'rgba(0, 0, 0, 0.5)',
                                        yAxisID: 'y',
                                    },
                                    {
                                        label: 'Nombre de ticket traité',
                                        data: f(result.serveAppointmentsByOffice).map(record => record.amount),
                                        borderColor: 'rgba(0, 255, 200, 1)',
                                        backgroundColor: 'rgba(0, 255, 200, 0.5)',
                                        yAxisID: 'y',
                                    },
                                    {
                                        label: 'Nombre de ticket en attente',
                                        data: f(result.waitingAppointmentsByOffice).map(record => record.amount),
                                        borderColor: 'rgba(255, 0, 0, 1)',
                                        backgroundColor: 'rgba(255, 0, 0, 0.5)',
                                        yAxisID: 'y',
                                    },
                                    {
                                        label: 'Temps d\'attente moyen (min)',
                                        data: f(result.totalByOffices).map(record => record.meanWaitingTime),
                                        borderColor: 'rgba(255, 165, 0, 1)',
                                        backgroundColor: 'rgba(255, 165, 0, 0.3)',
                                        type: 'line',
                                        yAxisID: 'y1',
                                    },
                                    {
                                        label: 'Temps de traitement moyen (min)',
                                        data: f(result.totalByOffices).map(record => record.meanServingTime),
                                        borderColor: 'rgba(128, 0, 128, 1)',
                                        backgroundColor: 'rgba(128, 0, 128, 0.3)',
                                        type: 'line',
                                        yAxisID: 'y1',
                                    },
                                ],
                            }}
                            options={{
                                responsive: true,
                                plugins: {
                                    datalabels: {
                                        display: false
                                    }
                                },
                                scales: {
                                    y: {
                                        type: 'linear',
                                        display: true,
                                        position: 'left',
                                        title: {
                                            display: true,
                                            text: 'Nombre de tickets'
                                        }
                                    },
                                    y1: {
                                        type: 'linear',
                                        display: true,
                                        position: 'right',
                                        title: {
                                            display: true,
                                            text: 'Temps (minutes)'
                                        },
                                        grid: {
                                            drawOnChartArea: false,
                                        },
                                    },
                                },
                            }} />
                            : (() => {
                                const allowedF = new Set(
                                    filterStats?.totalInTimeByOffice
                                        ?.filter(o => ticketThreshold === 0 || o.receives >= ticketThreshold)
                                        .map(o => o.name) ?? []
                                );
                                const ff = <T extends { name: string }>(arr: T[]) =>
                                    ticketThreshold === 0 ? arr : arr.filter(r => allowedF.has(r.name));
                                return <Line data={{
                                    labels: ff(filterStats.appointmentsByOffice).map(record => record.name),
                                    datasets: [
                                        {
                                            label: 'Nombre de ticket prise',
                                            data: ff(filterStats.appointmentsByOffice).map(record => record.amount),
                                            borderColor: 'rgba(0, 0, 0, 1)',
                                            backgroundColor: 'rgba(0, 0, 0, 0.5)',
                                        },
                                        {
                                            label: 'Temps d\'attente moyen (min)',
                                            data: ff(filterStats.totalByOffices).map(record => record.meanWaitingTime),
                                            borderColor: 'rgba(255, 165, 0, 1)',
                                            backgroundColor: 'rgba(255, 165, 0, 0.3)',
                                            type: 'line',
                                            yAxisID: 'y1',
                                        },
                                        {
                                            label: 'Temps de traitement moyen (min)',
                                            data: ff(filterStats.totalByOffices).map(record => record.meanServingTime),
                                            borderColor: 'rgba(128, 0, 128, 1)',
                                            backgroundColor: 'rgba(128, 0, 128, 0.3)',
                                            type: 'line',
                                            yAxisID: 'y1',
                                        }
                                    ],
                                }}
                                    options={{
                                        responsive: true,
                                        plugins: { datalabels: { display: false } },
                                        scales: {
                                            y: { type: 'linear', display: true, position: 'left', title: { display: true, text: 'Nombre de tickets' } },
                                            y1: { type: 'linear', display: true, position: 'right', title: { display: true, text: 'Temps (minutes)' }, grid: { drawOnChartArea: false } },
                                        },
                                    }}
                                />;
                            })();
                        })()}
                    </div>
                </div>
            </div>

            {/* Délais moyens d'attente et de traitement par service */}
            {(() => {
                const metrics = filter === false ? result?.globalServiceMetrics : filterStats?.globalServiceMetrics;
                if (!metrics || metrics.length === 0) return null;
                return (
                    <div className="flex flex-col my-3">
                        <div className="bg-gradient-to-r from-gray-800 to-gray-900 text-white py-3 px-4 rounded-t-lg">
                            <h2 className="text-sm font-semibold text-center">
                                Délais moyens d&apos;attente et de traitement par service
                            </h2>
                        </div>
                        <div className="bg-white rounded-b-lg shadow-sm border border-gray-100 p-4">
                            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
                                {metrics.map((metric, index) => (
                                    <div
                                        key={index}
                                        className="flex flex-col rounded-lg border border-gray-100 overflow-hidden shadow-sm hover:shadow-md transition-shadow"
                                    >
                                        {/* En-tête service */}
                                        <div className="bg-gray-800 px-2 py-2 text-center">
                                            <p className="text-white text-xs font-semibold leading-tight truncate" title={metric.name}>
                                                {metric.name}
                                            </p>
                                        </div>
                                        {/* Attente */}
                                        <div className="flex flex-col items-center justify-center bg-gray-50 px-2 py-2 border-b border-gray-100">
                                            <div className="flex items-center gap-1 mb-0.5">
                                                <AiOutlineClockCircle className="text-gray-400 text-xs" />
                                                <span className="text-gray-400 text-xs">Attente</span>
                                            </div>
                                            <span className="text-gray-700 font-bold text-xs tracking-tight">
                                                {formatMinutesToTime(metric.meanWaiting)}
                                            </span>
                                        </div>
                                        {/* Traitement */}
                                        <div className="flex flex-col items-center justify-center bg-emerald-50 px-2 py-2">
                                            <div className="flex items-center gap-1 mb-0.5">
                                                <IoCheckmarkDoneCircleSharp className="text-emerald-500 text-xs" />
                                                <span className="text-emerald-500 text-xs">Traitement</span>
                                            </div>
                                            <span className="text-emerald-600 font-bold text-xs tracking-tight">
                                                {formatMinutesToTime(metric.meanServing)}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                );
            })()}

            {/* Section Délais clients rapportés au nombre de caisses par agence */}
            <div className="flex flex-col my-3">
                <div className="bg-gradient-to-r from-gray-800 to-gray-900 text-white py-3 px-4 rounded-t-lg">
                    <h2 className="text-sm font-semibold text-center">
                        Délais clients rapportés au nombre de caisses par agence
                    </h2>
                </div>

                <div className="bg-white rounded-b-lg shadow-sm border border-gray-100 pt-8 pb-8" style={{ paddingLeft: '16px', paddingRight: '16px' }}>
                    {filter === false ? (
                        result?.meanWaitingTimeAndSubservices && result.meanWaitingTimeAndSubservices.length > 0 ? (() => {
                            const totalDelay = (name: string, fallback: number) => {
                                const office = result.totalByOffices?.find(o => o.name === name);
                                return office ? (office.meanWaitingTime + office.meanServingTime) : fallback;
                            };
                            const filteredMWTS = result.meanWaitingTimeAndSubservices
                                .filter(r =>
                                    ticketThreshold === 0 || (result.totalInTimeByOffice?.find(o => o.name === r.name)?.receives ?? 0) >= ticketThreshold
                                )
                                .sort((a, b) => totalDelay(a.name, a.time) - totalDelay(b.name, b.time));
                            return filteredMWTS.length === 0 ? (
                                <p className="text-center text-gray-500 py-8">Aucune agence ne correspond au seuil</p>
                            ) : (
                            <div className="relative">
                                {/* Graphique de la ligne noire (nombre de caisses) - EN HAUT */}
                                <div style={{ height: '120px', marginBottom: '1px', marginLeft: '6px' }}>
                                    <Line
                                        data={{
                                            labels: filteredMWTS.map(record => record.name),
                                            datasets: [
                                                {
                                                    label: 'Nombre de caisses',
                                                    data: filteredMWTS.map(record => record.subServices),
                                                    borderColor: 'rgba(0, 0, 0, 1)',
                                                    backgroundColor: 'rgba(0, 0, 0, 0.1)',
                                                    borderWidth: 2,
                                                    pointRadius: 4,
                                                    pointBackgroundColor: filteredMWTS.map(record => pointColor(record.name)),
                                                    tension: 0.4,
                                                    datalabels: {
                                                        anchor: 'end',
                                                        align: 'top',
                                                        formatter: (value: number) => value.toString(),
                                                        font: {
                                                            size: 11,
                                                            weight: 'bold'
                                                        },
                                                        color: '#000',
                                                        offset: 5
                                                    }
                                                }
                                            ] as any
                                        }}
                                        options={{
                                            responsive: true,
                                            maintainAspectRatio: false,
                                            layout: {
                                                padding: 0
                                            },
                                            plugins: {
                                                legend: {
                                                    display: false,
                                                },
                                                tooltip: {
                                                    enabled: true,
                                                    callbacks: {
                                                        label: function (context) {
                                                            return 'Caisses: ' + context.parsed.y;
                                                        }
                                                    }
                                                },
                                                datalabels: {
                                                    display: true
                                                }
                                            },
                                            scales: {
                                                x: {
                                                    display: false,
                                                    offset: true,
                                                    grid: {
                                                        display: false,
                                                        offset: true
                                                    }
                                                },
                                                y: {
                                                    display: false,
                                                    beginAtZero: true,
                                                    suggestedMax: Math.max(...filteredMWTS.map(r => r.subServices)) + 2,
                                                    grid: {
                                                        display: false
                                                    }
                                                }
                                            },
                                        }}
                                    />
                                </div>

                                {/* Graphique des barres (temps d'attente) - EN BAS */}
                                <div style={{ height: '280px', marginLeft: '-8px' }}>
                                    <Bar
                                        data={{
                                            labels: filteredMWTS.map(record => record.name),
                                            datasets: [
                                                {
                                                    label: 'Délai total (attente + traitement)',
                                                    data: filteredMWTS.map(record => {
                                                        const office = result.totalByOffices?.find(o => o.name === record.name);
                                                        return office ? (office.meanWaitingTime + office.meanServingTime) : record.time;
                                                    }),
                                                    backgroundColor: filteredMWTS.map(record => barColor(record.name, '#F4A261')),
                                                    borderRadius: 4,
                                                    barPercentage: 0.7,
                                                    categoryPercentage: 0.6,
                                                    yAxisID: 'y',
                                                    datalabels: {
                                                        color: '#000',
                                                        rotation: -90,
                                                        anchor: (context: any) => {
                                                            const value = context.dataset.data[context.dataIndex];
                                                            const maxValue = Math.max(...context.dataset.data);
                                                            // Si la valeur est petite (moins de 30% du max), mettre au-dessus
                                                            return value < maxValue * 0.3 ? 'end' : 'center';
                                                        },
                                                        align: (context: any) => {
                                                            const value = context.dataset.data[context.dataIndex];
                                                            const maxValue = Math.max(...context.dataset.data);
                                                            return value < maxValue * 0.3 ? 'end' : 'center';
                                                        },
                                                        offset: (context: any) => {
                                                            const value = context.dataset.data[context.dataIndex];
                                                            const maxValue = Math.max(...context.dataset.data);
                                                            return value < maxValue * 0.3 ? 1 : 0;
                                                        },
                                                        formatter: (value: number) => {
                                                            if (value === 0) return null;
                                                            return formatMinutesToTime(value);
                                                        },
                                                        font: {
                                                            weight: 'bold',
                                                            size: 9
                                                        },
                                                        clip: false
                                                    }
                                                }
                                            ] as any
                                        }}
                                        options={{
                                            responsive: true,
                                            maintainAspectRatio: false,
                                            layout: {
                                                padding: 0
                                            },
                                            plugins: {
                                                legend: {
                                                    display: false,
                                                },
                                                tooltip: {
                                                    callbacks: {
                                                        label: function (context) {
                                                            return 'Délai total: ' + formatMinutesToTime(context.parsed.y);
                                                        }
                                                    }
                                                },
                                                datalabels: {
                                                    display: true
                                                }
                                            },
                                            scales: {
                                                x: {
                                                    display: true,
                                                    offset: true,
                                                    grid: {
                                                        display: false,
                                                        offset: true
                                                    },
                                                    ticks: {
                                                        font: {
                                                            size: 10
                                                        }
                                                    }
                                                },
                                                y: {
                                                    display: false,
                                                    beginAtZero: true,
                                                    grid: {
                                                        display: false
                                                    }
                                                }
                                            },
                                        }}
                                    />
                                </div>
                            </div>
                        );
                        })() : (
                            <p className="text-center text-gray-500 py-8">Aucune donnée disponible</p>
                        )
                    ) : (
                        filterStats?.meanWaitingTimeAndSubservices && filterStats.meanWaitingTimeAndSubservices.length > 0 ? (() => {
                            const totalDelay = (name: string, fallback: number) => {
                                const office = filterStats.totalByOffices?.find(o => o.name === name);
                                return office ? (office.meanWaitingTime + office.meanServingTime) : fallback;
                            };
                            const filteredFilterMWTS = filterStats.meanWaitingTimeAndSubservices
                                .filter(r =>
                                    ticketThreshold === 0 || (filterStats.totalInTimeByOffice?.find(o => o.name === r.name)?.receives ?? 0) >= ticketThreshold
                                )
                                .sort((a, b) => totalDelay(a.name, a.time) - totalDelay(b.name, b.time));
                            return filteredFilterMWTS.length === 0 ? (
                                <p className="text-center text-gray-500 py-8">Aucune agence ne correspond au seuil</p>
                            ) : (
                            <div className="relative">
                                {/* Graphique de la ligne noire (nombre de caisses) - EN HAUT */}
                                <div style={{ height: '120px', marginBottom: '1px', marginLeft: '6px' }}>
                                    <Line
                                        data={{
                                            labels: filteredFilterMWTS.map(record => record.name),
                                            datasets: [
                                                {
                                                    label: 'Nombre de caisses',
                                                    data: filteredFilterMWTS.map(record => record.subServices),
                                                    borderColor: 'rgba(0, 0, 0, 1)',
                                                    backgroundColor: 'rgba(0, 0, 0, 0.1)',
                                                    borderWidth: 2,
                                                    pointRadius: 4,
                                                    pointBackgroundColor: filteredFilterMWTS.map(record => pointColor(record.name)),
                                                    tension: 0.4,
                                                    datalabels: {
                                                        anchor: 'end',
                                                        align: 'top',
                                                        formatter: (value: number) => value.toString(),
                                                        font: {
                                                            size: 11,
                                                            weight: 'bold'
                                                        },
                                                        color: '#000',
                                                        offset: 5
                                                    }
                                                }
                                            ] as any
                                        }}
                                        options={{
                                            responsive: true,
                                            maintainAspectRatio: false,
                                            layout: {
                                                padding: 0
                                            },
                                            plugins: {
                                                legend: {
                                                    display: false,
                                                },
                                                tooltip: {
                                                    enabled: true,
                                                    callbacks: {
                                                        label: function (context) {
                                                            return 'Caisses: ' + context.parsed.y;
                                                        }
                                                    }
                                                },
                                                datalabels: {
                                                    display: true
                                                }
                                            },
                                            scales: {
                                                x: {
                                                    display: false,
                                                    offset: true,
                                                    grid: {
                                                        display: false,
                                                        offset: true
                                                    }
                                                },
                                                y: {
                                                    display: false,
                                                    beginAtZero: true,
                                                    suggestedMax: Math.max(...filteredFilterMWTS.map(r => r.subServices)) + 2,
                                                    grid: {
                                                        display: false
                                                    }
                                                }
                                            },
                                        }}
                                    />
                                </div>

                                {/* Graphique des barres (temps d'attente) - EN BAS */}
                                <div style={{ height: '280px' }}>
                                    <Bar
                                        data={{
                                            labels: filteredFilterMWTS.map(record => record.name),
                                            datasets: [
                                                {
                                                    label: 'Délai total (attente + traitement)',
                                                    data: filteredFilterMWTS.map(record => {
                                                        const office = filterStats.totalByOffices?.find(o => o.name === record.name);
                                                        return office ? (office.meanWaitingTime + office.meanServingTime) : record.time;
                                                    }),
                                                    backgroundColor: filteredFilterMWTS.map(record => barColor(record.name, '#F4A261')),
                                                    borderRadius: 4,
                                                    barPercentage: 0.7,
                                                    categoryPercentage: 0.6,
                                                    datalabels: {
                                                        color: '#000',
                                                        rotation: -90,
                                                        anchor: (context: any) => {
                                                            const value = context.dataset.data[context.dataIndex];
                                                            const maxValue = Math.max(...context.dataset.data);
                                                            // Si la valeur est petite (moins de 30% du max), mettre au-dessus
                                                            return value < maxValue * 0.3 ? 'end' : 'center';
                                                        },
                                                        align: (context: any) => {
                                                            const value = context.dataset.data[context.dataIndex];
                                                            const maxValue = Math.max(...context.dataset.data);
                                                            return value < maxValue * 0.3 ? 'end' : 'center';
                                                        },
                                                        offset: (context: any) => {
                                                            const value = context.dataset.data[context.dataIndex];
                                                            const maxValue = Math.max(...context.dataset.data);
                                                            return value < maxValue * 0.3 ? 1 : 0;
                                                        },
                                                        formatter: (value: number) => {
                                                            if (value === 0) return null;
                                                            return formatMinutesToTime(value);
                                                        },
                                                        font: {
                                                            weight: 'bold',
                                                            size: 9
                                                        },
                                                        clip: false
                                                    }
                                                }
                                            ] as any
                                        }}
                                        options={{
                                            responsive: true,
                                            maintainAspectRatio: false,
                                            layout: {
                                                padding: 0
                                            },
                                            plugins: {
                                                legend: {
                                                    display: false,
                                                },
                                                tooltip: {
                                                    callbacks: {
                                                        label: function (context) {
                                                            return 'Délai total: ' + formatMinutesToTime(context.parsed.y);
                                                        }
                                                    }
                                                },
                                                datalabels: {
                                                    display: true
                                                }
                                            },
                                            scales: {
                                                x: {
                                                    display: true,
                                                    offset: true,
                                                    grid: {
                                                        display: false,
                                                        offset: true
                                                    },
                                                    ticks: {
                                                        font: {
                                                            size: 10
                                                        }
                                                    }
                                                },
                                                y: {
                                                    display: false,
                                                    beginAtZero: true,
                                                    grid: {
                                                        display: false
                                                    }
                                                }
                                            },
                                        }}
                                    />
                                </div>
                            </div>
                        );
                        })() : (
                            <p className="text-center text-gray-500 py-8">Aucune donnée disponible</p>
                        )
                    )}
                </div>
            </div>

            {/* Confirmité aux objectifs sur les volumes de tickets */}
            <div className="flex flex-col my-3">
                <div className="bg-gradient-to-r from-gray-800 to-gray-900 text-white py-3 px-4 rounded-t-lg">
                    <h2 className="text-sm font-semibold text-center">
                        Confirmité aux objectifs sur les volumes de tickets
                    </h2>
                </div>

                <div className="bg-white rounded-b-lg shadow-sm border border-gray-100 pt-8 pb-8" style={{ paddingLeft: '16px', paddingRight: '16px' }}>
                    {filter === false ? (
                        result?.totalInTimeByOffice && result.totalInTimeByOffice.length > 0 ? (() => {
                            const sortedInTime = [...result.totalInTimeByOffice]
                                .filter(r => ticketThreshold === 0 || r.receives >= ticketThreshold)
                                .sort((a, b) => {
                                const pA = a.receives > 0 ? (a.serves / a.receives) * 100 : 0;
                                const pB = b.receives > 0 ? (b.serves / b.receives) * 100 : 0;
                                return pA - pB;
                            });
                            return (
                            <div className="relative">
                                {/* Graphique de la ligne noire (nombre de caisses) - EN HAUT */}
                                <div style={{ height: '124px', position: 'relative' }}>
                                    <Line
                                        data={{
                                            labels: sortedInTime.map(record => record.name),
                                            datasets: [
                                                {
                                                    label: 'Nombre de tickets',
                                                    data: sortedInTime.map(record => record.receives),
                                                    borderColor: 'rgba(0, 0, 0, 1)',
                                                    backgroundColor: 'rgba(0, 0, 0, 0.1)',
                                                    borderWidth: 2,
                                                    pointRadius: 4,
                                                    pointBackgroundColor: sortedInTime.map(record => pointColor(record.name)),
                                                    tension: 0.4,
                                                    datalabels: {
                                                        anchor: 'end',
                                                        align: 'top',
                                                        formatter: (value: number) => value.toString(),
                                                        font: {
                                                            size: 11,
                                                            weight: 'bold'
                                                        },
                                                        color: '#000',
                                                        offset: 5
                                                    }
                                                }
                                            ] as any
                                        }}
                                        options={{
                                            responsive: true,
                                            maintainAspectRatio: false,
                                            layout: {
                                                padding: {
                                                    top: 22,
                                                    left: 14
                                                }
                                            },
                                            plugins: {
                                                legend: {
                                                    display: false,
                                                },
                                                tooltip: {
                                                    enabled: true,
                                                    callbacks: {
                                                        label: function (context) {
                                                            return 'Tickets: ' + context.parsed.y;
                                                        }
                                                    }
                                                },
                                                datalabels: {
                                                    display: true
                                                }
                                            },
                                            scales: {
                                                x: {
                                                    display: false,
                                                    offset: true,
                                                    grid: {
                                                        display: false,
                                                        offset: true
                                                    }
                                                },
                                                y: {
                                                    display: false,
                                                    beginAtZero: true,
                                                    suggestedMax: Math.max(...sortedInTime.map(r => r.receives)) + 1.2,
                                                    grid: {
                                                        display: false
                                                    }
                                                }
                                            },
                                        }}
                                    />
                                </div>

                                {/* Graphique des barres (pourcentage tickets en normes) - EN BAS */}
                                <div style={{ height: '280px', marginLeft: '-8px' }}>
                                    <Bar
                                        data={{
                                            labels: sortedInTime.map(record => record.name),
                                            datasets: [
                                                {
                                                    label: 'Pourcentage de tickets en normes',
                                                    data: sortedInTime.map(record =>
                                                        record.receives > 0 ? (record.serves / record.receives) * 100 : 0
                                                    ),
                                                    backgroundColor: sortedInTime.map(record => barColor(record.name, '#E0E0E0')),
                                                    borderRadius: 4,
                                                    barPercentage: 0.7,
                                                    categoryPercentage: 0.6,
                                                    yAxisID: 'y',
                                                    datalabels: {
                                                        color: '#000',
                                                        rotation: -90,
                                                        anchor: (context: any) => {
                                                            const value = context.dataset.data[context.dataIndex];
                                                            const maxValue = Math.max(...context.dataset.data);
                                                            // Si la valeur est petite (moins de 30% du max), mettre au-dessus
                                                            return value < maxValue * 0.3 ? 'end' : 'center';
                                                        },
                                                        align: (context: any) => {
                                                            const value = context.dataset.data[context.dataIndex];
                                                            const maxValue = Math.max(...context.dataset.data);
                                                            return value < maxValue * 0.3 ? 'end' : 'center';
                                                        },
                                                        offset: (context: any) => {
                                                            const value = context.dataset.data[context.dataIndex];
                                                            const maxValue = Math.max(...context.dataset.data);
                                                            return value < maxValue * 0.3 ? 4 : 0;
                                                        },
                                                        formatter: (value: number) => {
                                                            if (value === 0) return null;
                                                            return Math.round(Number.parseFloat(value.toFixed(1))) + '%';
                                                        },
                                                        font: {
                                                            weight: 'bold',
                                                            size: 9
                                                        },
                                                        clip: false
                                                    }
                                                }
                                            ] as any
                                        }}
                                        options={{
                                            responsive: true,
                                            maintainAspectRatio: false,
                                            layout: {
                                                padding: 0
                                            },
                                            plugins: {
                                                legend: {
                                                    display: false,
                                                },
                                                tooltip: {
                                                    callbacks: {
                                                        label: function (context) {
                                                            return 'Pourcentage: ' + Math.round(Number.parseFloat(context.parsed.y.toFixed(1))) + '%';
                                                        }
                                                    }
                                                },
                                                datalabels: {
                                                    display: true
                                                }
                                            },
                                            scales: {
                                                x: {
                                                    display: true,
                                                    offset: true,
                                                    grid: {
                                                        display: false,
                                                        offset: true
                                                    },
                                                    ticks: {
                                                        font: {
                                                            size: 10
                                                        }
                                                    }
                                                },
                                                y: {
                                                    display: false,
                                                    beginAtZero: true,
                                                    max: 100,
                                                    grid: {
                                                        display: false
                                                    }
                                                }
                                            },
                                        }}
                                    />
                                </div>
                            </div>
                            );
                        })() : (
                            <p className="text-center text-gray-500 py-8">Aucune donnée disponible</p>
                        )
                    ) : (
                        filterStats?.totalInTimeByOffice && filterStats.totalInTimeByOffice.length > 0 ? (() => {
                            const sortedFilterInTime = [...filterStats.totalInTimeByOffice]
                                .filter(r => ticketThreshold === 0 || r.receives >= ticketThreshold)
                                .sort((a, b) => {
                                const pA = a.receives > 0 ? (a.serves / a.receives) * 100 : 0;
                                const pB = b.receives > 0 ? (b.serves / b.receives) * 100 : 0;
                                return pA - pB;
                            });
                            return (
                            <div className="relative">
                                {/* Graphique de la ligne noire (nombre de tickets) - EN HAUT */}
                                <div style={{ height: '120px', position: 'relative' }}>
                                    <Line
                                        data={{
                                            labels: sortedFilterInTime.map(record => record.name),
                                            datasets: [
                                                {
                                                    label: 'Nombre de tickets',
                                                    data: sortedFilterInTime.map(record => record.receives),
                                                    borderColor: 'rgba(0, 0, 0, 1)',
                                                    backgroundColor: 'rgba(0, 0, 0, 0.1)',
                                                    borderWidth: 2,
                                                    pointRadius: 4,
                                                    pointBackgroundColor: sortedFilterInTime.map(record => pointColor(record.name)),
                                                    tension: 0.4,
                                                    datalabels: {
                                                        anchor: 'end',
                                                        align: 'top',
                                                        formatter: (value: number) => value.toString(),
                                                        font: {
                                                            size: 11,
                                                            weight: 'bold'
                                                        },
                                                        color: '#000',
                                                        offset: 5
                                                    }
                                                }
                                            ] as any
                                        }}
                                        options={{
                                            responsive: true,
                                            maintainAspectRatio: false,
                                            layout: {
                                                padding: {
                                                    top: 20,
                                                    left: 14
                                                }
                                            },
                                            plugins: {
                                                legend: {
                                                    display: false,
                                                },
                                                tooltip: {
                                                    enabled: true,
                                                    callbacks: {
                                                        label: function (context) {
                                                            return 'Tickets: ' + context.parsed.y;
                                                        }
                                                    }
                                                },
                                                datalabels: {
                                                    display: true
                                                }
                                            },
                                            scales: {
                                                x: {
                                                    display: false,
                                                    offset: true,
                                                    grid: {
                                                        display: false,
                                                        offset: true
                                                    }
                                                },
                                                y: {
                                                    display: false,
                                                    beginAtZero: true,
                                                    suggestedMax: Math.max(...sortedFilterInTime.map(r => r.receives)) + 1.2,
                                                    grid: {
                                                        display: false
                                                    }
                                                }
                                            },
                                        }}
                                    />
                                </div>

                                {/* Graphique des barres (pourcentage tickets en normes) - EN BAS */}
                                <div style={{ height: '280px', marginLeft: '-8px' }}>
                                    <Bar
                                        data={{
                                            labels: sortedFilterInTime.map(record => record.name),
                                            datasets: [
                                                {
                                                    label: 'Pourcentage de tickets en normes',
                                                    data: sortedFilterInTime.map(record =>
                                                        record.receives > 0 ? (record.serves / record.receives) * 100 : 0
                                                    ),
                                                    backgroundColor: sortedFilterInTime.map(record => barColor(record.name, '#E0E0E0')),
                                                    borderRadius: 4,
                                                    barPercentage: 0.7,
                                                    categoryPercentage: 0.6,
                                                    yAxisID: 'y',
                                                    datalabels: {
                                                        color: '#000',
                                                        rotation: -90,
                                                        anchor: (context: any) => {
                                                            const value = context.dataset.data[context.dataIndex];
                                                            const maxValue = Math.max(...context.dataset.data);
                                                            // Si la valeur est petite (moins de 30% du max), mettre au-dessus
                                                            return value < maxValue * 0.3 ? 'end' : 'center';
                                                        },
                                                        align: (context: any) => {
                                                            const value = context.dataset.data[context.dataIndex];
                                                            const maxValue = Math.max(...context.dataset.data);
                                                            return value < maxValue * 0.3 ? 'end' : 'center';
                                                        },
                                                        offset: (context: any) => {
                                                            const value = context.dataset.data[context.dataIndex];
                                                            const maxValue = Math.max(...context.dataset.data);
                                                            return value < maxValue * 0.3 ? 4 : 0;
                                                        },
                                                        formatter: (value: number) => {
                                                            if (value === 0) return null;
                                                            return Math.round(Number.parseFloat(value.toFixed(1))) + '%';
                                                        },
                                                        font: {
                                                            weight: 'bold',
                                                            size: 9
                                                        },
                                                        clip: false
                                                    }
                                                }
                                            ] as any
                                        }}
                                        options={{
                                            responsive: true,
                                            maintainAspectRatio: false,
                                            layout: {
                                                padding: 0
                                            },
                                            plugins: {
                                                legend: {
                                                    display: false,
                                                },
                                                tooltip: {
                                                    callbacks: {
                                                        label: function (context) {
                                                            return 'Pourcentage: ' + Math.round(Number.parseFloat(context.parsed.y.toFixed(1))) + '%';
                                                        }
                                                    }
                                                },
                                                datalabels: {
                                                    display: true
                                                }
                                            },
                                            scales: {
                                                x: {
                                                    display: true,
                                                    offset: true,
                                                    grid: {
                                                        display: false,
                                                        offset: true
                                                    },
                                                    ticks: {
                                                        font: {
                                                            size: 10
                                                        }
                                                    }
                                                },
                                                y: {
                                                    display: false,
                                                    beginAtZero: true,
                                                    max: 100,
                                                    grid: {
                                                        display: false
                                                    }
                                                }
                                            },
                                        }}
                                    />
                                </div>
                            </div>
                            );
                        })() : (
                            <p className="text-center text-gray-500 py-8">Aucune donnée disponible</p>
                        )
                    )}
                </div>
            </div>

            {/* Nombre moyen de tickets par caisse et par agence */}
            <div className="flex flex-col my-3">
                <div className="bg-gradient-to-r from-gray-800 to-gray-900 text-white py-3 px-4 rounded-t-lg">
                    <h2 className="text-sm font-semibold text-center">
                        Nombre moyen de tickets par caisse et par agence
                    </h2>
                </div>
                <div className="bg-white rounded-b-lg shadow-sm border border-gray-100 pt-8 pb-8" style={{ paddingLeft: '16px', paddingRight: '16px' }}>
                    {filter === false ? (
                        result?.meanWaitingTimeAndSubservices && result.meanWaitingTimeAndSubservices.length > 0 ? (() => {
                            const sortedTickets = [...result.meanWaitingTimeAndSubservices]
                                .filter(r => ticketThreshold === 0 || (result.totalInTimeByOffice?.find(o => o.name === r.name)?.receives ?? 0) >= ticketThreshold)
                                .sort((a, b) => {
                                const rA = result.totalInTimeByOffice?.find(o => o.name === a.name)?.receives ?? 0;
                                const rB = result.totalInTimeByOffice?.find(o => o.name === b.name)?.receives ?? 0;
                                return rA - rB;
                            });
                            return (
                            <div className="relative">
                                {/* Graphique ligne (nombre de caisses) - EN HAUT */}
                                <div style={{ height: '124px', position: 'relative' }}>
                                    <Line
                                        data={{
                                            labels: sortedTickets.map(record => record.name),
                                            datasets: [
                                                {
                                                    label: 'Nombre de caisses',
                                                    data: sortedTickets.map(record => record.subServices),
                                                    borderColor: 'rgba(0, 0, 0, 1)',
                                                    backgroundColor: 'rgba(0, 0, 0, 0.1)',
                                                    borderWidth: 2,
                                                    pointRadius: 4,
                                                    pointBackgroundColor: sortedTickets.map(record => pointColor(record.name)),
                                                    tension: 0.4,
                                                    datalabels: {
                                                        anchor: 'end',
                                                        align: 'top',
                                                        formatter: (value: number) => value.toString(),
                                                        font: { size: 11, weight: 'bold' },
                                                        color: '#000',
                                                        offset: 5
                                                    }
                                                }
                                            ] as any
                                        }}
                                        options={{
                                            responsive: true,
                                            maintainAspectRatio: false,
                                            layout: { padding: { top: 22, left: 14 } },
                                            plugins: {
                                                legend: { display: false },
                                                tooltip: {
                                                    enabled: true,
                                                    callbacks: {
                                                        label: function(context) {
                                                            return 'Caisses: ' + context.parsed.y;
                                                        }
                                                    }
                                                },
                                                datalabels: { display: true }
                                            },
                                            scales: {
                                                x: { display: false, offset: true, grid: { display: false, offset: true } },
                                                y: {
                                                    display: false,
                                                    beginAtZero: true,
                                                    suggestedMax: Math.max(...sortedTickets.map(r => r.subServices)) + 2,
                                                    grid: { display: false }
                                                }
                                            }
                                        }}
                                    />
                                </div>
                                {/* Graphique barres (nombre de tickets) - EN BAS */}
                                <div style={{ height: '280px', marginLeft: '-8px' }}>
                                    <Bar
                                        data={{
                                            labels: sortedTickets.map(record => record.name),
                                            datasets: [
                                                {
                                                    label: 'Nombre de tickets',
                                                    data: sortedTickets.map(record => {
                                                        const office = result.totalInTimeByOffice?.find(o => o.name === record.name);
                                                        return office ? office.receives : 0;
                                                    }),
                                                    backgroundColor: sortedTickets.map(record => barColor(record.name, '#E0E0E0')),
                                                    borderRadius: 4,
                                                    barPercentage: 0.7,
                                                    categoryPercentage: 0.6,
                                                    yAxisID: 'y',
                                                    datalabels: {
                                                        color: '#000',
                                                        rotation: -90,
                                                        anchor: (context: any) => {
                                                            const value = context.dataset.data[context.dataIndex];
                                                            const maxValue = Math.max(...context.dataset.data);
                                                            return value < maxValue * 0.3 ? 'end' : 'center';
                                                        },
                                                        align: (context: any) => {
                                                            const value = context.dataset.data[context.dataIndex];
                                                            const maxValue = Math.max(...context.dataset.data);
                                                            return value < maxValue * 0.3 ? 'end' : 'center';
                                                        },
                                                        offset: (context: any) => {
                                                            const value = context.dataset.data[context.dataIndex];
                                                            const maxValue = Math.max(...context.dataset.data);
                                                            return value < maxValue * 0.3 ? 4 : 0;
                                                        },
                                                        formatter: (value: number) => {
                                                            if (value === 0) return null;
                                                            return value.toString();
                                                        },
                                                        font: { weight: 'bold', size: 9 },
                                                        clip: false
                                                    }
                                                }
                                            ] as any
                                        }}
                                        options={{
                                            responsive: true,
                                            maintainAspectRatio: false,
                                            layout: { padding: 0 },
                                            plugins: {
                                                legend: { display: false },
                                                tooltip: {
                                                    callbacks: {
                                                        label: function(context) {
                                                            return 'Tickets: ' + context.parsed.y;
                                                        }
                                                    }
                                                },
                                                datalabels: { display: true }
                                            },
                                            scales: {
                                                x: {
                                                    display: true,
                                                    offset: true,
                                                    grid: { display: false, offset: true },
                                                    ticks: { font: { size: 10 } }
                                                },
                                                y: { display: false, beginAtZero: true, grid: { display: false } }
                                            }
                                        }}
                                    />
                                </div>
                            </div>
                            );
                        })() : (
                            <p className="text-center text-gray-500 py-8">Aucune donnée disponible</p>
                        )
                    ) : (
                        filterStats?.meanWaitingTimeAndSubservices && filterStats.meanWaitingTimeAndSubservices.length > 0 ? (() => {
                            const sortedFilterTickets = [...filterStats.meanWaitingTimeAndSubservices]
                                .filter(r => ticketThreshold === 0 || (filterStats.totalInTimeByOffice?.find(o => o.name === r.name)?.receives ?? 0) >= ticketThreshold)
                                .sort((a, b) => {
                                const rA = filterStats.totalInTimeByOffice?.find(o => o.name === a.name)?.receives ?? 0;
                                const rB = filterStats.totalInTimeByOffice?.find(o => o.name === b.name)?.receives ?? 0;
                                return rA - rB;
                            });
                            return (
                            <div className="relative">
                                {/* Graphique ligne (nombre de caisses) - EN HAUT */}
                                <div style={{ height: '124px', position: 'relative' }}>
                                    <Line
                                        data={{
                                            labels: sortedFilterTickets.map(record => record.name),
                                            datasets: [
                                                {
                                                    label: 'Nombre de caisses',
                                                    data: sortedFilterTickets.map(record => record.subServices),
                                                    borderColor: 'rgba(0, 0, 0, 1)',
                                                    backgroundColor: 'rgba(0, 0, 0, 0.1)',
                                                    borderWidth: 2,
                                                    pointRadius: 4,
                                                    pointBackgroundColor: sortedFilterTickets.map(record => pointColor(record.name)),
                                                    tension: 0.4,
                                                    datalabels: {
                                                        anchor: 'end',
                                                        align: 'top',
                                                        formatter: (value: number) => value.toString(),
                                                        font: { size: 11, weight: 'bold' },
                                                        color: '#000',
                                                        offset: 5
                                                    }
                                                }
                                            ] as any
                                        }}
                                        options={{
                                            responsive: true,
                                            maintainAspectRatio: false,
                                            layout: { padding: { top: 22, left: 14 } },
                                            plugins: {
                                                legend: { display: false },
                                                tooltip: {
                                                    enabled: true,
                                                    callbacks: {
                                                        label: function(context) {
                                                            return 'Caisses: ' + context.parsed.y;
                                                        }
                                                    }
                                                },
                                                datalabels: { display: true }
                                            },
                                            scales: {
                                                x: { display: false, offset: true, grid: { display: false, offset: true } },
                                                y: {
                                                    display: false,
                                                    beginAtZero: true,
                                                    suggestedMax: Math.max(...sortedFilterTickets.map(r => r.subServices)) + 2,
                                                    grid: { display: false }
                                                }
                                            }
                                        }}
                                    />
                                </div>
                                {/* Graphique barres (nombre de tickets) - EN BAS */}
                                <div style={{ height: '280px', marginLeft: '-8px' }}>
                                    <Bar
                                        data={{
                                            labels: sortedFilterTickets.map(record => record.name),
                                            datasets: [
                                                {
                                                    label: 'Nombre de tickets',
                                                    data: sortedFilterTickets.map(record => {
                                                        const office = filterStats.totalInTimeByOffice?.find(o => o.name === record.name);
                                                        return office ? office.receives : 0;
                                                    }),
                                                    backgroundColor: sortedFilterTickets.map(record => barColor(record.name, '#E0E0E0')),
                                                    borderRadius: 4,
                                                    barPercentage: 0.7,
                                                    categoryPercentage: 0.6,
                                                    yAxisID: 'y',
                                                    datalabels: {
                                                        color: '#000',
                                                        rotation: -90,
                                                        anchor: (context: any) => {
                                                            const value = context.dataset.data[context.dataIndex];
                                                            const maxValue = Math.max(...context.dataset.data);
                                                            return value < maxValue * 0.3 ? 'end' : 'center';
                                                        },
                                                        align: (context: any) => {
                                                            const value = context.dataset.data[context.dataIndex];
                                                            const maxValue = Math.max(...context.dataset.data);
                                                            return value < maxValue * 0.3 ? 'end' : 'center';
                                                        },
                                                        offset: (context: any) => {
                                                            const value = context.dataset.data[context.dataIndex];
                                                            const maxValue = Math.max(...context.dataset.data);
                                                            return value < maxValue * 0.3 ? 4 : 0;
                                                        },
                                                        formatter: (value: number) => {
                                                            if (value === 0) return null;
                                                            return value.toString();
                                                        },
                                                        font: { weight: 'bold', size: 9 },
                                                        clip: false
                                                    }
                                                }
                                            ] as any
                                        }}
                                        options={{
                                            responsive: true,
                                            maintainAspectRatio: false,
                                            layout: { padding: 0 },
                                            plugins: {
                                                legend: { display: false },
                                                tooltip: {
                                                    callbacks: {
                                                        label: function(context) {
                                                            return 'Tickets: ' + context.parsed.y;
                                                        }
                                                    }
                                                },
                                                datalabels: { display: true }
                                            },
                                            scales: {
                                                x: {
                                                    display: true,
                                                    offset: true,
                                                    grid: { display: false, offset: true },
                                                    ticks: { font: { size: 10 } }
                                                },
                                                y: { display: false, beginAtZero: true, grid: { display: false } }
                                            }
                                        }}
                                    />
                                </div>
                            </div>
                            );
                        })() : (
                            <p className="text-center text-gray-500 py-8">Aucune donnée disponible</p>
                        )
                    )}
                </div>
            </div>

            {/* Section Délais d'attente et de traitement */}
            <div className="flex flex-col my-3">
                <div className="bg-gradient-to-r from-gray-800 to-gray-900 text-white py-3 px-4 rounded-t-lg">
                    <h2 className="text-sm font-semibold text-center">Délais d&apos;attente et de traitement</h2>
                </div>
                <div className="bg-white rounded-b-lg shadow-sm border border-gray-100 pt-8 px-4 pb-8">
                    {filter === false ? (
                        result?.totalByOffices && result.totalByOffices.length > 0 ? (() => {
                            const sortedByWaiting = [...result.totalByOffices]
                                .filter(r => ticketThreshold === 0 || (result.totalInTimeByOffice?.find(o => o.name === r.name)?.receives ?? 0) >= ticketThreshold)
                                .sort((a, b) => a.meanWaitingTime - b.meanWaitingTime);
                            return (
                            <div style={{ height: '400px' }}>
                                <Bar
                                    data={{
                                        labels: sortedByWaiting.map(record => record.name),
                                        datasets: [
                                            {
                                                label: 'Temps d\'attente',
                                                data: sortedByWaiting.map(record => record.meanWaitingTime),
                                                backgroundColor: sortedByWaiting.map(record => barColor(record.name, '#E0E0E0')),
                                                borderColor: '#E0E0E0',
                                                borderWidth: 1,
                                                borderRadius: 4,
                                                barPercentage: 0.8,
                                                categoryPercentage: 0.7,
                                                datalabels: {
                                                    color: '#000',
                                                    rotation: -90,
                                                    anchor: (context: any) => {
                                                        const value = context.dataset.data[context.dataIndex];
                                                        const maxValue = Math.max(...context.dataset.data);
                                                        return value < maxValue * 0.3 ? 'end' : 'center';
                                                    },
                                                    align: (context: any) => {
                                                        const value = context.dataset.data[context.dataIndex];
                                                        const maxValue = Math.max(...context.dataset.data);
                                                        return value < maxValue * 0.3 ? 'end' : 'center';
                                                    },
                                                    offset: (context: any) => {
                                                        const value = context.dataset.data[context.dataIndex];
                                                        const maxValue = Math.max(...context.dataset.data);
                                                        return value < maxValue * 0.3 ? 4 : 0;
                                                    },
                                                    formatter: (value: number) => {
                                                        if (value === 0) return null;
                                                        return formatMinutesToTime(value);
                                                    },
                                                    font: {
                                                        weight: 'bold',
                                                        size: 9
                                                    },
                                                    clip: false
                                                }
                                            },
                                            {
                                                label: 'Temps de traitement',
                                                data: sortedByWaiting.map(record => record.meanServingTime),
                                                backgroundColor: sortedByWaiting.map(record => barColor(record.name, '#F4A261')),
                                                borderColor: '#F4A261',
                                                borderWidth: 1,
                                                borderRadius: 4,
                                                barPercentage: 0.8,
                                                categoryPercentage: 0.7,
                                                datalabels: {
                                                    color: '#000',
                                                    rotation: -90,
                                                    anchor: (context: any) => {
                                                        const value = context.dataset.data[context.dataIndex];
                                                        const maxValue = Math.max(...context.chart.data.datasets.flatMap((ds: any) => ds.data));
                                                        return value < maxValue * 0.3 ? 'end' : 'center';
                                                    },
                                                    align: (context: any) => {
                                                        const value = context.dataset.data[context.dataIndex];
                                                        const maxValue = Math.max(...context.chart.data.datasets.flatMap((ds: any) => ds.data));
                                                        return value < maxValue * 0.3 ? 'end' : 'center';
                                                    },
                                                    offset: (context: any) => {
                                                        const value = context.dataset.data[context.dataIndex];
                                                        const maxValue = Math.max(...context.chart.data.datasets.flatMap((ds: any) => ds.data));
                                                        return value < maxValue * 0.3 ? 4 : 0;
                                                    },
                                                    formatter: (value: number) => {
                                                        if (value === 0) return null;
                                                        return formatMinutesToTime(value);
                                                    },
                                                    font: {
                                                        weight: 'bold',
                                                        size: 9
                                                    },
                                                    clip: false
                                                }
                                            }
                                        ] as any
                                    }}
                                    options={{
                                        responsive: true,
                                        maintainAspectRatio: false,
                                        plugins: {
                                            legend: {
                                                display: true,
                                                position: 'top',
                                                labels: {
                                                    font: {
                                                        size: 12
                                                    }
                                                }
                                            },
                                            tooltip: {
                                                callbacks: {
                                                    label: function(context) {
                                                        return context.dataset.label + ': ' + formatMinutesToTime(context.parsed.y);
                                                    }
                                                }
                                            },
                                            datalabels: {
                                                display: true
                                            }
                                        },
                                        scales: {
                                            x: {
                                                display: true,
                                                grid: {
                                                    display: false
                                                },
                                                ticks: {
                                                    font: {
                                                        size: 10
                                                    }
                                                }
                                            },
                                            y: {
                                                display: false,
                                                grid: {
                                                    display: false
                                                }
                                            }
                                        },
                                    }}
                                />
                            </div>
                            );
                        })() : (
                            <p className="text-center text-gray-500 py-8">Aucune donnée disponible</p>
                        )
                    ) : (
                        filterStats?.totalByOffices && filterStats.totalByOffices.length > 0 ? (() => {
                            const sortedFilterByWaiting = [...filterStats.totalByOffices]
                                .filter(r => ticketThreshold === 0 || (filterStats.totalInTimeByOffice?.find(o => o.name === r.name)?.receives ?? 0) >= ticketThreshold)
                                .sort((a, b) => a.meanWaitingTime - b.meanWaitingTime);
                            return (
                            <div style={{ height: '400px' }}>
                                <Bar
                                    data={{
                                        labels: sortedFilterByWaiting.map(record => record.name),
                                        datasets: [
                                            {
                                                label: 'Temps d\'attente',
                                                data: sortedFilterByWaiting.map(record => record.meanWaitingTime),
                                                backgroundColor: sortedFilterByWaiting.map(record => barColor(record.name, '#E0E0E0')),
                                                borderColor: '#E0E0E0',
                                                borderWidth: 1,
                                                borderRadius: 4,
                                                barPercentage: 1,
                                                categoryPercentage: 0.7,
                                                datalabels: {
                                                    color: '#000',
                                                    rotation: -90,
                                                    anchor: (context: any) => {
                                                        const value = context.dataset.data[context.dataIndex];
                                                        const maxValue = Math.max(...context.dataset.data);
                                                        return value < maxValue * 0.3 ? 'end' : 'center';
                                                    },
                                                    align: (context: any) => {
                                                        const value = context.dataset.data[context.dataIndex];
                                                        const maxValue = Math.max(...context.dataset.data);
                                                        return value < maxValue * 0.3 ? 'end' : 'center';
                                                    },
                                                    offset: (context: any) => {
                                                        const value = context.dataset.data[context.dataIndex];
                                                        const maxValue = Math.max(...context.dataset.data);
                                                        return value < maxValue * 0.3 ? 4 : 0;
                                                    },
                                                    formatter: (value: number) => {
                                                        if (value === 0) return null;
                                                        return formatMinutesToTime(value);
                                                    },
                                                    font: {
                                                        weight: 'bold',
                                                        size: 9
                                                    },
                                                    clip: false
                                                }
                                            },
                                            {
                                                label: 'Temps de traitement',
                                                data: sortedFilterByWaiting.map(record => record.meanServingTime),
                                                backgroundColor: sortedFilterByWaiting.map(record => barColor(record.name, '#F4A261')),
                                                borderColor: '#F4A261',
                                                borderWidth: 1,
                                                borderRadius: 4,
                                                barPercentage: 0.9,
                                                categoryPercentage: 0.7,
                                                datalabels: {
                                                    color: '#000',
                                                    rotation: -90,
                                                    anchor: (context: any) => {
                                                        const value = context.dataset.data[context.dataIndex];
                                                        const maxValue = Math.max(...context.chart.data.datasets.flatMap((ds: any) => ds.data));
                                                        return value < maxValue * 0.3 ? 'end' : 'center';
                                                    },
                                                    align: (context: any) => {
                                                        const value = context.dataset.data[context.dataIndex];
                                                        const maxValue = Math.max(...context.chart.data.datasets.flatMap((ds: any) => ds.data));
                                                        return value < maxValue * 0.3 ? 'end' : 'center';
                                                    },
                                                    offset: (context: any) => {
                                                        const value = context.dataset.data[context.dataIndex];
                                                        const maxValue = Math.max(...context.chart.data.datasets.flatMap((ds: any) => ds.data));
                                                        return value < maxValue * 0.3 ? 4 : 0;
                                                    },
                                                    formatter: (value: number) => {
                                                        if (value === 0) return null;
                                                        return formatMinutesToTime(value);
                                                    },
                                                    font: {
                                                        weight: 'bold',
                                                        size: 9
                                                    },
                                                    clip: false
                                                }
                                            }
                                        ] as any
                                    }}
                                    options={{
                                        responsive: true,
                                        maintainAspectRatio: false,
                                        plugins: {
                                            legend: {
                                                display: true,
                                                position: 'top',
                                                labels: {
                                                    font: {
                                                        size: 12
                                                    }
                                                }
                                            },
                                            tooltip: {
                                                callbacks: {
                                                    label: function(context) {
                                                        return context.dataset.label + ': ' + formatMinutesToTime(context.parsed.y);
                                                    }
                                                }
                                            },
                                            datalabels: {
                                                display: true
                                            }
                                        },
                                        scales: {
                                            x: {
                                                display: true,
                                                grid: {
                                                    display: false
                                                },
                                                ticks: {
                                                    font: {
                                                        size: 10
                                                    }
                                                }
                                            },
                                            y: {
                                                display: false
                                            }
                                        },
                                    }}
                                />
                            </div>
                            );
                        })() : (
                            <p className="text-center text-gray-500 py-8">Aucune donnée disponible</p>
                        )
                    )}
                </div>
            </div>

            {/* Section Conformité aux objectifs */}
            <div className="flex flex-col my-3">
                <div className="bg-gradient-to-r from-gray-800 to-gray-900 text-white py-3 px-4 rounded-t-lg">
                    <h2 className="text-sm font-semibold text-center">Conformité aux objectifs</h2>
                </div>
                <div className="bg-white rounded-b-lg shadow-sm border border-gray-100 pt-8 px-4 pb-8">
                    {filter === false ? (
                        result?.totalInTimeByOffice && result.totalInTimeByOffice.length > 0 ? (() => {
                            const sortedConformity = [...result.totalInTimeByOffice]
                                .filter(r => ticketThreshold === 0 || r.receives >= ticketThreshold)
                                .sort((a, b) => {
                                const pA = a.receives > 0 ? (a.waitings / a.receives) * 100 : 0;
                                const pB = b.receives > 0 ? (b.waitings / b.receives) * 100 : 0;
                                return pA - pB;
                            });
                            return (
                            <div style={{ height: '400px' }}>
                                <Bar
                                    data={{
                                        labels: sortedConformity.map(record => record.name),
                                        datasets: [
                                            {
                                                label: 'Conformité attente',
                                                data: sortedConformity.map(record =>
                                                    record.receives > 0 ? (record.waitings / record.receives) * 100 : 0
                                                ),
                                                backgroundColor: sortedConformity.map(record => barColor(record.name, '#E0E0E0')),
                                                borderColor: '#E0E0E0',
                                                borderWidth: 1,
                                                borderRadius: 4,
                                                barPercentage: 0.8,
                                                categoryPercentage: 0.7,
                                                datalabels: {
                                                    color: '#000',
                                                    rotation: -90,
                                                    anchor: (context: any) => {
                                                        const value = context.dataset.data[context.dataIndex];
                                                        const maxValue = Math.max(...context.dataset.data);
                                                        return value < maxValue * 0.3 ? 'end' : 'center';
                                                    },
                                                    align: (context: any) => {
                                                        const value = context.dataset.data[context.dataIndex];
                                                        const maxValue = Math.max(...context.dataset.data);
                                                        return value < maxValue * 0.3 ? 'end' : 'center';
                                                    },
                                                    offset: (context: any) => {
                                                        const value = context.dataset.data[context.dataIndex];
                                                        const maxValue = Math.max(...context.dataset.data);
                                                        return value < maxValue * 0.3 ? 4 : 0;
                                                    },
                                                    formatter: (value: number) => {
                                                        if (value === 0) return null;
                                                        return Math.floor(Number.parseFloat(value.toFixed(1))) + '%';
                                                    },
                                                    font: {
                                                        weight: 'bold',
                                                        size: 9
                                                    },
                                                    clip: false
                                                }
                                            },
                                            {
                                                label: 'Conformité traitement',
                                                data: sortedConformity.map(record =>
                                                    record.receives > 0 ? (record.serves / record.receives) * 100 : 0
                                                ),
                                                backgroundColor: sortedConformity.map(record => barColor(record.name, '#F4A261')),
                                                borderColor: '#F4A261',
                                                borderWidth: 1,
                                                borderRadius: 4,
                                                barPercentage: 0.8,
                                                categoryPercentage: 0.7,
                                                datalabels: {
                                                    color: '#000',
                                                    rotation: -90,
                                                    anchor: (context: any) => {
                                                        const value = context.dataset.data[context.dataIndex];
                                                        const maxValue = Math.max(...context.dataset.data);
                                                        return value < maxValue * 0.3 ? 'end' : 'center';
                                                    },
                                                    align: (context: any) => {
                                                        const value = context.dataset.data[context.dataIndex];
                                                        const maxValue = Math.max(...context.dataset.data);
                                                        return value < maxValue * 0.3 ? 'end' : 'center';
                                                    },
                                                    offset: (context: any) => {
                                                        const value = context.dataset.data[context.dataIndex];
                                                        const maxValue = Math.max(...context.dataset.data);
                                                        return value < maxValue * 0.3 ? 4 : 0;
                                                    },
                                                    formatter: (value: number) => {
                                                        if (value === 0) return null;
                                                        return Math.floor(Number.parseFloat(value.toFixed(1))) + '%';
                                                    },
                                                    font: {
                                                        weight: 'bold',
                                                        size: 9
                                                    },
                                                    clip: false
                                                }
                                            }
                                        ] as any
                                    }}
                                    options={{
                                        responsive: true,
                                        maintainAspectRatio: false,
                                        plugins: {
                                            legend: {
                                                display: true,
                                                position: 'top',
                                                labels: {
                                                    font: {
                                                        size: 12
                                                    }
                                                }
                                            },
                                            tooltip: {
                                                callbacks: {
                                                    label: function(context) {
                                                        return context.dataset.label + ': ' + context.parsed.y.toFixed(1) + '%';
                                                    }
                                                }
                                            },
                                            datalabels: {
                                                display: true
                                            }
                                        },
                                        scales: {
                                            x: {
                                                display: true,
                                                grid: {
                                                    display: false
                                                },
                                                ticks: {
                                                    font: {
                                                        size: 10
                                                    }
                                                }
                                            },
                                            y: {
                                                display: false
                                            }
                                        },
                                    }}
                                />
                            </div>
                            );
                        })() : (
                            <p className="text-center text-gray-500 py-8">Aucune donnée disponible</p>
                        )
                    ) : (
                        filterStats?.totalInTimeByOffice && filterStats.totalInTimeByOffice.length > 0 ? (() => {
                            const sortedFilterConformity = [...filterStats.totalInTimeByOffice]
                                .filter(r => ticketThreshold === 0 || r.receives >= ticketThreshold)
                                .sort((a, b) => {
                                const pA = a.receives > 0 ? (a.waitings / a.receives) * 100 : 0;
                                const pB = b.receives > 0 ? (b.waitings / b.receives) * 100 : 0;
                                return pA - pB;
                            });
                            return (
                            <div style={{ height: '400px' }}>
                                <Bar
                                    data={{
                                        labels: sortedFilterConformity.map(record => record.name),
                                        datasets: [
                                            {
                                                label: 'Conformité attente',
                                                data: sortedFilterConformity.map(record =>
                                                    record.receives > 0 ? (record.waitings / record.receives) * 100 : 0
                                                ),
                                                backgroundColor: sortedFilterConformity.map(record => barColor(record.name, '#E0E0E0')),
                                                borderColor: '#E0E0E0',
                                                borderWidth: 1,
                                                borderRadius: 4,
                                                barPercentage: 0.8,
                                                categoryPercentage: 0.7,
                                                datalabels: {
                                                    color: '#000',
                                                    rotation: -90,
                                                    anchor: (context: any) => {
                                                        const value = context.dataset.data[context.dataIndex];
                                                        const maxValue = Math.max(...context.dataset.data);
                                                        return value < maxValue * 0.3 ? 'end' : 'center';
                                                    },
                                                    align: (context: any) => {
                                                        const value = context.dataset.data[context.dataIndex];
                                                        const maxValue = Math.max(...context.dataset.data);
                                                        return value < maxValue * 0.3 ? 'end' : 'center';
                                                    },
                                                    offset: (context: any) => {
                                                        const value = context.dataset.data[context.dataIndex];
                                                        const maxValue = Math.max(...context.dataset.data);
                                                        return value < maxValue * 0.3 ? 4 : 0;
                                                    },
                                                    formatter: (value: number) => {
                                                        if (value === 0) return null;
                                                        return Math.floor(Number.parseFloat(value.toFixed(1))) + '%';
                                                    },
                                                    font: {
                                                        weight: 'bold',
                                                        size: 9
                                                    },
                                                    clip: false
                                                }
                                            },
                                            {
                                                label: 'Conformité traitement',
                                                data: sortedFilterConformity.map(record =>
                                                    record.receives > 0 ? (record.serves / record.receives) * 100 : 0
                                                ),
                                                backgroundColor: sortedFilterConformity.map(record => barColor(record.name, '#F4A261')),
                                                borderColor: '#F4A261',
                                                borderWidth: 1,
                                                borderRadius: 4,
                                                barPercentage: 0.8,
                                                categoryPercentage: 0.7,
                                                datalabels: {
                                                    color: '#000',
                                                    rotation: -90,
                                                    anchor: (context: any) => {
                                                        const value = context.dataset.data[context.dataIndex];
                                                        const maxValue = Math.max(...context.dataset.data);
                                                        return value < maxValue * 0.3 ? 'end' : 'center';
                                                    },
                                                    align: (context: any) => {
                                                        const value = context.dataset.data[context.dataIndex];
                                                        const maxValue = Math.max(...context.dataset.data);
                                                        return value < maxValue * 0.3 ? 'end' : 'center';
                                                    },
                                                    offset: (context: any) => {
                                                        const value = context.dataset.data[context.dataIndex];
                                                        const maxValue = Math.max(...context.dataset.data);
                                                        return value < maxValue * 0.3 ? 4 : 0;
                                                    },
                                                    formatter: (value: number) => {
                                                        if (value === 0) return null;
                                                        return Math.floor(Number.parseFloat(value.toFixed(1))) + '%';
                                                    },
                                                    font: {
                                                        weight: 'bold',
                                                        size: 9
                                                    },
                                                    clip: false
                                                }
                                            }
                                        ] as any
                                    }}
                                    options={{
                                        responsive: true,
                                        maintainAspectRatio: false,
                                        plugins: {
                                            legend: {
                                                display: true,
                                                position: 'top',
                                                labels: {
                                                    font: {
                                                        size: 12
                                                    }
                                                }
                                            },
                                            tooltip: {
                                                callbacks: {
                                                    label: function(context) {
                                                        return context.dataset.label + ': ' + context.parsed.y.toFixed(1) + '%';
                                                    }
                                                }
                                            },
                                            datalabels: {
                                                display: true
                                            }
                                        },
                                        scales: {
                                            x: {
                                                display: true,
                                                grid: {
                                                    display: false
                                                },
                                                ticks: {
                                                    font: {
                                                        size: 10
                                                    }
                                                }
                                            },
                                            y: {
                                                display: false
                                            }
                                        },
                                    }}
                                />
                            </div>
                            );
                        })() : (
                            <p className="text-center text-gray-500 py-8">Aucune donnée disponible</p>
                        )
                    )}
                </div>
            </div>

            {graphAccordions()}


        </div>
    )
}

export default Report
"use client";
import { RiFileExcel2Fill } from "react-icons/ri";
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
import { Doughnut, Line } from 'react-chartjs-2';
import Loader from "@/components/common/Loader";
import useSWR from "swr";
import useAxiosAuth from "@/hooks/useAxiosAuth";
import * as FileSaver from 'file-saver';
import XLSX from 'sheetjs-style';
import { useEffect, useState } from "react";
import useChangeHeaderTitle from "../../hooks/useChangedHeader";
import { IoReload, IoTabletLandscape } from "react-icons/io5";
import { FaClipboardList, FaRegCalendar } from "react-icons/fa";
import { CiFilter } from "react-icons/ci";
import { Menu, MenuItem } from "@mui/material";
import { format } from 'date-fns';
import { fr } from "date-fns/locale/fr";
import toast from "react-hot-toast";
import { MdOutlineSupportAgent } from "react-icons/md";
import 'chart.js/auto';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { HiOutlineBuildingOffice } from "react-icons/hi2";

ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
    ArcElement
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

    useEffect(() => {
        useChangeTitle.onChanged("Tableau de bord");
    }, []); // Exécuté une seule fois au montage

    useEffect(() => {
        // Formatage de la date actuelle
        const today = new Date();
        const formattedDate = format(today, 'EEEE dd MMMM yyyy', { locale: fr });

        setCurrentDate(`Aujourd'hui : ${formattedDate}`);
        setFormattedStartDate(format(startDate, 'dd/MM/yyyy'));
        setDescription(`Ceci represente l'ensemble des données pour toutes les agences pour la date d'aujourd'hui ${today.toLocaleDateString('fr-FR')}`);
    }, [startDate]); // Dépend de startDate

    useEffect(() => {
        if (result?.appointmentsByHourSlot && result?.servingAppointmentsByHourSlot) {
            setWaitingAppointmentsOfficeByHourSlot(
                calculateWaitings(result.appointmentsByHourSlot, result.servingAppointmentsByHourSlot)
            );
        } else {
            setWaitingAppointmentsOfficeByHourSlot([]);
        }
    }, [result]);

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
        totalNotInTimeByOffice: []
    }

    const [filterStats, setFilterStats] = useState(emptyStats);
    const [filter, setFilter] = useState(false);
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
        let stats: any;
        if (filter) {
            stats = filterStats;
        } else {
            stats = result;
        }
        if (stats) {
            // Ajouter le titre et la description sur des lignes distinctes
            const titleStyle = { font: { bold: true, size: 18, color: '#FF0000' } }; // Style personnalisé pour le titre
            const descriptionStyle = { font: { italic: true, size: 14, color: '#0000FF' } }; // Style personnalisé pour la description
            const descript = { '': { v: description, s: descriptionStyle } };

            const offices: any = [];
            const title1 = { '': { v: 'Nombre de tickets par Agence', s: titleStyle } };
            offices.push(title1, descript);
            const jump = { '': '' };
            offices.push(jump);
            for (let index = 0; index < stats.appointmentsByOffice.length; index++) {
                const element = stats.appointmentsByOffice[index];
                const serviceTitle = { '': { v: element.name, s: titleStyle } };
                offices.push(serviceTitle);
                const headers2 = {
                    'Reçu': 'Reçu',
                    'Traité': 'Traité',
                    'En attente': 'En attente'
                };
                offices.push(headers2);
                const data = {
                    'Reçu': element.amount ? element.amount : 0,
                    'Traité': stats.serveAppointmentsByOffice[index]?.amount ? stats.serveAppointmentsByOffice[index]?.amount : 0,
                    'En attente': stats.waitingAppointmentsByOffice[index]?.amount ? stats.waitingAppointmentsByOffice[index]?.amount : 0
                };
                offices.push(data);
            }

            const gloabl: any = [];
            const globalTitle = { '': { v: 'Données globales pour toutes les agences', s: titleStyle } };
            gloabl.push(globalTitle, descript);
            gloabl.push(jump);
            const gHeaders = {
                'Agence': 'Agence',
                'Services': 'Services',
                'Points d\'appels': 'Points d\'appels',
                'Agents': 'Agents'
            };
            gloabl.push(gHeaders);
            gloabl.push({
                'Agence': stats.offices,
                'Service': stats.services,
                'Point d\'appel': stats.subServices,
                'Agent': stats.subServices
            });


            const offices2: any = [];
            const title2 = { '': { v: 'Pourcentage des tickets par Agence', s: titleStyle } };
            offices2.push(title2, descript);
            offices2.push(jump);
            const officeNames = stats.appointmentsByOffice.map((service: { name: any; }) => service.name);

            // En-tête des colonnes avec les noms des services
            const headerRow: any = {};
            officeNames.forEach((name: string | number) => {
                headerRow[name] = name;
            });

            offices2.push(headerRow);
            const data: any = {};
            officeNames.forEach((name: string | number) => {
                const record = stats.appointmentsByOffice.find((item: { name: any; }) => item.name === name);
                if (record) {
                    data[name] = `${(record.amount * 100) / stats.appointmentsByOffice?.reduce((acc: any, current: { amount: any; }) => acc + current.amount, 0)}%`
                } else {
                    data[name] = "0%";
                }
            });;
            offices2.push(data)



            // Convertir les données en feuille de calcul
            const globalWs = XLSX.utils.json_to_sheet(gloabl, { skipHeader: true });
            const officesTWs = XLSX.utils.json_to_sheet(offices, { skipHeader: true });
            const offices2Ws = XLSX.utils.json_to_sheet(offices2, { skipHeader: true });

            // Créer un classeur et ajouter la feuille de calcul
            const appWb = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(appWb, globalWs, 'globals');
            XLSX.utils.book_append_sheet(appWb, officesTWs, 'Total tickets par agence');
            XLSX.utils.book_append_sheet(appWb, offices2Ws, 'pourcentage');

            // Convertir le classeur en tableau d'octets
            const appBuffer = XLSX.write(appWb, { bookType: 'xlsx', type: 'array' });

            // Créer un Blob à partir des données du classeur
            const fileType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
            const appData = new Blob([appBuffer], { type: fileType });

            // Télécharger le fichier
            FileSaver.saveAs(appData, 'rapport.xlsx');
        }
    }

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

    const totalAmount = result?.appointmentsByOffice?.reduce((acc, current) => acc + current.amount, 0) || 0;

    const percentages = result?.appointmentsByOffice?.map(record => {
        const percentage = (record.amount * 100) / totalAmount;
        return percentage.toFixed(2); // Limite à deux décimales pour les pourcentages
    });

    if (isLoading || loading || !result) {
        return <Loader />
    }

    if (error) {
        return <p className=" text-center text-xs text-red-500">Vérifie votre connexion</p>
    }

    return (
        <div className=' h-screen bg-gray-200 overflow-y-scroll  w-full rounded-t-xl p-4'>
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
            <div className="flex gap-2 items-center mt-6 mb-6">
                <FaRegCalendar />
                <p className=" text-xs font-bold">{currentDate}</p>
            </div>
            <h3 className=" font-bold">1- Synthèse</h3>
            <div className=" flex justify-center mt-6">
                <div className=" w-4 bg-black">
                </div>
                <div className="flex bg-white rounded-sm justify-between items-center ">
                    <div className=" flex w-48 h-20 p-4 items-center justify-center gap-4 border-r-[1px]">
                        <div className=" w-12 h-12 bg-black bg-opacity-20 rounded-full flex justify-center items-center">
                            <HiOutlineBuildingOffice className=" text-blue" />
                        </div>
                        <div>
                            <h2 className=" text-sm font-bold">
                                {filter === false ? result?.offices : filterStats.offices}
                            </h2>
                            <p className=" text-xs opacity-60">
                                Sites
                            </p>
                        </div>
                    </div>
                    <div className="flex w-48 h-20 p-4 items-center justify-center gap-4 border-r-[1px]">
                        <div className=" w-12 h-12 bg-blue-500 bg-opacity-20 rounded-full flex justify-center items-center">
                            <FaClipboardList className=" text-blue-500" />
                        </div>
                        <div>
                            <h2 className=" text-sm font-bold">
                                {filter === false ? result?.services : filterStats.services}
                            </h2>
                            <p className=" text-xs opacity-60">
                                Services
                            </p>
                        </div>
                    </div>
                    <div className="flex w-48 h-20 p-4 items-center justify-center gap-4 border-r-[1px] ">
                        <div className=" w-12 h-12 bg-cyan-500 bg-opacity-20 rounded-full flex justify-center items-center">
                            <IoTabletLandscape className=" text-cyan-500" />
                        </div>
                        <div>
                            <h2 className=" text-sm font-bold">
                                {filter === false ? result?.subServices : filterStats.subServices}
                            </h2>
                            <p className=" text-xs opacity-60">
                                Points d&rsquo;appels
                            </p>
                        </div>
                    </div>
                    <div className="flex w-52 h-20 p-4 items-center justify-center gap-4 border-r-[1px]">
                        <div className=" w-12 h-12 bg-sky-500 bg-opacity-20 rounded-full flex justify-center items-center">
                            <MdOutlineSupportAgent className=" text-sky-500" />
                        </div>
                        <div>
                            <h2 className=" text-sm font-bold">
                                {filter === false ? result?.subServices : filterStats.subServices}
                            </h2>
                            <p className=" text-xs opacity-60">
                                Agents
                            </p>
                        </div>
                    </div>
                </div>
            </div>
            <h3 className=" font-bold mt-8">2- Visualisation du flux des clients par Site</h3>
            {filter == false ? <div className=" w-full bg-white rounded-md p-4 my-4">
                <Line data={{
                    labels: result?.appointmentsByOffice.map(record => record.name),
                    datasets: [
                        {
                            label: 'Nombre de ticket prise',
                            data: result.appointmentsByOffice.map(record => record.amount), // Exemple de données pour le nombre total de rendez-vous
                            borderColor: 'rgba(0, 0, 0, 1)',
                            backgroundColor: 'rgba(0, 0, 0, 0.5)',
                        },
                        {
                            label: 'Nombre de ticket traité',
                            data: result.serveAppointmentsByOffice.map(record => record.amount), // Exemple de données pour le nombre traité
                            borderColor: 'rgba(0, 255, 200, 1)',
                            backgroundColor: 'rgba(0, 255, 200, 0.5)',
                        },
                        {
                            label: 'Nombre de ticket en attente',
                            data: result.waitingAppointmentsByOffice.map(record => record.amount), // Exemple de données pour le nombre en attente
                            borderColor: 'rgba(255, 0, 0, 1)',
                            backgroundColor: 'rgba(255, 0, 0, 0.5)',
                        },
                    ],
                }} />
            </div>
                :
                <div className=" w-full bg-white rounded-md p-4 my-4">
                    <Line data={{
                        labels: filterStats?.appointmentsByOffice.map(record => record.name),
                        datasets: [
                            {
                                label: 'Nombre de ticket prise',
                                data: filterStats.appointmentsByOffice.map(record => record.amount), // Exemple de données pour le nombre total de rendez-vous
                                borderColor: 'rgba(0, 0, 0, 1)',
                                backgroundColor: 'rgba(0, 0, 0, 0.5)',
                            },
                            {
                                label: 'Nombre de ticket traité',
                                data: filterStats.serveAppointmentsByOffice.map(record => record.amount), // Exemple de données pour le nombre traité
                                borderColor: 'rgba(0, 255, 200, 1)',
                                backgroundColor: 'rgba(0, 255, 200, 0.5)',
                            },
                            {
                                label: 'Nombre de ticket en attente',
                                data: filterStats.waitingAppointmentsByOffice.map(record => record.amount), // Exemple de données pour le nombre en attente
                                borderColor: 'rgba(255, 0, 0, 1)',
                                backgroundColor: 'rgba(255, 0, 0, 0.5)',
                            },
                        ],
                    }} />
                </div>
            }
            <h3 className=" font-bold mt-8">3- Pourcentage des clients par Site</h3>
            {
                filter == false ?
                    <div className="w-full h-5/6 flex justify-center bg-white rounded-md p-4 my-4">
                        <Doughnut
                            data={{
                                labels: result?.appointmentsByOffice.map(record => record.name),
                                datasets: [{
                                    label: 'Le nombre de tickets en pourcentage',
                                    data: result?.appointmentsByOffice.map(record => (record.amount * 100) / result.totalAppointments),
                                    backgroundColor: generateColorPalette(result?.appointmentsByOffice.length),
                                    borderColor: generateColorPalette(result?.appointmentsByOffice.length),
                                    borderWidth: 1
                                }]
                            }}
                        />
                    </div>
                    :
                    <div className="w-full h-5/6 flex justify-center bg-white rounded-md p-4 my-4">
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
                    </div>
            }
            <h3 className=" font-bold my-4">4- Tableau comparatif général des agences</h3>
            <table className="w-full table-fixed">
                <thead>
                    <tr className=" bg-black">
                        <th className="w-1/2 px-3 py-4 text-left text-white text-xs font-semibold">Agence</th>
                        <th className="w-1/4 py-4 text-left text-white text-xs font-semibold">Nombre Tickets %</th>
                        <th className="w-1/4 py-4 text-left text-white text-xs font-semibold">Temps Moyen d&rsquo;Attente %</th>
                        <th className="w-1/3 py-4 text-left text-white text-xs font-semibold">Temps Moyen de Ttraitement %</th>
                    </tr>
                </thead>
                {filter == false ? <> {
                    result.totalByOffices?.map((appointment) => (
                        <tr key={appointment.name} className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600">
                            <td className='text-xs py-2 px-1 font-semibold'>
                                {appointment.name}
                            </td>
                            <td className=' text-xs opacity-60'>
                                {((appointment.receives / result.totalByOffices?.reduce((total, item) => total + item.receives, 0)) * 100).toFixed(1)}%
                            </td>
                            <td className=' text-xs opacity-60'>
                                {((appointment.meanWaitingTime / result.totalByOffices?.reduce((total, item) => total + item.meanWaitingTime, 0)) * 100).toFixed(1)}%
                            </td>
                            <td className=' text-xs opacity-60'>
                                {((appointment.meanServingTime / result.totalByOffices?.reduce((total, item) => total + item.meanServingTime, 0)) * 100).toFixed(1)}%
                            </td>
                        </tr>
                    ))}
                    <tr className="bg-green-600 text-white ">
                        <td className='text-xs py-2 px-3 font-semibold'>
                            Total
                        </td>
                        <td className=' text-xs'>
                            {(result.totalByOffices?.reduce((total, item) => total + item.receives, 0) / result.totalByOffices?.reduce((total, item) => total + item.receives, 0)) * 100}%
                        </td>
                        <td className=' text-xs'>
                            {(result.totalByOffices?.reduce((total, item) => total + item.meanWaitingTime, 0) / result.totalByOffices?.reduce((total, item) => total + item.meanWaitingTime, 0)) * 100}%
                        </td>
                        <td className=' text-xs'>
                            {(result.totalByOffices?.reduce((total, item) => total + item.meanServingTime, 0) / result.totalByOffices?.reduce((total, item) => total + item.meanServingTime, 0)) * 100}%
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
                                    {((appointment.receives / filterStats.totalByOffices?.reduce((total, item) => total + item.receives, 0)) * 100).toFixed(1)}%
                                </td>
                                <td className=' text-xs opacity-60'>
                                    {((appointment.meanWaitingTime / filterStats.totalByOffices?.reduce((total, item) => total + item.meanWaitingTime, 0)) * 100).toFixed(1)}%
                                </td>
                                <td className=' text-xs opacity-60'>
                                    {((appointment.meanServingTime / filterStats.totalByOffices?.reduce((total, item) => total + item.meanServingTime, 0)) * 100).toFixed(1)}%
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

            <h3 className=" font-bold my-4">5- Tableau comparatif général des affluences</h3>
            <table className="w-full table-fixed">
                <thead>
                    <tr className=" bg-black">
                        <th className="w-1/2 px-3 py-4 text-left text-white text-xs font-semibold">Heure</th>
                        {
                            result.appointmentsByHourSlot[0].data.map((office) => (
                                <th key={office.name} className="w-1/2  py-4 text-left text-white text-xs font-semibold">{office.name}</th>
                            ))
                        }
                        <th className="w-1/3 py-4 px-3 bg-green-500 text-left text-white text-xs font-semibold">Total</th>
                    </tr>
                </thead>
                {result.appointmentsByHourSlot.length > 0 && filter == false ? <> {
                    result.appointmentsByHourSlot.map((appointment) => (
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

            <h3 className=" font-bold my-4">6- Tableau comparatif général des attentes</h3>
            <table className="w-full table-fixed">
                <thead>
                    <tr className=" bg-black">
                        <th className="w-1/2 px-3 py-4 text-left text-white text-xs font-semibold">Heure</th>
                        {
                            result.appointmentsByHourSlot[0].data.map((office) => (
                                <th key={office.name} className="w-1/2  py-4 text-left text-white text-xs font-semibold">{office.name}</th>
                            ))
                        }
                        <th className="w-1/3 py-4 px-3 bg-green-500 text-left text-white text-xs font-semibold">Total</th>
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

            <h3 className=" font-bold my-4">7- Tableau comparatif général des traitements</h3>
            <table className="w-full table-fixed">
                <thead>
                    <tr className=" bg-black">
                        <th className="w-1/2 px-3 py-4 text-left text-white text-xs font-semibold">Heure</th>
                        {
                            result.servingAppointmentsByHourSlot[0].data.map((office) => (
                                <th key={office.name} className="w-1/2  py-4 text-left text-white text-xs font-semibold">{office.name}</th>
                            ))
                        }
                        <th className="w-1/3 py-4 px-3 bg-green-500 text-left text-white text-xs font-semibold">Total</th>
                    </tr>
                </thead>
                {result.servingAppointmentsByHourSlot.length > 0 && filter == false ? <> {
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

            <h3 className=" font-bold my-4">8- Tableau comparatif des agences par rapport aux opérations en normes</h3>
            <table className="w-full table-fixed">
                <thead>
                    <tr className=" bg-black">
                        <th className="w-1/2 px-3 py-4 text-left text-white text-xs font-semibold">Agence</th>
                        <th className="w-1/4 py-4 text-left text-white text-xs font-semibold">Nombre Tickets %</th>
                        <th className="w-1/4 py-4 text-left text-white text-xs font-semibold">Attente %</th>
                        <th className="w-1/3 py-4 text-left text-white text-xs font-semibold">Ttraitement %</th>
                    </tr>
                </thead>
                {filter == false ? <> {
                    result.totalInTimeByOffice?.map((appointment) => (
                        <tr key={appointment.name} className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600">
                            <td className='text-xs py-2 px-1 font-semibold'>
                                {appointment.name}
                            </td>
                            <td className=' text-xs opacity-60'>
                                {((appointment.receives / result.totalInTimeByOffice?.reduce((total, item) => total + item.receives, 0)) * 100).toFixed(1)}%
                            </td>
                            <td className=' text-xs opacity-60'>
                                {((appointment.waitings / result.totalInTimeByOffice?.reduce((total, item) => total + item.waitings, 0)) * 100).toFixed(1)}%
                            </td>
                            <td className=' text-xs opacity-60'>
                                {((appointment.serves / result.totalInTimeByOffice?.reduce((total, item) => total + item.serves, 0)) * 100).toFixed(1)}%
                            </td>
                        </tr>
                    ))}
                    <tr className="bg-green-600 text-white ">
                        <td className='text-xs py-2 px-3 font-semibold'>
                            Total
                        </td>
                        <td className=' text-xs'>
                            {(result.totalInTimeByOffice?.reduce((total, item) => total + item.receives, 0) / result.totalInTimeByOffice?.reduce((total, item) => total + item.receives, 0)) * 100}%
                        </td>
                        <td className=' text-xs'>
                            {(result.totalInTimeByOffice?.reduce((total, item) => total + item.waitings, 0) / result.totalInTimeByOffice?.reduce((total, item) => total + item.waitings, 0)) * 100}%
                        </td>
                        <td className=' text-xs'>
                            {(result.totalInTimeByOffice?.reduce((total, item) => total + item.serves, 0) / result.totalInTimeByOffice?.reduce((total, item) => total + item.serves, 0)) * 100}%
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
                                    {((appointment.receives / filterStats.totalInTimeByOffice?.reduce((total, item) => total + item.receives, 0)) * 100).toFixed(1)}%
                                </td>
                                <td className=' text-xs opacity-60'>
                                    {((appointment.waitings / filterStats.totalInTimeByOffice?.reduce((total, item) => total + item.waitings, 0)) * 100).toFixed(1)}%
                                </td>
                                <td className=' text-xs opacity-60'>
                                    {((appointment.serves / filterStats.totalInTimeByOffice?.reduce((total, item) => total + item.serves, 0)) * 100).toFixed(1)}%
                                </td>
                            </tr>
                        ))}
                    <tr className="bg-green-600 text-white ">
                        <td className='text-xs py-2 px-3 font-semibold'>
                            Total
                        </td>
                        <td className=' text-xs'>
                            {(filterStats.totalInTimeByOffice?.reduce((total, item) => total + item.receives, 0) / filterStats.totalInTimeByOffice?.reduce((total, item) => total + item.receives, 0)) * 100}%
                        </td>
                        <td className=' text-xs'>
                            {(filterStats.totalInTimeByOffice?.reduce((total, item) => total + item.waitings, 0) / filterStats.totalInTimeByOffice?.reduce((total, item) => total + item.waitings, 0)) * 100}%
                        </td>
                        <td className=' text-xs'>
                            {(filterStats.totalInTimeByOffice?.reduce((total, item) => total + item.serves, 0) / filterStats.totalInTimeByOffice?.reduce((total, item) => total + item.serves, 0)) * 100}%
                        </td>
                    </tr>
                </>
                }
            </table>

            <h3 className=" font-bold my-4">9- Tableau comparatif des agences par rapport aux opérations hors normes</h3>
            <table className="w-full table-fixed">
                <thead>
                    <tr className=" bg-black">
                        <th className="w-1/2 px-3 py-4 text-left text-white text-xs font-semibold">Agence</th>
                        <th className="w-1/4 py-4 text-left text-white text-xs font-semibold">Nombre Tickets %</th>
                        <th className="w-1/4 py-4 text-left text-white text-xs font-semibold">Attente %</th>
                        <th className="w-1/3 py-4 text-left text-white text-xs font-semibold">Ttraitement %</th>
                    </tr>
                </thead>
                {filter == false ? <> {
                    result.totalNotInTimeByOffice?.map((appointment) => (
                        <tr key={appointment.name} className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600">
                            <td className='text-xs py-2 px-1 font-semibold'>
                                {appointment.name}
                            </td>
                            <td className=' text-xs opacity-60'>
                                {((appointment.receives / result.totalNotInTimeByOffice?.reduce((total, item) => total + item.receives, 0)) * 100).toFixed(1)}%
                            </td>
                            <td className=' text-xs opacity-60'>
                                {((appointment.waitings / result.totalNotInTimeByOffice?.reduce((total, item) => total + item.waitings, 0)) * 100).toFixed(1)}%
                            </td>
                            <td className=' text-xs opacity-60'>
                                {((appointment.serves / result.totalNotInTimeByOffice?.reduce((total, item) => total + item.serves, 0)) * 100).toFixed(1)}%
                            </td>
                        </tr>
                    ))}
                    <tr className="bg-green-600 text-white ">
                        <td className='text-xs py-2 px-3 font-semibold'>
                            Total
                        </td>
                        <td className=' text-xs'>
                            {(result.totalNotInTimeByOffice?.reduce((total, item) => total + item.receives, 0) / result.totalNotInTimeByOffice?.reduce((total, item) => total + item.receives, 0)) * 100}%
                        </td>
                        <td className=' text-xs'>
                            {(result.totalNotInTimeByOffice?.reduce((total, item) => total + item.waitings, 0) / result.totalNotInTimeByOffice?.reduce((total, item) => total + item.waitings, 0)) * 100}%
                        </td>
                        <td className=' text-xs'>
                            {(result.totalNotInTimeByOffice?.reduce((total, item) => total + item.serves, 0) / result.totalNotInTimeByOffice?.reduce((total, item) => total + item.serves, 0)) * 100}%
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
                                    {((appointment.receives / filterStats.totalNotInTimeByOffice?.reduce((total, item) => total + item.receives, 0)) * 100).toFixed(1)}%
                                </td>
                                <td className=' text-xs opacity-60'>
                                    {((appointment.waitings / filterStats.totalNotInTimeByOffice?.reduce((total, item) => total + item.waitings, 0)) * 100).toFixed(1)}%
                                </td>
                                <td className=' text-xs opacity-60'>
                                    {((appointment.serves / filterStats.totalNotInTimeByOffice?.reduce((total, item) => total + item.serves, 0)) * 100).toFixed(1)}%
                                </td>
                            </tr>
                        ))}
                    <tr className="bg-green-600 text-white ">
                        <td className='text-xs py-2 px-3 font-semibold'>
                            Total
                        </td>
                        <td className=' text-xs'>
                            {(filterStats.totalNotInTimeByOffice?.reduce((total, item) => total + item.receives, 0) / filterStats.totalNotInTimeByOffice?.reduce((total, item) => total + item.receives, 0)) * 100}%
                        </td>
                        <td className=' text-xs'>
                            {(filterStats.totalNotInTimeByOffice?.reduce((total, item) => total + item.waitings, 0) / filterStats.totalNotInTimeByOffice?.reduce((total, item) => total + item.waitings, 0)) * 100}%
                        </td>
                        <td className=' text-xs'>
                            {(filterStats.totalNotInTimeByOffice?.reduce((total, item) => total + item.serves, 0) / filterStats.totalNotInTimeByOffice?.reduce((total, item) => total + item.serves, 0)) * 100}%
                        </td>
                    </tr>
                </>
                }
            </table>
        </div>
    )
}

export default Report
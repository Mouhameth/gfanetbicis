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
import { Bar, Line } from 'react-chartjs-2';
import Loader from "@/components/common/Loader";
import useSWR from "swr";
import useAxiosAuth from "@/hooks/useAxiosAuth";
import * as FileSaver from 'file-saver';
import XLSX from 'sheetjs-style';
import { useEffect, useState } from "react";
import useChangeHeaderTitle from "../hooks/useChangedHeader";
import { IoAddCircleOutline, IoCheckmarkDoneCircleSharp, IoReload, IoTabletLandscape } from "react-icons/io5";
import { FaClipboardList, FaFilter, FaRegCalendar } from "react-icons/fa";
import { BsStickyFill } from "react-icons/bs";
import { CiFilter } from "react-icons/ci";
import { Menu, MenuItem, Checkbox, Button, ListItemText, Slider } from "@mui/material";
import { format } from 'date-fns';
import { fr } from "date-fns/locale/fr";
import toast from "react-hot-toast";
import { MdOutlineTimelapse, MdTimer } from "react-icons/md";
import 'chart.js/auto';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { HiOutlineBuildingOffice } from "react-icons/hi2";
import { Accordion } from "@/components/Accordion";
import { FiEdit3 } from "react-icons/fi";
import Modal from '@mui/material/Modal'

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

const Home = () => {
  const url = `/appointment/stats`;
  const timeUrl = `/time`;
  const axiosAuth = useAxiosAuth();
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const officeUrl = `/office`;
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(null);
  const [officeId, setOfficeId] = useState(17);
  const [formattedStartDate, setFormattedStartDate] = useState('');
  const [formattedEndDate, setFormattedEndDate] = useState('');
  const [openEditTime, setOpenEditTime] = useState(false);
  const [openTime, setOpenTime] = useState(false);

  const time: Time = {
    id: 0,
    createdAt: new Date(),
    time: 0,
    type: '',
    updatedAt: new Date()
  };
  const [timeToUpdate, setTimeToUpdate] = useState(time);
  const { data: fetchedOffices, isLoading: officeLoading, error: officeError } = useSWR(officeUrl, () => axiosAuth.get<Office[]>(officeUrl).then((res) => res.data));
  const { data: result, isLoading, error, mutate } = useSWR(`${url}`, () => axiosAuth.post<Stats>(url, JSON.stringify({ date: now.toLocaleDateString('fr-FR'), ids: [17] })).then((res) => res.data));
  const { data: fetchedTimes, isLoading: timeLoading, mutate: mutateTimes } = useSWR(timeUrl, () => axiosAuth.get<Time[]>(timeUrl).then((res) => res.data));
  const useChangeTitle = useChangeHeaderTitle();
  const [currentDate, setCurrentDate] = useState('');
  const [officeName, setOfficeName] = useState('');
  useEffect(() => {
    useChangeTitle.onChanged("Rapport global du flux des clients en agence");
    const date = new Date(new Date().getTime());
    const hours = String(date.getUTCHours()).padStart(2, '0');
    const minutes = String(date.getUTCMinutes()).padStart(2, '0');
    const seconds = String(date.getUTCSeconds()).padStart(2, '0');
    const pickedTime = `${hours}:${minutes}:${seconds}`;
    setCurrentDate(`Aujourd'hui : ${format(`${now.toLocaleDateString('fr-FR').split('/')[1]}/${now.toLocaleDateString('fr-FR').split('/')[0]}/${now.toLocaleDateString('fr-FR').split('/')[2]}`, 'EEEE dd MMMM yyyy', { locale: fr })} à ${pickedTime}`);
    setFormattedStartDate(format(startDate, 'dd/MM/yyyy'));
    if (fetchedOffices && fetchedOffices.length > 0) {
      const office = fetchedOffices.find((office) => office.id === officeId);
      setOfficeName(office!.name)
    }
    setDescription(`Ceci represente l'ensemble des données pour l'agence ${officeName} pour la date d'aujourd'hui ${new Date().toLocaleDateString('fr-FR')} à ${pickedTime}`);
  }, [result, fetchedOffices]);
  const emptyStats: Stats = {
    subServices: 0,
    services: 0,
    receives: 0,
    appointments: 0,
    appointmentsByService: [],
    appointmentList: [],
    appointmentsByStatut: [],
    months: [],
    weeks: [],
    years: [],
    waitings: 0,
    meanWaitingTime: 0,
    meanServingTime: 0,
    totalInWaiting: 0,
    totatlInServing: 0,
    totalNotInWaiting: 0,
    totatlNotInServing: 0,
    serveAppointmentsByService: [],
    waitingAppointmentsByService: [],
    meanWaitingTimeByService: [],
    meanServingTimeByService: [],
    totatlInWaitingByService: [],
    totatlNotInWaitingByService: [],
    totatlInServingByService: [],
    totatlNotInServingByService: [],
    appointmentsBySubService: [],
    serveAppointmentsBySubService: [],
    waitingAppointmentsBySubService: [],
    meanWaitingTimeBySubService: [],
    meanServingTimeBySubService: [],
    totatlInWaitingBySubService: [],
    totatlNotInWaitingBySubService: [],
    totatlInServingBySubService: [],
    totatlNotInServingBySubService: [],
    appointmentsByHourSlot: [],
    serveAppointmentsByHourSlot: [],
    appointmentsByDays: [],
    appointmentsByDates: [],
    totalByOffices: [],
    normalAppointments: 0
  }

  const [filterStats, setFilterStats] = useState(emptyStats);
  const [filter, setFilter] = useState(false);
  const [filterOffice, setFilterOffice] = useState(false);
  const [loading, setLoading] = useState(false);
  const [seeAll, setSeeAll] = useState(false);
  const [showTotal, setShowTotal] = useState(false);
  const [filterTwoDate, setFilterTwoDate] = useState(false);
  const [filterBetween, setFilterBetween] = useState(false);
  const [description, setDescription] = useState('');
  const [filterAsc, setFilterAsc] = useState(false);
  const [anchorOfficeElFilter, setAnchorOfficeElFilter] = useState(null);
  const openOfficeMenuFilter = Boolean(anchorOfficeElFilter);
  const [anchorWeekElFilter, setAnchorWeekElFilter] = useState(null);
  const openWeekMenuFilter = Boolean(anchorWeekElFilter);
  let emptyAppointments: Appointment[] = [];
  const [filterAppointments, setFilterAppointments] = useState(emptyAppointments);

  const submitTime = async () => {
    try {
      setLoading(true);
      const res = await axiosAuth.post(timeUrl, JSON.stringify({ 'time': value, 'type': type }));
      if (res.status == 201) {
        toast.success('Opération réussie!', { duration: 3000, className: " text-xs" });
        mutate();
        mutateTimes();
        handleCloseTime();
      }
    }
    catch (error: any) {
      console.log(error);

      toast.error('Une erreur est survenue, réessayer!', { duration: 3000, className: " text-xs" });
    }
    finally {
      setLoading(false);
    }
  }

  const updateTime = async () => {
    try {
      setLoading(true);
      const res = await axiosAuth.put(timeUrl, JSON.stringify({ 'id': timeToUpdate.id, 'time': value }));
      if (res.status == 200) {
        toast.success('Opération réussie!', { duration: 3000, className: " text-xs" });
        mutate();
        mutateTimes();
        handleCloseEditTime();
      }
    }
    catch (error: any) {
      console.log(error);

      toast.error('Une erreur est survenue, réessayer!', { duration: 3000, className: " text-xs" });
    }
    finally {
      setLoading(false);
    }
  }

  const [value, setValue] = useState(0);
  const [type, setType] = useState('');

  const handleChange = (event: Event, newValue: number | number[]) => {

    if (typeof newValue === 'number') {
      setValue(newValue);
    }
  };



  const handleOpenEditTime = (time: Time) => {
    setTimeToUpdate(time);
    setValue(time.time);
    setOpenEditTime(true);
  };

  const handleOpenTime = (type: string) => {
    setType(type)
    setOpenTime(true);
  };

  const handleCloseTime = () => {
    setOpenTime(false);
  };

  const handleCloseEditTime = () => {
    setOpenEditTime(false);
  };

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

  const handleOfficeClickFilter = (event: any) => {
    setAnchorOfficeElFilter(event.currentTarget);
    setSelectedOffices([]);
  };

  const handleRangeClickFilter = (event: any) => {
    setAnchorRangeElFilter(event.currentTarget);
  };

  const handleFilter = async (date: string) => {
    setDescription(`Ceci represente l'ensemble des données de l'agence ${officeName} à la date du ${date}`)

    try {
      setFilter(true);
      setFilterOffice(false);
      setLoading(true);
      setFilterTwoDate(false);
      setFilterBetween(false);

      setCurrentDate(`L'année ${date}`);
      if (date.split('/').length === 2) {
        setCurrentDate(`Le mois de ${format(`${date.split('/')[0]}/01/${date.split('/')[1]}`, 'MMMM yyyy', { locale: fr })}`);
      }
      if (date.split('/').length === 3) {
        setCurrentDate(`La journée du ${format(`${date.split('/')[1]}/${date.split('/')[0]}/${date.split('/')[2]}`, 'EEEE dd MMMM yyyy', { locale: fr })}`);
      }

      const res = await axiosAuth.post<Stats>(url, JSON.stringify({ date: date, ids: selectedOffices.length === 0 ? [officeId] : selectedOffices }));
      if (res.status == 200) {
        console.log(res.data);

        setFilterStats(res.data);
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

  const handleFilterOffice = async () => {
    if (selectedOffices.length > 0) {
      setFilterTwoDate(false);
      setFilterBetween(false);
      if (selectedOffices.length === 1) {
        const office = fetchedOffices!.find((office) => office.id === selectedOffices[0]);
        setOfficeId(office!.id);
        setOfficeName(office!.name);
        setDescription(`Ceci represente l'ensemble des données de l'agence ${office!.name} à la date du ${now.toLocaleDateString('fr-FR')}`);
        setShowTotal(false);
      } else {
        let officeText = "";
        for (let index = 0; index < selectedOffices!.length; index++) {
          if (index > 0) {
            officeText = officeText + " - ";
          }
          const id = selectedOffices![index];
          const office = fetchedOffices!.find((office) => office.id == id);
          if (office) {
            setOfficeId(office.id);
            officeText = officeText + office.name;
          }
        }
        setOfficeName(officeText!);
        setDescription(`Ceci represente l'ensemble des données de l'agence ${officeText} à la date du ${now.toLocaleDateString('fr-FR')}`);
        setShowTotal(true);
      }

      setCurrentDate("Aujourd'hui");
      try {
        setFilter(true);
        setFilterOffice(true);
        setLoading(true);
        const date = new Date(new Date().getTime());
        const hours = String(date.getUTCHours()).padStart(2, '0');
        const minutes = String(date.getUTCMinutes()).padStart(2, '0');
        const seconds = String(date.getUTCSeconds()).padStart(2, '0');
        const pickedTime = `${hours}:${minutes}:${seconds}`;
        setCurrentDate(`Aujourd'hui : ${format(`${now.toLocaleDateString('fr-FR').split('/')[1]}/${now.toLocaleDateString('fr-FR').split('/')[0]}/${now.toLocaleDateString('fr-FR').split('/')[2]}`, 'EEEE dd MMMM yyyy', { locale: fr })} à ${pickedTime}`);

        const res = await axiosAuth.post<Stats>(url, JSON.stringify({ date: now.toLocaleDateString('fr-FR'), ids: selectedOffices }));
        if (res.status == 200) {
          setFilterStats(res.data);
        }
      } catch (error) {
        setFilter(false);
        toast.error('Une erreur est survenue, réessayer!', { duration: 3000, className: " text-xs" });
      } finally {
        setLoading(false);
        setAnchorMonthElFilter(null);
        setAnchorYearElFilter(null);
        handleCloseOfficeMenuFilter();
      }
    }

  };

  const amountOfDays = (start: string, end: string): number => {
    // Convertir les chaînes de dates en objets Date
    const startDate = new Date(start);
    const endDate = new Date(end);

    // Valider les dates
    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      throw new Error("Les dates ne sont pas valides");
    }

    // Si la date de début est après la date de fin, on inverse
    if (startDate > endDate) {
      throw new Error("La date de début doit être antérieure à la date de fin");
    }

    let count = 0;
    let currentDate = new Date(startDate);

    // Parcourir chaque jour entre les deux dates
    while (currentDate <= endDate) {
      const dayOfWeek = currentDate.getDay();
      // Compter uniquement les jours ouvrables (lundi à vendredi)
      if (dayOfWeek !== 0 && dayOfWeek !== 6) {
        count++;
      }
      // Passer au jour suivant
      currentDate.setDate(currentDate.getDate() + 1);
    }

    return count;
  };

  const [selectedOffices, setSelectedOffices] = useState<number[]>([]);

  // Gérer la sélection des bureaux
  const handleToggleOffice = (officeId: number) => {
    setSelectedOffices(prevSelected =>
      prevSelected.includes(officeId)
        ? prevSelected.filter(id => id !== officeId)
        : [...prevSelected, officeId]
    );

  };


  const handleWeekFilter = async (start: string, end: string) => {
    const differenceInDays = amountOfDays(`${start.split('/')[2]}/${start.split('/')[1]}/${start.split('/')[0]}`, `${end.split('/')[2]}/${end.split('/')[1]}/${end.split('/')[0]}`);

    setDescription(`Ceci represente l'ensemble des données de l'agence ${officeName} de ${start} à ${end}, nombre de jours ouvrés: ${differenceInDays}`)

    try {
      setFilter(true);
      setFilterTwoDate(true);
      setFilterBetween(true);
      setFilterOffice(false);
      setLoading(true);
      setCurrentDate(`Entre le ${format(`${start.split('/')[1]}/${start.split('/')[0]}/${start.split('/')[2]}`, 'EEEE dd MMMM yyyy', { locale: fr })} et le ${format(`${end.split('/')[1]}/${end.split('/')[0]}/${end.split('/')[2]}`, 'EEEE dd MMMM yyyy', { locale: fr })}, nombre de jours ouvrés: ${differenceInDays}`);
      const res = await axiosAuth.post<Stats>(`${url}/week`, JSON.stringify({ start: start, end: end, ids: selectedOffices.length === 0 ? [officeId] : selectedOffices }));
      if (res.status == 200) {
        setFilterStats(res.data);
      }

    } catch (error) {
      setFilter(false);
      toast.error('Une erreur est survenue, réessayer!', { duration: 3000, className: " text-xs" });
    } finally {
      setLoading(false);
      setAnchorWeekElFilter(null);
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
  const handleCloseOfficeMenuFilter = () => {
    setAnchorOfficeElFilter(null);
  };

  const handleCloseRangeMenuFilter = () => {
    setAnchorRangeElFilter(null);
  };

  const onChange = (dates: any) => {

    const [start, end] = dates;
    setStartDate(start);
    setEndDate(end);
    setFormattedStartDate(format(start, 'dd/MM/yyyy'))
    if (end !== null) {
      setFormattedEndDate(format(end, 'dd/MM/yyyy'));
    }

  };

  const handleReverse = () => {
    setFilterAsc(true)
    if (filter) {
      const copiedArray = filterStats.appointmentList.slice();
      setFilterAppointments(copiedArray.reverse())
    } else {
      const copiedArray = result!.appointmentList.slice();
      setFilterAppointments(copiedArray.reverse())
    }
  };

  const handleFilterDsc = () => {
    setFilterAsc(false)
    // setFilterAppointments(emptyAppointments)
  };

  const exportToExcel = async () => {
    const appointments: any = [];
    let stats: any;
    if (filter) {
      stats = filterStats;
    } else {
      stats = result;
    }
    if (stats) {
      // Ajouter le titre et la description sur des lignes distinctes
      const titleStyle = { font: { bold: true, size: 24, color: '#FF0000' } }; // Style personnalisé pour le titre
      const title = { '': { v: 'Tickets', s: titleStyle } };
      const descriptionStyle = { font: { italic: true, size: 14, color: '#0000FF' } }; // Style personnalisé pour la description
      const descript = { '': { v: description, s: descriptionStyle } };
      appointments.push(title, descript);

      // Ajouter un saut de ligne avant les en-têtes
      const jump1 = { '': '' };
      appointments.push(jump1);

      // Ajouter les en-têtes des colonnes

      const headers = {
        'Date d\'arrivée': 'Date d\'arrivée',
        'Heure d\'arrivée': 'Heure d\'arrivée',
        'No d\'arrivée': 'No d\'arrivée',
        'No de ticket': 'No de ticket',
        'Service': 'Service',
        "Point d'appel": "Point d'appel",
        "Heure d'appel": "Heure d'appel",
        "Temps d'attente": "Temps d'attente",
        'Temps de traitement': "Temps de traitement",
        "Ticket transféré": "Ticket transféré",
        "Ticket sauté": "Ticket sauté"
      };
      appointments.push(headers);
      // Ajouter les données
      for (let index = 0; index < stats.appointmentList.length; index++) {
        const element = stats.appointmentList[index];
        const data = {
          'Date d\'arrivée': element.date,
          'Heure d\'arrivée': element.time,
          'No d\'arrivée': element.num,
          'No de ticket': element.num,
          'Service': element.Service ? element.Service.name : '',
          "Point d'appel": element.Subservice ? element.Subservice.name : '',
          'Heure d\'appel': element.callTime,
          'Temps d\'attente': format(element.waitingTime * 60 * 1000, 'HH:mm:ss'),
          'Temps de traitement': format(element.processingTime * 60 * 1000, 'HH:mm:ss'),
          "Ticket transféré": element.transfered ? "Oui" : "Non",
          "Ticket sauté": element.missing ? "Oui" : "Non"
        };
        appointments.push(data);
      }

      const services: any = [];
      const title2 = { '': { v: 'Nombre de tickets par Service', s: titleStyle } };
      services.push(title2, descript);

      for (let index = 0; index < stats.appointmentsByService.length; index++) {
        const element = stats.appointmentsByService[index];
        const serviceTitle = { '': { v: element.name, s: titleStyle } };
        services.push(serviceTitle);
        const newL = { '': '\n' };
        services.push(newL);
        const headers2 = {
          'Reçu': 'Reçu',
          'Traité': 'Traité',
          'En attente': 'En attente'
        };
        services.push(headers2);
        const data = {
          'Reçu': element.amount ? element.amount : 0,
          'Traité': stats.serveAppointmentsByService[index]?.amount ? stats.serveAppointmentsByService[index]?.amount : 0,
          'En attente': stats.waitingAppointmentsByService[index]?.amount ? stats.waitingAppointmentsByService[index]?.amount : 0
        };
        services.push(data);
      }

      const gloabl: any = [];
      const globalTitle = { '': { v: 'Données globales', s: titleStyle } };
      gloabl.push(globalTitle, descript);
      gloabl.push(jump1);
      const gHeaders = {
        'Services': 'Services',
        'Points d\'appels': 'Points d\'appels',
        'Tickets traités': 'Tickets traités',
        'Tickets en attente': 'Tickets en attente',
        'Total tickets': 'Total tickets'
      };
      gloabl.push(gHeaders);
      gloabl.push({
        'Services': stats.services,
        'Points d\'appels': stats.subServices,
        'Tickets traités': stats.receives,
        'Tickets en attente': stats.waitings,
        'Total tickets': stats.appointments
      });

      const globalTime: any = [];
      const globalTimeTitle = { '': { v: 'Données des temps globaux', s: titleStyle } };
      globalTime.push(globalTimeTitle, descript);
      globalTime.push(jump1);
      const gTHeaders = {
        'Temps moyen d\'attente': 'Temps moyen d\'attente',
        'Temps moyen de traitement': 'Temps moyen de traitement',
        'Ticket dans le temps optimal d\'attente': 'Ticket dans le temps optimal d\'attente',
        'Ticket en dehors du temps optimal d\'attente': 'Ticket en dehors du temps optimal d\'attente',
        'Ticket dans le temps optimal de traitement': 'Ticket dans le temps optimal de traitement',
        'Ticket en dehors du temps optimal de traitement': 'Ticket en dehors du temps optimal de traitement'
      };
      globalTime.push(gTHeaders);
      globalTime.push({
        'Temps moyen d\'attente': format(stats.meanWaitingTime * 60 * 1000, 'HH:mm:ss'),
        'Temps moyen de traitement': format(stats.meanServingTime * 60 * 1000, 'HH:mm:ss'),
        'Ticket dans le temps optimal d\'attente': stats.totalInWaiting,
        'Ticket en dehors du temps optimal d\'attente': stats.totalNotInWaiting,
        'Ticket dans le temps optimal de traitement': stats.totatlInServing,
        'Ticket en dehors du temps optimal de traitement': stats.totatlNotInServing
      });

      const meanTimeService: any = [];
      const meanTimeServiceTitle = { '': { v: 'Temps moyen d\'attente Par Service', s: titleStyle } };
      meanTimeService.push(meanTimeServiceTitle, descript);
      meanTimeService.push(jump1);
      const serviceNames = stats.appointmentsByService.map((service: { name: any; }) => service.name);

      // En-tête des colonnes avec les noms des services
      const headerRow: any = {};
      serviceNames.forEach((name: string | number) => {
        headerRow[name] = name;
      });

      meanTimeService.push(headerRow);
      const mTSData: any = {};
      serviceNames.forEach((name: string | number) => {
        const meanWaitingTime = stats.meanWaitingTimeByService.find((item: { name: any; }) => item.name === name);
        if (meanWaitingTime) {
          mTSData[name] = format(meanWaitingTime.amount * 60 * 1000, 'HH:mm:ss');
        } else {
          mTSData[name] = '00:00:00';
        }
      });

      meanTimeService.push(mTSData);

      const meanServingTimeService: any = [];
      const meanServingTimeServiceTitle = { '': { v: 'Temps moyen de traitement Par Service', s: titleStyle } };
      meanServingTimeService.push(meanServingTimeServiceTitle, descript);
      meanServingTimeService.push(jump1);

      meanServingTimeService.push(headerRow);
      const mSData: any = {};
      serviceNames.forEach((name: string | number) => {
        const meanServingTime = stats.meanServingTimeByService.find((item: { name: any; }) => item.name === name);
        if (meanServingTime) {
          mSData[name] = format(meanServingTime.amount * 60 * 1000, 'HH:mm:ss');
        } else {
          mSData[name] = '00:00:00';
        }
      });

      meanServingTimeService.push(mSData);

      const inWaitingTimeService: any = [];
      const inWaitingTimeServiceTitle = { '': { v: 'Le nombre de ticket dans le temps optimal d\'attente par Service', s: titleStyle } };
      inWaitingTimeService.push(inWaitingTimeServiceTitle, descript);
      inWaitingTimeService.push(jump1);

      inWaitingTimeService.push(headerRow);
      const inWData: any = {};
      serviceNames.forEach((name: string | number) => {
        const inWaitingTime = stats.totatlInWaitingByService.find((item: { name: any; }) => item.name === name);
        if (inWaitingTime) {
          inWData[name] = inWaitingTime.amount;

        } else {
          inWData[name] = '00:00:00';
        }
      });

      inWaitingTimeService.push(inWData);

      const notInWaitingTimeService: any = [];
      const notInWaitingTimeServiceTitle = { '': { v: 'Le nombre de ticket en dehors du temps optimal d\'attente par Service', s: titleStyle } };
      notInWaitingTimeService.push(notInWaitingTimeServiceTitle, descript);
      notInWaitingTimeService.push(jump1);

      notInWaitingTimeService.push(headerRow);
      const notInWData: any = {};
      serviceNames.forEach((name: string | number) => {
        const notInWaitingTime = stats.totatlNotInWaitingByService.find((item: { name: any; }) => item.name === name);
        if (notInWaitingTime) {
          notInWData[name] = notInWaitingTime.amount;

        } else {
          notInWData[name] = '00:00:00';
        }
      });

      notInWaitingTimeService.push(notInWData);

      const inServingTimeService: any = [];
      const inServingTimeServiceTitle = { '': { v: 'Le nombre de ticket dans le temps optimal de traitement par Service', s: titleStyle } };
      inServingTimeService.push(inServingTimeServiceTitle, descript);
      inServingTimeService.push(jump1);

      inServingTimeService.push(headerRow);
      const inSData: any = {};
      serviceNames.forEach((name: string | number) => {
        const inServingTime = stats.totatlInServingByService.find((item: { name: any; }) => item.name === name);
        if (inServingTime) {
          inSData[name] = inServingTime.amount;

        } else {
          inSData[name] = '00:00:00';
        }
      });

      inServingTimeService.push(inSData);

      const notInServingTimeService: any = [];
      const notInServingTimeServiceTitle = { '': { v: 'Le nombre de ticket en dehors du temps optimal de traitement par Service', s: titleStyle } };
      notInServingTimeService.push(notInServingTimeServiceTitle, descript);
      notInServingTimeService.push(jump1);

      notInServingTimeService.push(headerRow);
      const notInSData: any = {};
      serviceNames.forEach((name: string | number) => {
        const notInServingTime = stats.totatlNotInServingByService.find((item: { name: any; }) => item.name === name);
        if (notInServingTime) {
          notInSData[name] = notInServingTime.amount;

        } else {
          notInSData[name] = '00:00:00';
        }
      });

      notInServingTimeService.push(notInSData);

      const subServices: any = [];
      const subTitle = { '': { v: 'Nombre de tickets par Point d\'appel', s: titleStyle } };
      subServices.push(subTitle, descript);

      for (let index = 0; index < stats.appointmentsBySubService.length; index++) {
        const element = stats.appointmentsBySubService[index];
        const serviceTitle = { '': { v: element.name, s: titleStyle } };
        subServices.push(serviceTitle);
        const newL = { '': '\n' };
        subServices.push(newL);
        const headers2 = {
          'Reçu': 'Reçu',
          'Traité': 'Traité',
          'En attente': 'En attente'
        };
        subServices.push(headers2);
        const data = {
          'Reçu': element.amount ? element.amount : 0,
          'Traité': stats.serveAppointmentsBySubService[index]?.amount ? stats.serveAppointmentsBySubService[index]?.amount : 0,
          'En attente': stats.waitingAppointmentsBySubService[index]?.amount ? stats.waitingAppointmentsBySubService[index]?.amount : 0
        };
        subServices.push(data);
      }

      const meanTimeSubService: any = [];
      const meanTimeSubServiceTitle = { '': { v: 'Temps moyen d\'attente Par Point d\'appel', s: titleStyle } };
      meanTimeSubService.push(meanTimeSubServiceTitle, descript);
      meanTimeSubService.push(jump1);
      const subServiceNames = stats.appointmentsBySubService.map((service: { name: any; }) => service.name);

      // En-tête des colonnes avec les noms des services
      const subServiceHeaderRow: any = {};
      subServiceNames.forEach((name: string | number) => {
        subServiceHeaderRow[name] = name;
      });

      meanTimeSubService.push(subServiceHeaderRow);
      const mTSubData: any = {};
      subServiceNames.forEach((name: string | number) => {
        const meanWaitingTime = stats.meanWaitingTimeBySubService.find((item: { name: any; }) => item.name === name);
        if (meanWaitingTime) {
          mTSubData[name] = format(meanWaitingTime.amount * 60 * 1000, 'HH:mm:ss');
        } else {
          mTSubData[name] = '00:00:00';
        }
      });

      meanTimeSubService.push(mTSubData);

      const meanServingTimeSubService: any = [];
      const meanServingTimeSubServiceTitle = { '': { v: 'Temps moyen de traitement Par Point d\'appel', s: titleStyle } };
      meanServingTimeSubService.push(meanServingTimeSubServiceTitle, descript);
      meanServingTimeSubService.push(jump1);

      meanServingTimeSubService.push(subServiceHeaderRow);
      const mSubData: any = {};
      subServiceNames.forEach((name: string | number) => {
        const meanServingTime = stats.meanServingTimeBySubService.find((item: { name: any; }) => item.name === name);
        if (meanServingTime) {
          mSubData[name] = format(meanServingTime.amount * 60 * 1000, 'HH:mm:ss');
        } else {
          mSubData[name] = '00:00:00';
        }
      });

      meanServingTimeSubService.push(mSubData);

      const inWaitingTimeSubservice: any = [];
      const inWaitingTimeSubserviceTitle = { '': { v: 'Le nombre de ticket dans le temps optimal d\'attente par Point d\'appel', s: titleStyle } };
      inWaitingTimeSubservice.push(inWaitingTimeSubserviceTitle, descript);
      inWaitingTimeSubservice.push(jump1);

      inWaitingTimeSubservice.push(subServiceHeaderRow);
      const inWSubData: any = {};
      subServiceNames.forEach((name: string | number) => {
        const inWaitingTime = stats.totatlInWaitingBySubService.find((item: { name: any; }) => item.name === name);
        if (inWaitingTime) {
          inWSubData[name] = inWaitingTime.amount;
        } else {
          inWSubData[name] = '00:00:00';
        }
      });

      inWaitingTimeSubservice.push(inWSubData);

      const notInWaitingTimeSubservice: any = [];
      const notInWaitingTimeSubserviceTitle = { '': { v: 'Le nombre de ticket en dehors du temps optimal de traitement par Point d\'appel', s: titleStyle } };
      notInWaitingTimeSubservice.push(notInWaitingTimeSubserviceTitle, descript);
      notInWaitingTimeSubservice.push(jump1);

      notInWaitingTimeSubservice.push(subServiceHeaderRow);
      const notInSubData: any = {};
      subServiceNames.forEach((name: string | number) => {
        const notInServingTime = stats.totatlNotInServingBySubService.find((item: { name: any; }) => item.name === name);
        if (notInServingTime) {
          notInSubData[name] = notInServingTime.amount;

        } else {
          notInSubData[name] = '00:00:00';
        }
      });

      notInWaitingTimeSubservice.push(notInSubData);

      const inServingTimeSubservice: any = [];
      const inServingTimeSubserviceTitle = { '': { v: 'Le nombre de ticket dans le temps optimal de traitement par Point d\'appel', s: titleStyle } };
      inServingTimeSubservice.push(inServingTimeSubserviceTitle, descript);
      inServingTimeSubservice.push(jump1);

      inServingTimeSubservice.push(subServiceHeaderRow);
      const inSubData: any = {};
      subServiceNames.forEach((name: string | number) => {
        const inServingTime = stats.totatlInServingBySubService.find((item: { name: any; }) => item.name === name);
        if (inServingTime) {
          inSubData[name] = inServingTime.amount;

        } else {
          inSubData[name] = '00:00:00';
        }
      });

      inServingTimeSubservice.push(inSubData);

      const notInServingTimeSubservice: any = [];
      const notInServingTimeSubserviceTitle = { '': { v: 'Le nombre de ticket en dehors du temps optimal de traitement par Point d\'appel', s: titleStyle } };
      notInServingTimeSubservice.push(notInServingTimeSubserviceTitle, descript);
      notInServingTimeSubservice.push(jump1);

      notInServingTimeSubservice.push(subServiceHeaderRow);
      const notInServSubData: any = {};
      subServiceNames.forEach((name: string | number) => {
        const notInServingTime = stats.totatlNotInServingBySubService.find((item: { name: string | number; }) => item.name === name);
        if (notInServingTime) {
          notInServSubData[name] = notInServingTime.amount;

        } else {
          notInServSubData[name] = '00:00:00';
        }
      });

      notInServingTimeSubservice.push(notInServSubData);
      const gWs = XLSX.utils.json_to_sheet(gloabl, { skipHeader: true });
      const gTWs = XLSX.utils.json_to_sheet(globalTime, { skipHeader: true });
      const appWs = XLSX.utils.json_to_sheet(appointments, { skipHeader: true });
      const servicesWs = XLSX.utils.json_to_sheet(services, { skipHeader: true });
      const mTWs = XLSX.utils.json_to_sheet(meanTimeService, { skipHeader: true });
      const mSWs = XLSX.utils.json_to_sheet(meanServingTimeService, { skipHeader: true });
      const appWb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(appWb, gWs, 'Globals');
      XLSX.utils.book_append_sheet(appWb, gTWs, 'Temps globaux');
      XLSX.utils.book_append_sheet(appWb, appWs, 'Rapport détaillé');
      XLSX.utils.book_append_sheet(appWb, servicesWs, 'Services');
      XLSX.utils.book_append_sheet(appWb, mTWs, 'TEM par Service');
      XLSX.utils.book_append_sheet(appWb, mSWs, 'TTM par Service');

      // Convertir le classeur en tableau d'octets
      const appBuffer = XLSX.write(appWb, { bookType: 'xlsx', type: 'array' });

      // Créer un Blob à partir des données du classeur
      const fileType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
      const appData = new Blob([appBuffer], { type: fileType });

      // Télécharger le fichier
      FileSaver.saveAs(appData, `${officeName.charAt(0).toUpperCase() + officeName.slice(1)}_Rapport_global_${currentDate}.xlsx`);
    }
  }

  const exportTableDataToExcel = async (name: string, title: string, list: any,) => {
    if (filter == false) {
      setDescription(`Ceci represente l'ensemble des données pour la date d'aujourd'hui ${new Date().toLocaleDateString('fr-FR')}`)
    }
    const titleStyle = { font: { bold: true, size: 18, color: '#FF0000' } };
    const descriptionStyle = { font: { italic: true, size: 14, color: '#0000FF' } };
    const tableTitle = { '': { v: title, s: titleStyle } };
    const tableDescription = { '': { v: description, s: descriptionStyle } };

    const appointments: any = [];
    appointments.push(tableTitle, tableDescription);

    // Ajouter un saut de ligne avant les en-têtes
    const jump1 = { '': '' };
    appointments.push(jump1);

    // Ajouter les en-têtes des colonnes

    const headers = {
      'Heure d\'arrivée': 'Heure d\'arrivée',
      'No d\'arrivée': 'No d\'arrivée',
      'No de ticket': 'No de ticket',
      'Service': 'Service',
      "Point d'appel": "Point d'appel",
      "Heure d'appel": "Heure d'appel",
      "Temps d'attente": "Temps d'attente",
      'Temps de traitement': "Temps de traitement",
      "Ticket transféré": "Ticket transféré",
      "Ticket sauté": "Ticket sauté"
    };
    appointments.push(headers);
    // Ajouter les données
    for (let index = 0; index < list.appointmentList.length; index++) {
      const element = list.appointmentList[index];
      const data = {
        'Heure d\'arrivée': element.time,
        'No d\'arrivée': element.num,
        'No de ticket': element.num,
        'Service': element.Service ? element.Service.name : '',
        "Point d'appel": element.Subservice ? element.Subservice.name : '',
        'Heure d\'appel': element.callTime,
        'Temps d\'attente': format(element.waitingTime * 60 * 1000, 'HH:mm:ss'),
        'Temps de traitement': format(element.processingTime * 60 * 1000, 'HH:mm:ss'),
        "Ticket transféré": element.transfered ? "Oui" : "Non",
        "Ticket sauté": element.missing ? "Oui" : "Non"
      };
      appointments.push(data);
    }

    const mTWs = XLSX.utils.json_to_sheet(appointments, { skipHeader: true });
    const appWb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(appWb, mTWs, name);

    // Convertir le classeur en tableau d'octets
    const appBuffer = XLSX.write(appWb, { bookType: 'xlsx', type: 'array' });

    // Créer un Blob à partir des données du classeur
    const fileType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
    const appData = new Blob([appBuffer], { type: fileType });

    // Télécharger le fichier
    FileSaver.saveAs(appData, `${name}.xlsx`);
  }

  const calculateWaitingAppointments = (appointmentsByHourSlot: any, serveAppointmentsByHourSlot: any): number[] => {
    let pendingTickets = 0; // Initialisation du compteur des tickets en attente
    const pendingTicketsByHourSlot = []; // Tableau pour stocker les résultats

    // Calcul du nombre de tickets en attente pour chaque période
    for (let i = 0; i < appointmentsByHourSlot.length; i++) {
      const appointments = parseInt(appointmentsByHourSlot[i].amount, 10) || 0; // Si la valeur est NaN, elle sera remplacée par 0
      const served = parseInt(serveAppointmentsByHourSlot[i].amount, 10) || 0;

      // 1. Ajouter les nouveaux tickets du créneau actuel
      pendingTickets += appointments;

      // 2. Soustraire les tickets servis dans ce créneau
      pendingTickets -= served;

      // 3. S'assurer que le nombre de tickets en attente ne soit pas négatif
      pendingTickets = Math.max(0, pendingTickets);

      // Empêcher les valeurs négatives
      pendingTickets = Math.max(0, pendingTickets);

      pendingTicketsByHourSlot.push(pendingTickets);
    }
    // pendingTickets = appointmentsByHourSlot[i].amount + pendingTickets - serveAppointmentsByHourSlot[i].amount; // Ajout du résultat de la soustraction à l'accumulateur
    // pendingTicketsByHourSlot.push(pendingTickets); // Stockage du résultat dans le tableau
    return pendingTicketsByHourSlot;
  }

  if (isLoading || loading || !result || officeLoading || timeLoading) {
    return <Loader />
  }

  if (error || officeError) {
    return <p className=" text-center text-xs text-red-500">Vérifie votre connexion</p>
  }

  return (
    <div className=' bg-gray-100 h-fit  w-full rounded-t-xl p-4'>
      <div className=" w-full flex items-center justify-between">
        <div className="flex gap-3 items-center">
          <button className=' bg-teal-200 text-xs flex gap-2 items-center rounded-md py-2 px-3' aria-controls="fade-menu-filter" aria-haspopup="true" onClick={handleOfficeClickFilter}>
            <CiFilter />
            <p className=' font-semibold' >Filtrer par agence</p>
          </button>
          <Menu
            id="fade-menu-filter"
            anchorEl={anchorOfficeElFilter}
            keepMounted
            open={openOfficeMenuFilter}
            onClose={handleCloseOfficeMenuFilter}
            className=' rounded-xl'
          >
            {fetchedOffices?.map((office) => (
              <MenuItem
                key={office.id}
                className="bg-gray-200 text-gray-500 mx-2 my-1 rounded-full text-xs h-10 "
              // On retire onClick pour éviter l'interférence avec le Checkbox
              >
                <Checkbox
                  checked={selectedOffices.includes(office.id)}
                  onChange={() => handleToggleOffice(office.id)}
                  color="default"
                  onClick={(e) => e.stopPropagation()} // Empêcher le clic de se propager
                />
                <ListItemText primary={office.name} />
              </MenuItem>
            ))}

            {/* Bouton Rechercher */}
            <div className="flex justify-center p-2">
              <Button
                variant="contained"
                color="success"
                onClick={handleFilterOffice}
                className="bg-black text-white rounded-full w-full py-2"
              >
                Valider
              </Button>
            </div>
          </Menu>
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
                  setFilterBetween(true);
                  handleWeekFilter(formattedStartDate, formattedEndDate);
                }
              }} className=" w-full bg-black text-xs text-white py-2 rounded-md hover:bg-green-500">Valider</button>
            </div>
          </Menu>
          <div className=" py-2 px-3 rounded-md bg-blue-200 flex items-center gap-2 text-xs font-semibold cursor-pointer" onClick={() => {
            setFilter(false);
            setFilterOffice(false);
            setFilterTwoDate(false);
            setFilterBetween(false);
            const date = new Date(new Date().getTime());
            const hours = String(date.getUTCHours()).padStart(2, '0');
            const minutes = String(date.getUTCMinutes()).padStart(2, '0');
            const seconds = String(date.getUTCSeconds()).padStart(2, '0');
            const pickedTime = `${hours}:${minutes}:${seconds}`;
            setCurrentDate(`Aujourd'hui : ${format(`${now.toLocaleDateString('fr-FR').split('/')[1]}/${now.toLocaleDateString('fr-FR').split('/')[0]}/${now.toLocaleDateString('fr-FR').split('/')[2]}`, 'EEEE dd MMMM yyyy', { locale: fr })} à ${pickedTime}`);
            const office = fetchedOffices!.find((office) => office.id === officeId);
            setOfficeName(office!.name)
            setDescription(`Ceci represente l'ensemble des données de l'agence ${officeName} pour la date d'aujourd'hui ${new Date().toLocaleDateString('fr-FR')}`);
            setOfficeId(17);
            setShowTotal(false);
            setSelectedOffices([]);
            setFilterAsc(false);
            setFilterAppointments(emptyAppointments);
          }}>
            <IoReload />
            <p>Aujourd&rsquo;hui</p>
          </div>
        </div>

        <button onClick={exportToExcel} className=" bg-green-700 rounded-md py-2 px-3 text-white text-xs flex items-center gap-2"><RiFileExcel2Fill />Exporter</button>
      </div>
      <div className="flex gap-2 items-center mt-6">
        <HiOutlineBuildingOffice />
        <p className=" text-xs font-bold">{officeName.toUpperCase()}</p>
      </div>
      <div className="flex gap-2 items-center mt-3 mb-6">
        <FaRegCalendar />
        <p className=" text-xs font-bold">{currentDate}</p>
      </div>

      <Accordion title="Métriques">
        {
          fetchedTimes && fetchedTimes.map((time) => (
            <>
              {
                time.type === "meanWaitingTime" &&
                <div className=' my-4'>
                  <p className=' text-sm font-semibold my-2'>Temps moyen d&apos;attente</p>
                  <div className="flex gap-3 items-center">
                    <p className=' text-xs'>Durée : {time.time} minutes</p>
                    <FiEdit3 size={16} onClick={() => handleOpenEditTime(time)} className=" cursor-pointer hover:text-blue-500" />
                  </div>
                </div>
              }
              {
                time.type === "meanServingTime" &&
                <div className=' my-4'>
                  <p className=' text-sm font-semibold my-2'>Temps moyen de traitement</p>
                  <div className="flex gap-3 items-center">
                    <p className=' text-xs'>Durée : {time.time} minutes</p>
                    <FiEdit3 size={16} onClick={() => handleOpenEditTime(time)} className=" cursor-pointer hover:text-blue-500" />
                  </div>
                </div>
              }
              {
                time.type === "minimalServingTime" &&
                <div className=' my-4'>
                  <p className=' text-sm font-semibold my-2'>Temps minimal de traitement</p>
                  <div className="flex gap-3 items-center">
                    <p className=' text-xs'>Durée : {time.time} minutes</p>
                    <FiEdit3 size={16} onClick={() => handleOpenEditTime(time)} className=" cursor-pointer hover:text-blue-500" />
                  </div>
                </div>
              }
            </>
          ))
        }
        {fetchedTimes && fetchedTimes.length == 0 && <button onClick={() => handleOpenTime("meanWaitingTime")} className='  bg-black py-2 px-4 rounded-md text-white text-sm flex items-center gap-2 my-4 '><IoAddCircleOutline size={20} /> Ajouter Le temps moyen d&apos;attente</button>}
        {fetchedTimes && fetchedTimes.length < 2 && <button onClick={() => handleOpenTime("meanServingTime")} className='  bg-black py-2 px-4 rounded-md text-white text-sm flex items-center gap-2 my-4'><IoAddCircleOutline size={20} /> Ajouter Le temps moyen de traitement</button>}
        {fetchedTimes && fetchedTimes.length < 3 && <button onClick={() => handleOpenTime("minimalServingTime")} className='  bg-black py-2 px-4 rounded-md text-white text-sm flex items-center gap-2 my-4'><IoAddCircleOutline size={20} /> Ajouter Le temps minimal de traitement</button>}
      </Accordion>
      <h3 className=" font-bold">1-Synthèse</h3>
      <div className=" flex justify-center mt-12">
        <div className=" w-4 bg-black">
        </div>
        <div className="flex bg-white rounded-sm justify-between items-center ">
          <div className="flex w-48 h-20 p-4 items-center justify-center gap-4 border-r-[1px]">
            <div className=" w-12 h-12 bg-blue-500 bg-opacity-20 rounded-full flex justify-center items-center">
              <FaClipboardList className=" text-blue-600" />
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
            <div className=" w-12 h-12 bg-gray-400 bg-opacity-20 rounded-full flex justify-center items-center">
              <IoTabletLandscape className=" text-gray-600" />
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
          <div className="flex w-52 h-20 py-4 items-center justify-center gap-2 border-r-[1px]">
            <div className=" w-12 h-12 bg-green-500 bg-opacity-20 rounded-full flex justify-center items-center">
              <IoCheckmarkDoneCircleSharp className=" text-green-600" />
            </div>
            <div>
              <h2 className=" text-sm font-bold">
                {filter === false ? result?.receives : filterStats.receives}
              </h2>
              <div className=" flex items-center gap-2">
                <p className=" text-xs opacity-60">
                  Clients traités
                </p>
                <p className=" text-xs text-green-500 font-semibold">
                  {filter === false ? `${result?.receives ? `${((result?.receives / result?.appointments) * 100).toFixed()}%` : '0%'}` : `${filterStats?.receives ? `${((filterStats?.receives / filterStats?.appointments) * 100).toFixed()}%` : '0%'}`}
                </p>
              </div>
            </div>
          </div>
          <div className="flex w-52 h-20 py-4 items-center justify-center gap-4 border-r-[1px]">
            <div className=" w-12 h-12 bg-red-500 bg-opacity-20 rounded-full flex justify-center items-center">
              <RiLoader2Fill className=" text-red-600" />
            </div>
            <div>
              <h2 className=" text-sm font-bold">
                {filter === false ? result?.waitings : filterStats.waitings}
              </h2>
              <div className=" flex items-center gap-2">
                <p className=" text-xs opacity-60">
                  Clients en attente
                </p>
                <p className=" text-xs text-red-500 font-semibold">
                  {filter === false ? `${result?.waitings ? `${((result?.waitings / result?.appointments) * 100).toFixed()}%` : '0%'}` : `${filterStats?.waitings ? `${((filterStats?.waitings / filterStats?.appointments) * 100).toFixed()}%` : '0%'}`}
                </p>
              </div>
            </div>
          </div>
          <div className="flex w-60 h-20 p-4 items-center justify-center gap-4">
            <div className=" w-12 h-12 bg-yellow-500 bg-opacity-20 rounded-full flex justify-center items-center">
              <BsStickyFill className=" text-yellow-600" />
            </div>
            <div>
              <h2 className=" text-sm font-bold">
                {filter === false ? result?.appointments : filterStats.appointments}
              </h2>
              <p className=" text-xs opacity-60">
                Clients totalisé
              </p>
            </div>
          </div>
        </div>
      </div>
      <div className=" flex justify-center my-8 items-center">
        <MdTimer size={50} />
        <div className="flex bg-white rounded-sm justify-between items-center ">
          <div className="flex w-52 h-20 py-4 items-center justify-center gap-2 border-r-[1px]">
            <div className=" w-12 h-12 bg-red-400 bg-opacity-10 rounded-full flex justify-center items-center">
              <MdOutlineTimelapse className=" text-red-500" />
            </div>
            <div>
              <h2 className=" text-md font-bold">
                {filter === false ? format(result?.meanWaitingTime * 60 * 1000, 'HH:mm:ss') : filterBetween ? format((filterStats.appointmentsByDates.length === 0 ? 0 : filterStats.appointmentsByDates?.reduce((total, item) => total + item.meanWaiting, 0) / filterStats.appointmentsByDates.length) * 60 * 1000, 'HH:mm:ss') : format(filterStats?.meanWaitingTime * 60 * 1000, 'HH:mm:ss')}
              </h2>
              <p className=" text-xs opacity-60">
                Attente moyenne
              </p>
            </div>
          </div>
          <div className="flex w-58 h-20 py-4 px-2 items-center justify-center gap-2 border-r-[1px]">
            <div className=" w-12 h-12 bg-green-400 bg-opacity-10 rounded-full flex justify-center items-center">
              <MdOutlineTimelapse className=" text-green-500" />
            </div>
            <div>
              <h2 className=" text-md font-bold">
                {filter === false ? format(result?.meanServingTime * 60 * 1000, 'HH:mm:ss') : filterBetween ? format((filterStats.appointmentsByDates.length === 0 ? 0 : filterStats.appointmentsByDates?.reduce((total, item) => total + item.meanServing, 0) / filterStats.appointmentsByDates.length) * 60 * 1000, 'HH:mm:ss') : format(filterStats?.meanServingTime * 60 * 1000, 'HH:mm:ss')}
              </h2>
              <p className=" text-xs opacity-60">
                Traitement moyen
              </p>
            </div>
          </div>
          <div className=" w-60 h-20 py-1 px-2 gap-2 border-r-[1px]">
            <div>
              <p className=" text-xs opacity-60 text-center pb-1 ">
                Attente optimale
              </p>
              <div className=" flex justify-between px-2">
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
                      {filter === false ? `${result?.totalInWaiting ? `${((result?.totalInWaiting / result?.appointments) * 100).toFixed()}%` : '0%'}` : `${filterStats?.totalInWaiting ? `${((filterStats?.totalInWaiting / filterStats?.appointments) * 100).toFixed()}%` : '0%'}`}
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
                      {filter === false ? `${result?.totalNotInWaiting ? `${((result?.totalNotInWaiting / result?.appointments) * 100).toFixed()}%` : '0%'}` : `${filterStats?.totalNotInWaiting ? `${((filterStats?.totalNotInWaiting / filterStats?.appointments) * 100).toFixed()}%` : '0%'}`}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className=" w-60 h-20 py-1 px-2 gap-2 border-r-[1px]">
            <div>
              <p className=" text-xs opacity-60 text-center pb-1">
                Traitement optimal
              </p>
              <div className=" flex justify-between px-2">
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
                      {filter === false ? `${result?.totatlInServing ? `${((result?.totatlInServing / result?.appointments) * 100).toFixed()}%` : '0%'}` : `${filterStats?.totatlInServing ? `${((filterStats?.totatlInServing / filterStats?.appointments) * 100).toFixed()}%` : '0%'}`}
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
                      {filter === false ? `${result?.totatlNotInServing ? `${((result?.totatlNotInServing / result?.appointments) * 100).toFixed()}%` : '0%'}` : `${filterStats?.totatlNotInServing ? `${((filterStats?.totatlNotInServing / filterStats?.appointments) * 100).toFixed()}%` : '0%'}`}
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

      {
        filterBetween === true && <div className=" mt-4 mb-8">
          <div className="flex gap-2 items-center mb-2">
            <HiOutlineBuildingOffice />
            <p className=" text-xs font-bold">{officeName.toUpperCase()}</p>
          </div>
          <div className="flex gap-2 items-center mb-2">
            <FaRegCalendar />
            <p className=" text-xs font-bold">{currentDate}</p>
          </div>
          <table className="w-full table-fixed">
            <thead>
              <tr className=" bg-black text-white">
                <th className="w-24 px-3 py-4 text-left  text-xs font-semibold">Date</th>
                <th className="w-2/12 py-4 text-center  text-xs font-semibold">Clients totalisés</th>
                <th className="w-2/12 py-4 text-center  text-xs font-semibold">Attente moyenne</th>
                <th className="w-2/12 py-4 text-center  text-xs font-semibold">Traitement moyen</th>
                <th className='w-2/12 py-4 text-center  text-xs font-semibold'>Attente optimale</th>
                <th className="w-2/12 py-4 text-center  text-xs font-semibold">Attente non optimale</th>
                <th className='w-2/12 py-4 text-center  text-xs font-semibold'>Traitement optimale</th>
                <th className='w-48 py-4 text-center  text-xs font-semibold'>Traitement non optimale</th>
              </tr>
            </thead>
            {
              filterStats.appointmentsByDates?.map((date, index) => (
                <tr key={index} className=" bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600">
                  <td className=' w-24 text-xs p-3 '>
                    <p>{`${date.name.split('-')[2]}/${date.name.split('-')[1]}/${date.name.split('-')[0]}`}</p>
                  </td>
                  <td className='w-2/12 text-xs py-3 text-center '>
                    <p>{date.receives}</p>
                  </td>
                  <td className='w-2/12 text-xs py-3  text-center'>
                    <p>{format(date?.meanWaiting * 60 * 1000, 'HH:mm:ss')}</p>
                  </td>
                  <td className='w-2/12 text-xs py-3  text-center'>
                    <p>{format(date?.meanServing * 60 * 1000, 'HH:mm:ss')}</p>
                  </td>
                  <td className='w-2/12 text-xs py-3  text-center'>
                    <p>{date.inwaitings}</p>
                  </td>
                  <td className='w-2/12 text-xs py-3 text-center'>
                    <p>{date.notInWaitings}</p>
                  </td>
                  <td className='w-2/12 text-xs py-3 text-center'>
                    <p>{date.inservings}</p>
                  </td>
                  <td className='w-2/12 text-xs py-3 text-center'>
                    <p>{date.notInServings}</p>
                  </td>
                </tr>
              ))
            }
            <tr className=" bg-green-500 text-white border-b font-bold">
              <td className=' w-24 text-xs p-3 '>
                <p>Totale</p>
              </td>
              <td className='w-1/12 text-xs py-3 text-center '>
                <p>{filterStats.appointmentsByDates?.reduce((total, item) => total + item.receives, 0)}</p>
              </td>
              <td className='w-1/12 text-xs py-3  text-center'>
                <p>{format(filterStats.appointmentsByDates.length === 0 ? 0 : (filterStats.appointmentsByDates?.reduce((total, item) => total + item.meanWaiting, 0) / filterStats.appointmentsByDates.length) * 60 * 1000, 'HH:mm:ss')}</p>
              </td>
              <td className='w-1/12 text-xs py-3  text-center'>
                <p>{format(filterStats.appointmentsByDates.length === 0 ? 0 : (filterStats.appointmentsByDates?.reduce((total, item) => total + item.meanServing, 0) / filterStats.appointmentsByDates.length) * 60 * 1000, 'HH:mm:ss')}</p>
              </td>
              <td className='w-2/12 text-xs py-3  text-center'>
                <p>{filterStats.appointmentsByDates?.reduce((total, item) => total + item.inwaitings, 0)}</p>
              </td>
              <td className='w-2/12 text-xs py-3 text-center'>
                <p>{filterStats.appointmentsByDates?.reduce((total, item) => total + item.notInWaitings, 0)}</p>
              </td>
              <td className='w-2/12 text-xs py-3 text-center'>
                <p>{filterStats.appointmentsByDates?.reduce((total, item) => total + item.inservings, 0)}</p>
              </td>
              <td className='w-2/12 text-xs py-3 text-center'>
                <p>{filterStats.appointmentsByDates?.reduce((total, item) => total + item.notInServings, 0)}</p>
              </td>
            </tr>
          </table>

        </div>
      }

      <h3 className=" font-bold mb-4">2-Analyse par rapport aux services</h3>
      <div className=" flex justify-center gap-12 mb-7">
        <div className=" w-fit bg-white rounded pb-1">
          <MdTimer size={30} className=" mx-auto mt-1" />
          <hr className=" w-8 mx-auto my-3" />
          <p className=" text-center">Attente moyenne</p>
          <div className="flex gap-4 justify-center my-2 px-2">
            {
              filter === false ?
                result?.meanWaitingTimeByService.map(record => (
                  <div key={record.name} className=" text-center">
                    <p className=" text-xs font-semibold">{format(record.amount * 60 * 1000, 'HH:mm:ss')}</p>
                    <p className=" text-xs">{record.name}</p>
                  </div>
                )) :
                filterStats?.meanWaitingTimeByService.map(record => (
                  <div key={record.name} className=" text-center">
                    <p className=" text-xs font-semibold">{format(record.amount * 60 * 1000, 'HH:mm:ss')}</p>
                    <p className=" text-xs">{record.name}</p>
                  </div>
                ))
            }
          </div>
        </div>
        <div className=" w-fit bg-white rounded pb-1">
          <MdTimer size={30} className=" mx-auto mt-1" />
          <hr className=" w-8 mx-auto my-3" />
          <p className=" text-center">Traitement moyen</p>
          <div className="flex gap-4 justify-center my-2 px-2">
            {
              filter === false ?
                result?.meanServingTimeByService.map(record => (
                  <div key={record.name} className=" text-center">
                    <p className=" text-xs font-semibold">{format(record.amount * 60 * 1000, 'HH:mm:ss')}</p>
                    <p className=" text-xs">{record.name}</p>
                  </div>
                ))
                :
                filterStats?.meanServingTimeByService.map(record => (
                  <div key={record.name} className=" text-center">
                    <p className=" text-xs font-semibold">{format(record.amount * 60 * 1000, 'HH:mm:ss')}</p>
                    <p className=" text-xs">{record.name}</p>
                  </div>
                ))
            }
          </div>
        </div>
      </div>
      <div className=" mt-2 flex justify-center items-start gap-5">
        <div className=" w-2/3 h-screen pb-14 bg-white rounded overflow-hidden">
          <h3 className=" text-center p-1">Visualisation de l&lsquo;affluence par service</h3>
          <Bar
            data={filter === false ? {
              labels: result?.appointmentsByService.map(record => record.name), // Les noms de vos services
              datasets: [
                {
                  label: 'Reçu',
                  backgroundColor: 'rgb(0, 0, 0)', // Noir foncé pour "Reçu"
                  borderColor: 'rgba(0, 0, 0, 1)',
                  borderWidth: 1,
                  hoverBackgroundColor: 'rgba(0, 0, 0, 0.8)',
                  hoverBorderColor: 'rgba(0, 0, 0, 1)',
                  data: result?.appointmentsByService.map(record => record.amount), // Les données pour "Reçu" pour chaque service
                },
                {
                  label: 'Traité',
                  backgroundColor: 'rgba(0, 128, 0, 0.7)', // Vert foncé pour "Traité"
                  borderColor: 'rgba(0, 128, 0, 1)',
                  borderWidth: 1,
                  hoverBackgroundColor: 'rgba(0, 128, 0, 0.8)',
                  hoverBorderColor: 'rgba(0, 128, 0, 1)',
                  data: result?.serveAppointmentsByService.map(record => record.amount), // Les données pour "Traité" pour chaque service
                },
                {
                  label: 'En attente',
                  backgroundColor: 'rgba(255, 0, 0, 0.8)', // Rouge pour "En attente"
                  borderColor: 'rgba(255, 0, 0, 1)',
                  borderWidth: 1,
                  hoverBackgroundColor: 'rgba(255, 0, 0, 0.8)',
                  hoverBorderColor: 'rgba(255, 0, 0, 1)',
                  data: result?.waitingAppointmentsByService.map(record => record.amount)  // Les données pour "En attente" pour chaque service
                },
                {
                  label: 'Attente optimale',
                  backgroundColor: 'rgba(58, 252, 193, 0.8)', // Rouge pour "En attente"
                  borderColor: 'rgba(58, 252, 193, 1)',
                  borderWidth: 1,
                  hoverBackgroundColor: 'rgba(58, 252, 193, 0.8)',
                  hoverBorderColor: 'rgba(58, 252, 193, 1)',
                  data: result?.totatlInWaitingByService.map(record => record.amount)
                },
                {
                  label: 'Attente Non Optimale',
                  backgroundColor: 'rgba(248, 82, 139, 0.8)', // Rouge pour "En attente"
                  borderColor: 'rgba(248, 82, 139, 1)',
                  borderWidth: 1,
                  hoverBackgroundColor: 'rgba(248, 82, 139, 0.8)',
                  hoverBorderColor: 'rgba(248, 82, 139, 1)',
                  data: result?.totatlNotInWaitingByService.map(record => record.amount)
                },
                {
                  label: 'Traitement Optimale',
                  backgroundColor: 'rgba(40, 125, 100, 0.8)', // Rouge pour "En attente"
                  borderColor: 'rgba(40, 125, 100, 1)',
                  borderWidth: 1,
                  hoverBackgroundColor: 'rgba(40, 125, 100, 0.8)',
                  hoverBorderColor: 'rgba(40, 125, 100, 1)',
                  data: result?.totatlInServingByService.map(record => record.amount)
                },
                {
                  label: 'Traitement Non Optimale',
                  backgroundColor: 'rgba(255, 175, 202, 0.8)', // Rouge pour "En attente"
                  borderColor: 'rgba(255, 175, 202, 1)',
                  borderWidth: 1,
                  hoverBackgroundColor: 'rgba(255, 175, 202, 0.8)',
                  hoverBorderColor: 'rgba(255, 175, 202, 1)',
                  data: result?.totatlNotInServingByService.map(record => record.amount)
                }
              ],
            } : {
              labels: filterStats?.appointmentsByService.map(record => record.name), // Les noms de vos services
              datasets: [
                {
                  label: 'Reçu',
                  backgroundColor: 'rgb(0, 0, 0)', // Noir foncé pour "Reçu"
                  borderColor: 'rgba(0, 0, 0, 1)',
                  borderWidth: 1,
                  hoverBackgroundColor: 'rgba(0, 0, 0, 0.8)',
                  hoverBorderColor: 'rgba(0, 0, 0, 1)',
                  data: filterStats?.appointmentsByService.map(record => record.amount) // Les données pour "Reçu" pour chaque service
                },
                {
                  label: 'Traité',
                  backgroundColor: 'rgba(0, 128, 0, 0.7)', // Vert foncé pour "Traité"
                  borderColor: 'rgba(0, 128, 0, 1)',
                  borderWidth: 1,
                  hoverBackgroundColor: 'rgba(0, 128, 0, 0.8)',
                  hoverBorderColor: 'rgba(0, 128, 0, 1)',
                  data: filterStats?.serveAppointmentsByService.map(record => record.amount), // Les données pour "Traité" pour chaque service
                },
                ...(filterOffice === true ? [{
                  label: 'En attente',
                  backgroundColor: 'rgba(255, 0, 0, 0.8)', // Rouge pour "En attente"
                  borderColor: 'rgba(255, 0, 0, 1)',
                  borderWidth: 1,
                  hoverBackgroundColor: 'rgba(255, 0, 0, 0.8)',
                  hoverBorderColor: 'rgba(255, 0, 0, 1)',
                  data: filterStats?.waitingAppointmentsByService.map(record => record.amount) // Les données pour "En attente" pour chaque service
                }] : []),
                {
                  label: 'Attente optimale',
                  backgroundColor: 'rgba(58, 252, 193, 0.8)', // Rouge pour "En attente"
                  borderColor: 'rgba(58, 252, 193, 1)',
                  borderWidth: 1,
                  hoverBackgroundColor: 'rgba(58, 252, 193, 0.8)',
                  hoverBorderColor: 'rgba(58, 252, 193, 1)',
                  data: filterStats?.totatlInWaitingByService.map(record => record.amount)
                },
                {
                  label: 'Attente Non Optimale',
                  backgroundColor: 'rgba(248, 82, 139, 0.8)', // Rouge pour "En attente"
                  borderColor: 'rgba(248, 82, 139, 1)',
                  borderWidth: 1,
                  hoverBackgroundColor: 'rgba(248, 82, 139, 0.8)',
                  hoverBorderColor: 'rgba(248, 82, 139, 1)',
                  data: filterStats?.totatlNotInWaitingByService.map(record => record.amount)
                },
                {
                  label: 'Traitement Optimale',
                  backgroundColor: 'rgba(40, 125, 100, 0.8)', // Rouge pour "En attente"
                  borderColor: 'rgba(40, 125, 100, 1)',
                  borderWidth: 1,
                  hoverBackgroundColor: 'rgba(40, 125, 100, 0.8)',
                  hoverBorderColor: 'rgba(40, 125, 100, 1)',
                  data: filterStats?.totatlInServingByService.map(record => record.amount)
                },
                {
                  label: 'Traitement Non Optimale',
                  backgroundColor: 'rgba(255, 0, 0, 0.8)', // Rouge pour "En attente"
                  borderColor: 'rgba(255, 0, 0, 1)',
                  borderWidth: 1,
                  hoverBackgroundColor: 'rgba(255, 0, 0, 0.8)',
                  hoverBorderColor: 'rgba(255, 0, 0, 1)',
                  data: filterStats?.totatlNotInServingByService.map(record => record.amount)
                }
              ],
            }}
            width={100}
            height={50}
            options={{
              maintainAspectRatio: false,
            }} // Utilisation des options typées
          />
        </div>
        <div className=" w-96">
          <div className=" bg-white rounded pb-1 pt-1">
            <MdTimer size={30} className=" mx-auto" />
            <hr className=" w-8 mx-auto my-3" />
            <p className=" text-center">Attente optimale</p>
            <div className="flex gap-4 justify-center my-2">
              {
                filter === false ?
                  result?.totatlInWaitingByService.map(record => (
                    <div key={record.name} className=" text-center">
                      <p className=" text-xs font-semibold">{Math.ceil(record.amount)}</p>
                      <p className=" text-xs font-semibold">{record.name}</p>
                    </div>
                  ))
                  :
                  filterStats?.totatlInWaitingByService.map(record => (
                    <div key={record.name} className=" text-center">
                      <p className=" text-xs font-semibold">{Math.ceil(record.amount)}</p>
                      <p className=" text-xs font-semibold">{record.name}</p>
                    </div>
                  ))
              }
            </div>
          </div>

          <div className=" bg-white rounded pb-1 my-7 pt-1">
            <MdTimer size={30} className=" mx-auto" />
            <hr className=" w-8 mx-auto my-3" />
            <p className=" text-center">Attente non optimale</p>
            <div className="flex gap-4 justify-center my-2 px-2">
              {
                filter === false ?
                  result?.totatlNotInWaitingByService.map(record => (
                    <div key={record.name} className=" text-center">
                      <p className=" text-xs font-semibold text-red-500">{Math.ceil(record.amount)}</p>
                      <p className=" text-xs font-semibold">{record.name}</p>
                    </div>
                  )) :
                  filterStats?.totatlNotInWaitingByService.map(record => (
                    <div key={record.name} className=" text-center">
                      <p className=" text-xs font-semibold text-red-500">{Math.ceil(record.amount)}</p>
                      <p className=" text-xs font-semibold">{record.name}</p>
                    </div>
                  ))
              }
            </div>
          </div>

          <div className=" bg-white rounded pb-1 pt-1">
            <MdTimer size={30} className=" mx-auto" />
            <hr className=" w-8 mx-auto my-3" />
            <p className=" text-center">Traitement optimal</p>
            <div className="flex gap-4 justify-center my-2 px-2">
              {filter === false ?
                result?.totatlInServingByService.map(record => (
                  <div key={record.name} className=" text-center">
                    <p className=" text-xs font-semibold">{Math.ceil(record.amount)}</p>
                    <p className=" text-xs font-semibold">{record.name}</p>
                  </div>
                ))
                :
                filterStats?.totatlInServingByService.map(record => (
                  <div key={record.name} className=" text-center">
                    <p className=" text-xs font-semibold">{Math.ceil(record.amount)}</p>
                    <p className=" text-xs font-semibold">{record.name}</p>
                  </div>
                ))
              }
            </div>
          </div>

          <div className=" bg-white rounded pb-1 my-7 pt-1">
            <MdTimer size={30} className=" mx-auto" />
            <hr className=" w-8 mx-auto my-3" />
            <p className=" text-center">Traitement non optimal</p>
            <div className="flex gap-4 justify-center my-2 px-2">
              {
                filter === false ?
                  result?.totatlNotInServingByService.map(record => (
                    <div key={record.name} className=" text-center">
                      <p className=" text-xs font-semibold text-red-500">{Math.ceil(record.amount)}</p>
                      <p className=" text-xs font-semibold">{record.name}</p>
                    </div>
                  ))
                  :
                  filterStats?.totatlNotInServingByService.map(record => (
                    <div key={record.name} className=" text-center">
                      <p className=" text-xs font-semibold text-red-500">{Math.ceil(record.amount)}</p>
                      <p className=" text-xs font-semibold">{record.name}</p>
                    </div>
                  ))
              }
            </div>
          </div>
        </div>
      </div>
      <h3 className=" font-bold my-4">3-Analyse par rapport aux points d&apos;appel</h3>
      <div className=" flex justify-center my-8">
        <div className=" w-4 bg-black">
        </div>
        <div className="flex bg-white rounded-sm justify-between items-center">
          <div className=" w-fit h-fit py-4 border-r-[1px] px-2">
            <div className=" flex items-center gap-2 justify-center">
              <div className=" w-4 h-4 bg-green-500 bg-opacity-20 rounded-full flex justify-center items-center">
                <IoCheckmarkDoneCircleSharp className=" text-green-600 w-3" />
              </div>
              <p className=" text-xs font-bold">Clients traités</p>
            </div>
            <div className="grid grid-cols-3 gap-2 justify-items-center items-center my-2 px-2 w-fit">
              {
                filter === false ? result?.serveAppointmentsBySubService.map(record => (
                  <div key={record.name} className=" text-center">
                    <p className=" text-xs font-semibold">{record.amount}</p>
                    <div className=" flex items-center gap-1 mt-1">
                      <p className=" text-xs ">{record.name.charAt(0).toUpperCase() + record.name.slice(1).toLowerCase()}</p>
                      {result?.serveAppointmentsBySubService ? <p className={`text-xs font-semibold ${record.amount > 0 ? `text-green-500` : `text-red-500`} `} > {((record.amount / result?.receives) * 100).toFixed()}%</p> : <p className=" text-xs font-semibold text-red-500">0%</p>}
                    </div>
                  </div>
                ))
                  :
                  filterStats?.serveAppointmentsBySubService.map(record => (
                    <div key={record.name} className=" text-center">
                      <p className=" text-xs font-semibold">{record.amount}</p>
                      <div className=" flex items-center gap-1 mt-1">
                        <p className=" text-xs ">{record.name.charAt(0).toUpperCase() + record.name.slice(1).toLowerCase()}</p>
                        {filterStats?.serveAppointmentsBySubService ? <p className={`text-xs font-semibold ${record.amount > 0 ? `text-green-500` : `text-red-500`} `} > {((record.amount / filterStats?.receives) * 100).toFixed()}%</p> : <p className=" text-xs font-semibold text-red-500">0%</p>}
                      </div>
                    </div>))
              }
            </div>
          </div>
          <div className=" w-fit h-fit py-4 border-r-[1px] px-2">
            <div className=" flex items-center gap-2 justify-center">
              <div className=" w-4 h-4 bg-red-500 bg-opacity-20 rounded-full flex justify-center items-center">
                <RiLoader2Fill className=" text-red-600 w-3" />
              </div>
              <p className=" text-xs font-bold">Clients en attente</p>
            </div>
            <div className="grid grid-cols-3 gap-2 justify-items-center items-center my-2 px-2 w-fit">
              {filter === false ? result?.waitingAppointmentsBySubService.map(record => (
                <div key={record.name} className=" text-center">
                  <p className=" text-xs font-semibold">{record.amount}</p>
                  <div className=" flex items-center gap-1 mt-1">
                    <p className=" text-xs ">{record.name.charAt(0).toUpperCase() + record.name.slice(1).toLowerCase()}</p>
                    {result?.waitingAppointmentsBySubService ? <p className={`text-xs font-semibold ${record.amount > 0 ? `text-red-500` : `text-green-500`} `} > {result?.waitings > 0 ? ((record.amount / result?.waitings) * 100).toFixed() : 0}%</p> : <p className=" text-xs font-semibold text-red-500">0%</p>}
                  </div>
                </div>
              ))
                :
                filterStats?.waitingAppointmentsBySubService.map(record => (
                  <div key={record.name} className=" text-center">
                    <p className=" text-xs font-semibold">{record.amount}</p>
                    <div className=" flex items-center gap-1 mt-1">
                      <p className=" text-xs capitalize">{record.name}</p>
                      {filterStats?.waitingAppointmentsBySubService ? <p className={`text-xs font-semibold ${record.amount > 0 ? `text-red-500` : `text-green-500`} `} > {filterStats?.waitings > 0 ? ((record.amount / filterStats?.waitings) * 100).toFixed() : 0}%</p> : <p className=" text-xs font-semibold text-red-500">0%</p>}
                    </div>
                  </div>
                ))
              }
            </div>
          </div>
          <div className=" w-fit h-fit p-4 px-2">
            <div className=" flex items-center gap-2 justify-center">
              <div className=" w-4 h-4 bg-yellow-500 bg-opacity-20 rounded-full flex justify-center items-center">
                <BsStickyFill className=" text-yellow-600 w-2" />
              </div>
              <p className=" text-xs font-bold">Clients totalisés</p>
            </div>
            <div className="grid grid-cols-3 gap-2 justify-items-center items-center my-2 px-2 w-fit">
              {filter === false ? result?.appointmentsBySubService.map(record => (
                <div key={record.name} className=" text-center">
                  <p className=" text-xs font-semibold">{record.amount}</p>
                  <div className=" flex items-center gap-1 mt-1">
                    <p className=" text-xs ">{record.name.charAt(0).toUpperCase() + record.name.slice(1).toLowerCase()}</p>
                    {result?.appointmentsBySubService ? <p className={`text-xs font-semibold ${record.amount > 0 ? `text-green-500` : `text-red-500`} `} > {((record.amount / result?.appointments) * 100).toFixed()}%</p> : <p className=" text-xs font-semibold text-red-500">0%</p>}
                  </div>
                </div>
              )) :
                filterStats?.appointmentsBySubService.map(record => (
                  <div key={record.name} className=" text-center">
                    <p className=" text-xs font-semibold">{record.amount}</p>
                    <div className=" flex items-center gap-1 mt-1">
                      <p className=" text-xs ">{record.name.charAt(0).toUpperCase() + record.name.slice(1).toLowerCase()}</p>
                      {filterStats?.appointmentsBySubService ? <p className={`text-xs font-semibold ${record.amount > 0 ? `text-green-500` : `text-red-500`} `} > {((record.amount / filterStats?.appointments) * 100).toFixed()}%</p> : <p className=" text-xs font-semibold text-red-500">0%</p>}
                    </div>
                  </div>
                ))
              }
            </div>
          </div>
        </div>
      </div>

      <div className=" flex justify-center gap-12 my-7">
        <div className=" w-fit bg-white rounded py-1">
          <MdTimer size={30} className=" mx-auto" />
          <hr className=" w-8 mx-auto my-3" />
          <p className=" text-center">Attente moyenne</p>
          <div className="flex gap-4 justify-center my-2 px-2">
            {
              filter === false ?
                result?.meanWaitingTimeBySubService.map(record => (
                  <div key={record.name} className=" text-center">
                    <p className=" text-xs font-semibold">{format(record.amount * 60 * 1000, 'HH:mm:ss')}</p>
                    <p className=" text-xs">{record.name}</p>
                  </div>
                ))
                :
                filterStats?.meanWaitingTimeBySubService.map(record => (
                  <div key={record.name} className=" text-center">
                    <p className=" text-xs font-semibold">{format(record.amount * 60 * 1000, 'HH:mm:ss')}</p>
                    <p className=" text-xs">{record.name}</p>
                  </div>
                ))
            }
          </div>
        </div>
        <div className=" w-fit bg-white rounded py-1">
          <MdTimer size={30} className=" mx-auto" />
          <hr className=" w-8 mx-auto my-3" />
          <p className=" text-center">Traitement moyen </p>
          <div className="flex gap-4 justify-center my-2 px-2">
            {
              filter === false ?
                result?.meanServingTimeBySubService.map(record => (
                  <div key={record.name} className=" text-center">
                    <p className=" text-xs font-semibold">{format(record.amount * 60 * 1000, 'HH:mm:ss')}</p>
                    <p className=" text-xs">{record.name}</p>
                  </div>
                ))
                :
                filterStats?.meanServingTimeBySubService.map(record => (
                  <div key={record.name} className=" text-center">
                    <p className=" text-xs font-semibold">{format(record.amount * 60 * 1000, 'HH:mm:ss')}</p>
                    <p className=" text-xs">{record.name}</p>
                  </div>
                ))
            }
          </div>
        </div>
      </div>
      <div className=" mt-8 flex justify-center items-start gap-5">
        <div className=" w-2/3 h-screen pb-14 bg-white rounded overflow-hidden">
          <h3 className=" text-center p-1">Visualisation de l&apos;affluence point d&apos;appel</h3>
          <Bar
            data={filter === false ? {
              labels: result?.appointmentsBySubService.map(record => record.name), // Les noms de vos services
              datasets: [
                {
                  label: 'Reçu',
                  backgroundColor: 'rgb(0, 0, 0)', // Noir foncé pour "Reçu"
                  borderColor: 'rgba(0, 0, 0, 1)',
                  borderWidth: 1,
                  hoverBackgroundColor: 'rgba(0, 0, 0, 0.8)',
                  hoverBorderColor: 'rgba(0, 0, 0, 1)',
                  data: result?.appointmentsBySubService.map(record => record.amount), // Les données pour "Reçu" pour chaque service
                },
                {
                  label: 'Traité',
                  backgroundColor: 'rgba(0, 128, 0, 0.7)', // Vert foncé pour "Traité"
                  borderColor: 'rgba(0, 128, 0, 1)',
                  borderWidth: 1,
                  hoverBackgroundColor: 'rgba(0, 128, 0, 0.8)',
                  hoverBorderColor: 'rgba(0, 128, 0, 1)',
                  data: result?.serveAppointmentsBySubService.map(record => record.amount), // Les données pour "Traité" pour chaque service
                },
                {
                  label: 'En attente',
                  backgroundColor: 'rgba(255, 0, 0, 0.8)', // Rouge pour "En attente"
                  borderColor: 'rgba(255, 0, 0, 1)',
                  borderWidth: 1,
                  hoverBackgroundColor: 'rgba(255, 0, 0, 0.8)',
                  hoverBorderColor: 'rgba(255, 0, 0, 1)',
                  data: result?.waitingAppointmentsBySubService.map(record => record.amount), // Les données pour "En attente" pour chaque service
                },
                {
                  label: 'Attente optimale',
                  backgroundColor: 'rgba(58, 252, 193, 0.8)', // Rouge pour "En attente"
                  borderColor: 'rgba(58, 252, 193, 1)',
                  borderWidth: 1,
                  hoverBackgroundColor: 'rgba(58, 252, 193, 0.8)',
                  hoverBorderColor: 'rgba(58, 252, 193, 1)',
                  data: result?.totatlInWaitingBySubService.map(record => record.amount)
                },
                {
                  label: 'Attente Non Optimale',
                  backgroundColor: 'rgba(248, 82, 139, 0.8)', // Rouge pour "En attente"
                  borderColor: 'rgba(248, 82, 139, 1)',
                  borderWidth: 1,
                  hoverBackgroundColor: 'rgba(248, 82, 139, 0.8)',
                  hoverBorderColor: 'rgba(248, 82, 139, 1)',
                  data: result?.totatlNotInWaitingBySubService.map(record => record.amount)
                },
                {
                  label: 'Traitement Optimale',
                  backgroundColor: 'rgba(40, 125, 100, 0.8)', // Rouge pour "En attente"
                  borderColor: 'rgba(40, 125, 100, 1)',
                  borderWidth: 1,
                  hoverBackgroundColor: 'rgba(40, 125, 100, 0.8)',
                  hoverBorderColor: 'rgba(40, 125, 100, 1)',
                  data: result?.totatlInServingBySubService.map(record => record.amount)
                },
                {
                  label: 'Traitement Non Optimale',
                  backgroundColor: 'rgba(255, 175, 202, 0.8)', // Rouge pour "En attente"
                  borderColor: 'rgba(255, 175, 202, 1)',
                  borderWidth: 1,
                  hoverBackgroundColor: 'rgba(255, 175, 202, 0.8)',
                  hoverBorderColor: 'rgba(255, 175, 202, 1)',
                  data: result?.totatlNotInServingBySubService.map(record => record.amount)
                }
              ],
            } : {
              labels: filterStats?.appointmentsBySubService.map(record => record.name), // Les noms de vos services
              datasets: [
                {
                  label: 'Reçu',
                  backgroundColor: 'rgb(0, 0, 0)', // Noir foncé pour "Reçu"
                  borderColor: 'rgba(0, 0, 0, 1)',
                  borderWidth: 1,
                  hoverBackgroundColor: 'rgba(0, 0, 0, 0.8)',
                  hoverBorderColor: 'rgba(0, 0, 0, 1)',
                  data: filterStats?.appointmentsBySubService.map(record => record.amount), // Les données pour "Reçu" pour chaque service
                },
                {
                  label: 'Traité',
                  backgroundColor: 'rgba(0, 128, 0, 0.7)', // Vert foncé pour "Traité"
                  borderColor: 'rgba(0, 128, 0, 1)',
                  borderWidth: 1,
                  hoverBackgroundColor: 'rgba(0, 128, 0, 0.8)',
                  hoverBorderColor: 'rgba(0, 128, 0, 1)',
                  data: filterStats?.serveAppointmentsBySubService.map(record => record.amount), // Les données pour "Traité" pour chaque service
                },
                ...(filterOffice === true ? [{
                  label: 'En attente',
                  backgroundColor: 'rgba(255, 0, 0, 0.8)', // Rouge pour "En attente"
                  borderColor: 'rgba(255, 0, 0, 1)',
                  borderWidth: 1,
                  hoverBackgroundColor: 'rgba(255, 0, 0, 0.8)',
                  hoverBorderColor: 'rgba(255, 0, 0, 1)',
                  data: filterStats?.waitingAppointmentsBySubService.map(record => record.amount) // Les données pour "En attente" pour chaque service
                }] : []),
                {
                  label: 'Attente optimale',
                  backgroundColor: 'rgba(58, 252, 193, 0.8)', // Rouge pour "En attente"
                  borderColor: 'rgba(58, 252, 193, 1)',
                  borderWidth: 1,
                  hoverBackgroundColor: 'rgba(58, 252, 193, 0.8)',
                  hoverBorderColor: 'rgba(58, 252, 193, 1)',
                  data: filterStats?.totatlInWaitingBySubService.map(record => record.amount)
                },
                {
                  label: 'Attente Non Optimale',
                  backgroundColor: 'rgba(248, 82, 139, 0.8)', // Rouge pour "En attente"
                  borderColor: 'rgba(248, 82, 139, 1)',
                  borderWidth: 1,
                  hoverBackgroundColor: 'rgba(248, 82, 139, 0.8)',
                  hoverBorderColor: 'rgba(248, 82, 139, 1)',
                  data: filterStats?.totatlNotInWaitingBySubService.map(record => record.amount)
                },
                {
                  label: 'Traitement Optimale',
                  backgroundColor: 'rgba(40, 125, 100, 0.8)', // Rouge pour "En attente"
                  borderColor: 'rgba(40, 125, 100, 1)',
                  borderWidth: 1,
                  hoverBackgroundColor: 'rgba(40, 125, 100, 0.8)',
                  hoverBorderColor: 'rgba(40, 125, 100, 1)',
                  data: filterStats?.totatlInServingBySubService.map(record => record.amount)
                },
                {
                  label: 'Traitement Non Optimale',
                  backgroundColor: 'rgba(255, 0, 0, 0.8)', // Rouge pour "En attente"
                  borderColor: 'rgba(255, 0, 0, 1)',
                  borderWidth: 1,
                  hoverBackgroundColor: 'rgba(255, 0, 0, 0.8)',
                  hoverBorderColor: 'rgba(255, 0, 0, 1)',
                  data: filterStats?.totatlNotInServingBySubService.map(record => record.amount)
                }
              ],
            }}
            width={100}
            height={50}
            options={{
              maintainAspectRatio: false,

            }} // Utilisation des options typées
          />
        </div>
        <div className=" w-fit">
          <div className=" bg-white rounded py-1">
            <MdTimer size={30} className=" mx-auto" />
            <hr className=" w-8 mx-auto my-3" />
            <p className=" text-center">Attente optimale</p>
            <div className="flex gap-4 justify-center my-2 px-2">
              {filter === false ?
                result?.totatlInWaitingBySubService.map(record => (
                  <div key={record.name} className=" text-center">
                    <p className=" text-xs font-semibold">{Math.ceil(record.amount)}</p>
                    <p className=" text-xs font-semibold">{record.name}</p>
                  </div>
                ))
                :
                filterStats?.totatlInWaitingBySubService.map(record => (
                  <div key={record.name} className=" text-center">
                    <p className=" text-xs font-semibold">{Math.ceil(record.amount)}</p>
                    <p className=" text-xs font-semibold">{record.name}</p>
                  </div>
                ))
              }
            </div>
          </div>

          <div className=" bg-white rounded py-1 my-7">
            <MdTimer size={30} className=" mx-auto" />
            <hr className=" w-8 mx-auto my-3" />
            <p className=" text-center">Attente non optimale</p>
            <div className="flex gap-4 justify-center my-2">
              {
                filter === false ?
                  result?.totatlNotInWaitingBySubService.map(record => (
                    <div key={record.name} className=" text-center">
                      <p className=" text-xs font-semibold text-red-500">{Math.ceil(record.amount)}</p>
                      <p className=" text-xs font-semibold">{record.name}</p>
                    </div>
                  ))
                  :
                  filterStats?.totatlNotInWaitingBySubService.map(record => (
                    <div key={record.name} className=" text-center">
                      <p className=" text-xs font-semibold text-red-500">{Math.ceil(record.amount)}</p>
                      <p className=" text-xs font-semibold">{record.name}</p>
                    </div>
                  ))
              }
            </div>
          </div>

          <div className=" bg-white rounded py-1">
            <MdTimer size={30} className=" mx-auto" />
            <hr className=" w-8 mx-auto my-3" />
            <p className=" text-center">Traitement optimal</p>
            <div className="flex gap-4 justify-center my-2">
              {
                filter === false ?
                  result?.totatlInServingBySubService.map(record => (
                    <div key={record.name} className=" text-center">
                      <p className=" text-xs font-semibold">{Math.ceil(record.amount)}</p>
                      <p className=" text-xs font-semibold">{record.name}</p>
                    </div>
                  ))
                  :
                  filterStats?.totatlInServingBySubService.map(record => (
                    <div key={record.name} className=" text-center">
                      <p className=" text-xs font-semibold">{Math.ceil(record.amount)}</p>
                      <p className=" text-xs font-semibold">{record.name}</p>
                    </div>
                  ))
              }
            </div>
          </div>

          <div className=" bg-white rounded py-1 my-7">
            <MdTimer size={30} className=" mx-auto" />
            <hr className=" w-8 mx-auto my-3" />
            <p className=" text-center">Traitement non optimal</p>
            <div className="flex gap-4 justify-center my-2">
              {
                filter === false ?
                  result?.totatlNotInServingBySubService.map((record: { amount: number; name: string }) => (
                    <div key={record.name} className=" text-center">
                      <p className=" text-xs font-semibold text-red-500">{Math.ceil(record.amount)}</p>
                      <p className=" text-xs font-semibold">{record.name}</p>
                    </div>
                  ))
                  :
                  filterStats?.totatlNotInServingBySubService.map(record => (
                    <div key={record.name} className=" text-center">
                      <p className=" text-xs font-semibold text-red-500">{Math.ceil(record.amount)}</p>
                      <p className=" text-xs font-semibold">{record.name}</p>
                    </div>
                  ))
              }
            </div>
          </div>
        </div>
      </div>

      <h3 className=" font-bold my-4">4-Visualisation linaire du flux des clients</h3>
      {
        filterTwoDate === true && <div className=" h-screen pb-14 bg-white rounded overflow-hidden">
          <h3 className=" text-center p-1">Répartition des tickets par date</h3>
          <Bar
            data={{
              labels: filterStats?.appointmentsByDays.map(record => format(`${record.name.split('-')[1]}/${record.name.split('-')[2]}/${record.name.split('-')[0]}`, 'EEEE dd MMMM yyyy', { locale: fr })), // Les noms de vos services
              datasets: [
                {
                  label: 'Nombre de clients',
                  backgroundColor: 'rgb(0, 0, 0)', // Noir foncé pour "Reçu"
                  borderColor: 'rgba(0, 0, 0, 1)',
                  borderWidth: 1,
                  hoverBackgroundColor: 'rgba(0, 0, 0, 0.8)',
                  hoverBorderColor: 'rgba(0, 0, 0, 1)',
                  data: filterStats?.appointmentsByDays.map(record => record.all), // Les données pour "Reçu" pour chaque service
                },
                {
                  label: 'Clients traités',
                  backgroundColor: 'rgba(0, 128, 0, 0.7)', // Vert foncé pour "Traité"
                  borderColor: 'rgba(0, 128, 0, 1)',
                  borderWidth: 1,
                  hoverBackgroundColor: 'rgba(0, 128, 0, 0.8)',
                  hoverBorderColor: 'rgba(0, 128, 0, 1)',
                  data: filterStats?.appointmentsByDays.map(record => record.receives), // Les données pour "Traité" pour chaque service
                },
                {
                  label: 'Attente optimale',
                  backgroundColor: 'rgba(39, 245, 161, 0.8)', // Rouge pour "En attente"
                  borderColor: 'rgba(39, 245, 161, 1)',
                  borderWidth: 1,
                  hoverBackgroundColor: 'rgba(39, 245, 161, 0.8)',
                  hoverBorderColor: 'rgba(39, 245, 161, 1)',
                  data: filterStats?.appointmentsByDays.map(record => record.inWaitings), // Les données pour "En attente" pour chaque service
                },
                {
                  label: 'Attente non optimale',
                  backgroundColor: 'rgba(255, 0, 0, 0.8)', // Rouge pour "En attente"
                  borderColor: 'rgba(255, 0, 0, 1)',
                  borderWidth: 1,
                  hoverBackgroundColor: 'rgba(255, 0, 0, 0.8)',
                  hoverBorderColor: 'rgba(255, 0, 0, 1)',
                  data: filterStats?.appointmentsByDays.map(record => record.notInWaitings), // Les données pour "En attente" pour chaque service
                },
                {
                  label: 'Traitement optimal',
                  backgroundColor: 'rgba(13, 233, 230, 0.8)', // Rouge pour "En attente"
                  borderColor: 'rgba(13, 233, 230, 1)',
                  borderWidth: 1,
                  hoverBackgroundColor: 'rgba(13, 233, 230, 0.8)',
                  hoverBorderColor: 'rgba(13, 233, 230, 1)',
                  data: filterStats?.appointmentsByDays.map(record => record.inServings), // Les données pour "En attente" pour chaque service
                },
                {
                  label: 'Traitement non optimal',
                  backgroundColor: 'rgba(173, 37, 95, 0.8)', // Rouge pour "En attente"
                  borderColor: 'rgba(173, 37, 95, 1)',
                  borderWidth: 1,
                  hoverBackgroundColor: 'rgba(173, 37, 95, 0.8)',
                  hoverBorderColor: 'rgba(173, 37, 95, 1)',
                  data: filterStats?.appointmentsByDays.map(record => record.notInServings), // Les données pour "En attente" pour chaque service
                },
              ],
            }}
            width={100}
            height={50}
            options={{
              maintainAspectRatio: false
            }} // Utilisation des options typées
          />
        </div>
      }
      {filter == false ? <div className=" w-full bg-white rounded-md p-4 my-4">
        <div className="flex gap-2 items-center mb-2">
            <HiOutlineBuildingOffice />
            <p className=" text-xs font-bold">{officeName.toUpperCase()}</p>
          </div>
          <div className="flex gap-2 items-center mb-2">
            <FaRegCalendar />
            <p className=" text-xs font-bold">{currentDate}</p>
          </div>
        <Line data={{
          labels: result?.appointmentsByHourSlot.map(record => `${new Date(record.name).getHours()}:00:00`),
          datasets: [
            {
              label: 'Nombre de clients',
              data: result.appointmentsByHourSlot.map(record => record.amount), // Exemple de données pour le nombre total de rendez-vous
              borderColor: 'rgba(0, 0, 0, 1)',
              backgroundColor: 'rgba(0, 0, 0, 0.5)',
            },
            {
              label: 'Clients traités',
              data: result.serveAppointmentsByHourSlot.map(record => record.amount), // Exemple de données pour le nombre traité
              borderColor: 'rgba(0, 255, 200, 1)',
              backgroundColor: 'rgba(0, 255, 200, 0.5)',
            },
            {
              label: 'Clients en attente',
              data: calculateWaitingAppointments(result?.appointmentsByHourSlot, result.serveAppointmentsByHourSlot), // Exemple de données pour le nombre en attente
              borderColor: 'rgba(255, 0, 0, 1)',
              backgroundColor: 'rgba(255, 0, 0, 0.5)',
            },
          ],
        }} />

      </div> :
        <div className=" w-full bg-white rounded-md p-4 my-4">
          <div className="flex gap-2 items-center mb-2">
            <HiOutlineBuildingOffice />
            <p className=" text-xs font-bold">{officeName.toUpperCase()}</p>
          </div>
          <div className="flex gap-2 items-center mb-2">
            <FaRegCalendar />
            <p className=" text-xs font-bold">{currentDate}</p>
          </div>
          <Line data={{
            labels: filterStats?.appointmentsByHourSlot.map(record => record.name),
            datasets: [
              {
                label: 'Nombre de clients',
                data: filterStats.appointmentsByHourSlot.map(record => record.amount), // Exemple de données pour le nombre total de rendez-vous
                borderColor: 'rgba(0, 0, 0, 1)',
                backgroundColor: 'rgba(0, 0, 0, 0.5)',
              },
              {
                label: 'Clients traités',
                data: filterStats.serveAppointmentsByHourSlot.map(record => record.amount), // Exemple de données pour le nombre traité
                borderColor: 'rgba(0, 255, 200, 1)',
                backgroundColor: 'rgba(0, 255, 200, 0.5)',
              },
              {
                label: 'Clients en attente',
                data: calculateWaitingAppointments(filterStats?.appointmentsByHourSlot, filterStats.serveAppointmentsByHourSlot), // Exemple de données pour le nombre en attente
                borderColor: 'rgba(255, 0, 0, 1)',
                backgroundColor: 'rgba(255, 0, 0, 0.5)'
              },
            ],
          }} />

        </div>
      }
      <h3 className=" font-bold my-6">5-Tableau détaillé du flux des clients</h3>

      <div className=" ">
        <div className=" flex items-center justify-between">
          <button onClick={() => exportTableDataToExcel("tickets", "Tickets traités", filter ? filterStats : result)} className=" bg-green-700 rounded-md py-2 mb-1 px-2 text-white text-xs flex items-center gap-2"><RiFileExcel2Fill />Exporter</button>
          {!filterAsc ? <button onClick={handleReverse} className=" bg-black rounded-md py-2 mb-1 px-2 text-white text-xs flex items-center gap-2"><FaFilter />Filtrer par ordre croissant</button> : <button onClick={handleFilterDsc} className=" bg-black rounded-md py-2 mb-1 px-2 text-white text-xs flex items-center gap-2"><FaFilter />Filtrer par ordre décroissant</button>}
        </div>

        <table className="w-full table-fixed">
          <thead>
            <tr className=" bg-black">
              <th className="w-1/3 px-3 py-4 text-left text-white text-xs font-semibold">Date d&apos;arrivée</th>
              <th className="w-1/3 px-3 py-4 text-left text-white text-xs font-semibold">Heure d&apos;arrivée</th>
              <th className="w-1/5 py-4 text-left text-white text-xs font-semibold">No d&apos;arrivée</th>
              <th className="w-1/5 py-4 text-left text-white text-xs font-semibold">No de ticket</th>
              <th className="w-1/4 py-4 text-left text-white text-xs font-semibold">Service</th>
              <th className="w-1/4 py-4 text-left text-white text-xs font-semibold">Point d&apos;appel</th>
              <th className="w-1/4 py-4 text-left text-white text-xs font-semibold">Heure d&apos;appel</th>
              <th className="w-1/3 py-4 text-left text-white text-xs font-semibold">Temps d&apos;attente</th>
              <th className="w-1/3 py-4 text-left text-white text-xs font-semibold">Temps de traitement</th>
              <th className="w-1/4 py-4 text-left text-white text-xs font-semibold">Ticket transféré</th>
              <th className="w-1/5 py-4 text-left text-white text-xs font-semibold">Ticket sauté</th>
            </tr>
          </thead>
          {
            seeAll ? filter === false ? <> {filterAsc === false ? result.appointmentList?.map((appointment) => (
              <tr key={appointment.id} className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600">
                <td className='text-xs py-2 px-3 font-semibold'>
                  {appointment.date}
                </td>
                <td className='text-xs py-2 px-3 font-semibold'>
                  {appointment.time}
                </td>
                <td className=' text-xs opacity-60'>
                  {appointment.num}
                </td>
                <td className=' text-xs opacity-60'>
                  {appointment.num}
                </td>
                <td className=' text-xs opacity-60'>
                  {appointment.Service.name}
                </td>
                <td className=' text-xs opacity-60'>
                  {appointment.Subservice.name}
                </td>
                <td className=' text-xs opacity-60'>
                  {appointment.callTime !== null ? appointment.callTime : <span className=" text-red-500">En attente...</span>}
                </td>
                <td className=' text-xs opacity-60'>
                  {format(appointment.waitingTime * 60 * 1000, 'HH:mm:ss')}
                </td>
                <td className=' text-xs opacity-60'>
                  {appointment.received ? <span className=" text-green-500">En traitement...</span> : format(appointment.processingTime * 60 * 1000, 'HH:mm:ss')}
                </td>
                <td className=' text-xs opacity-60'>
                  {appointment.transfered ? <p>Oui</p> : <p>Non</p>}
                </td>
                <td className=' text-xs opacity-60'>
                  {appointment.missing ? <p>Oui</p> : <p>Non</p>}
                </td>

              </tr>
            )) : filterAppointments.map((appointment) => (
              <tr key={appointment.id} className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600">
                <td className='text-xs py-2 px-3 font-semibold'>
                  {appointment.date}
                </td>
                <td className='text-xs py-2 px-3 font-semibold'>
                  {appointment.time}
                </td>
                <td className=' text-xs opacity-60'>
                  {appointment.num}
                </td>
                <td className=' text-xs opacity-60'>
                  {appointment.num}
                </td>
                <td className=' text-xs opacity-60'>
                  {appointment.Service.name}
                </td>
                <td className=' text-xs opacity-60'>
                  {appointment.Subservice.name}
                </td>
                <td className=' text-xs opacity-60'>
                  {appointment.callTime !== null ? appointment.callTime : filterOffice ? <span className=" text-red-500">En attente...</span> : <span className=" text-red-500">Non appelé</span>}
                </td>
                <td className=' text-xs opacity-60'>
                  {format(appointment.waitingTime * 60 * 1000, 'HH:mm:ss')}
                </td>
                <td className=' text-xs opacity-60'>
                  {appointment.received ? filterOffice ? <span className=" text-green-500">En traitement...</span> : <span className=" text-red-500">Non clôturé</span> : format(appointment.processingTime * 60 * 1000, 'HH:mm:ss')}
                </td>
                <td className=' text-xs opacity-60'>
                  {appointment.transfered ? <p>Oui</p> : <p>Non</p>}
                </td>
                <td className=' text-xs opacity-60'>
                  {appointment.missing ? <p>Oui</p> : <p>Non</p>}
                </td>

              </tr>
            ))}
              <tr className="bg-green-600 text-white">
                <td className='text-xs py-2 px-3 font-semibold'>
                  Total
                </td>
                <td className=' text-xs '>

                </td>
                <td className=' text-xs '>
                  {result.appointmentList.length}
                </td>
                <td className=' text-xs '>
                  {result.appointmentList.length}
                </td>
                <td className=' text-xs '>
                  {result.services}
                </td>
                <td className=' text-xs '>
                  {result.subServices}
                </td>
                <td className=' text-xs '>

                </td>
                <td className=' text-xs '>
                  {result.appointmentList?.length > 0 && format(result.meanWaitingTime * 60 * 1000, 'HH:mm:ss')}
                </td>
                <td className=' text-xs '>
                  {result.appointmentList?.length > 0 && format(result.meanServingTime * 60 * 1000, 'HH:mm:ss')}
                </td>
                <td className=' text-xs '>
                  {result.appointmentList.filter(element => element.transfered).length}
                </td>
                <td className=' text-xs '>
                  {result.appointmentList.filter(element => element.missing).length}
                </td>
              </tr>
            </>
              :
              <>
                {filterAsc === false ? filterStats.appointmentList?.map((appointment) => (
                  <tr key={appointment.id} className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600">
                    <td className='text-xs py-2 px-3 font-semibold'>
                      {appointment.date}
                    </td>
                    <td className='text-xs py-2 px-3 font-semibold'>
                      {appointment.time}
                    </td>
                    <td className=' text-xs opacity-60'>
                      {appointment.num}
                    </td>
                    <td className=' text-xs opacity-60'>
                      {appointment.num}
                    </td>
                    <td className=' text-xs opacity-60'>
                      {appointment.Service.name}
                    </td>
                    <td className=' text-xs opacity-60'>
                      {appointment.Subservice.name}
                    </td>
                    <td className=' text-xs opacity-60'>
                      {appointment.callTime !== null ? appointment.callTime : filterOffice ? <span className=" text-red-500">En attente...</span> : <span className=" text-red-500">Non appelé</span>}
                    </td>
                    <td className=' text-xs opacity-60'>
                      {format(appointment.waitingTime * 60 * 1000, 'HH:mm:ss')}
                    </td>
                    <td className=' text-xs opacity-60'>
                      {appointment.received ? filterOffice ? <span className=" text-green-500">En traitement...</span> : <span className=" text-red-500">Non clôturé</span> : format(appointment.processingTime * 60 * 1000, 'HH:mm:ss')}
                    </td>
                    <td className=' text-xs opacity-60'>
                      {appointment.transfered ? <p>Oui</p> : <p>Non</p>}
                    </td>
                    <td className=' text-xs opacity-60'>
                      {appointment.missing ? <p>Oui</p> : <p>Non</p>}
                    </td>

                  </tr>
                )) : filterAppointments.map((appointment) => (
                  <tr key={appointment.id} className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600">
                    <td className='text-xs py-2 px-3 font-semibold'>
                      {appointment.date}
                    </td>
                    <td className='text-xs py-2 px-3 font-semibold'>
                      {appointment.time}
                    </td>
                    <td className=' text-xs opacity-60'>
                      {appointment.num}
                    </td>
                    <td className=' text-xs opacity-60'>
                      {appointment.num}
                    </td>
                    <td className=' text-xs opacity-60'>
                      {appointment.Service.name}
                    </td>
                    <td className=' text-xs opacity-60'>
                      {appointment.Subservice.name}
                    </td>
                    <td className=' text-xs opacity-60'>
                      {appointment.callTime !== null ? appointment.callTime : filterOffice ? <span className=" text-red-500">En attente...</span> : <span className=" text-red-500">Non appelé</span>}
                    </td>
                    <td className=' text-xs opacity-60'>
                      {format(appointment.waitingTime * 60 * 1000, 'HH:mm:ss')}
                    </td>
                    <td className=' text-xs opacity-60'>
                      {appointment.received ? filterOffice ? <span className=" text-green-500">En traitement...</span> : <span className=" text-red-500">Non clôturé</span> : format(appointment.processingTime * 60 * 1000, 'HH:mm:ss')}
                    </td>
                    <td className=' text-xs opacity-60'>
                      {appointment.transfered ? <p>Oui</p> : <p>Non</p>}
                    </td>
                    <td className=' text-xs opacity-60'>
                      {appointment.missing ? <p>Oui</p> : <p>Non</p>}
                    </td>

                  </tr>
                ))}
                <tr className="bg-green-600 text-white">
                  <td className='text-xs py-2 px-3 font-semibold'>
                    Total
                  </td>
                  <td className=' text-xs '>

                  </td>
                  <td className=' text-xs '>
                    {filterStats.appointmentList.length}
                  </td>
                  <td className=' text-xs '>
                    {filterStats.appointmentList.length}
                  </td>
                  <td className=' text-xs '>
                    {filterStats.services}
                  </td>
                  <td className=' text-xs '>
                    {filterStats.subServices}
                  </td>
                  <td className=' text-xs '>

                  </td>
                  <td className=' text-xs '>
                    {filterStats.appointmentList?.length > 0 && format(filterStats.meanWaitingTime * 60 * 1000, 'HH:mm:ss')}
                  </td>
                  <td className=' text-xs '>
                    {filterStats.appointmentList?.length > 0 && format(filterStats.meanServingTime * 60 * 1000, 'HH:mm:ss')}
                  </td>
                  <td className=' text-xs '>
                    {filterStats.appointmentList.filter(element => element.transfered).length}
                  </td>
                  <td className=' text-xs '>
                    {filterStats.appointmentList.filter(element => element.missing).length}
                  </td>
                </tr>
              </> :
              filter === false ?
                <>
                  {filterAsc === false ? result.appointmentList?.map((appointment, index) => {
                    if (index < 16) {
                      return (
                        <tr key={appointment.id} className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600">
                          <td className='text-xs py-2 px-3 font-semibold'>
                            {appointment.date}
                          </td>
                          <td className='text-xs py-2 px-3 font-semibold'>
                            {appointment.time}
                          </td>
                          <td className=' text-xs opacity-60'>
                            {appointment.num}
                          </td>
                          <td className=' text-xs opacity-60'>
                            {appointment.num}
                          </td>
                          <td className=' text-xs opacity-60'>
                            {appointment.Service.name}
                          </td>
                          <td className=' text-xs opacity-60'>
                            {appointment.Subservice.name}
                          </td>
                          <td className=' text-xs opacity-60'>
                            {appointment.callTime !== null ? appointment.callTime : <span className=" text-red-500">En attente...</span>}
                          </td>
                          <td className=' text-xs opacity-60'>
                            {format(appointment.waitingTime * 60 * 1000, 'HH:mm:ss')}
                          </td>
                          <td className=' text-xs opacity-60'>
                            {appointment.received ? <span className=" text-green-500">En traitement...</span> : format(appointment.processingTime * 60 * 1000, 'HH:mm:ss')}
                          </td>
                          <td className=' text-xs opacity-60'>
                            {appointment.transfered ? <p>Oui</p> : <p>Non</p>}
                          </td>
                          <td className=' text-xs opacity-60'>
                            {appointment.missing ? <p>Oui</p> : <p>Non</p>}
                          </td>
                        </tr>
                      );
                    }
                  }) :
                    filterAppointments.map((appointment, index) => {
                      if (index < 16) {
                        return (
                          <tr key={appointment.id} className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600">
                            <td className='text-xs py-2 px-3 font-semibold'>
                              {appointment.date}
                            </td>
                            <td className='text-xs py-2 px-3 font-semibold'>
                              {appointment.time}
                            </td>
                            <td className=' text-xs opacity-60'>
                              {appointment.num}
                            </td>
                            <td className=' text-xs opacity-60'>
                              {appointment.num}
                            </td>
                            <td className=' text-xs opacity-60'>
                              {appointment.Service.name}
                            </td>
                            <td className=' text-xs opacity-60'>
                              {appointment.Subservice.name}
                            </td>
                            <td className=' text-xs opacity-60'>
                              {appointment.callTime !== null ? appointment.callTime : filterOffice ? <span className=" text-red-500">En attente...</span> : <span className=" text-red-500">Non appelé</span>}
                            </td>
                            <td className=' text-xs opacity-60'>
                              {format(appointment.waitingTime * 60 * 1000, 'HH:mm:ss')}
                            </td>
                            <td className=' text-xs opacity-60'>
                              {appointment.received ? filterOffice ? <span className=" text-green-500">En traitement...</span> : <span className=" text-red-500">Non clôturé</span> : format(appointment.processingTime * 60 * 1000, 'HH:mm:ss')}
                            </td>
                            <td className=' text-xs opacity-60'>
                              {appointment.transfered ? <p>Oui</p> : <p>Non</p>}
                            </td>
                            <td className=' text-xs opacity-60'>
                              {appointment.missing ? <p>Oui</p> : <p>Non</p>}
                            </td>
                          </tr>
                        );
                      }
                    })
                  }
                  <tr className="bg-green-600 text-white">
                    <td className='text-xs py-2 px-3 font-semibold'>
                      Total
                    </td>
                    <td className=' text-xs'>

                    </td>
                    <td className=' text-xs'>
                      {result.appointmentList.length}
                    </td>
                    <td className=' text-xs'>
                      {result.appointmentList.length}
                    </td>
                    <td className=' text-xs'>
                      {result.services}
                    </td>
                    <td className=' text-xs'>
                      {result.subServices}
                    </td>
                    <td className=' text-xs'>

                    </td>
                    <td className=' text-xs'>
                      {result.appointmentList?.length > 0 && format(result.meanWaitingTime * 60 * 1000, 'HH:mm:ss')}
                    </td>
                    <td className=' text-xs'>
                      {result.appointmentList?.length > 0 && format(result.meanServingTime * 60 * 1000, 'HH:mm:ss')}
                    </td>
                    <td className=' text-xs'>
                      {result.appointmentList.filter(element => element.transfered).length}
                    </td>
                    <td className=' text-xs'>
                      {result.appointmentList.filter(element => element.missing).length}
                    </td>
                  </tr>
                </> :
                <>
                  {filterAsc === false ? filterStats.appointmentList?.map((appointment, index) => {
                    if (index < 16) {
                      return (
                        <tr key={appointment.id} className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600">
                          <td className='text-xs py-2 px-3 font-semibold'>
                            {appointment.date}
                          </td>
                          <td className='text-xs py-2 px-3 font-semibold'>
                            {appointment.time}
                          </td>
                          <td className=' text-xs opacity-60'>
                            {appointment.num}
                          </td>
                          <td className=' text-xs opacity-60'>
                            {appointment.num}
                          </td>
                          <td className=' text-xs opacity-60'>
                            {appointment.Service.name}
                          </td>
                          <td className=' text-xs opacity-60'>
                            {appointment.Subservice.name}
                          </td>
                          <td className=' text-xs opacity-60'>
                            {appointment.callTime !== null ? appointment.callTime : filterOffice ? <span className=" text-red-500">En attente...</span> : <span className=" text-red-500">Non appelé</span>}
                          </td>
                          <td className=' text-xs opacity-60'>
                            {format(appointment.waitingTime * 60 * 1000, 'HH:mm:ss')}
                          </td>
                          <td className=' text-xs opacity-60'>
                            {appointment.received ? filterOffice ? <span className=" text-green-500">En traitement...</span> : <span className=" text-red-500">Non clôturé</span> : format(appointment.processingTime * 60 * 1000, 'HH:mm:ss')}
                          </td>
                          <td className=' text-xs opacity-60'>
                            {appointment.transfered ? <p>Oui</p> : <p>Non</p>}
                          </td>
                          <td className=' text-xs opacity-60'>
                            {appointment.missing ? <p>Oui</p> : <p>Non</p>}
                          </td>
                        </tr>
                      );
                    }
                  }) : filterAppointments.map((appointment, index) => {
                    if (index < 16) {
                      return (
                        <tr key={appointment.id} className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600">
                          <td className='text-xs py-2 px-3 font-semibold'>
                            {appointment.date}
                          </td>
                          <td className='text-xs py-2 px-3 font-semibold'>
                            {appointment.time}
                          </td>
                          <td className=' text-xs opacity-60'>
                            {appointment.num}
                          </td>
                          <td className=' text-xs opacity-60'>
                            {appointment.num}
                          </td>
                          <td className=' text-xs opacity-60'>
                            {appointment.Service.name}
                          </td>
                          <td className=' text-xs opacity-60'>
                            {appointment.Subservice.name}
                          </td>
                          <td className=' text-xs opacity-60'>
                            {appointment.callTime !== null ? appointment.callTime : <span>00.00.00</span>}
                          </td>
                          <td className=' text-xs opacity-60'>
                            {format(appointment.waitingTime * 60 * 1000, 'HH:mm:ss')}
                          </td>
                          <td className=' text-xs opacity-60'>
                            {appointment.received ? filterOffice ? <span className=" text-green-500">En traitement...</span> : <span className=" text-red-500">Non clôturé</span> : format(appointment.processingTime * 60 * 1000, 'HH:mm:ss')}
                          </td>
                          <td className=' text-xs opacity-60'>
                            {appointment.transfered ? <p>Oui</p> : <p>Non</p>}
                          </td>
                          <td className=' text-xs opacity-60'>
                            {appointment.missing ? <p>Oui</p> : <p>Non</p>}
                          </td>
                        </tr>
                      );
                    }
                  })}
                  <tr className="bg-green-600 text-white ">
                    <td className='text-xs py-2 px-3 font-semibold'>
                      Total
                    </td>
                    <td className=' text-xs'>

                    </td>
                    <td className=' text-xs'>
                      {filterStats.appointmentList.length}
                    </td>
                    <td className=' text-xs'>
                      {filterStats.appointmentList.length}
                    </td>
                    <td className=' text-xs'>
                      {filterStats.services}
                    </td>
                    <td className=' text-xs'>
                      {filterStats.subServices}
                    </td>
                    <td className=' text-xs'>

                    </td>
                    <td className=' text-xs'>
                      {filterStats.appointmentList?.length > 0 && format(filterStats.meanWaitingTime * 60 * 1000, 'HH:mm:ss')}
                    </td>
                    <td className=' text-xs'>
                      {filterStats.appointmentList?.length > 0 && format(filterStats.meanServingTime * 60 * 1000, 'HH:mm:ss')}
                    </td>
                    <td className=' text-xs'>
                      {filterStats.appointmentList.filter(element => element.transfered).length}
                    </td>
                    <td className=' text-xs'>
                      {filterStats.appointmentList.filter(element => element.missing).length}
                    </td>
                  </tr>
                </>
          }
        </table>
        {result.appointmentList.length > 15 || filterStats.appointmentList.length > 15 ? <button onClick={() => setSeeAll(!seeAll)} className=" mt-2 bg-black rounded-md py-1 mb-1 px-2 text-white text-xs flex items-center gap-2">
          {!seeAll ? <p>Voir plus</p> : <p>Voir moins</p>}
        </button>
          : null
        }
      </div>
      {
        showTotal && <div className=" mt-10">
          <h3 className=" font-bold my-4">Comparatif des agences</h3>
          <table className="w-full table-fixed">
            <thead>
              <tr className=" bg-black">
                <th className="w-1/2 px-3 py-4 text-left text-white text-xs font-semibold">Agence</th>
                <th className="w-1/5 py-4 text-left text-white text-xs font-semibold">Service</th>
                <th className="w-1/5 py-4 text-left text-white text-xs font-semibold">Point d&apos;appel</th>
                <th className="w-1/4 py-4 text-left text-white text-xs font-semibold">Nombre Tickets</th>
                <th className="w-1/4 py-4 text-left text-white text-xs font-semibold">Tickets Traités</th>
                <th className="w-1/3 py-4 text-left text-white text-xs font-semibold">Tickets En Attente</th>
                <th className="w-1/3 py-4 text-left text-white text-xs font-semibold">Tickets Transférés</th>
                <th className="w-1/4 py-4 text-left text-white text-xs font-semibold">Tickets Sautés</th>
                <th className="w-1/4 py-4 text-left text-white text-xs font-semibold">Attente Moyen</th>
                <th className="w-1/3 py-4 text-left text-white text-xs font-semibold">Ttraitement Moyen</th>
              </tr>
            </thead>
            {
              filterStats.totalByOffices?.map((appointment) => (
                <tr key={appointment.name} className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600">
                  <td className='text-xs py-2 px-1 font-semibold'>
                    {appointment.name}
                  </td>
                  <td className='text-xs opacity-60'>
                    {appointment.services}
                  </td>
                  <td className=' text-xs opacity-60'>
                    {appointment.subservices}
                  </td>
                  <td className=' text-xs opacity-60'>
                    {appointment.receives}
                  </td>
                  <td className=' text-xs opacity-60'>
                    {appointment.serves}
                  </td>
                  <td className=' text-xs opacity-60'>
                    {appointment.waitings}
                  </td>
                  <td className=' text-xs opacity-60'>
                    {appointment.transfers}
                  </td>
                  <td className=' text-xs opacity-60'>
                    {appointment.missing}
                  </td>
                  <td className=' text-xs opacity-60'>
                    {format(appointment.meanWaitingTime * 60 * 1000, 'HH:mm:ss')}
                  </td>
                  <td className=' text-xs opacity-60'>
                    {format(appointment.meanServingTime * 60 * 1000, 'HH:mm:ss')}
                  </td>
                </tr>
              ))}
          </table>
        </div>
      }

      <Modal
        open={openTime}
        onClose={handleCloseTime}
        aria-labelledby="simple-modal-title"
        aria-describedby="simple-modal-description"
      >
        <div className=' w-1/4 bg-white p-4  rounded-lg mx-auto my-12'>
          <p className=' text-sm font-semibold py-2'>Temps</p>
          <div style={{ width: 300, margin: 'auto' }}>
            <p className=' text-xs font-medium'>Choisissez un temps</p>
            <Slider
              value={value}
              onChange={handleChange}
              aria-labelledby="discrete-slider"
              valueLabelDisplay="auto"
              step={1}
              marks
              min={1}
              max={180}
              className=' text-black'
            />
            <p className=' text-xs'>{value} minutes</p>

          </div>
          <div className=' py-4 flex items-center justify-center gap-3'>
            <button className=' w-full bg-black hover:bg-green-500 text-white text-sm font-semibold py-2 px-3 rounded-md' onClick={submitTime}>Soumettre</button>
          </div>
        </div>
      </Modal>
      <Modal
        open={openEditTime}
        onClose={handleCloseEditTime}
        aria-labelledby="simple-modal-title"
        aria-describedby="simple-modal-description"
      >
        <div className=' w-1/4 bg-white p-4  rounded-lg mx-auto my-12'>
          <p className=' text-sm font-semibold py-2'>Modifier Temps</p>
          <div style={{ width: 300, margin: 'auto' }}>
            <p className=' text-xs font-medium'>Choisissez un temps</p>
            <Slider
              value={value}
              onChange={handleChange}
              aria-labelledby="discrete-slider"
              valueLabelDisplay="auto"
              step={1}
              marks
              min={1}
              max={180}
              className=' text-black'
            />
            <p className=' text-xs'>{value} minutes</p>

          </div>
          <div className=' py-4 flex items-center justify-center gap-3'>
            <button className=' w-full bg-black hover:bg-green-500 text-white text-sm font-semibold py-2 px-3 rounded-md' onClick={updateTime}>Soumettre</button>
          </div>
        </div>
      </Modal>
    </div>
  )
}

export default Home;
"use client";

import Loader from "@/components/common/Loader";
import useAxiosAuth from "@/hooks/useAxiosAuth";
import { Office } from "@/types/office";
import { format } from "date-fns";
import { fr } from "date-fns/locale/fr";
import { useEffect, useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import toast from "react-hot-toast";
import useSWR from "swr";
import * as FileSaver from "file-saver";
import XLSX from "sheetjs-style";
import { RiFileExcel2Fill } from "react-icons/ri";
import { FiSearch } from "react-icons/fi";
import { AiOutlineWarning } from "react-icons/ai";
import { IoCloseSharp } from "react-icons/io5";
import { BsTicketPerforated } from "react-icons/bs";
import useChangeHeaderTitle from "../../hooks/useChangedHeader";

/** Convertit des minutes décimales en HH:MM:SS. */
const formatMinutes = (minutes: number): string => {
    const safe = Number.isFinite(minutes) ? Math.max(0, minutes) : 0;
    const hours = Math.floor(safe / 60);
    const mins = Math.floor(safe % 60);
    const secs = Math.floor((safe * 60) % 60);
    return `${String(hours).padStart(2, "0")}:${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
};

/** Rend une valeur du formulaire lisible (les cases à cocher arrivent en booléen). */
const displayValue = (value: unknown): string => {
    if (value === null || value === undefined || value === "") return "Non renseigné";
    if (typeof value === "boolean") return value ? "Oui" : "Non";
    return String(value);
};

/** Statut du ticket, dérivé des drapeaux remontés par l'agence. */
const ticketStatus = (ticket: TicketSearchResult) => {
    if (ticket.missing) return { label: "Absent", className: "bg-red-100 text-red-700" };
    // Clôturé par la fermeture : le conseiller n'a jamais terminé le ticket,
    // l'afficher comme « Traité » laisserait croire à un traitement mené à son terme.
    if (ticket.autoClosed) return { label: "Non clôturé", className: "bg-orange-100 text-orange-700" };
    if (ticket.serve) return { label: "Traité", className: "bg-green-100 text-green-700" };
    if (ticket.received) return { label: "En cours", className: "bg-blue-100 text-blue-700" };
    return { label: "En attente", className: "bg-amber-100 text-amber-700" };
};

const Tickets = () => {
    const axiosAuth = useAxiosAuth();
    const useChangeTitle = useChangeHeaderTitle();

    const [query, setQuery] = useState("");
    const [officeId, setOfficeId] = useState<number>(0);
    const [startDate, setStartDate] = useState<Date | null>(null);
    const [endDate, setEndDate] = useState<Date | null>(null);
    const [results, setResults] = useState<TicketSearchResult[] | null>(null);
    const [loading, setLoading] = useState(false);
    const [selected, setSelected] = useState<TicketSearchResult | null>(null);

    const { data: offices } = useSWR("/office", () =>
        axiosAuth.get<Office[]>("/office").then((res) => res.data)
    );

    useEffect(() => {
        useChangeTitle.onChanged("Recherche de tickets");
    }, []);

    const handleSearch = async (event?: React.FormEvent) => {
        event?.preventDefault();

        const term = query.trim();
        if (term.length === 0) {
            toast.error("Saisissez un identifiant, un numéro ou une information client", {
                duration: 3000,
                className: " text-xs"
            });
            return;
        }

        setLoading(true);
        try {
            const payload: Record<string, unknown> = { query: term };
            if (officeId !== 0) payload.officeId = officeId;
            // La plage n'est transmise que complète : une borne seule filtrerait
            // silencieusement une moitié des résultats.
            if (startDate && endDate) {
                payload.start = format(startDate, "yyyy-MM-dd");
                payload.end = format(endDate, "yyyy-MM-dd");
            }

            const res = await axiosAuth.post<TicketSearchResult[]>("/appointment/search", payload);
            setResults(res.data);

            if (res.data.length === 0) {
                toast("Aucun ticket ne correspond à cette recherche", {
                    duration: 3000,
                    className: " text-xs"
                });
            }
        } catch (error) {
            toast.error("Une erreur est survenue, réessayer!", {
                duration: 3000,
                className: " text-xs"
            });
        } finally {
            setLoading(false);
        }
    };

    const resetFilters = () => {
        setQuery("");
        setOfficeId(0);
        setStartDate(null);
        setEndDate(null);
        setResults(null);
    };

    /**
     * Export Excel des résultats.
     * Les colonnes du formulaire sont l'union des libellés rencontrés : deux
     * services peuvent demander des informations différentes.
     */
    const exportToExcel = () => {
        if (!results || results.length === 0) return;

        const infoColumns: string[] = [];
        results.forEach((ticket) => {
            Object.keys(ticket.infoValues || {}).forEach((key) => {
                const label = ticket.infoLabels?.[key] ?? key;
                if (!infoColumns.includes(label)) infoColumns.push(label);
            });
        });

        // Les champs de clôture sont préfixés : un service peut demander
        // « Commentaire » au client et au conseiller sans que les deux
        // colonnes se confondent dans le tableur.
        const closingColumns: string[] = [];
        results.forEach((ticket) => {
            Object.keys(ticket.closingValues || {}).forEach((key) => {
                const label = ticket.closingLabels?.[key] ?? key;
                if (!closingColumns.includes(label)) closingColumns.push(label);
            });
        });

        const rows = results.map((ticket) => {
            const row: Record<string, unknown> = {
                "Identifiant": ticket.ticketRef ?? "",
                "Ticket": `${ticket.prefix ?? ""}${ticket.num}`,
                "Agence": ticket.officeName ?? "",
                "Service": ticket.serviceName ?? "",
                "Guichet / caisse": ticket.subserviceName ?? "",
                "Date": ticket.date,
                "Heure d'émission": ticket.time,
                "Heure d'appel": ticket.callTime ?? "",
                "Heure de fin": ticket.endTime ?? "",
                "Fin relevée": ticket.autoClosed ? "Non (fermeture 19h)" : "Oui",
                "Attente": formatMinutes(ticket.waitingTime),
                "Traitement": formatMinutes(ticket.processingTime),
                "Statut": ticketStatus(ticket).label,
                // Horodatage serveur, non modifiable : c'est la référence du délai.
                "Horodatage": ticket.createdAt
            };

            infoColumns.forEach((label) => {
                const key = Object.keys(ticket.infoValues || {}).find(
                    (candidate) => (ticket.infoLabels?.[candidate] ?? candidate) === label
                );
                row[label] = key ? displayValue(ticket.infoValues[key]) : "";
            });

            closingColumns.forEach((label) => {
                const key = Object.keys(ticket.closingValues || {}).find(
                    (candidate) => (ticket.closingLabels?.[candidate] ?? candidate) === label
                );
                row[`Clôture — ${label}`] = key
                    ? displayValue(ticket.closingValues[key])
                    : "";
            });

            return row;
        });

        const worksheet = XLSX.utils.json_to_sheet(rows);
        worksheet["!cols"] = Object.keys(rows[0]).map(() => ({ wch: 22 }));

        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Tickets");

        const buffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
        const blob = new Blob([buffer], {
            type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        });
        FileSaver.saveAs(blob, `tickets_${new Date().toISOString().split("T")[0]}.xlsx`);
    };

    if (loading) {
        return <Loader />;
    }

    return (
        <div className="h-screen bg-gray-200 w-full overflow-y-scroll rounded-t-xl px-4 py-3">
            {/* Barre de recherche */}
            <form onSubmit={handleSearch} className="bg-white rounded-lg shadow-sm border border-gray-100 p-4">
                <div className="flex flex-wrap items-center gap-3">
                    <div className="flex items-center gap-2 flex-1 min-w-[260px] border border-gray-300 rounded-md px-3 py-2">
                        <FiSearch className="text-gray-400" />
                        <input
                            value={query}
                            onChange={(event) => setQuery(event.target.value)}
                            placeholder="Identifiant du ticket, numéro, nom, n° de compte…"
                            className="flex-1 text-xs focus:outline-none"
                        />
                    </div>

                    <select
                        value={officeId}
                        onChange={(event) => setOfficeId(Number(event.target.value))}
                        className="border border-gray-300 rounded-md px-3 py-2 text-xs focus:outline-none"
                    >
                        <option value={0}>Toutes les agences</option>
                        {offices?.map((office) => (
                            <option key={office.id} value={office.id}>
                                {office.location || office.name}
                            </option>
                        ))}
                    </select>

                    <div className="border border-gray-300 rounded-md px-3 py-2 text-xs">
                        <DatePicker
                            locale={fr}
                            selected={startDate}
                            onChange={(dates) => {
                                const [start, end] = dates as [Date | null, Date | null];
                                setStartDate(start);
                                setEndDate(end);
                            }}
                            startDate={startDate}
                            endDate={endDate}
                            selectsRange
                            isClearable
                            dateFormat="dd/MM/yyyy"
                            placeholderText="Période (optionnelle)"
                            className="focus:outline-none w-44"
                        />
                    </div>

                    <button
                        type="submit"
                        className="bg-black text-white text-xs font-semibold rounded-md px-4 py-2 hover:bg-green-500"
                    >
                        Rechercher
                    </button>

                    {results !== null && (
                        <button
                            type="button"
                            onClick={resetFilters}
                            className="text-xs text-gray-500 underline hover:text-gray-800"
                        >
                            Réinitialiser
                        </button>
                    )}
                </div>
                <p className="text-[11px] text-gray-400 mt-2">
                    La recherche porte sur l&apos;identifiant unique du ticket, sur les informations
                    saisies par le client sur la borne, et sur le numéro de ticket.
                </p>
            </form>

            {/* Résultats */}
            {results !== null && results.length > 0 && (
                <div className="flex flex-col my-3">
                    <div className="bg-gradient-to-r from-gray-800 to-gray-900 text-white py-3 px-4 rounded-t-lg flex items-center justify-between">
                        <h2 className="text-sm font-semibold">
                            {results.length} ticket{results.length > 1 ? "s" : ""} trouvé
                            {results.length > 1 ? "s" : ""}
                        </h2>
                        <button
                            onClick={exportToExcel}
                            className="bg-green-700 rounded-md py-2 px-3 text-white text-xs flex items-center gap-2 hover:bg-green-600"
                        >
                            <RiFileExcel2Fill />
                            Exporter
                        </button>
                    </div>
                    <div className="bg-white rounded-b-lg shadow-sm border border-gray-100 overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="bg-black">
                                    <th className="px-3 py-3 text-left text-white text-xs font-semibold">Identifiant</th>
                                    <th className="px-3 py-3 text-left text-white text-xs font-semibold">Ticket</th>
                                    <th className="px-3 py-3 text-left text-white text-xs font-semibold">Agence</th>
                                    <th className="px-3 py-3 text-left text-white text-xs font-semibold">Service</th>
                                    <th className="px-3 py-3 text-left text-white text-xs font-semibold">Date</th>
                                    <th className="px-3 py-3 text-left text-white text-xs font-semibold">Attente</th>
                                    <th className="px-3 py-3 text-left text-white text-xs font-semibold">Statut</th>
                                    <th className="px-3 py-3 text-left text-white text-xs font-semibold"></th>
                                </tr>
                            </thead>
                            <tbody>
                                {results.map((ticket) => {
                                    const status = ticketStatus(ticket);
                                    return (
                                        <tr key={ticket.id} className="bg-white border-b hover:bg-gray-50">
                                            <td className="px-3 py-2 text-xs font-bold tracking-widest">
                                                {ticket.ticketRef ?? "—"}
                                            </td>
                                            <td className="px-3 py-2 text-xs font-semibold">
                                                {ticket.prefix}
                                                {ticket.num}
                                            </td>
                                            <td className="px-3 py-2 text-xs opacity-70">{ticket.officeName}</td>
                                            <td className="px-3 py-2 text-xs opacity-70">{ticket.serviceName}</td>
                                            <td className="px-3 py-2 text-xs opacity-70">
                                                {ticket.date} à {ticket.time}
                                            </td>
                                            <td className="px-3 py-2 text-xs opacity-70">
                                                {formatMinutes(ticket.waitingTime)}
                                            </td>
                                            <td className="px-3 py-2">
                                                <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${status.className}`}>
                                                    {status.label}
                                                </span>
                                            </td>
                                            <td className="px-3 py-2">
                                                <button
                                                    onClick={() => setSelected(ticket)}
                                                    className="text-xs font-semibold text-gray-700 border border-gray-300 rounded-md px-3 py-1 hover:bg-gray-100"
                                                >
                                                    Détail
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Aucun résultat */}
            {results !== null && results.length === 0 && (
                <div className="w-full mt-16 text-center">
                    <div className="bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200 rounded-xl p-8 shadow-sm">
                        <div className="flex justify-center mb-4">
                            <div className="bg-amber-100 p-3 rounded-full">
                                <AiOutlineWarning className="w-8 h-8 text-amber-600" />
                            </div>
                        </div>
                        <h3 className="text-xl font-semibold text-gray-900 mb-3">Aucun résultat</h3>
                        <p className="text-gray-600 leading-relaxed">
                            Vérifiez l&apos;identifiant saisi, ou élargissez la période et l&apos;agence.
                        </p>
                    </div>
                </div>
            )}

            {/* État initial */}
            {results === null && (
                <div className="w-full mt-16 text-center">
                    <div className="bg-white border border-gray-200 rounded-xl p-8 shadow-sm">
                        <div className="flex justify-center mb-4">
                            <div className="bg-gray-100 p-3 rounded-full">
                                <BsTicketPerforated className="w-8 h-8 text-gray-500" />
                            </div>
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">
                            Rechercher un ticket
                        </h3>
                        <p className="text-gray-500 text-sm">
                            Saisissez l&apos;identifiant figurant sur le ticket pour retrouver le
                            dossier et son horodatage.
                        </p>
                    </div>
                </div>
            )}

            {/* Fiche détaillée */}
            {selected && (
                <div
                    className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
                    onClick={() => setSelected(null)}
                >
                    <div
                        className="bg-white rounded-xl shadow-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto"
                        onClick={(event) => event.stopPropagation()}
                    >
                        <div className="bg-gradient-to-r from-gray-800 to-gray-900 text-white py-3 px-5 rounded-t-xl flex items-center justify-between">
                            <h2 className="text-sm font-semibold">Détail du ticket</h2>
                            <button onClick={() => setSelected(null)} className="text-white">
                                <IoCloseSharp size={20} />
                            </button>
                        </div>

                        <div className="p-5">
                            {selected.ticketRef && (
                                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-4 text-center">
                                    <p className="text-xs text-gray-500 mb-1">Identifiant unique</p>
                                    <p className="text-2xl font-bold tracking-[0.3em]">{selected.ticketRef}</p>
                                </div>
                            )}

                            <div className="grid grid-cols-2 gap-3 mb-4">
                                {[
                                    ["Numéro ticket", `${selected.prefix}${selected.num}`],
                                    ["Agence", selected.officeName],
                                    ["Service", selected.serviceName],
                                    // Renseigné à l'appel : vide pour un ticket encore en attente.
                                    ["Guichet / caisse", selected.subserviceName || "Non traité"],
                                    ["Statut", ticketStatus(selected).label],
                                    ["Date", selected.date],
                                    ["Heure d'émission", selected.time],
                                    ["Heure d'appel", selected.callTime ?? "Non appelé"],
                                    // Posée à la clôture : vide pour un ticket encore au guichet.
                                    [
                                        "Heure de fin de traitement",
                                        selected.endTime
                                            ? selected.autoClosed
                                                ? `${selected.endTime} (fermeture)`
                                                : selected.endTime
                                            : "Non clôturé"
                                    ],
                                    ["Temps d'attente", formatMinutes(selected.waitingTime)],
                                    ["Temps de traitement", formatMinutes(selected.processingTime)]
                                ].map(([label, value]) => (
                                    <div key={label} className="border border-gray-100 rounded-md p-2">
                                        <p className="text-[11px] text-gray-400">{label}</p>
                                        <p className="text-xs font-semibold text-gray-800">{value}</p>
                                    </div>
                                ))}
                            </div>

                            <h3 className="text-xs font-semibold text-gray-700 mb-2">
                                Informations saisies par le client
                            </h3>
                            {Object.keys(selected.infoValues || {}).length === 0 ? (
                                <p className="text-xs text-gray-400 italic">
                                    Aucune information n&apos;a été demandée pour ce service.
                                </p>
                            ) : (
                                <div className="border border-gray-100 rounded-md divide-y">
                                    {Object.keys(selected.infoValues).map((key) => (
                                        <div key={key} className="flex justify-between px-3 py-2">
                                            <span className="text-xs text-gray-500">
                                                {selected.infoLabels?.[key] ?? key}
                                            </span>
                                            <span className="text-xs font-semibold text-gray-800 text-right">
                                                {displayValue(selected.infoValues[key])}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* Saisie du conseiller à la clôture. Absente tant que
                                le ticket n'est pas clôturé, ou si le service
                                n'impose pas de formulaire de clôture. */}
                            {Object.keys(selected.closingValues || {}).length > 0 && (
                                <>
                                    <h3 className="text-xs font-semibold text-gray-700 mt-4 mb-2">
                                        Informations saisies par le conseiller à la clôture
                                    </h3>
                                    <div className="border border-gray-100 rounded-md divide-y">
                                        {Object.keys(selected.closingValues).map((key) => (
                                            <div key={key} className="flex justify-between px-3 py-2">
                                                <span className="text-xs text-gray-500">
                                                    {selected.closingLabels?.[key] ?? key}
                                                </span>
                                                <span className="text-xs font-semibold text-gray-800 text-right">
                                                    {displayValue(selected.closingValues[key])}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Tickets;

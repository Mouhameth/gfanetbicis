"use client";

/**
 * Comparaison des délais avec la période précédente, écart aux cibles,
 * Top 5 et Flop 5 des agences.
 *
 * Les données viennent d'un seul appel (`useDelayComparison`), partagé par :
 *  - `DelayTrend` : les lignes de comparaison sous les cases de la barre de
 *    chiffres de /home ;
 *  - `AgencyRanking` (export par défaut) : le Top 5 / Flop 5.
 *
 * La période suit les filtres du tableau de bord ; l'API calcule elle-même la
 * période précédente (J-1, S-1, M-1, A-1).
 */

import useSWR from "swr";
import useAxiosAuth from "@/hooks/useAxiosAuth";
import { IoTrendingDown, IoTrendingUp } from "react-icons/io5";
import { FaMedal, FaTrophy } from "react-icons/fa";
import { AiOutlineWarning } from "react-icons/ai";

export type ComparePeriod = { date: string } | { start: string; end: string };

type OfficeDelay = {
    name: string;
    receives: number;
    meanWaitingTime: number;
    meanServingTime: number;
};

type Means = { meanWaitingTime: number; meanServingTime: number; appointments: number };

export type CompareResult = {
    current: Means;
    previous: Means;
    previousLabel: string;
    targets: { meanWaitingTime: number | null; meanServingTime: number | null };
    offices: OfficeDelay[];
} | null;

/** Un seul appel par période, partagé par la barre de chiffres et le classement. */
export const useDelayComparison = (period: ComparePeriod) => {
    const axiosAuth = useAxiosAuth();
    const url = "/appointment/stats/compare";
    return useSWR<CompareResult>(
        [url, JSON.stringify(period)],
        () => axiosAuth.post<CompareResult>(url, JSON.stringify(period)).then((res) => res.data)
    );
};

/** Minutes → HH:mm:ss */
const formatTime = (minutes: number): string => {
    const total = Math.round(minutes * 60);
    const h = Math.floor(total / 3600);
    const m = Math.floor((total % 3600) / 60);
    const s = total % 60;
    return [h, m, s].map((v) => String(v).padStart(2, "0")).join(":");
};

/** Écart en minutes → « +8 min », « -12 s ». */
const formatDiff = (minutes: number): string => {
    const sign = minutes > 0 ? "+" : minutes < 0 ? "-" : "";
    const abs = Math.abs(minutes);
    return abs < 1 ? `${sign}${Math.round(abs * 60)} s` : `${sign}${Math.round(abs)} min`;
};

const TEXT = "text-[7px] lg:text-[8px] xl:text-[9px] leading-tight whitespace-nowrap";

/** Hausse = rouge (délai plus long), baisse = vert. */
const DiffLine = ({ diff, text, title }: { diff: number; text: string; title?: string }) => {
    const up = diff > 0;
    const color = diff === 0 ? "text-gray-500" : up ? "text-red-500" : "text-green-500";
    const Icon = up ? IoTrendingUp : IoTrendingDown;
    return (
        <p className={`flex items-center gap-0.5 ${TEXT}`} title={title}>
            {diff !== 0 && <Icon className={`${color} shrink-0`} />}
            <span className={`${color} font-semibold`}>{formatDiff(diff)}</span>
            <span className="opacity-60">{text}</span>
        </p>
    );
};

type DelayTrendProps = {
    /** Délai affiché dans la case, en minutes. */
    value: number;
    /** Délai de la même case sur la période précédente. */
    previous: number | undefined;
    previousLabel: string | undefined;
    /** Cible en minutes, null si non définie. */
    target: number | null | undefined;
};

/** Lignes « vs J-1 » et « vs cible » sous une case de la barre de chiffres. */
export const DelayTrend = ({ value, previous, previousLabel, target }: DelayTrendProps) => {
    if (previousLabel === undefined) return null; // comparaison pas encore chargée
    return (
        <div className="mt-0.5">
            {previous
                ? <DiffLine diff={value - previous} text={`vs ${previousLabel}`} title={`${formatTime(previous)} en ${previousLabel}`} />
                : <p className={`${TEXT} opacity-40`}>Pas de données {previousLabel}</p>}
            {target !== null && target !== undefined &&
                <DiffLine diff={value - target} text={`vs cible ${target} min`} />}
        </div>
    );
};

/** Ligne « vs J-1 » sous la case Total : évolution en %. Couleur neutre,
 *  plus de tickets n'étant ni bon ni mauvais en soi. */
export const CountTrend = ({ value, previous, previousLabel }: {
    value: number;
    previous: number | undefined;
    previousLabel: string | undefined;
}) => {
    if (previousLabel === undefined) return null;
    if (!previous) return <p className={`${TEXT} opacity-40 mt-0.5`}>Pas de données {previousLabel}</p>;
    const diff = value - previous;
    const percent = Math.round((diff / previous) * 100);
    const Icon = diff > 0 ? IoTrendingUp : IoTrendingDown;
    return (
        <p className={`flex items-center gap-0.5 mt-0.5 ${TEXT}`} title={`${previous.toLocaleString("fr-FR")} tickets en ${previousLabel}`}>
            {percent !== 0 && <Icon className="text-blue-500 shrink-0" />}
            <span className="text-blue-500 font-semibold">{percent > 0 ? "+" : ""}{percent}%</span>
            <span className="opacity-60">vs {previousLabel}</span>
        </p>
    );
};

type Ranking = { title: string; rows: { name: string; value: number }[] };

/** Or, argent, bronze pour les 3 premiers du Top. */
const MEDALS = ["text-yellow-400", "text-gray-400", "text-amber-700"];

/** Rang : médaille (Top 1-3), pastille rouge (Flop) ou pastille grise. */
const RankBadge = ({ index, kind }: { index: number; kind: "top" | "flop" }) => {
    if (kind === "top" && index < 3) {
        return <FaMedal className={`${MEDALS[index]} w-4 shrink-0`} title={`${index + 1}e`} />;
    }
    const color = kind === "flop" ? "bg-red-500 bg-opacity-10 text-red-500" : "bg-gray-100 text-gray-500";
    return (
        <span className={`w-4 h-4 rounded-full ${color} text-[9px] font-semibold flex items-center justify-center shrink-0`}>
            {index + 1}
        </span>
    );
};

const RankingTable = ({ title, kind, rankings }: { title: string; kind: "top" | "flop"; rankings: Ranking[] }) => (
    <div className="flex flex-col rounded-lg border border-gray-200 overflow-hidden shadow-sm">
        <div className={`bg-gray-800 px-3 py-2 border-l-4 ${kind === "top" ? "border-green-500" : "border-red-500"} flex items-center gap-2`}>
            {kind === "top"
                ? <FaTrophy className="text-yellow-400" />
                : <AiOutlineWarning className="text-red-400" />}
            <p className="text-white text-xs font-semibold">{title}</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-gray-100 bg-white">
            {rankings.map((ranking) => (
                <div key={ranking.title} className="p-2">
                    <p className="text-[11px] font-semibold text-gray-700 mb-1">{ranking.title}</p>
                    {ranking.rows.length === 0
                        ? <p className="text-[10px] text-gray-400">Aucune donnée</p>
                        : ranking.rows.map((row, index) => (
                            <div key={row.name} className="flex items-center justify-between gap-2 py-0.5 text-[11px]">
                                <span className="flex items-center gap-2 min-w-0">
                                    <RankBadge index={index} kind={kind} />
                                    <span className="text-gray-700 truncate" title={row.name}>{row.name}</span>
                                </span>
                                <span className="font-semibold text-gray-800 shrink-0">{formatTime(row.value)}</span>
                            </div>
                        ))}
                </div>
            ))}
        </div>
    </div>
);

type Props = {
    data: CompareResult | undefined;
    isLoading: boolean;
    /** Seuil de tickets du filtre « focus agences » (0 = toutes). */
    ticketThreshold: number;
};

const AgencyRanking = ({ data, isLoading, ticketThreshold }: Props) => {
    if (isLoading) {
        return <p className="text-center text-xs text-gray-500 py-6">Chargement…</p>;
    }
    if (!data) return null;

    // Mêmes agences que le graphe suivant : celles qui atteignent le seuil de tickets.
    const offices = data.offices.filter((o) => o.receives > 0 && o.receives >= ticketThreshold);
    const rank = (value: (o: OfficeDelay) => number, order: "asc" | "desc", keep = (o: OfficeDelay) => true) =>
        offices
            .filter(keep)
            .map((o) => ({ name: o.name, value: value(o) }))
            .sort((a, b) => (order === "asc" ? a.value - b.value : b.value - a.value))
            .slice(0, 5);

    const client = (o: OfficeDelay) => o.meanWaitingTime + o.meanServingTime;
    const waiting = (o: OfficeDelay) => o.meanWaitingTime;
    const serving = (o: OfficeDelay) => o.meanServingTime;
    // Une agence sans traitement mesuré afficherait 00:00:00 et serait « meilleure » à tort.
    const hasServing = (o: OfficeDelay) => o.meanServingTime > 0;

    const rankings = (order: "asc" | "desc"): Ranking[] => [
        { title: "Délai client", rows: rank(client, order) },
        { title: "Délai d'attente", rows: rank(waiting, order) },
        { title: "Délai de traitement", rows: rank(serving, order, hasServing) }
    ];

    return (
        <div className="flex flex-col my-3">
            <div className="bg-gradient-to-r from-gray-800 to-gray-900 text-white py-3 px-4 rounded-t-lg">
                <h2 className="text-sm font-semibold text-center">Top 5 et Flop 5 des agences</h2>
            </div>
            <div className="bg-white rounded-b-lg shadow-sm border border-gray-100 p-4 grid grid-cols-1 xl:grid-cols-2 gap-3">
                <RankingTable title="Top 5 agences" kind="top" rankings={rankings("asc")} />
                <RankingTable title="Flop 5 agences" kind="flop" rankings={rankings("desc")} />
            </div>
        </div>
    );
};

export default AgencyRanking;

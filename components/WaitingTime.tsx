import { useState, useEffect } from 'react';

interface WaitingTimeProps {
  startTime: string; // Format "HH:mm:ss"
}

export const WaitingTime = ({ startTime }: WaitingTimeProps) => {
  const [elapsed, setElapsed] = useState('');

  useEffect(() => {
    const calculateTime = () => {
      // 1. Créer une date avec l'heure de début
      const now = new Date();
      const [hours, minutes, seconds] = startTime.split(':').map(Number);
      
      const startDate = new Date();
      startDate.setHours(hours, minutes, seconds, 0);

      // Si le ticket a été pris "hier" (ex: il est 01:00 et le ticket date de 23:00)
      if (startDate > now) {
          startDate.setDate(startDate.getDate() - 1);
      }

      // 2. Calculer la différence en millisecondes
      const diffInMs = now.getTime() - startDate.getTime();
      
      // 3. Formater en HH:mm:ss
      const h = Math.floor(diffInMs / 3600000);
      const m = Math.floor((diffInMs % 3600000) / 60000);
      const s = Math.floor((diffInMs % 60000) / 1000);

      const display = [
        h.toString().padStart(2, '0'),
        m.toString().padStart(2, '0'),
        s.toString().padStart(2, '0')
      ].join(':');

      setElapsed(display);
    };

    // Lancer immédiatement et puis toutes les secondes
    calculateTime();
    const timer = setInterval(calculateTime, 1000);

    return () => clearInterval(timer); // Nettoyage
  }, [startTime]);

  return <span>{elapsed}</span>;
};
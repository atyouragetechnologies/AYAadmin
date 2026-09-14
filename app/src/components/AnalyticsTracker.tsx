import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import ReactGA from 'react-ga4';
import { getSession } from '../utils/session';
import { supabase } from '../utils/supabase';
import { logJourneyEvent } from '../utils/feedbackUtils';

export const AnalyticsTracker = () => {
    const location = useLocation();
    const lastHeartbeat = useRef<number>(Date.now());

    useEffect(() => {
        ReactGA.send({ hitType: "pageview", page: location.pathname + location.search });
    }, [location]);

    // Active session heartbeat: log engagement time every 60s
    useEffect(() => {
        const interval = setInterval(() => {
            try {
                const session = getSession();
                if (session.userId) {
                    const now = Date.now();
                    const elapsedSeconds = Math.round((now - lastHeartbeat.current) / 1000);
                    lastHeartbeat.current = now;

                    if (elapsedSeconds >= 30 && elapsedSeconds <= 300) {
                        const today = new Date().toISOString().split('T')[0];
                        supabase.from('users').update({ 
                            last_active_date: today,
                            updated_at: new Date().toISOString()
                        }).eq('id', session.userId).catch(() => {});

                        logJourneyEvent(session.userId, 'app_session', 'session_heartbeat', {
                            duration_seconds: elapsedSeconds,
                            path: window.location.pathname
                        });
                    }
                }
            } catch {}
        }, 60000);

        return () => clearInterval(interval);
    }, []);

    return null;
};


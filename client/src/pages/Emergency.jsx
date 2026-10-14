import { useState, useEffect, useCallback } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from '../context/AuthContext';
import {
  AlertCircle,
  Phone,
  Shield,
  CheckCircle2,
  Radio,
  MapPin,
  Clock,
  User,
  Wifi,
  WifiOff,
} from 'lucide-react';

export default function Emergency() {
  const { token, user } = useAuth();
  const [socket, setSocket] = useState(null);
  const [connected, setConnected] = useState(false);
  const [sosActive, setSosActive] = useState(false);
  const [sosId, setSosId] = useState(null);
  const [sosStatus, setSosStatus] = useState('');
  const [statusMessage, setStatusMessage] = useState('');
  const [activeAlerts, setActiveAlerts] = useState([]);
  const [gettingLocation, setGettingLocation] = useState(false);

  const isStaff = user?.role === 'doctor' || user?.role === 'admin';

  useEffect(() => {
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
    const newSocket = io(`${apiUrl}/emergency`, {
      auth: { token },
      transports: ['websocket', 'polling'],
    });

    newSocket.on('connect', () => {
      setConnected(true);
      newSocket.emit('sos:get-active');
    });

    newSocket.on('disconnect', () => {
      setConnected(false);
    });

    newSocket.on('connect_error', (err) => {
      console.error('Emergency socket connection error:', err.message);
      setConnected(false);
    });

    newSocket.on('sos:incoming', (data) => {
      setActiveAlerts(prev => {
        const exists = prev.some(a => a.sosId === data.sosId);
        if (exists) return prev;
        return [data, ...prev];
      });
    });

    newSocket.on('sos:status-update', (data) => {
      setSosStatus(data.status);
      setStatusMessage(data.message);
      if (data.status === 'resolved') {
        setSosActive(false);
        setSosId(null);
      }
    });

    newSocket.on('sos:updated', (data) => {
      setActiveAlerts(prev =>
        prev.map(a => a.sosId === data.sosId ? { ...a, status: data.status } : a)
          .filter(a => a.status !== 'resolved')
      );
    });

    newSocket.on('sos:active-list', (list) => {
      setActiveAlerts(list);
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, [token]);

  const triggerSOS = useCallback(() => {
    if (!socket || sosActive) return;

    setGettingLocation(true);

    const sendSOS = (lat, lng) => {
      socket.emit('sos:trigger', { lat, lng }, (response) => {
        if (response.success) {
          setSosActive(true);
          setSosId(response.sosId);
          setSosStatus('active');
          setStatusMessage('SOS alert sent. Help is on the way.');
        }
        setGettingLocation(false);
      });
    };

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => sendSOS(pos.coords.latitude, pos.coords.longitude),
        () => sendSOS(null, null),
        { enableHighAccuracy: true, timeout: 5000 }
      );
    } else {
      sendSOS(null, null);
    }
  }, [socket, sosActive]);

  const acknowledgeAlert = useCallback((sosId) => {
    if (!socket) return;
    socket.emit('sos:acknowledge', { sosId }, (response) => {
      if (response.success) {
        setActiveAlerts(prev =>
          prev.map(a => a.sosId === sosId ? { ...a, status: 'acknowledged' } : a)
        );
      }
    });
  }, [socket]);

  const resolveAlert = useCallback((sosId) => {
    if (!socket) return;
    socket.emit('sos:resolve', { sosId }, (response) => {
      if (response.success) {
        setActiveAlerts(prev => prev.filter(a => a.sosId !== sosId));
      }
    });
  }, [socket]);

  return (
    <div className="w-full flex justify-center px-4 pb-12">
      <div className="w-full max-w-3xl">
      <div className="animate-fade-in">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
          <div className="flex items-center gap-5">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0"
                 style={{ backgroundColor: 'var(--color-emergency-subtle)', border: '1px solid var(--color-emergency-wash)' }}>
               <AlertCircle className="w-7 h-7" style={{ color: 'var(--color-emergency)' }} />
            </div>
            <div className="min-w-0 text-left">
              <h1 className="text-3xl font-bold truncate" style={{ color: 'var(--color-ink)' }}>Emergency SOS</h1>
              <p className="mt-1 truncate" style={{ color: 'var(--color-ink-muted)' }}>Real-time emergency assistance</p>
            </div>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold shadow-sm"
               style={{ 
                 backgroundColor: connected ? 'var(--color-sage-subtle)' : 'var(--color-amber-subtle)',
                 color: connected ? 'var(--color-sage)' : 'var(--color-amber)',
                 border: `1px solid ${connected ? 'var(--color-sage-wash)' : 'var(--color-amber-wash)'}`
               }}>
            {connected ? <Wifi className="w-4 h-4" /> : <WifiOff className="w-4 h-4" />}
            {connected ? 'Connected to Network' : 'Disconnected'}
          </div>
        </div>

        {/* Patient View */}
        {!isStaff && (
          <div className="animate-slide-up space-y-6">
            {!sosActive ? (
              <div className="card p-8 md:p-12 text-center relative overflow-hidden"
                   style={{ borderColor: 'var(--color-emergency-wash)' }}>
                
                <p className="mb-8 max-w-lg mx-auto text-lg leading-relaxed" style={{ color: 'var(--color-ink-light)' }}>
                  Press the SOS button if you need immediate emergency medical assistance.
                  All available medical professionals will be notified instantly.
                </p>

                <div className="relative w-48 h-48 mx-auto group">
                   <div className="absolute inset-0 rounded-full blur-[40px] transition-all duration-500"
                        style={{ backgroundColor: 'var(--color-emergency-wash)' }} />
                   
                   <button
                     onClick={triggerSOS}
                     disabled={!connected || gettingLocation}
                     className="absolute inset-0 rounded-full flex flex-col items-center justify-center gap-2 border-4 transition-all z-10 hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                     style={{ 
                       backgroundColor: 'var(--color-emergency)', 
                       color: '#FFFFFF', 
                       borderColor: 'var(--color-emergency-wash)',
                       boxShadow: '0 8px 30px rgba(192, 57, 43, 0.4)'
                     }}
                   >
                     {gettingLocation ? (
                       <>
                         <MapPin className="w-10 h-10 animate-pulse-soft" />
                         <span className="text-sm font-bold uppercase tracking-widest mt-1">Locating...</span>
                       </>
                     ) : (
                       <>
                         <Radio className="w-14 h-14" />
                         <span className="text-2xl font-black uppercase tracking-widest mt-1">SOS</span>
                       </>
                     )}
                   </button>
                </div>

                <p className="text-sm font-medium mt-8 flex items-center justify-center gap-2" style={{ color: 'var(--color-ink-muted)' }}>
                  <MapPin className="w-4 h-4" />
                  Your location will be securely shared with medical professionals
                </p>
              </div>
            ) : (
              <div className="card p-8 md:p-12 text-center relative overflow-hidden"
                   style={{ borderColor: 'var(--color-emergency)', backgroundColor: 'var(--color-emergency-subtle)' }}>

                <div className="relative w-28 h-28 mx-auto mb-6">
                   <div className="absolute inset-0 rounded-full blur-2xl animate-pulse"
                        style={{ backgroundColor: sosStatus === 'acknowledged' ? 'var(--color-sage-wash)' : 'var(--color-emergency-wash)' }} />
                   <div className="relative w-full h-full rounded-full flex items-center justify-center border-4 shadow-lg"
                        style={{ 
                          backgroundColor: '#FFFFFF', 
                          borderColor: sosStatus === 'acknowledged' ? 'var(--color-sage)' : 'var(--color-emergency)'
                        }}>
                     {sosStatus === 'acknowledged' ? (
                       <CheckCircle2 className="w-12 h-12" style={{ color: 'var(--color-sage)' }} />
                     ) : (
                       <Radio className="w-12 h-12 animate-pulse-soft" style={{ color: 'var(--color-emergency)' }} />
                     )}
                   </div>
                </div>

                <h2 className="text-3xl font-bold mb-3" style={{ color: 'var(--color-ink)' }}>
                  {sosStatus === 'acknowledged' ? 'Help is on the way!' : 'SOS Alert Active'}
                </h2>
                <p className="text-lg mb-6 max-w-sm mx-auto" style={{ color: 'var(--color-ink-light)' }}>{statusMessage}</p>

                <div className="inline-flex items-center gap-3 px-6 py-3 rounded-2xl text-sm font-bold shadow-sm"
                     style={{ 
                       backgroundColor: sosStatus === 'acknowledged' ? 'var(--color-sage-subtle)' : 'var(--color-amber-subtle)',
                       color: sosStatus === 'acknowledged' ? 'var(--color-sage)' : 'var(--color-amber)',
                       border: `1px solid ${sosStatus === 'acknowledged' ? 'var(--color-sage-wash)' : 'var(--color-amber-wash)'}`
                     }}>
                  <div className={`w-2.5 h-2.5 rounded-full ${sosStatus === 'acknowledged' ? '' : 'animate-pulse'}`}
                       style={{ backgroundColor: sosStatus === 'acknowledged' ? 'var(--color-sage)' : 'var(--color-amber)' }} />
                  Status: {sosStatus.toUpperCase()}
                </div>
              </div>
            )}

            {/* Emergency Contacts */}
            <div className="card p-6 md:p-8">
              <h3 className="text-xl font-bold mb-6 flex items-center gap-3" style={{ color: 'var(--color-ink)' }}>
                <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                     style={{ backgroundColor: 'var(--color-paper-warm)', border: '1px solid var(--color-border)' }}>
                  <Phone className="w-5 h-5" style={{ color: 'var(--color-ink-muted)' }} />
                </div>
                Emergency Contacts
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <a href="tel:112" className="flex items-center justify-between p-4 rounded-2xl transition-all group"
                   style={{ backgroundColor: 'var(--color-paper-warm)', border: '1px solid var(--color-border)' }}>
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full flex items-center justify-center"
                         style={{ backgroundColor: 'var(--color-emergency-subtle)' }}>
                      <Phone className="w-5 h-5" style={{ color: 'var(--color-emergency)' }} />
                    </div>
                    <div>
                      <p className="font-bold" style={{ color: 'var(--color-ink)' }}>Emergency Services</p>
                      <p className="text-sm mt-0.5" style={{ color: 'var(--color-ink-muted)' }}>National Emergency</p>
                    </div>
                  </div>
                  <span className="text-xl font-black px-3 py-1 rounded-lg data-value"
                        style={{ backgroundColor: '#FFFFFF', color: 'var(--color-ink)', border: '1px solid var(--color-border)' }}>112</span>
                </a>
                <a href="tel:108" className="flex items-center justify-between p-4 rounded-2xl transition-all group"
                   style={{ backgroundColor: 'var(--color-paper-warm)', border: '1px solid var(--color-border)' }}>
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full flex items-center justify-center"
                         style={{ backgroundColor: 'var(--color-emergency-subtle)' }}>
                      <Phone className="w-5 h-5" style={{ color: 'var(--color-emergency)' }} />
                    </div>
                    <div>
                      <p className="font-bold" style={{ color: 'var(--color-ink)' }}>Ambulance</p>
                      <p className="text-sm mt-0.5" style={{ color: 'var(--color-ink-muted)' }}>Medical Transport</p>
                    </div>
                  </div>
                  <span className="text-xl font-black px-3 py-1 rounded-lg data-value"
                        style={{ backgroundColor: '#FFFFFF', color: 'var(--color-ink)', border: '1px solid var(--color-border)' }}>108</span>
                </a>
              </div>
            </div>
          </div>
        )}

        {/* Doctor/Admin View */}
        {isStaff && (
          <div className="animate-slide-up">
            <div className="card p-6 md:p-8">
              <h2 className="text-xl font-bold mb-6 flex items-center gap-3" style={{ color: 'var(--color-ink)' }}>
                <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                     style={{ backgroundColor: 'var(--color-teal-wash)', border: '1px solid var(--color-border)' }}>
                  <Shield className="w-5 h-5" style={{ color: 'var(--color-teal)' }} />
                </div>
                Active Emergency Alerts
                {activeAlerts.length > 0 && (
                  <span className="text-xs font-bold px-2.5 py-1 rounded-full text-white shadow-sm"
                        style={{ backgroundColor: 'var(--color-emergency)' }}>
                    {activeAlerts.length}
                  </span>
                )}
              </h2>

              {activeAlerts.length === 0 ? (
                <div className="text-center py-12 rounded-2xl" style={{ backgroundColor: 'var(--color-paper-warm)', border: '1px solid var(--color-border)' }}>
                  <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
                       style={{ backgroundColor: '#FFFFFF', border: '1px solid var(--color-sage-wash)' }}>
                    <CheckCircle2 className="w-8 h-8" style={{ color: 'var(--color-sage)' }} />
                  </div>
                  <p className="text-lg font-bold" style={{ color: 'var(--color-ink)' }}>No active emergencies</p>
                  <p className="text-sm mt-1" style={{ color: 'var(--color-ink-muted)' }}>All clear at the moment.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {activeAlerts.map((alert) => (
                    <div
                      key={alert.sosId}
                      className="p-5 rounded-2xl border"
                      style={{ 
                        backgroundColor: alert.status === 'active' ? 'var(--color-emergency-subtle)' : 'var(--color-amber-subtle)',
                        borderColor: alert.status === 'active' ? 'var(--color-emergency-wash)' : 'var(--color-amber-wash)'
                      }}
                    >
                      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                        <div>
                          <div className="flex items-center gap-3 mb-2">
                            <div className="w-8 h-8 rounded-full flex items-center justify-center"
                                 style={{ backgroundColor: '#FFFFFF', border: '1px solid var(--color-border)' }}>
                              <User className="w-4 h-4" style={{ color: 'var(--color-ink)' }} />
                            </div>
                            <p className="font-bold text-lg" style={{ color: 'var(--color-ink)' }}>
                              {alert.userName || 'Unknown Patient'}
                            </p>
                            <span className="text-xs px-3 py-1 rounded-full font-bold uppercase tracking-wider text-white"
                                  style={{ backgroundColor: alert.status === 'active' ? 'var(--color-emergency)' : 'var(--color-amber)' }}>
                              {alert.status}
                            </span>
                          </div>
                          
                          <div className="space-y-2 mt-4">
                            {alert.userPhone && (
                              <a href={`tel:${alert.userPhone}`} className="text-sm font-medium flex items-center gap-2 w-fit px-3 py-1.5 rounded-lg data-value"
                                 style={{ backgroundColor: '#FFFFFF', border: '1px solid var(--color-border)', color: 'var(--color-ink)' }}>
                                <Phone className="w-4 h-4" style={{ color: 'var(--color-teal)' }} />
                                {alert.userPhone}
                              </a>
                            )}
                            {alert.location?.lat && (
                              <p className="text-sm font-medium flex items-center gap-2 w-fit px-3 py-1.5 rounded-lg data-value"
                                 style={{ backgroundColor: '#FFFFFF', border: '1px solid var(--color-border)', color: 'var(--color-ink)' }}>
                                <MapPin className="w-4 h-4" style={{ color: 'var(--color-emergency)' }} />
                                {alert.location.lat.toFixed(4)}, {alert.location.lng.toFixed(4)}
                              </p>
                            )}
                            <p className="text-xs font-medium flex items-center gap-2 ml-1 mt-3 data-value" style={{ color: 'var(--color-ink-muted)' }}>
                              <Clock className="w-3.5 h-3.5" />
                              {new Date(alert.createdAt).toLocaleString()}
                            </p>
                          </div>
                        </div>

                        <div className="flex md:flex-col gap-3 mt-4 md:mt-0 w-full md:w-auto">
                          {alert.status === 'active' && (
                            <button
                              onClick={() => acknowledgeAlert(alert.sosId)}
                              className="flex-1 md:flex-none px-6 py-3 text-white rounded-xl text-sm font-bold shadow-sm transition-all"
                              style={{ backgroundColor: 'var(--color-amber)' }}
                            >
                              Acknowledge
                            </button>
                          )}
                          <button
                            onClick={() => resolveAlert(alert.sosId)}
                            className="flex-1 md:flex-none px-6 py-3 text-white rounded-xl text-sm font-bold shadow-sm transition-all"
                            style={{ backgroundColor: 'var(--color-sage)' }}
                          >
                            Resolve Alert
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
      </div>
    </div>
  );
}

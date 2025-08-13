import React, { useState, useEffect, useRef } from 'react';
import { Heart, HeartOff, Plus, X, Check, Users, Bell, Zap, TrendingUp } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import Confetti from 'react-confetti';
import { database, DB_PATHS } from './firebase';
import { ref, onValue, push, set, remove, serverTimestamp, off } from 'firebase/database';

interface UserSubmission {
  name: string;
  submitter: string;
  timestamp: number;
}

interface VoteData {
  [voterName: string]: {
    [voteKey: string]: boolean;
  };
}

interface ActiveUser {
  name: string;
  lastActive: number;
}

interface Notification {
  id: string;
  message: string;
  timestamp: number;
  type: 'vote' | 'submission' | 'user';
}

const NamingVotingAppFirebase = () => {
  // Estados originales
  const [votesByPerson, setVotesByPerson] = useState<VoteData>({});
  const [currentVoter, setCurrentVoter] = useState('');
  const [showVoterForm, setShowVoterForm] = useState(true);
  const [userSubmissions, setUserSubmissions] = useState<{[key: string]: UserSubmission[]}>({});
  const [showAddForm, setShowAddForm] = useState(false);
  const [newName, setNewName] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [submitterName, setSubmitterName] = useState('');

  // Estados para funcionalidades divertidas
  const [activeUsers, setActiveUsers] = useState<{[key: string]: ActiveUser}>({});
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [showConfetti, setShowConfetti] = useState(false);
  const [recentVotes, setRecentVotes] = useState<{[key: string]: number}>({});
  
  const userActivityRef = useRef<any>(null);
  const lastNotificationRef = useRef<number>(Date.now());

  const categories = [
    {
      id: 'hispanic',
      title: '🌎 HISPANA',
      subtitle: 'Cultura latina, bilingüe',
      color: 'bg-orange-100 border-orange-300',
      names: [
        'ConversaFlow', 'AmigaAI', 'MercadoMente', 'CharlaCore', 'PuenteMind',
        'VozInteligente', 'ConectaMente', 'HablaFlujo', 'DialogoAI', 'PlaticoFlow'
      ]
    },
    {
      id: 'speed',
      title: '⚡ VELOCIDAD',
      subtitle: '48 horas, resultados rápidos',
      color: 'bg-yellow-100 border-yellow-300',
      names: [
        'VelocIA', 'ExpresoMind', 'RápidoFlow', 'InstantMente', 'TurboFlow',
        'SwiftCore', 'AgilMente', 'FlashFlow', 'VelocidadAI', 'ExpresoCore'
      ]
    },
    {
      id: 'modular',
      title: '🔧 MODULAR',
      subtitle: 'Multi-vertical, adaptable',
      color: 'bg-blue-100 border-blue-300',
      names: [
        'Camaleón', 'AdaptaCore', 'FlexiMente', 'PolyFlow', 'ShapeShift',
        'MultiFacet', 'VariaCore', 'OmniFlow', 'FlexCore', 'AdaptiveAI'
      ]
    },
    {
      id: 'regional',
      title: '🌴 LATAM TECH',
      subtitle: 'Innovación regional',
      color: 'bg-green-100 border-green-300',
      names: [
        'TropicalAI', 'SiliconSur', 'InnovaLatam', 'TecnoTropico', 'SurTech',
        'LatamMind', 'TropicFlow', 'RegionCore', 'SouthFlow', 'TierraAI'
      ]
    },
    {
      id: 'futuristic',
      title: '🚀 FUTURISTA',
      subtitle: 'Next-gen, AI avanzada',
      color: 'bg-purple-100 border-purple-300',
      names: [
        'SynapseFlow', 'NeuralCore', 'CogniMente', 'QuantumFlow', 'NexusAI',
        'ZenithCore', 'EvolutionAI', 'MetaFlow', 'HyperCore', 'ApexAI'
      ]
    },
    {
      id: 'value_es',
      title: '💰 VALOR (ESP)',
      subtitle: 'Ahorro, ventas, ROI',
      color: 'bg-red-100 border-red-300',
      names: [
        'AhorroInteligente', 'VentaMás', 'TiempoLibre', 'GananciaAI', 'EficienciaMáxima',
        'ROI-Matic', 'VentaFácil', 'TiempoValioso', 'CreceMás', 'ProfitFlow'
      ]
    },
    {
      id: 'value_en',
      title: '💎 VALOR (ENG)',
      subtitle: 'Time savings, growth',
      color: 'bg-indigo-100 border-indigo-300',
      names: [
        'TimeSaver', 'SalesBoost', 'EfficiencyPro', 'ROI-Master', 'ProfitMind',
        'TimeFree', 'SalesFlow', 'GrowthCore', 'RevenueAI', 'ValueFlow'
      ]
    }
  ];

  // Configurar listeners de Firebase
  useEffect(() => {
    // Escuchar votos en tiempo real
    const votesRef = ref(database, DB_PATHS.votes);
    const votesUnsubscribe = onValue(votesRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        setVotesByPerson(data);
      }
    });

    // Escuchar submissions de usuarios
    const submissionsRef = ref(database, DB_PATHS.userSubmissions);
    const submissionsUnsubscribe = onValue(submissionsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        setUserSubmissions(data);
      }
    });

    // Escuchar usuarios activos
    const activeUsersRef = ref(database, DB_PATHS.activeUsers);
    const activeUsersUnsubscribe = onValue(activeUsersRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const now = Date.now();
        // Filtrar usuarios activos en los últimos 5 minutos
        const filtered = Object.keys(data).reduce((acc, userId) => {
          if (now - data[userId].lastActive < 300000) { // 5 minutos
            acc[userId] = data[userId];
          }
          return acc;
        }, {} as {[key: string]: ActiveUser});
        setActiveUsers(filtered);
      }
    });

    // Escuchar notificaciones
    const notificationsRef = ref(database, DB_PATHS.notifications);
    const notificationsUnsubscribe = onValue(notificationsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const notificationsList = Object.keys(data)
          .map(key => ({ id: key, ...data[key] }))
          .filter(notif => notif.timestamp > lastNotificationRef.current)
          .sort((a, b) => b.timestamp - a.timestamp)
          .slice(0, 10); // Mantener solo las últimas 10
        
        setNotifications(notificationsList);
        
        // Mostrar confetti para nuevas votaciones
        notificationsList.forEach(notif => {
          if (notif.type === 'vote' && notif.timestamp > Date.now() - 5000) {
            triggerConfetti();
          }
        });
      }
    });

    return () => {
      off(votesRef, 'value', votesUnsubscribe);
      off(submissionsRef, 'value', submissionsUnsubscribe);
      off(activeUsersRef, 'value', activeUsersUnsubscribe);
      off(notificationsRef, 'value', notificationsUnsubscribe);
    };
  }, []);

  // Mantener usuario activo
  useEffect(() => {
    if (currentVoter) {
      const updateUserActivity = () => {
        const userRef = ref(database, `${DB_PATHS.activeUsers}/${currentVoter.replace(/[.#$[\]]/g, '_')}`);
        set(userRef, {
          name: currentVoter,
          lastActive: serverTimestamp()
        });
      };

      updateUserActivity();
      userActivityRef.current = setInterval(updateUserActivity, 30000); // Cada 30 segundos

      return () => {
        if (userActivityRef.current) {
          clearInterval(userActivityRef.current);
        }
      };
    }
  }, [currentVoter]);

  // Funciones auxiliares
  const triggerConfetti = () => {
    setShowConfetti(true);
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 }
    });
    setTimeout(() => setShowConfetti(false), 3000);
  };

  const addNotification = (message: string, type: 'vote' | 'submission' | 'user') => {
    const notificationRef = push(ref(database, DB_PATHS.notifications));
    set(notificationRef, {
      message,
      timestamp: serverTimestamp(),
      type
    });
  };

  // Funciones de votación con Firebase
  const handleVote = async (categoryId: string, name: string) => {
    if (!currentVoter) return;
    
    const key = `${categoryId}-${name}`;
    const currentVote = votesByPerson[currentVoter]?.[key];
    const newVoteState = !currentVote;
    
    // Actualizar en Firebase
    const voteRef = ref(database, `${DB_PATHS.votes}/${currentVoter.replace(/[.#$[\]]/g, '_')}/${key}`);
    await set(voteRef, newVoteState);
    
    // Agregar notificación
    if (newVoteState) {
      const displayName = name.startsWith('user-') ? name.substring(5) : name;
      addNotification(`${currentVoter} votó por "${displayName}"`, 'vote');
      
      // Efecto visual
      setRecentVotes(prev => ({ ...prev, [key]: Date.now() }));
      triggerConfetti();
    }
  };

  const handleStartVoting = (voterName: string) => {
    if (!voterName.trim()) {
      alert('Por favor ingresa tu nombre');
      return;
    }
    const cleanName = voterName.trim();
    setCurrentVoter(cleanName);
    setShowVoterForm(false);
    lastNotificationRef.current = Date.now();
    
    addNotification(`${cleanName} se unió a la votación`, 'user');
  };

  const handleAddName = async () => {
    if (!newName.trim() || !selectedCategory || !submitterName.trim()) {
      alert('Por favor completa todos los campos');
      return;
    }

    const submission: UserSubmission = {
      name: newName.trim(),
      submitter: submitterName.trim(),
      timestamp: Date.now()
    };

    // Agregar a Firebase
    const submissionRef = push(ref(database, `${DB_PATHS.userSubmissions}/${selectedCategory}`));
    await set(submissionRef, submission);

    // Agregar notificación
    addNotification(`${submitterName.trim()} agregó "${newName.trim()}" en ${categories.find(c => c.id === selectedCategory)?.title}`, 'submission');

    // Limpiar formulario
    setNewName('');
    setSubmitterName('');
    setSelectedCategory('');
    setShowAddForm(false);
    
    triggerConfetti();
  };

  const removeUserSubmission = async (categoryId: string, index: number) => {
    const submissions = userSubmissions[categoryId];
    if (!submissions || !submissions[index]) return;

    // Encontrar la key correcta en Firebase
    const submissionsRef = ref(database, `${DB_PATHS.userSubmissions}/${categoryId}`);
    onValue(submissionsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const keys = Object.keys(data);
        if (keys[index]) {
          const itemRef = ref(database, `${DB_PATHS.userSubmissions}/${categoryId}/${keys[index]}`);
          remove(itemRef);
        }
      }
    }, { onlyOnce: true });
  };

  // Funciones auxiliares originales (adaptadas)
  const getVoteCount = (categoryId: string) => {
    if (!currentVoter || !votesByPerson[currentVoter]) return 0;
    return Object.keys(votesByPerson[currentVoter]).filter(key => 
      key.startsWith(categoryId) && votesByPerson[currentVoter][key]
    ).length;
  };

  const getTotalVotes = () => {
    if (!currentVoter || !votesByPerson[currentVoter]) return 0;
    return Object.values(votesByPerson[currentVoter]).filter(Boolean).length;
  };

  const getAllVoters = () => {
    return Object.keys(votesByPerson).filter(voter => 
      Object.values(votesByPerson[voter]).some(Boolean)
    );
  };

  const getNamePopularity = (categoryId: string, name: string) => {
    const allVoters = getAllVoters();
    if (allVoters.length === 0) return { count: 0, percentage: 0, voters: [] };
    
    const key = `${categoryId}-${name}`;
    const votersWhoSelected = allVoters.filter(voter => 
      votesByPerson[voter]?.[key]
    );
    
    return {
      count: votersWhoSelected.length,
      percentage: Math.round((votersWhoSelected.length / allVoters.length) * 100),
      voters: votersWhoSelected
    };
  };

  const getPopularityBadge = (count: number, percentage: number) => {
    if (count === 0) return null;
    if (percentage >= 75) return { text: '🏆 Favorito', color: 'bg-yellow-100 text-yellow-800 border-yellow-300' };
    if (percentage >= 50) return { text: '⭐ Popular', color: 'bg-green-100 text-green-800 border-green-300' };
    if (count > 1) return { text: '👥 Consenso', color: 'bg-blue-100 text-blue-800 border-blue-300' };
    return null;
  };

  const getTotalUserSubmissions = () => {
    return Object.values(userSubmissions).reduce((total, categorySubmissions) => 
      total + categorySubmissions.length, 0
    );
  };

  const getAllSelectedNames = () => {
    if (!currentVoter || !votesByPerson[currentVoter]) return [];
    
    const currentVotes = votesByPerson[currentVoter];
    const originalNames = Object.keys(currentVotes)
      .filter(key => currentVotes[key])
      .map(key => {
        const [categoryId, name] = key.split('-');
        const category = categories.find(c => c.id === categoryId);
        return { name, category: category?.title || 'Unknown', type: 'original' };
      });

    const userNames = Object.keys(currentVotes)
      .filter(key => currentVotes[key] && key.includes('user-'))
      .map(key => {
        const parts = key.split('-');
        const categoryId = parts[0];
        const name = parts.slice(2).join('-');
        const category = categories.find(c => c.id === categoryId);
        return { name, category: category?.title || 'Unknown', type: 'user' };
      });

    return [...originalNames, ...userNames];
  };

  return (
    <div className="max-w-7xl mx-auto p-4 bg-gray-50 min-h-screen">
      {/* Confetti */}
      {showConfetti && (
        <Confetti
          width={window.innerWidth}
          height={window.innerHeight}
          recycle={false}
          numberOfPieces={200}
        />
      )}

      {/* Modal para Capturar Nombre del Votante */}
      {showVoterForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-xl shadow-2xl p-8 w-full max-w-md"
          >
            <div className="text-center mb-6">
              <motion.h2 
                initial={{ y: -20 }}
                animate={{ y: 0 }}
                className="text-2xl font-bold text-gray-800 mb-2"
              >
                🗳️ Bienvenido a la Votación
              </motion.h2>
              <p className="text-gray-600">
                Para comenzar, ingresa tu nombre para identificar tus votos
              </p>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tu nombre *
                </label>
                <input
                  type="text"
                  value={currentVoter}
                  onChange={(e) => setCurrentVoter(e.target.value)}
                  placeholder="Ej: María García"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  onKeyPress={(e) => e.key === 'Enter' && handleStartVoting(currentVoter)}
                  autoFocus
                />
              </div>
              
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleStartVoting(currentVoter)}
                className="w-full bg-blue-500 hover:bg-blue-600 text-white py-3 rounded-lg font-bold text-lg transition-colors"
              >
                Comenzar a Votar
              </motion.button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Header con stats en tiempo real */}
      <motion.div 
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="bg-white rounded-xl shadow-lg p-6 mb-6"
      >
        <div className="text-center mb-4">
          <div className="inline-block bg-blue-50 border border-blue-200 rounded-lg px-4 py-2 mb-3">
            <span className="text-blue-700 font-medium">
              🗳️ Votando como: <strong>{currentVoter}</strong>
            </span>
            <button
              onClick={() => setShowVoterForm(true)}
              className="ml-3 text-blue-600 hover:text-blue-800 text-sm underline"
            >
              Cambiar
            </button>
          </div>
        </div>

        <h1 className="text-3xl font-bold text-center text-gray-800 mb-2">
          🎯 ¿Cuál nombre te gusta más?
        </h1>
        <p className="text-center text-gray-600 mb-4">
          Haz clic en el ❤️ de los nombres que más te gusten. <strong>¡También puedes agregar tus propias ideas!</strong>
        </p>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
          {/* Stats existentes */}
          <motion.div 
            whileHover={{ scale: 1.05 }}
            className="bg-gradient-to-r from-blue-50 to-purple-50 p-4 rounded-lg text-center"
          >
            <div className="text-2xl font-bold text-blue-700">
              {getTotalVotes()}
            </div>
            <div className="text-sm text-gray-600">Tus votos</div>
          </motion.div>
          
          <motion.div 
            whileHover={{ scale: 1.05 }}
            className="bg-gradient-to-r from-green-50 to-blue-50 p-4 rounded-lg text-center"
          >
            <div className="text-2xl font-bold text-green-700">
              {getTotalUserSubmissions()}
            </div>
            <div className="text-sm text-gray-600">Ideas contribuidas</div>
          </motion.div>

          {/* Nuevos stats en tiempo real */}
          <motion.div 
            whileHover={{ scale: 1.05 }}
            className="bg-gradient-to-r from-orange-50 to-red-50 p-4 rounded-lg text-center"
          >
            <div className="flex items-center justify-center gap-2">
              <Users className="w-5 h-5 text-orange-600" />
              <span className="text-2xl font-bold text-orange-700">
                {Object.keys(activeUsers).length}
              </span>
            </div>
            <div className="text-sm text-gray-600">Usuarios activos</div>
          </motion.div>

          <motion.div 
            whileHover={{ scale: 1.05 }}
            className="bg-gradient-to-r from-purple-50 to-pink-50 p-4 rounded-lg text-center"
          >
            <div className="flex items-center justify-center gap-2">
              <TrendingUp className="w-5 h-5 text-purple-600" />
              <span className="text-2xl font-bold text-purple-700">
                {getAllVoters().length}
              </span>
            </div>
            <div className="text-sm text-gray-600">Total votantes</div>
          </motion.div>
        </div>

        {/* Panel de notificaciones en tiempo real */}
        {notifications.length > 0 && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4"
          >
            <div className="flex items-center gap-2 mb-2">
              <Bell className="w-4 h-4 text-yellow-600" />
              <span className="text-sm font-medium text-yellow-800">Actividad reciente</span>
            </div>
            <div className="space-y-1 max-h-20 overflow-y-auto">
              {notifications.slice(0, 3).map((notification) => (
                <motion.div
                  key={notification.id}
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  className="text-xs text-yellow-700 flex items-center gap-2"
                >
                  {notification.type === 'vote' && <Zap className="w-3 h-3" />}
                  {notification.type === 'submission' && <Plus className="w-3 h-3" />}
                  {notification.type === 'user' && <Users className="w-3 h-3" />}
                  <span>{notification.message}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        <div className="text-center">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowAddForm(true)}
            className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white px-6 py-3 rounded-lg font-bold flex items-center gap-2 mx-auto transition-all"
          >
            <Plus className="w-5 h-5" />
            Agregar Nombre
          </motion.button>
        </div>
      </motion.div>

      {/* Resto del componente continúa igual pero con animaciones Motion */}
      {/* [El resto del código del formulario y categorías se mantiene igual, agregando motion.div donde sea apropiado] */}
      
      {/* Por brevedad, incluyo solo las partes clave - el resto se mantiene igual pero con animaciones */}
      
    </div>
  );
};

export default NamingVotingAppFirebase;
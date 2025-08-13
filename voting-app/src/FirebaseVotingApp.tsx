import React, { useState, useEffect, useRef } from 'react';
import { Heart, HeartOff, Plus, X, Check, Users, Bell, Zap, TrendingUp } from 'lucide-react';
import { motion } from 'framer-motion';
import confetti from 'canvas-confetti';
import Confetti from 'react-confetti';
import { database, DB_PATHS } from './firebase';
import { ref, onValue, push, set } from 'firebase/database';

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

const FirebaseVotingApp = () => {
  // Estados principales
  const [votesByPerson, setVotesByPerson] = useState<VoteData>({});
  const [currentVoter, setCurrentVoter] = useState('');
  const [confirmedVoter, setConfirmedVoter] = useState(''); // Usuario confirmado
  const [showVoterForm, setShowVoterForm] = useState(true);
  const [userSubmissions, setUserSubmissions] = useState<{[key: string]: UserSubmission[]}>({});
  const [showAddForm, setShowAddForm] = useState(false);
  const [newName, setNewName] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [submitterName, setSubmitterName] = useState('');

  // Estados para tiempo real y diversión
  const [activeUsers, setActiveUsers] = useState<{[key: string]: ActiveUser}>({});
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [showConfetti, setShowConfetti] = useState(false);
  
  const userActivityRef = useRef<NodeJS.Timeout | null>(null);
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
    const setupFirebaseListeners = () => {
      // Escuchar votos
      const votesRef = ref(database, DB_PATHS.votes);
      onValue(votesRef, (snapshot) => {
        const data = snapshot.val();
        setVotesByPerson(data || {});
      });

      // Escuchar submissions
      const submissionsRef = ref(database, DB_PATHS.userSubmissions);
      onValue(submissionsRef, (snapshot) => {
        const data = snapshot.val();
        setUserSubmissions(data || {});
      });

      // Escuchar usuarios activos
      const activeUsersRef = ref(database, DB_PATHS.activeUsers);
      onValue(activeUsersRef, (snapshot) => {
        const data = snapshot.val();
        if (data) {
          const now = Date.now();
          // Hacer el filtrado más permisivo: 10 minutos
          const filtered = Object.keys(data).reduce((acc, userId) => {
            const lastActive = typeof data[userId].lastActive === 'number' 
              ? data[userId].lastActive 
              : Date.now();
            if (now - lastActive < 600000) { // 10 minutos
              acc[userId] = data[userId];
            }
            return acc;
          }, {} as {[key: string]: ActiveUser});
          setActiveUsers(filtered);
          console.log('Usuarios activos:', Object.keys(filtered).length, filtered);
        } else {
          setActiveUsers({});
        }
      });

      // Escuchar notificaciones
      const notificationsRef = ref(database, DB_PATHS.notifications);
      onValue(notificationsRef, (snapshot) => {
        const data = snapshot.val();
        if (data) {
          const notificationsList = Object.keys(data)
            .map(key => ({ id: key, ...data[key] }))
            .filter(notif => notif.timestamp > lastNotificationRef.current)
            .sort((a, b) => b.timestamp - a.timestamp)
            .slice(0, 10);
          
          setNotifications(notificationsList);
          
          // Confetti para nuevas votaciones
          notificationsList.forEach(notif => {
            if (notif.type === 'vote' && notif.timestamp > Date.now() - 5000) {
              triggerConfetti();
            }
          });
        }
      });
    };

    setupFirebaseListeners();
  }, []);

  // Mantener usuario activo
  useEffect(() => {
    if (confirmedVoter) {
      const updateActivity = async () => {
        try {
          const cleanVoterName = confirmedVoter.replace(/[.#$[\]]/g, '_');
          const userRef = ref(database, `${DB_PATHS.activeUsers}/${cleanVoterName}`);
          await set(userRef, {
            name: confirmedVoter,
            lastActive: Date.now()
          });
        } catch (error) {
          console.error('Error al actualizar actividad:', error);
        }
      };

      updateActivity();
      userActivityRef.current = setInterval(updateActivity, 30000);

      return () => {
        if (userActivityRef.current) {
          clearInterval(userActivityRef.current);
        }
      };
    }
  }, [confirmedVoter]);

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

  const addNotification = async (message: string, type: 'vote' | 'submission' | 'user') => {
    try {
      const notificationRef = push(ref(database, DB_PATHS.notifications));
      await set(notificationRef, {
        message,
        timestamp: Date.now(),
        type
      });
    } catch (error) {
      console.error('Error al agregar notificación:', error);
    }
  };

  // Funciones principales
  const handleVote = async (categoryId: string, name: string) => {
    if (!confirmedVoter) return;
    
    try {
      const key = `${categoryId}-${name}`;
      const currentVote = votesByPerson[confirmedVoter]?.[key];
      const newVoteState = !currentVote;
      
      // Actualización optimista del estado local
      setVotesByPerson(prev => ({
        ...prev,
        [confirmedVoter]: {
          ...prev[confirmedVoter],
          [key]: newVoteState
        }
      }));
      
      const cleanVoterName = confirmedVoter.replace(/[.#$[\]]/g, '_');
      const voteRef = ref(database, `${DB_PATHS.votes}/${cleanVoterName}/${key}`);
      
      console.log('Votando:', { voter: cleanVoterName, key, newState: newVoteState });
      
      await set(voteRef, newVoteState);
      
      if (newVoteState) {
        const displayName = name.startsWith('user-') ? name.substring(5) : name;
        addNotification(`${confirmedVoter} votó por "${displayName}"`, 'vote');
        triggerConfetti();
      }
    } catch (error) {
      console.error('Error al votar:', error);
      // Revertir el estado optimista en caso de error
      setVotesByPerson(prev => ({
        ...prev,
        [confirmedVoter]: {
          ...prev[confirmedVoter],
          [`${categoryId}-${name}`]: !prev[confirmedVoter]?.[`${categoryId}-${name}`]
        }
      }));
      alert('Error al votar. Revisa la consola y la configuración de Firebase.');
    }
  };

  const handleStartVoting = (voterName: string) => {
    if (!voterName.trim()) {
      alert('Por favor ingresa tu nombre');
      return;
    }
    const cleanName = voterName.trim();
    setCurrentVoter(cleanName);
    setConfirmedVoter(cleanName); // Confirmar usuario aquí
    setShowVoterForm(false);
    lastNotificationRef.current = Date.now();
    
    addNotification(`${cleanName} se unió a la votación`, 'user');
  };

  const handleAddName = async () => {
    if (!newName.trim() || !selectedCategory) {
      alert('Por favor completa el nombre y selecciona una categoría');
      return;
    }

    const finalSubmitterName = submitterName.trim() || confirmedVoter || 'Anónimo';

    try {
      const submission: UserSubmission = {
        name: newName.trim(),
        submitter: finalSubmitterName,
        timestamp: Date.now()
      };

      console.log('Agregando nombre:', submission, 'en categoría:', selectedCategory);

      const submissionRef = push(ref(database, `${DB_PATHS.userSubmissions}/${selectedCategory}`));
      await set(submissionRef, submission);

      addNotification(`${finalSubmitterName} agregó "${newName.trim()}"`, 'submission');

      setNewName('');
      setSubmitterName('');
      setSelectedCategory('');
      setShowAddForm(false);
      triggerConfetti();

      console.log('Nombre agregado exitosamente');
    } catch (error) {
      console.error('Error al agregar nombre:', error);
      alert('Error al agregar nombre. Revisa la consola.');
    }

  };

  // Funciones de cálculo
  const getVoteCount = (categoryId: string) => {
    if (!confirmedVoter || !votesByPerson[confirmedVoter]) return 0;
    return Object.keys(votesByPerson[confirmedVoter]).filter(key => 
      key.startsWith(categoryId) && votesByPerson[confirmedVoter][key]
    ).length;
  };

  const getTotalVotes = () => {
    if (!confirmedVoter || !votesByPerson[confirmedVoter]) return 0;
    return Object.values(votesByPerson[confirmedVoter]).filter(Boolean).length;
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
    const total = Object.values(userSubmissions).reduce((total, categorySubmissions) => 
      total + (categorySubmissions?.length || 0), 0
    );
    console.log('Ideas contribuidas:', total, userSubmissions);
    return total;
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

      {/* Modal de inicio */}
      {showVoterForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-xl shadow-2xl p-8 w-full max-w-md"
          >
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-2">
                🗳️ Votación en Tiempo Real
              </h2>
              <p className="text-gray-600">
                ¡Vota y ve las decisiones de otros en tiempo real!
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
                  onKeyDown={(e) => e.key === 'Enter' && handleStartVoting(currentVoter)}
                  autoFocus
                />
              </div>
              
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleStartVoting(currentVoter)}
                className="w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white py-3 rounded-lg font-bold text-lg transition-all"
              >
                🚀 ¡Comenzar!
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
          <div className="inline-flex items-center gap-3 bg-blue-50 border border-blue-200 rounded-lg px-4 py-2 mb-3">
            <span className="text-blue-700 font-medium">
              🗳️ <strong>{confirmedVoter}</strong>
            </span>
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-xs text-green-600 font-medium">ONLINE</span>
            </div>
            <button
              onClick={() => setShowVoterForm(true)}
              className="text-blue-600 hover:text-blue-800 text-sm underline"
            >
              Cambiar
            </button>
          </div>
        </div>

        <h1 className="text-3xl font-bold text-center text-gray-800 mb-2">
          🎯 Votación Colaborativa en Tiempo Real
        </h1>
        <p className="text-center text-gray-600 mb-4">
          ¡Vota y ve las decisiones de otros al instante! 🎉
        </p>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
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

        {/* Notificaciones en tiempo real */}
        {notifications.length > 0 && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-lg p-4 mb-4"
          >
            <div className="flex items-center gap-2 mb-2">
              <Bell className="w-4 h-4 text-yellow-600" />
              <span className="text-sm font-medium text-yellow-800">🔥 Actividad en vivo</span>
            </div>
            <div className="space-y-1 max-h-20 overflow-y-auto">
              {notifications.slice(0, 3).map((notification) => (
                <motion.div
                  key={notification.id}
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  className="text-xs text-yellow-700 flex items-center gap-2"
                >
                  {notification.type === 'vote' && <Zap className="w-3 h-3 text-green-500" />}
                  {notification.type === 'submission' && <Plus className="w-3 h-3 text-blue-500" />}
                  {notification.type === 'user' && <Users className="w-3 h-3 text-purple-500" />}
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
            className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white px-6 py-3 rounded-lg font-bold flex items-center gap-2 mx-auto transition-all shadow-lg"
          >
            <Plus className="w-5 h-5" />
            ✨ Agregar Idea
          </motion.button>
        </div>
      </motion.div>

      {/* Modal para agregar nombres */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-md"
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-gray-800">💡 Nueva Idea</h3>
              <button
                onClick={() => setShowAddForm(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tu nombre (opcional)
                </label>
                <input
                  type="text"
                  value={submitterName}
                  onChange={(e) => setSubmitterName(e.target.value)}
                  placeholder={confirmedVoter ? `${confirmedVoter} (predeterminado)` : "Tu nombre"}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Si lo dejas vacío, usará "{confirmedVoter}"
                </p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Categoría *
                </label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option value="">Selecciona categoría</option>
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.title}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nombre propuesto *
                </label>
                <input
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="Ej: ConversaMax"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
              
              <div className="flex gap-3 pt-4">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleAddName}
                  className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white py-3 rounded-lg font-bold flex items-center justify-center gap-2"
                >
                  <Check className="w-5 h-5" />
                  Agregar
                </motion.button>
                <button
                  onClick={() => {
                    setShowAddForm(false);
                    setSelectedCategory('');
                    setNewName('');
                    setSubmitterName('');
                  }}
                  className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-700 py-3 rounded-lg font-bold"
                >
                  Cancelar
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* Categorías con animaciones */}
      <div className="space-y-8">
        {categories.map((category, categoryIndex) => (
          <motion.div 
            key={category.id}
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: categoryIndex * 0.1 }}
            className="bg-white rounded-xl shadow-lg p-6"
          >
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-800">
                  {category.title}
                </h2>
                <p className="text-gray-600">{category.subtitle}</p>
              </div>
              <div className="flex items-center gap-3">
                <div className="bg-gradient-to-r from-blue-100 to-purple-100 px-4 py-2 rounded-full">
                  <span className="text-lg font-bold text-gray-700">
                    {getVoteCount(category.id)} ❤️
                  </span>
                </div>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => {
                    setSelectedCategory(category.id);
                    setShowAddForm(true);
                  }}
                  className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition-all text-sm"
                >
                  <Plus className="w-4 h-4" />
                  Agregar
                </motion.button>
              </div>
            </div>

            {/* Grid de nombres con animaciones */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 mb-4">
              {category.names.map((name, nameIndex) => {
                const isVoted = confirmedVoter && votesByPerson[confirmedVoter]?.[`${category.id}-${name}`];
                const popularity = getNamePopularity(category.id, name);
                const badge = getPopularityBadge(popularity.count, popularity.percentage);
                
                return (
                  <motion.button
                    key={name}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: (categoryIndex * 0.1) + (nameIndex * 0.02) }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleVote(category.id, name)}
                    className={`group relative p-4 rounded-lg border-2 transition-all duration-200 ${
                      isVoted 
                        ? 'border-red-400 bg-gradient-to-br from-red-50 to-pink-50 shadow-lg' 
                        : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-md'
                    }`}
                  >
                    {/* Corazón animado */}
                    <motion.div 
                      className="absolute top-2 right-2"
                      animate={{ scale: isVoted ? [1, 1.2, 1] : 1 }}
                      transition={{ duration: 0.3 }}
                    >
                      {isVoted ? (
                        <Heart className="w-6 h-6 text-red-500 fill-current" />
                      ) : (
                        <HeartOff className="w-6 h-6 text-gray-300 group-hover:text-red-300" />
                      )}
                    </motion.div>

                    {/* Badge de popularidad */}
                    {badge && (
                      <motion.div 
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="absolute top-2 left-2"
                      >
                        <span className={`text-xs px-2 py-1 rounded-full font-medium border ${badge.color}`}>
                          {badge.text}
                        </span>
                      </motion.div>
                    )}

                    {/* Nombre */}
                    <div className={`pr-8 ${badge ? 'pt-6' : ''}`}>
                      <h3 className={`font-bold text-left text-sm md:text-base ${
                        isVoted ? 'text-red-700' : 'text-gray-800'
                      }`}>
                        {name}
                      </h3>
                      {getAllVoters().length > 1 && popularity.count > 0 && (
                        <p className="text-xs text-gray-500 mt-1">
                          {popularity.percentage}% ({popularity.count}/{getAllVoters().length})
                        </p>
                      )}
                    </div>

                    {/* Badge de seleccionado */}
                    {isVoted && (
                      <motion.div 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="absolute bottom-2 left-2"
                      >
                        <span className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded-full font-medium">
                          ✓ Seleccionado
                        </span>
                      </motion.div>
                    )}
                  </motion.button>
                );
              })}
            </div>

            {/* Nombres agregados por usuarios */}
            {userSubmissions[category.id] && userSubmissions[category.id].length > 0 && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <div className="flex items-center gap-2 mb-3">
                  <div className="h-px bg-gray-300 flex-1"></div>
                  <span className="text-sm font-medium text-gray-500 bg-gray-50 px-3 py-1 rounded-full">
                    💡 Ideas Contribuidas ({userSubmissions[category.id].length})
                  </span>
                  <div className="h-px bg-gray-300 flex-1"></div>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
                  {userSubmissions[category.id].map((submission, index) => {
                    const voteKey = `${category.id}-user-${submission.name}`;
                    const isVoted = confirmedVoter && votesByPerson[confirmedVoter]?.[voteKey];
                    const popularity = getNamePopularity(category.id, `user-${submission.name}`);
                    const badge = getPopularityBadge(popularity.count, popularity.percentage);
                    
                    return (
                      <motion.div 
                        key={index}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="relative group"
                      >
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => handleVote(category.id, `user-${submission.name}`)}
                          className={`relative p-4 rounded-lg border-2 transition-all duration-200 w-full ${
                            isVoted 
                              ? 'border-purple-400 bg-gradient-to-br from-purple-50 to-pink-50 shadow-lg' 
                              : 'border-purple-200 bg-purple-25 hover:border-purple-300 hover:shadow-md'
                          }`}
                        >
                          {/* Corazón */}
                          <motion.div 
                            className="absolute top-2 right-2"
                            animate={{ scale: isVoted ? [1, 1.2, 1] : 1 }}
                            transition={{ duration: 0.3 }}
                          >
                            {isVoted ? (
                              <Heart className="w-6 h-6 text-purple-500 fill-current" />
                            ) : (
                              <HeartOff className="w-6 h-6 text-purple-300 group-hover:text-purple-400" />
                            )}
                          </motion.div>

                          {/* Badge de popularidad */}
                          {badge && (
                            <div className="absolute top-2 left-2">
                              <span className={`text-xs px-2 py-1 rounded-full font-medium border ${badge.color}`}>
                                {badge.text}
                              </span>
                            </div>
                          )}

                          {/* Nombre e info */}
                          <div className={`pr-8 ${badge ? 'pt-6' : ''}`}>
                            <h3 className={`font-bold text-left text-sm md:text-base ${
                              isVoted ? 'text-purple-700' : 'text-purple-800'
                            }`}>
                              {submission.name}
                            </h3>
                            <p className="text-xs text-purple-600 mt-1">
                              por {submission.submitter}
                            </p>
                            {getAllVoters().length > 1 && popularity.count > 0 && (
                              <p className="text-xs text-purple-500 mt-1">
                                {popularity.percentage}% ({popularity.count}/{getAllVoters().length})
                              </p>
                            )}
                          </div>

                          {isVoted && (
                            <motion.div 
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              className="absolute bottom-2 left-2"
                            >
                              <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded-full font-medium">
                                ✓ Seleccionado
                              </span>
                            </motion.div>
                          )}
                        </motion.button>
                      </motion.div>
                    );
                  })}
                </div>
              </motion.div>
            )}
          </motion.div>
        ))}
      </div>

      {/* Resumen de favoritos */}
      {getTotalVotes() > 0 && (
        <motion.div 
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-8 bg-gradient-to-r from-green-50 to-blue-50 rounded-xl shadow-lg p-6 border border-green-200"
        >
          <h3 className="text-2xl font-bold text-center text-gray-800 mb-4">
            🏆 Tus Favoritos ({getTotalVotes()})
          </h3>
          
          <div className="flex flex-wrap justify-center gap-2 mb-4">
            {confirmedVoter && votesByPerson[confirmedVoter] && Object.keys(votesByPerson[confirmedVoter])
              .filter(key => votesByPerson[confirmedVoter][key])
              .map((key, index) => {
                const [categoryId, ...nameParts] = key.split('-');
                const name = nameParts.join('-');
                const isUser = name.startsWith('user-');
                const displayName = isUser ? name.substring(5) : name;
                const category = categories.find(c => c.id === categoryId);
                
                return (
                  <motion.span
                    key={index}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.05 }}
                    className={`px-4 py-2 rounded-full shadow-md border-2 font-medium ${
                      isUser 
                        ? 'bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200 text-purple-800' 
                        : 'bg-white border-green-200 text-gray-800'
                    }`}
                  >
                    {displayName}
                    <span className="text-xs text-gray-500 ml-2">{category?.title}</span>
                    {isUser && <span className="ml-1">💡</span>}
                  </motion.span>
                );
              })}
          </div>

          <div className="text-center">
            <motion.button 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                const favorites = confirmedVoter && votesByPerson[confirmedVoter] ? 
                  Object.keys(votesByPerson[confirmedVoter])
                    .filter(key => votesByPerson[confirmedVoter][key])
                    .map(key => {
                      const [, ...nameParts] = key.split('-');
                      const name = nameParts.join('-');
                      return name.startsWith('user-') ? name.substring(5) : name;
                    }).join('\n') : '';
                navigator.clipboard.writeText(favorites);
                alert('¡Lista copiada! 📋');
              }}
              className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white px-6 py-2 rounded-lg font-medium transition-all shadow-lg"
            >
              📋 Copiar Favoritos
            </motion.button>
          </div>
        </motion.div>
      )}

      {/* Panel de comparación */}
      {getAllVoters().length > 1 && (
        <motion.div 
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-8 bg-white rounded-xl shadow-lg p-6"
        >
          <h3 className="text-2xl font-bold text-center text-gray-800 mb-6">
            👥 Comparación en Tiempo Real
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {getAllVoters().map((voter, voterIndex) => {
              const voterVotes = votesByPerson[voter] || {};
              const voterFavorites = Object.keys(voterVotes).filter(key => voterVotes[key]);
              
              return (
                <motion.div 
                  key={voter}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: voterIndex * 0.1 }}
                  className={`border rounded-lg p-4 ${
                    voter === currentVoter ? 'border-blue-300 bg-blue-50' : 'border-gray-200'
                  }`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-bold text-lg text-gray-800 flex items-center gap-2">
                      {voter}
                      {voter === confirmedVoter && (
                        <span className="text-blue-600 text-sm">(Tú)</span>
                      )}
                      {activeUsers[voter.replace(/[.#$[\]]/g, '_')] && (
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      )}
                    </h4>
                    <span className="bg-gradient-to-r from-blue-100 to-purple-100 text-gray-800 text-sm font-medium px-3 py-1 rounded-full">
                      {voterFavorites.length} votos
                    </span>
                  </div>
                  
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {voterFavorites.length > 0 ? (
                      voterFavorites.map((key, index) => {
                        const [categoryId, ...nameParts] = key.split('-');
                        const name = nameParts.join('-');
                        const isUser = name.startsWith('user-');
                        const displayName = isUser ? name.substring(5) : name;
                        const category = categories.find(c => c.id === categoryId);
                        const popularity = getNamePopularity(categoryId, name);
                        
                        return (
                          <motion.div 
                            key={index}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.02 }}
                            className="flex items-center justify-between text-sm bg-gray-50 rounded p-2"
                          >
                            <div className="flex items-center gap-2">
                              <span className="font-medium text-gray-700">
                                {displayName}
                                {isUser && <span className="text-purple-600 ml-1">💡</span>}
                              </span>
                              {popularity.count > 1 && (
                                <span className="bg-blue-100 text-blue-700 text-xs px-2 py-1 rounded-full border border-blue-200">
                                  {popularity.percentage}%
                                </span>
                              )}
                            </div>
                            <span className="text-gray-500 text-xs">
                              {category?.title}
                            </span>
                          </motion.div>
                        );
                      })
                    ) : (
                      <p className="text-gray-500 text-sm italic">Sin votos aún</p>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      )}

      {/* Instrucciones */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
        className="mt-8 bg-white rounded-xl shadow-lg p-6"
      >
        <h3 className="text-xl font-bold text-center text-gray-800 mb-4">
          🎮 ¿Cómo funciona?
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-center">
          <div className="p-4 bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg">
            <div className="text-3xl mb-2">👆</div>
            <p><strong>1. Vota</strong><br/>Haz clic en ❤️ para votar</p>
          </div>
          <div className="p-4 bg-gradient-to-br from-green-50 to-blue-50 rounded-lg">
            <div className="text-3xl mb-2">👥</div>
            <p><strong>2. Ve en vivo</strong><br/>Observa votos de otros</p>
          </div>
          <div className="p-4 bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg">
            <div className="text-3xl mb-2">💡</div>
            <p><strong>3. Contribuye</strong><br/>Agrega tus ideas</p>
          </div>
          <div className="p-4 bg-gradient-to-br from-yellow-50 to-orange-50 rounded-lg">
            <div className="text-3xl mb-2">🎉</div>
            <p><strong>4. Celebra</strong><br/>¡Disfruta los efectos!</p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default FirebaseVotingApp;
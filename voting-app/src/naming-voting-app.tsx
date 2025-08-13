import { useState } from 'react';
import { Heart, HeartOff, Plus, X, Check } from 'lucide-react';

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

const NamingVotingApp = () => {
  // Estados originales
  const [votesByPerson, setVotesByPerson] = useState<VoteData>({});
  const [currentVoter, setCurrentVoter] = useState('');
  const [showVoterForm, setShowVoterForm] = useState(true);
  const [userSubmissions, setUserSubmissions] = useState<{[key: string]: UserSubmission[]}>({});
  const [showAddForm, setShowAddForm] = useState(false);
  const [newName, setNewName] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [submitterName, setSubmitterName] = useState('');


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

  const handleVote = (categoryId, name) => {
    if (!currentVoter) return;
    
    const key = `${categoryId}-${name}`;
    setVotesByPerson(prev => ({
      ...prev,
      [currentVoter]: {
        ...prev[currentVoter],
        [key]: !prev[currentVoter]?.[key]
      }
    }));
  };

  const handleStartVoting = (voterName) => {
    if (!voterName.trim()) {
      alert('Por favor ingresa tu nombre');
      return;
    }
    setCurrentVoter(voterName.trim());
    setShowVoterForm(false);
  };

  const handleAddName = () => {
    if (!newName.trim() || !selectedCategory || !submitterName.trim()) {
      alert('Por favor completa todos los campos');
      return;
    }

    const categoryKey = selectedCategory;
    setUserSubmissions(prev => ({
      ...prev,
      [categoryKey]: [
        ...(prev[categoryKey] || []),
        {
          name: newName.trim(),
          submitter: submitterName.trim(),
          timestamp: Date.now()
        }
      ]
    }));

    // Limpiar formulario
    setNewName('');
    setSubmitterName('');
    setSelectedCategory('');
    setShowAddForm(false);
    
    alert(`¡"${newName}" agregado exitosamente! 🎉`);
  };

  const removeUserSubmission = (categoryId, index) => {
    setUserSubmissions(prev => ({
      ...prev,
      [categoryId]: prev[categoryId].filter((_, i) => i !== index)
    }));
  };

  const getVoteCount = (categoryId) => {
    if (!currentVoter || !votesByPerson[currentVoter]) return 0;
    return Object.keys(votesByPerson[currentVoter]).filter(key => 
      key.startsWith(categoryId) && votesByPerson[currentVoter][key]
    ).length;
  };

  const getTotalVotes = () => {
    if (!currentVoter || !votesByPerson[currentVoter]) return 0;
    return Object.values(votesByPerson[currentVoter]).filter(Boolean).length;
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
        const name = parts.slice(2).join('-'); // Manejar nombres con guiones
        const category = categories.find(c => c.id === categoryId);
        return { name, category: category?.title || 'Unknown', type: 'user' };
      });

    return [...originalNames, ...userNames];
  };

  const getTotalUserSubmissions = () => {
    return Object.values(userSubmissions).reduce((total, categorySubmissions) => 
      total + categorySubmissions.length, 0
    );
  };

  const getAllVoters = () => {
    return Object.keys(votesByPerson).filter(voter => 
      Object.values(votesByPerson[voter]).some(Boolean)
    );
  };

  const getVoterSelectedNames = (voter) => {
    if (!votesByPerson[voter]) return [];
    
    const voterVotes = votesByPerson[voter];
    return Object.keys(voterVotes)
      .filter(key => voterVotes[key])
      .map(key => {
        const [categoryId, ...nameParts] = key.split('-');
        const name = nameParts.join('-');
        const category = categories.find(c => c.id === categoryId);
        return { 
          name: name.startsWith('user-') ? name.substring(5) : name, 
          category: category?.title || 'Unknown',
          isUserSubmission: name.startsWith('user-')
        };
      });
  };

  const getNamePopularity = (categoryId, name) => {
    const allVoters = getAllVoters();
    if (allVoters.length === 0) return { count: 0, percentage: 0 };
    
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

  const getPopularityBadge = (count, percentage) => {
    if (count === 0) return null;
    if (percentage >= 75) return { text: '🏆 Favorito', color: 'bg-yellow-100 text-yellow-800 border-yellow-300' };
    if (percentage >= 50) return { text: '⭐ Popular', color: 'bg-green-100 text-green-800 border-green-300' };
    if (count > 1) return { text: '👥 Consenso', color: 'bg-blue-100 text-blue-800 border-blue-300' };
    return null;
  };

  return (
    <div className="max-w-7xl mx-auto p-4 bg-gray-50 min-h-screen">
      {/* Modal para Capturar Nombre del Votante */}
      {showVoterForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-2xl p-8 w-full max-w-md">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-2">
                🗳️ Bienvenido a la Votación
              </h2>
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
              
              <button
                onClick={() => handleStartVoting(currentVoter)}
                className="w-full bg-blue-500 hover:bg-blue-600 text-white py-3 rounded-lg font-bold text-lg transition-colors"
              >
                Comenzar a Votar
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Header Simplificado */}
      <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
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
        
        <div className="flex flex-col md:flex-row gap-4 items-center justify-center">
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-4 rounded-lg text-center">
            <span className="text-2xl font-bold text-blue-700">
              {getTotalVotes()} nombres seleccionados
            </span>
          </div>
          
          <div className="bg-gradient-to-r from-green-50 to-blue-50 p-4 rounded-lg text-center">
            <span className="text-lg font-bold text-green-700">
              {getTotalUserSubmissions()} ideas contribuidas
            </span>
          </div>
          
          <button
            onClick={() => setShowAddForm(true)}
            className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white px-6 py-3 rounded-lg font-bold flex items-center gap-2 transition-all"
          >
            <Plus className="w-5 h-5" />
            Agregar Nombre
          </button>
        </div>
      </div>

      {/* Formulario para Agregar Nombres */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-gray-800">💡 Agregar Nueva Idea</h3>
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
                  placeholder="Ej: María García"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Categoría
                </label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option value="">Selecciona una categoría</option>
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
                <button
                  onClick={handleAddName}
                  className="flex-1 bg-purple-500 hover:bg-purple-600 text-white py-3 rounded-lg font-bold flex items-center justify-center gap-2"
                >
                  <Check className="w-5 h-5" />
                  Agregar
                </button>
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
          </div>
        </div>
      )}

      {/* Grid de Categorías - Todas Visibles */}
      <div className="space-y-8">
        {categories.map(category => (
          <div key={category.id} className="bg-white rounded-xl shadow-lg p-6">
            {/* Header de Categoría */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-800">
                  {category.title}
                </h2>
                <p className="text-gray-600">{category.subtitle}</p>
              </div>
              <div className="flex items-center gap-3">
                <div className="bg-gray-100 px-4 py-2 rounded-full">
                  <span className="text-lg font-bold text-gray-700">
                    {getVoteCount(category.id)} ❤️
                  </span>
                </div>
                <button
                  onClick={() => {
                    setSelectedCategory(category.id);
                    setShowAddForm(true);
                  }}
                  className="bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition-colors text-sm"
                >
                  <Plus className="w-4 h-4" />
                  Agregar
                </button>
              </div>
            </div>

            {/* Grid de Nombres Originales */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 mb-4">
              {category.names.map(name => {
                const isVoted = currentVoter && votesByPerson[currentVoter]?.[`${category.id}-${name}`];
                const popularity = getNamePopularity(category.id, name);
                const badge = getPopularityBadge(popularity.count, popularity.percentage);
                
                return (
                  <button
                    key={name}
                    onClick={() => handleVote(category.id, name)}
                    className={`group relative p-4 rounded-lg border-2 transition-all duration-200 hover:scale-105 ${
                      isVoted 
                        ? 'border-red-400 bg-red-50 shadow-lg' 
                        : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-md'
                    }`}
                  >
                    {/* Corazón */}
                    <div className="absolute top-2 right-2">
                      {isVoted ? (
                        <Heart className="w-6 h-6 text-red-500 fill-current" />
                      ) : (
                        <HeartOff className="w-6 h-6 text-gray-300 group-hover:text-red-300" />
                      )}
                    </div>

                    {/* Badge de Popularidad - Esquina superior izquierda */}
                    {badge && (
                      <div className="absolute top-2 left-2">
                        <span className={`text-xs px-2 py-1 rounded-full font-medium border ${badge.color}`}
                              title={`${popularity.count} de ${getAllVoters().length} votantes (${popularity.percentage}%)`}>
                          {badge.text}
                        </span>
                      </div>
                    )}

                    {/* Nombre */}
                    <div className={`pr-8 ${badge ? 'pt-6' : ''}`}>
                      <h3 className={`font-bold text-left text-sm md:text-base ${
                        isVoted ? 'text-red-700' : 'text-gray-800'
                      }`}>
                        {name}
                      </h3>
                      {/* Mostrar porcentaje si hay múltiples votantes */}
                      {getAllVoters().length > 1 && popularity.count > 0 && (
                        <p className="text-xs text-gray-500 mt-1">
                          {popularity.percentage}% ({popularity.count}/{getAllVoters().length})
                        </p>
                      )}
                    </div>

                    {/* Badge si está votado */}
                    {isVoted && (
                      <div className="absolute bottom-2 left-2">
                        <span className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded-full font-medium">
                          ✓ Seleccionado
                        </span>
                      </div>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Nombres Agregados por Usuarios */}
            {userSubmissions[category.id] && userSubmissions[category.id].length > 0 && (
              <div>
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
                    const isVoted = currentVoter && votesByPerson[currentVoter]?.[voteKey];
                    const popularity = getNamePopularity(category.id, `user-${submission.name}`);
                    const badge = getPopularityBadge(popularity.count, popularity.percentage);
                    
                    return (
                      <div key={index} className="relative">
                        <button
                          onClick={() => handleVote(category.id, `user-${submission.name}`)}
                          className={`group relative p-4 rounded-lg border-2 transition-all duration-200 hover:scale-105 w-full ${
                            isVoted 
                              ? 'border-purple-400 bg-purple-50 shadow-lg' 
                              : 'border-purple-200 bg-purple-25 hover:border-purple-300 hover:shadow-md'
                          }`}
                        >
                          {/* Corazón */}
                          <div className="absolute top-2 right-2">
                            {isVoted ? (
                              <Heart className="w-6 h-6 text-purple-500 fill-current" />
                            ) : (
                              <HeartOff className="w-6 h-6 text-purple-300 group-hover:text-purple-400" />
                            )}
                          </div>

                          {/* Badge de Popularidad - Esquina superior izquierda */}
                          {badge && (
                            <div className="absolute top-2 left-2">
                              <span className={`text-xs px-2 py-1 rounded-full font-medium border ${badge.color}`}
                                    title={`${popularity.count} de ${getAllVoters().length} votantes (${popularity.percentage}%)`}>
                                {badge.text}
                              </span>
                            </div>
                          )}

                          {/* Nombre */}
                          <div className={`pr-8 ${badge ? 'pt-6' : ''}`}>
                            <h3 className={`font-bold text-left text-sm md:text-base ${
                              isVoted ? 'text-purple-700' : 'text-purple-800'
                            }`}>
                              {submission.name}
                            </h3>
                            <p className="text-xs text-purple-600 mt-1">
                              por {submission.submitter}
                            </p>
                            {/* Mostrar porcentaje si hay múltiples votantes */}
                            {getAllVoters().length > 1 && popularity.count > 0 && (
                              <p className="text-xs text-purple-500 mt-1">
                                {popularity.percentage}% ({popularity.count}/{getAllVoters().length})
                              </p>
                            )}
                          </div>

                          {/* Badge si está votado */}
                          {isVoted && (
                            <div className="absolute bottom-2 left-2">
                              <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded-full font-medium">
                                ✓ Seleccionado
                              </span>
                            </div>
                          )}
                        </button>
                        
                        {/* Botón eliminar (solo visible en hover) */}
                        <button
                          onClick={() => removeUserSubmission(category.id, index)}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                          title="Eliminar sugerencia"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Resumen Final - Solo si hay votos */}
      {getTotalVotes() > 0 && (
        <div className="mt-8 bg-gradient-to-r from-green-50 to-blue-50 rounded-xl shadow-lg p-6">
          <h3 className="text-2xl font-bold text-center text-gray-800 mb-4">
            🏆 Tus Nombres Favoritos ({getTotalVotes()})
          </h3>
          
          <div className="flex flex-wrap justify-center gap-2">
            {getAllSelectedNames().map((item, index) => (
              <span
                key={index}
                className={`px-4 py-2 rounded-full shadow-md border-2 ${
                  item.type === 'user' 
                    ? 'bg-purple-50 border-purple-200' 
                    : 'bg-white border-green-200'
                }`}
              >
                <span className="font-bold text-gray-800">{item.name}</span>
                <span className="text-xs text-gray-500 ml-2">{item.category}</span>
                {item.type === 'user' && (
                  <span className="text-xs text-purple-600 ml-1">💡</span>
                )}
              </span>
            ))}
          </div>

          <div className="mt-6 text-center">
            <button 
              onClick={() => {
                const names = getAllSelectedNames().map(item => item.name).join('\n');
                navigator.clipboard.writeText(names);
                alert('¡Lista copiada al portapapeles!');
              }}
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg font-medium text-sm transition-colors"
            >
              📋 Copiar Lista de Favoritos
            </button>
          </div>
        </div>
      )}

      {/* Comparación de Votos por Persona */}
      {getAllVoters().length > 1 && (
        <div className="mt-8 bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-2xl font-bold text-center text-gray-800 mb-6">
            👥 Comparación de Votos por Persona
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {getAllVoters().map(voter => {
              const voterNames = getVoterSelectedNames(voter);
              return (
                <div key={voter} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-bold text-lg text-gray-800">
                      {voter} {voter === currentVoter && <span className="text-blue-600">(Tú)</span>}
                    </h4>
                    <span className="bg-blue-100 text-blue-800 text-sm font-medium px-2 py-1 rounded-full">
                      {voterNames.length} votos
                    </span>
                  </div>
                  
                  <div className="space-y-2">
                    {voterNames.length > 0 ? (
                      voterNames.map((item, index) => {
                        // Calcular popularidad para mostrar en la comparación
                        const categoryId = categories.find(c => c.title === item.category)?.id;
                        let popularityInfo = null;
                        
                        if (categoryId) {
                          const nameKey = item.isUserSubmission ? `user-${item.name}` : item.name;
                          const popularity = getNamePopularity(categoryId, nameKey);
                          if (popularity.count > 1) {
                            popularityInfo = {
                              percentage: popularity.percentage,
                              count: popularity.count,
                              total: getAllVoters().length
                            };
                          }
                        }
                        
                        return (
                          <div key={index} className="flex items-center justify-between text-sm">
                            <div className="flex items-center gap-2">
                              <span className="font-medium text-gray-700">
                                {item.name}
                                {item.isUserSubmission && <span className="text-purple-600 ml-1">💡</span>}
                              </span>
                              {popularityInfo && (
                                <span className="bg-blue-50 text-blue-700 text-xs px-2 py-1 rounded-full border border-blue-200"
                                      title={`${popularityInfo.count} de ${popularityInfo.total} votantes seleccionaron este nombre`}>
                                  {popularityInfo.percentage}%
                                </span>
                              )}
                            </div>
                            <span className="text-gray-500 text-xs">
                              {item.category}
                            </span>
                          </div>
                        );
                      })
                    ) : (
                      <p className="text-gray-500 text-sm italic">Sin votos aún</p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
          
          <div className="mt-6 text-center">
            <div className="flex flex-wrap justify-center gap-3">
            <button 
              onClick={() => {
                const allVoters = getAllVoters();
                let simpleComparison = '=== COMPARACIÓN POR PERSONA ===\n\n';
                
                allVoters.forEach(voter => {
                  const voterNames = getVoterSelectedNames(voter);
                  simpleComparison += `👤 ${voter.toUpperCase()} (${voterNames.length} votos):\n`;
                  
                  if (voterNames.length === 0) {
                    simpleComparison += '   • Sin votos aún\n';
                  } else {
                    voterNames.forEach(item => {
                      // Calcular popularidad
                      const categoryId = categories.find(c => c.title === item.category)?.id;
                      let popularityText = '';
                      
                      if (categoryId) {
                        const nameKey = item.isUserSubmission ? `user-${item.name}` : item.name;
                        const popularity = getNamePopularity(categoryId, nameKey);
                        if (popularity.count > 1) {
                          popularityText = ` [${popularity.percentage}%]`;
                        }
                      }
                      
                      simpleComparison += `   • ${item.name}${item.isUserSubmission ? ' 💡' : ''}${popularityText} (${item.category})\n`;
                    });
                  }
                  simpleComparison += '\n';
                });
                
                navigator.clipboard.writeText(simpleComparison);
                alert('¡Comparación por persona copiada al portapapeles!');
              }}
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg font-medium text-sm transition-colors"
            >
              👥 Copiar Comparación con %
            </button>
            
            <button 
              onClick={() => {
                const allVoters = getAllVoters();
                let comparison = '=== COMPARACIÓN DE VOTACIONES ===\n\n';
                
                allVoters.forEach(voter => {
                  const voterNames = getVoterSelectedNames(voter);
                  comparison += `👤 ${voter.toUpperCase()}:\n`;
                  
                  if (voterNames.length === 0) {
                    comparison += '   • Sin votos aún\n';
                  } else {
                    // Agrupar por categoría
                    const byCategory = {};
                    voterNames.forEach(item => {
                      if (!byCategory[item.category]) {
                        byCategory[item.category] = [];
                      }
                      
                      // Calcular popularidad para el reporte
                      const categoryName = item.isUserSubmission ? `user-${item.name}` : item.name;
                      const categoryId = categories.find(c => c.title === item.category)?.id;
                      let popularityInfo = '';
                      
                      if (categoryId) {
                        const popularity = getNamePopularity(categoryId, categoryName);
                        if (popularity.count > 1) {
                          popularityInfo = ` [${popularity.percentage}% - ${popularity.count}/${allVoters.length}]`;
                        }
                      }
                      
                      byCategory[item.category].push(
                        item.name + 
                        (item.isUserSubmission ? ' 💡' : '') + 
                        popularityInfo
                      );
                    });
                    
                    Object.keys(byCategory).forEach(category => {
                      comparison += `   📂 ${category}:\n`;
                      byCategory[category].forEach(name => {
                        comparison += `      • ${name}\n`;
                      });
                    });
                  }
                  comparison += '\n';
                });
                
                comparison += `📊 TOTAL DE VOTANTES: ${allVoters.length}\n`;
                comparison += `📊 TOTAL DE VOTOS: ${allVoters.reduce((total, voter) => total + getVoterSelectedNames(voter).length, 0)}\n\n`;
                
                // Ranking de popularidad
                comparison += '=== RANKING DE POPULARIDAD ===\n\n';
                const allNames = [];
                
                // Recopilar todos los nombres con sus popularidades
                categories.forEach(category => {
                  category.names.forEach(name => {
                    const popularity = getNamePopularity(category.id, name);
                    if (popularity.count > 0) {
                      allNames.push({
                        name,
                        category: category.title,
                        popularity,
                        isUser: false
                      });
                    }
                  });
                  
                  if (userSubmissions[category.id]) {
                    userSubmissions[category.id].forEach(submission => {
                      const popularity = getNamePopularity(category.id, `user-${submission.name}`);
                      if (popularity.count > 0) {
                        allNames.push({
                          name: submission.name,
                          category: category.title,
                          popularity,
                          isUser: true
                        });
                      }
                    });
                  }
                });
                
                // Ordenar por popularidad
                allNames.sort((a, b) => {
                  if (b.popularity.percentage !== a.popularity.percentage) {
                    return b.popularity.percentage - a.popularity.percentage;
                  }
                  return b.popularity.count - a.popularity.count;
                });
                
                allNames.forEach((item, index) => {
                  const medal = index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `${index + 1}.`;
                  comparison += `${medal} ${item.name}${item.isUser ? ' 💡' : ''} - ${item.popularity.percentage}% (${item.popularity.count}/${allVoters.length}) - ${item.category}\n`;
                });
                
                navigator.clipboard.writeText(comparison);
                alert('¡Comparación detallada copiada al portapapeles!');
              }}
              className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg font-medium text-sm transition-colors"
            >
              📊 Copiar Comparación Completa
            </button>
            </div>
          </div>
        </div>
      )}

      {/* Instrucciones Finales */}
      <div className="mt-8 bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-xl font-bold text-center text-gray-800 mb-4">
          💡 ¿Cómo votar?
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
          <div className="p-4 bg-gray-50 rounded-lg">
            <div className="text-3xl mb-2">👆</div>
            <p><strong>1. Haz clic</strong><br/>en los nombres que te gusten</p>
          </div>
          <div className="p-4 bg-gray-50 rounded-lg">
            <div className="text-3xl mb-2">❤️</div>
            <p><strong>2. Ve el corazón</strong><br/>aparecer cuando votes</p>
          </div>
          <div className="p-4 bg-gray-50 rounded-lg">
            <div className="text-3xl mb-2">📋</div>
            <p><strong>3. Copia tu lista</strong><br/>al final para compartir</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NamingVotingApp;
import { useState, useEffect, useMemo } from 'react';
import { auth, db, appId } from './config/firebase';
import { 
  onAuthStateChanged, 
  signInAnonymously,
  User 
} from 'firebase/auth';
import { 
  collection, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  onSnapshot, 
  serverTimestamp, 
  Timestamp 
} from 'firebase/firestore';
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  Copy,
  Save,
  X,
  Tag,
  Terminal,
  CheckCircle2,
  Loader2,
  LayoutGrid,
  List as ListIcon,
  Download,
  Upload,
  FileJson
} from 'lucide-react';

// --- TYPES ---
interface PromptData {
  id: string;
  title: string;
  content: string;
  category: string;
  tags: string[];
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// --- COMPOSANTS ---

export default function PromptManager() {
  const [user, setUser] = useState<User | null>(null);
  const [prompts, setPrompts] = useState<PromptData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');
  
  // État du formulaire (Modal)
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPrompt, setEditingPrompt] = useState<PromptData | null>(null);
  
  // Champs du formulaire
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    category: 'Général',
    tagsInput: ''
  });

  // État de la copie
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // --- AUTHENTIFICATION ---
  useEffect(() => {
    const initAuth = async () => {
      try {
        await signInAnonymously(auth);
      } catch (error) {
        console.error("Erreur d'authentification:", error);
      }
    };
    initAuth();

    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  // --- CHARGEMENT DES DONNÉES (FIRESTORE) ---
  useEffect(() => {
    if (!user) return;

    // Utilisation du chemin privé utilisateur : /artifacts/{appId}/users/{userId}/prompts
    const collectionRef = collection(db, 'artifacts', appId, 'users', user.uid, 'prompts');

    const unsubscribe = onSnapshot(collectionRef, (snapshot) => {
      const loadedPrompts = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as PromptData[];

      // Tri côté client (pour éviter les index complexes Firestore)
      // Tri par date de mise à jour descendante
      loadedPrompts.sort((a, b) => {
        const dateA = a.updatedAt?.toMillis() || 0;
        const dateB = b.updatedAt?.toMillis() || 0;
        return dateB - dateA;
      });

      setPrompts(loadedPrompts);
      setIsLoading(false);
    }, (error) => {
      console.error("Erreur lors du chargement des prompts:", error);
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  // --- GESTIONNAIRES D'ACTIONS ---

  const handleOpenModal = (promptToEdit?: PromptData) => {
    if (promptToEdit) {
      setEditingPrompt(promptToEdit);
      setFormData({
        title: promptToEdit.title,
        content: promptToEdit.content,
        category: promptToEdit.category || 'Général',
        tagsInput: promptToEdit.tags ? promptToEdit.tags.join(', ') : ''
      });
    } else {
      setEditingPrompt(null);
      setFormData({
        title: '',
        content: '',
        category: 'Général',
        tagsInput: ''
      });
    }
    setIsModalOpen(true);
  };

  const handleSave = async () => {
    if (!user) return;
    if (!formData.title.trim() || !formData.content.trim()) return;

    const tags = formData.tagsInput.split(',').map(t => t.trim()).filter(t => t !== '');

    try {
      const collectionRef = collection(db, 'artifacts', appId, 'users', user.uid, 'prompts');

      if (editingPrompt) {
        // Mise à jour
        const docRef = doc(db, 'artifacts', appId, 'users', user.uid, 'prompts', editingPrompt.id);
        await updateDoc(docRef, {
          title: formData.title,
          content: formData.content,
          category: formData.category,
          tags: tags,
          updatedAt: serverTimestamp()
        });
      } else {
        // Création
        await addDoc(collectionRef, {
          title: formData.title,
          content: formData.content,
          category: formData.category,
          tags: tags,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        });
      }
      setIsModalOpen(false);
    } catch (error) {
      console.error("Erreur lors de la sauvegarde:", error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!user) return;
    if (window.confirm("Êtes-vous sûr de vouloir supprimer ce prompt ?")) {
      try {
        const docRef = doc(db, 'artifacts', appId, 'users', user.uid, 'prompts', id);
        await deleteDoc(docRef);
      } catch (error) {
        console.error("Erreur lors de la suppression:", error);
      }
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      // Feedback visuel : on mémorise temporairement qu'on a copié
      const id = Date.now().toString();
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch (error) {
      console.error("Erreur lors de la copie:", error);
    }
  };

  // --- EXPORT/IMPORT ---

  const exportAllPrompts = () => {
    try {
      const exportData = prompts.map(prompt => ({
        title: prompt.title,
        content: prompt.content,
        category: prompt.category,
        tags: prompt.tags,
        createdAt: prompt.createdAt?.toDate().toISOString(),
        updatedAt: prompt.updatedAt?.toDate().toISOString()
      }));

      const dataStr = JSON.stringify(exportData, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `prompts-export-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      const id = Date.now().toString();
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch (error) {
      console.error("Erreur lors de l'export:", error);
      alert("Erreur lors de l'export des prompts");
    }
  };

  const exportSinglePrompt = (prompt: PromptData) => {
    try {
      const exportData = {
        title: prompt.title,
        content: prompt.content,
        category: prompt.category,
        tags: prompt.tags,
        createdAt: prompt.createdAt?.toDate().toISOString(),
        updatedAt: prompt.updatedAt?.toDate().toISOString()
      };

      const dataStr = JSON.stringify(exportData, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `prompt-${prompt.title.replace(/[^a-z0-9]/gi, '-').toLowerCase()}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      const id = Date.now().toString();
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch (error) {
      console.error("Erreur lors de l'export:", error);
      alert("Erreur lors de l'export du prompt");
    }
  };

  const importPrompts = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !user) return;

    try {
      const text = await file.text();
      const importedData = JSON.parse(text);

      // Vérifier si c'est un tableau ou un objet unique
      const promptsToImport = Array.isArray(importedData) ? importedData : [importedData];

      const collectionRef = collection(db, 'artifacts', appId, 'users', user.uid, 'prompts');

      let successCount = 0;
      for (const promptData of promptsToImport) {
        if (promptData.title && promptData.content) {
          await addDoc(collectionRef, {
            title: promptData.title,
            content: promptData.content,
            category: promptData.category || 'Général',
            tags: promptData.tags || [],
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp()
          });
          successCount++;
        }
      }

      alert(`${successCount} prompt(s) importé(s) avec succès !`);

      // Réinitialiser l'input file
      event.target.value = '';
    } catch (error) {
      console.error("Erreur lors de l'import:", error);
      alert("Erreur lors de l'import. Vérifiez que le fichier JSON est valide.");
    }
  };

  const loadExamplePrompts = async () => {
    if (!user) return;
    if (!window.confirm("Voulez-vous charger des exemples de prompts ? Cela ajoutera quelques prompts prédéfinis à votre collection.")) return;

    const examples = [
      {
        title: "Traducteur de code Python vers JavaScript",
        content: "Traduis le code Python suivant en JavaScript moderne (ES6+). Assure-toi d'utiliser les meilleures pratiques JavaScript et explique les différences principales entre les deux versions.",
        category: "Code",
        tags: ["python", "javascript", "traduction", "code"]
      },
      {
        title: "Générateur de documentation technique",
        content: "Génère une documentation technique complète pour le code suivant. Inclus : description générale, paramètres, valeurs de retour, exemples d'utilisation et notes importantes.",
        category: "Code",
        tags: ["documentation", "code", "technique"]
      },
      {
        title: "Optimiseur de prompts",
        content: "Analyse le prompt suivant et propose une version optimisée qui donnera de meilleurs résultats avec les IA. Explique les améliorations apportées.",
        category: "Général",
        tags: ["prompt", "optimisation", "ia"]
      },
      {
        title: "Rédacteur d'article de blog SEO",
        content: "Rédige un article de blog de 800-1000 mots sur [SUJET]. L'article doit être optimisé SEO, informatif, engageant et inclure : introduction accrocheuse, 3-5 sections principales avec sous-titres H2/H3, conclusion avec CTA.",
        category: "Rédaction",
        tags: ["blog", "seo", "rédaction", "marketing"]
      },
      {
        title: "Analyseur de données CSV",
        content: "Analyse le fichier CSV suivant et fournis : statistiques descriptives, tendances principales, anomalies détectées, visualisations recommandées et insights clés pour la prise de décision.",
        category: "Analyse",
        tags: ["données", "csv", "analyse", "statistiques"]
      }
    ];

    try {
      const collectionRef = collection(db, 'artifacts', appId, 'users', user.uid, 'prompts');

      for (const example of examples) {
        await addDoc(collectionRef, {
          ...example,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        });
      }

      alert(`${examples.length} exemples de prompts chargés avec succès !`);
    } catch (error) {
      console.error("Erreur lors du chargement des exemples:", error);
      alert("Erreur lors du chargement des exemples");
    }
  };

  // --- FILTRAGE ET RECHERCHE ---
  const filteredPrompts = useMemo(() => {
    if (!searchTerm.trim()) return prompts;
    
    const term = searchTerm.toLowerCase();
    return prompts.filter(p => 
      p.title.toLowerCase().includes(term) ||
      p.content.toLowerCase().includes(term) ||
      p.category.toLowerCase().includes(term) ||
      p.tags.some(tag => tag.toLowerCase().includes(term))
    );
  }, [prompts, searchTerm]);

  // --- UTILITAIRES ---
  const formatDate = (timestamp: Timestamp | undefined) => {
    if (!timestamp) return "Pas de date";
    const date = timestamp.toDate();
    return new Intl.DateTimeFormat('fr-FR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  // --- AFFICHAGE ---

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
        
        {/* HEADER */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="bg-gradient-to-br from-indigo-500 to-purple-600 p-3 rounded-2xl shadow-lg">
                <Terminal className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-black text-slate-900 tracking-tight">
                  Prompt Manager
                </h1>
                <p className="text-sm text-slate-500 mt-0.5">
                  Organisez et gérez vos prompts IA efficacement
                </p>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => handleOpenModal()}
                className="flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl active:scale-95 transition-all"
              >
                <Plus className="w-5 h-5" />
                <span className="hidden sm:inline">Nouveau Prompt</span>
              </button>

              <div className="flex gap-2">
                <button
                  onClick={exportAllPrompts}
                  disabled={prompts.length === 0}
                  className="flex items-center gap-2 px-4 py-3 bg-white border-2 border-indigo-200 text-indigo-700 font-semibold rounded-xl hover:bg-indigo-50 hover:border-indigo-300 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                  title="Exporter tous les prompts"
                >
                  <Download className="w-5 h-5" />
                  <span className="hidden md:inline">Exporter</span>
                </button>

                <label className="flex items-center gap-2 px-4 py-3 bg-white border-2 border-green-200 text-green-700 font-semibold rounded-xl hover:bg-green-50 hover:border-green-300 active:scale-95 transition-all cursor-pointer shadow-sm">
                  <Upload className="w-5 h-5" />
                  <span className="hidden md:inline">Importer</span>
                  <input
                    type="file"
                    accept=".json"
                    onChange={importPrompts}
                    className="hidden"
                  />
                </label>

                <button
                  onClick={loadExamplePrompts}
                  className="flex items-center gap-2 px-4 py-3 bg-white border-2 border-amber-200 text-amber-700 font-semibold rounded-xl hover:bg-amber-50 hover:border-amber-300 active:scale-95 transition-all shadow-sm"
                  title="Charger des exemples de prompts"
                >
                  <FileJson className="w-5 h-5" />
                  <span className="hidden md:inline">Exemples</span>
                </button>
              </div>
            </div>
          </div>

          {/* BARRE DE RECHERCHE + TOGGLE VUE */}
          <div className="mt-6 flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="text"
                placeholder="Rechercher par titre, contenu, catégorie ou tags..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3.5 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none shadow-sm"
              />
            </div>
            
            <div className="flex gap-2 bg-white border border-slate-200 rounded-xl p-1.5 shadow-sm">
              <button
                onClick={() => setViewMode('table')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
                  viewMode === 'table' 
                    ? 'bg-indigo-100 text-indigo-700' 
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                <ListIcon className="w-4 h-4" />
                <span className="hidden sm:inline">Table</span>
              </button>
              <button
                onClick={() => setViewMode('grid')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
                  viewMode === 'grid' 
                    ? 'bg-indigo-100 text-indigo-700' 
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                <LayoutGrid className="w-4 h-4" />
                <span className="hidden sm:inline">Grille</span>
              </button>
            </div>
          </div>
        </div>

        {/* CONTENU PRINCIPAL */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="w-12 h-12 text-indigo-500 animate-spin mb-4" />
            <p className="text-slate-500 font-medium">Chargement de vos prompts...</p>
          </div>
        ) : filteredPrompts.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center shadow-sm border border-slate-200">
            <div className="bg-slate-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Terminal className="w-10 h-10 text-slate-400" />
            </div>
            <h3 className="text-xl font-bold text-slate-800 mb-2">
              {searchTerm ? "Aucun résultat trouvé" : "Aucun prompt enregistré"}
            </h3>
            <p className="text-slate-500 mb-6">
              {searchTerm 
                ? "Essayez avec d'autres mots-clés" 
                : "Créez votre premier prompt pour commencer"}
            </p>
            {!searchTerm && (
              <button 
                onClick={() => handleOpenModal()}
                className="inline-flex items-center gap-2 px-5 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl shadow-md hover:shadow-lg transition-all"
              >
                <Plus className="w-5 h-5" />
                Créer un prompt
              </button>
            )}
          </div>
        ) : (
          <>
            {/* STATISTIQUES RAPIDES */}
            <div className="mb-6 flex gap-4 overflow-x-auto pb-2">
              <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-200 min-w-[140px]">
                <div className="text-3xl font-bold text-indigo-600">{prompts.length}</div>
                <div className="text-sm text-slate-500 mt-1">Total prompts</div>
              </div>
              <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-200 min-w-[140px]">
                <div className="text-3xl font-bold text-purple-600">
                  {[...new Set(prompts.map(p => p.category))].length}
                </div>
                <div className="text-sm text-slate-500 mt-1">Catégories</div>
              </div>
              <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-200 min-w-[140px]">
                <div className="text-3xl font-bold text-blue-600">
                  {[...new Set(prompts.flatMap(p => p.tags))].length}
                </div>
                <div className="text-sm text-slate-500 mt-1">Tags uniques</div>
              </div>
            </div>

            {/* VUE TABLE */}
            {viewMode === 'table' && (
              <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-200">
                        <th className="text-left p-4 font-bold text-slate-700 text-sm">Titre</th>
                        <th className="text-left p-4 font-bold text-slate-700 text-sm">Catégorie</th>
                        <th className="text-left p-4 font-bold text-slate-700 text-sm">Contenu</th>
                        <th className="text-left p-4 font-bold text-slate-700 text-sm">Tags</th>
                        <th className="text-left p-4 font-bold text-slate-700 text-sm">Modifié</th>
                        <th className="text-right p-4 font-bold text-slate-700 text-sm">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredPrompts.map((prompt) => (
                        <tr key={prompt.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors group">
                          <td className="p-4 align-top">
                            <div className="font-semibold text-slate-800">{prompt.title}</div>
                          </td>
                          <td className="p-4 align-top">
                            <span className="inline-block px-3 py-1 text-xs font-medium bg-indigo-50 text-indigo-700 rounded-full">
                              {prompt.category}
                            </span>
                          </td>
                          <td className="p-4 align-top">
                            <div className="max-w-md">
                              <p className="text-sm text-slate-600 line-clamp-2 font-mono bg-slate-50 px-2 py-1 rounded">
                                {prompt.content}
                              </p>
                            </div>
                          </td>
                          <td className="p-4 align-top">
                            <div className="flex flex-wrap gap-1 max-w-xs">
                              {prompt.tags?.slice(0, 3).map((tag, i) => (
                                <span 
                                  key={i}
                                  className="text-xs px-2 py-1 bg-slate-100 text-slate-600 rounded-md"
                                >
                                  #{tag}
                                </span>
                              ))}
                              {prompt.tags?.length > 3 && (
                                <span className="text-xs px-2 py-1 bg-slate-100 text-slate-600 rounded-md">
                                  +{prompt.tags.length - 3}
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="p-4 align-top text-sm text-slate-500 whitespace-nowrap">
                            {formatDate(prompt.updatedAt)}
                          </td>
                          <td className="p-4 align-top text-right">
                            <div className="flex justify-end gap-2 opacity-60 group-hover:opacity-100 transition-opacity">
                              <button
                                onClick={() => copyToClipboard(prompt.content)}
                                className="p-2 hover:bg-indigo-50 text-slate-500 hover:text-indigo-600 rounded-lg transition-colors"
                                title="Copier"
                              >
                                <Copy className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => exportSinglePrompt(prompt)}
                                className="p-2 hover:bg-green-50 text-slate-500 hover:text-green-600 rounded-lg transition-colors"
                                title="Exporter ce prompt"
                              >
                                <Download className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleOpenModal(prompt)}
                                className="p-2 hover:bg-amber-50 text-slate-500 hover:text-amber-600 rounded-lg transition-colors"
                                title="Modifier"
                              >
                                <Edit2 className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleDelete(prompt.id)}
                                className="p-2 hover:bg-red-50 text-slate-500 hover:text-red-600 rounded-lg transition-colors"
                                title="Supprimer"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* VUE GRILLE (Cartes) */}
            {viewMode === 'grid' && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredPrompts.map((prompt) => (
                  <div key={prompt.id} className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200 hover:shadow-md transition-shadow flex flex-col h-full">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <span className="text-xs font-medium text-indigo-600 bg-indigo-50 px-2 py-1 rounded-full mb-2 inline-block">
                          {prompt.category}
                        </span>
                        <h3 className="font-bold text-slate-800 text-lg">{prompt.title}</h3>
                      </div>
                      <div className="flex gap-1">
                        <button
                          onClick={() => exportSinglePrompt(prompt)}
                          className="p-1.5 text-slate-400 hover:text-green-600 hover:bg-green-50 rounded transition-colors"
                          title="Exporter ce prompt"
                        >
                          <Download className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleOpenModal(prompt)}
                          className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded transition-colors"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(prompt.id)}
                          className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    
                    <div className="flex-grow mb-4 relative group/copy">
                      <div className="absolute top-2 right-2 opacity-0 group-hover/copy:opacity-100 transition-opacity">
                         <button 
                            onClick={() => copyToClipboard(prompt.content)}
                            className="bg-white/90 backdrop-blur text-indigo-600 p-1.5 rounded-md shadow-sm border border-slate-200 hover:bg-indigo-50"
                         >
                           <Copy className="w-4 h-4" />
                         </button>
                      </div>
                      <p className="text-sm text-slate-600 bg-slate-50 p-3 rounded-lg border border-slate-100 font-mono h-32 overflow-y-auto scrollbar-thin">
                        {prompt.content}
                      </p>
                    </div>

                    <div className="flex items-center justify-between pt-3 border-t border-slate-100 mt-auto">
                      <div className="flex items-center gap-2 overflow-hidden">
                        <Tag className="w-3 h-3 text-slate-400 flex-shrink-0" />
                        <div className="flex gap-1 overflow-x-auto scrollbar-none">
                          {prompt.tags?.map((tag, i) => (
                            <span key={i} className="text-xs text-slate-500 whitespace-nowrap">
                              #{tag}
                            </span>
                          ))}
                        </div>
                      </div>
                      <span className="text-xs text-slate-400 whitespace-nowrap ml-2">
                        {formatDate(prompt.updatedAt)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {/* MODAL Formulaire */}
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm transition-opacity">
            <div className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
              <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                  {editingPrompt ? <Edit2 className="w-5 h-5 text-amber-500" /> : <Plus className="w-5 h-5 text-indigo-500" />}
                  {editingPrompt ? 'Modifier le prompt' : 'Créer un nouveau prompt'}
                </h2>
                <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 hover:bg-slate-200 p-2 rounded-full transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <div className="p-6 space-y-4 overflow-y-auto">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-sm font-semibold text-slate-700">Titre</label>
                    <input
                      type="text"
                      value={formData.title}
                      onChange={(e) => setFormData({...formData, title: e.target.value})}
                      placeholder="Ex: Traducteur Python vers JS"
                      className="w-full p-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-sm font-semibold text-slate-700">Catégorie</label>
                    <select
                      value={formData.category}
                      onChange={(e) => setFormData({...formData, category: e.target.value})}
                      className="w-full p-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                    >
                      <option value="Général">Général</option>
                      <option value="Code">Code & Dev</option>
                      <option value="Rédaction">Rédaction</option>
                      <option value="Marketing">Marketing</option>
                      <option value="Image">Génération d'Image</option>
                      <option value="Analyse">Analyse de Données</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-sm font-semibold text-slate-700">Contenu du Prompt</label>
                  <textarea
                    value={formData.content}
                    onChange={(e) => setFormData({...formData, content: e.target.value})}
                    placeholder="Écrivez votre prompt ici..."
                    rows={8}
                    className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none font-mono text-sm resize-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                    <Tag className="w-4 h-4" />
                    Tags (séparés par des virgules)
                  </label>
                  <input
                    type="text"
                    value={formData.tagsInput}
                    onChange={(e) => setFormData({...formData, tagsInput: e.target.value})}
                    placeholder="python, javascript, tutoriel..."
                    className="w-full p-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                  />
                </div>
              </div>

              <div className="p-5 border-t border-slate-100 bg-slate-50 flex justify-end gap-3">
                <button 
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-2.5 text-slate-600 font-medium hover:bg-slate-200 rounded-xl transition-colors"
                >
                  Annuler
                </button>
                <button 
                  onClick={handleSave}
                  disabled={!formData.title || !formData.content}
                  className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-xl shadow-md hover:shadow-lg active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Save className="w-4 h-4" />
                  Enregistrer
                </button>
              </div>
            </div>
          </div>
        )}

        {/* NOTIFICATION DE COPIE */}
        {copiedId && (
          <div className="fixed bottom-6 right-6 bg-green-500 text-white px-5 py-3 rounded-xl shadow-lg flex items-center gap-2 animate-slide-up">
            <CheckCircle2 className="w-5 h-5" />
            <span className="font-medium">Copié dans le presse-papiers !</span>
          </div>
        )}

      </div>
    </div>
  );
}

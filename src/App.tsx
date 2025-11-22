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

  const EXAMPLE_PROMPTS = [
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

  // Calculer quels exemples sont déjà chargés
  const examplesStatus = useMemo(() => {
    const existingTitles = new Set(prompts.map(p => p.title));
    const missing = EXAMPLE_PROMPTS.filter(ex => !existingTitles.has(ex.title));
    const existing = EXAMPLE_PROMPTS.filter(ex => existingTitles.has(ex.title));
    return {
      missingCount: missing.length,
      existingCount: existing.length,
      allLoaded: missing.length === 0,
      missingExamples: missing
    };
  }, [prompts]);

  const loadExamplePrompts = async () => {
    if (!user) return;

    const { missingCount, existingCount, missingExamples } = examplesStatus;

    if (missingCount === 0) {
      alert("Tous les exemples sont déjà chargés dans votre collection !");
      return;
    }

    const confirmMessage = existingCount > 0
      ? `${existingCount} exemple(s) déjà présent(s). Voulez-vous charger les ${missingCount} exemple(s) manquant(s) ?`
      : `Voulez-vous charger ${missingCount} exemples de prompts prédéfinis ?`;

    if (!window.confirm(confirmMessage)) return;

    try {
      const collectionRef = collection(db, 'artifacts', appId, 'users', user.uid, 'prompts');

      for (const example of missingExamples) {
        await addDoc(collectionRef, {
          ...example,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        });
      }

      alert(`${missingExamples.length} exemple(s) ajouté(s) avec succès !`);
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
          <div className="flex flex-col gap-6">
            {/* Logo et titre */}
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl blur opacity-50"></div>
                <div className="relative bg-gradient-to-br from-indigo-500 to-purple-600 p-4 rounded-2xl shadow-lg">
                  <Terminal className="w-8 h-8 text-white" />
                </div>
              </div>
              <div>
                <h1 className="text-4xl font-black text-slate-900 tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-600">
                  Prompt Manager
                </h1>
                <p className="text-sm text-slate-600 mt-1 font-medium">
                  Organisez et gérez vos prompts IA efficacement
                </p>
              </div>
            </div>

            {/* Actions principales */}
            <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
              <button
                onClick={() => handleOpenModal()}
                className="group relative flex items-center justify-center gap-2 px-6 py-3.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-bold rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-0.5"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-indigo-400 to-purple-400 rounded-xl blur opacity-30 group-hover:opacity-50 transition-opacity"></div>
                <Plus className="w-5 h-5 relative z-10" />
                <span className="relative z-10">Nouveau Prompt</span>
              </button>

              <div className="flex gap-3 flex-1 sm:flex-initial">
                <button
                  onClick={exportAllPrompts}
                  disabled={prompts.length === 0}
                  className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-5 py-3.5 bg-white hover:bg-gradient-to-br hover:from-indigo-50 hover:to-purple-50 border border-slate-200 hover:border-indigo-300 text-slate-700 hover:text-indigo-700 font-semibold rounded-xl shadow-sm hover:shadow-md transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-white"
                  title="Exporter tous les prompts"
                >
                  <Download className="w-5 h-5" />
                  <span className="hidden lg:inline">Exporter</span>
                </button>

                <label className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-5 py-3.5 bg-white hover:bg-gradient-to-br hover:from-green-50 hover:to-emerald-50 border border-slate-200 hover:border-green-300 text-slate-700 hover:text-green-700 font-semibold rounded-xl shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer">
                  <Upload className="w-5 h-5" />
                  <span className="hidden lg:inline">Importer</span>
                  <input
                    type="file"
                    accept=".json"
                    onChange={importPrompts}
                    className="hidden"
                  />
                </label>

                <button
                  onClick={loadExamplePrompts}
                  disabled={examplesStatus.allLoaded}
                  className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-5 py-3.5 bg-white hover:bg-gradient-to-br hover:from-amber-50 hover:to-orange-50 border border-slate-200 hover:border-amber-300 text-slate-700 hover:text-amber-700 font-semibold rounded-xl shadow-sm hover:shadow-md transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-white"
                  title={
                    examplesStatus.allLoaded
                      ? "Tous les exemples sont déjà chargés"
                      : examplesStatus.existingCount > 0
                      ? `${examplesStatus.missingCount} exemple(s) manquant(s) à charger`
                      : "Charger 5 exemples de prompts prédéfinis"
                  }
                >
                  <FileJson className="w-5 h-5" />
                  <span className="hidden lg:inline">
                    Exemples {examplesStatus.existingCount > 0 && !examplesStatus.allLoaded && `(${examplesStatus.missingCount})`}
                  </span>
                </button>
              </div>
            </div>
          </div>

          {/* BARRE DE RECHERCHE + TOGGLE VUE */}
          <div className="mt-6 flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1 group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
              <input
                type="text"
                placeholder="Rechercher par titre, contenu, catégorie ou tags..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-4 bg-white/80 backdrop-blur-sm border-2 border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 hover:border-slate-300 outline-none shadow-sm hover:shadow transition-all font-medium text-slate-700 placeholder:text-slate-400"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute right-4 top-1/2 -translate-y-1/2 p-1 hover:bg-slate-100 rounded-full transition-colors"
                >
                  <X className="w-4 h-4 text-slate-400" />
                </button>
              )}
            </div>

            <div className="flex gap-2 bg-white/80 backdrop-blur-sm border-2 border-slate-200 rounded-xl p-1.5 shadow-sm">
              <button
                onClick={() => setViewMode('table')}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-lg font-semibold transition-all duration-200 ${
                  viewMode === 'table'
                    ? 'bg-gradient-to-br from-indigo-500 to-purple-600 text-white shadow-md transform scale-105'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                <ListIcon className="w-5 h-5" />
                <span className="hidden sm:inline">Table</span>
              </button>
              <button
                onClick={() => setViewMode('grid')}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-lg font-semibold transition-all duration-200 ${
                  viewMode === 'grid'
                    ? 'bg-gradient-to-br from-indigo-500 to-purple-600 text-white shadow-md transform scale-105'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                <LayoutGrid className="w-5 h-5" />
                <span className="hidden sm:inline">Grille</span>
              </button>
            </div>
          </div>
        </div>

        {/* CONTENU PRINCIPAL */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-24">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full blur-xl opacity-30 animate-pulse"></div>
              <Loader2 className="relative w-16 h-16 text-indigo-600 animate-spin" />
            </div>
            <p className="text-slate-600 font-bold text-lg mt-6">Chargement de vos prompts...</p>
            <p className="text-slate-400 text-sm mt-2">Veuillez patienter</p>
          </div>
        ) : filteredPrompts.length === 0 ? (
          <div className="bg-gradient-to-br from-white to-slate-50 rounded-3xl p-16 text-center shadow-sm border-2 border-slate-200/50">
            <div className="relative inline-block mb-6">
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full blur-2xl opacity-20"></div>
              <div className="relative bg-gradient-to-br from-indigo-100 to-purple-100 w-24 h-24 rounded-full flex items-center justify-center">
                <Terminal className="w-12 h-12 text-indigo-600" />
              </div>
            </div>
            <h3 className="text-3xl font-black text-slate-900 mb-3">
              {searchTerm ? "Aucun résultat trouvé" : "Aucun prompt enregistré"}
            </h3>
            <p className="text-slate-600 font-medium text-lg mb-8 max-w-md mx-auto">
              {searchTerm
                ? "Essayez avec d'autres mots-clés ou affinez votre recherche"
                : "Créez votre premier prompt pour commencer à organiser vos idées"}
            </p>
            {!searchTerm && (
              <button
                onClick={() => handleOpenModal()}
                className="group relative inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-bold rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-indigo-400 to-purple-400 rounded-xl blur opacity-30 group-hover:opacity-50 transition-opacity"></div>
                <Plus className="w-6 h-6 relative z-10" />
                <span className="relative z-10">Créer mon premier prompt</span>
              </button>
            )}
          </div>
        ) : (
          <>
            {/* STATISTIQUES RAPIDES */}
            <div className="mb-6 grid grid-cols-3 gap-4">
              <div className="group bg-gradient-to-br from-white to-indigo-50/30 rounded-2xl p-5 shadow-sm border-2 border-slate-200/50 hover:border-indigo-300 hover:shadow-md transition-all duration-300">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-indigo-100 rounded-lg group-hover:bg-indigo-200 transition-colors">
                    <Terminal className="w-5 h-5 text-indigo-600" />
                  </div>
                  <div className="text-sm font-semibold text-slate-600">Total prompts</div>
                </div>
                <div className="text-4xl font-black bg-gradient-to-br from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                  {prompts.length}
                </div>
              </div>
              <div className="group bg-gradient-to-br from-white to-purple-50/30 rounded-2xl p-5 shadow-sm border-2 border-slate-200/50 hover:border-purple-300 hover:shadow-md transition-all duration-300">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-purple-100 rounded-lg group-hover:bg-purple-200 transition-colors">
                    <Tag className="w-5 h-5 text-purple-600" />
                  </div>
                  <div className="text-sm font-semibold text-slate-600">Catégories</div>
                </div>
                <div className="text-4xl font-black bg-gradient-to-br from-purple-600 to-pink-600 bg-clip-text text-transparent">
                  {[...new Set(prompts.map(p => p.category))].length}
                </div>
              </div>
              <div className="group bg-gradient-to-br from-white to-blue-50/30 rounded-2xl p-5 shadow-sm border-2 border-slate-200/50 hover:border-blue-300 hover:shadow-md transition-all duration-300">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-blue-100 rounded-lg group-hover:bg-blue-200 transition-colors">
                    <Tag className="w-5 h-5 text-blue-600" />
                  </div>
                  <div className="text-sm font-semibold text-slate-600">Tags uniques</div>
                </div>
                <div className="text-4xl font-black bg-gradient-to-br from-blue-600 to-cyan-600 bg-clip-text text-transparent">
                  {[...new Set(prompts.flatMap(p => p.tags))].length}
                </div>
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
                  <div key={prompt.id} className="group bg-white rounded-2xl p-6 shadow-sm border-2 border-slate-200/50 hover:border-indigo-300 hover:shadow-xl transition-all duration-300 flex flex-col h-full transform hover:-translate-y-1">
                    {/* Header de la carte */}
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-3">
                          <span className="text-xs font-bold text-indigo-600 bg-gradient-to-br from-indigo-50 to-purple-50 px-3 py-1.5 rounded-full border border-indigo-200">
                            {prompt.category}
                          </span>
                        </div>
                        <h3 className="font-black text-slate-900 text-xl leading-tight group-hover:text-indigo-700 transition-colors">
                          {prompt.title}
                        </h3>
                      </div>
                    </div>

                    {/* Contenu */}
                    <div className="flex-grow mb-4 relative">
                      <div className="absolute -top-2 -right-2 opacity-0 group-hover:opacity-100 transition-all duration-200 z-10">
                         <button
                            onClick={() => copyToClipboard(prompt.content)}
                            className="bg-gradient-to-br from-indigo-500 to-purple-600 text-white p-2.5 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-110 transition-all"
                            title="Copier le contenu"
                         >
                           <Copy className="w-4 h-4" />
                         </button>
                      </div>
                      <div className="bg-gradient-to-br from-slate-50 to-slate-100/50 p-4 rounded-xl border-2 border-slate-200/50 h-36 overflow-y-auto">
                        <p className="text-sm text-slate-700 font-mono leading-relaxed">
                          {prompt.content}
                        </p>
                      </div>
                    </div>

                    {/* Tags */}
                    {prompt.tags && prompt.tags.length > 0 && (
                      <div className="flex items-center gap-2 mb-4 overflow-hidden">
                        <Tag className="w-4 h-4 text-slate-400 flex-shrink-0" />
                        <div className="flex gap-2 overflow-x-auto scrollbar-none">
                          {prompt.tags?.slice(0, 4).map((tag, i) => (
                            <span key={i} className="text-xs font-semibold bg-slate-100 text-slate-600 px-2.5 py-1 rounded-md whitespace-nowrap">
                              #{tag}
                            </span>
                          ))}
                          {prompt.tags?.length > 4 && (
                            <span className="text-xs font-semibold bg-slate-200 text-slate-600 px-2.5 py-1 rounded-md whitespace-nowrap">
                              +{prompt.tags.length - 4}
                            </span>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Footer avec actions */}
                    <div className="flex items-center justify-between pt-4 border-t-2 border-slate-100 mt-auto">
                      <span className="text-xs font-medium text-slate-500">
                        {formatDate(prompt.updatedAt)}
                      </span>
                      <div className="flex gap-1">
                        <button
                          onClick={() => exportSinglePrompt(prompt)}
                          className="p-2 text-slate-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-all hover:scale-110"
                          title="Exporter"
                        >
                          <Download className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleOpenModal(prompt)}
                          className="p-2 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-all hover:scale-110"
                          title="Modifier"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(prompt.id)}
                          className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all hover:scale-110"
                          title="Supprimer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {/* MODAL Formulaire */}
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md transition-all animate-in fade-in duration-200">
            <div className="bg-white rounded-3xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] border-2 border-slate-200/50 animate-in zoom-in-95 duration-200">
              <div className="p-6 border-b-2 border-slate-100 flex justify-between items-center bg-gradient-to-br from-slate-50 to-white">
                <h2 className="text-2xl font-black text-slate-900 flex items-center gap-3">
                  <div className={`p-2.5 rounded-xl ${editingPrompt ? 'bg-amber-100' : 'bg-indigo-100'}`}>
                    {editingPrompt ? <Edit2 className="w-6 h-6 text-amber-600" /> : <Plus className="w-6 h-6 text-indigo-600" />}
                  </div>
                  {editingPrompt ? 'Modifier le prompt' : 'Créer un nouveau prompt'}
                </h2>
                <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-700 hover:bg-slate-200 p-2.5 rounded-xl transition-all hover:scale-110">
                  <X className="w-6 h-6" />
                </button>
              </div>
              
              <div className="p-6 space-y-5 overflow-y-auto">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                      <Terminal className="w-4 h-4 text-indigo-600" />
                      Titre
                    </label>
                    <input
                      type="text"
                      value={formData.title}
                      onChange={(e) => setFormData({...formData, title: e.target.value})}
                      placeholder="Ex: Traducteur Python vers JS"
                      className="w-full p-3.5 bg-white border-2 border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 hover:border-slate-300 outline-none transition-all font-medium"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                      <Tag className="w-4 h-4 text-purple-600" />
                      Catégorie
                    </label>
                    <select
                      value={formData.category}
                      onChange={(e) => setFormData({...formData, category: e.target.value})}
                      className="w-full p-3.5 bg-white border-2 border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 hover:border-slate-300 outline-none transition-all font-medium"
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

                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700">Contenu du Prompt</label>
                  <textarea
                    value={formData.content}
                    onChange={(e) => setFormData({...formData, content: e.target.value})}
                    placeholder="Écrivez votre prompt ici..."
                    rows={10}
                    className="w-full p-4 bg-gradient-to-br from-slate-50 to-slate-100/50 border-2 border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 hover:border-slate-300 outline-none font-mono text-sm resize-none transition-all"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                    <Tag className="w-4 h-4 text-blue-600" />
                    Tags (séparés par des virgules)
                  </label>
                  <input
                    type="text"
                    value={formData.tagsInput}
                    onChange={(e) => setFormData({...formData, tagsInput: e.target.value})}
                    placeholder="python, javascript, tutoriel..."
                    className="w-full p-3.5 bg-white border-2 border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 hover:border-slate-300 outline-none transition-all font-medium"
                  />
                </div>
              </div>

              <div className="p-6 border-t-2 border-slate-100 bg-gradient-to-br from-slate-50 to-white flex justify-end gap-3">
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="px-6 py-3 text-slate-700 font-bold hover:bg-slate-200 rounded-xl transition-all hover:scale-105"
                >
                  Annuler
                </button>
                <button
                  onClick={handleSave}
                  disabled={!formData.title || !formData.content}
                  className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                >
                  <Save className="w-5 h-5" />
                  Enregistrer
                </button>
              </div>
            </div>
          </div>
        )}

        {/* NOTIFICATION DE COPIE */}
        {copiedId && (
          <div className="fixed bottom-6 right-6 bg-gradient-to-r from-green-500 to-emerald-600 text-white px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-3 animate-in slide-in-from-bottom-5 duration-300 border-2 border-green-400/50">
            <div className="p-1 bg-white/20 rounded-lg">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <span className="font-bold text-lg">Copié dans le presse-papiers !</span>
          </div>
        )}

      </div>
    </div>
  );
}

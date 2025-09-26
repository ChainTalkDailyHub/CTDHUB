import { useState, useEffect } from 'react';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import WalletButton from '../../components/WalletButton';
import { AdminSystem, ADMIN_CONFIG } from '@/lib/adminSystem';

// Declare Ethereum interface for TypeScript
declare global {
  interface Window {
    ethereum?: {
      request: (args: { method: string; params?: any[] }) => Promise<any>;
      on: (event: string, callback: (data: any) => void) => void;
      removeListener: (event: string, callback: (data: any) => void) => void;
    };
  }
}

interface Lesson {
  id: string;
  title: string;
  description: string;
  youtubeUrl: string;
  duration?: string;
}

interface DeveloperProfile {
  walletAddress: string;
  name: string;
  age: number;
  profession: string;
  specialty: string;
  createdAt: string;
}

interface Course {
  id: string;
  title: string;
  description: string;
  thumbnail?: string;
  category: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  lessons: Lesson[];
  createdAt: string;
  views: number;
  likes: number;
  creator: string;
  creatorProfile: DeveloperProfile;
}

interface Video {
  id: string;
  title: string;
  description: string;
  url: string;
  thumbnail: string;
  uploadDate: string;
  views: number;
  likes: number;
}

export default function DeveloperPage() {
  const [isConnected, setIsConnected] = useState(false);
  const [walletAddress, setWalletAddress] = useState('');
  const [developerProfile, setDeveloperProfile] = useState<DeveloperProfile | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  
  // Content management states
  const [activeTab, setActiveTab] = useState<'courses' | 'videos'>('courses');
  const [courses, setCourses] = useState<Course[]>([]);
  const [videos, setVideos] = useState<Video[]>([]);
  const [showCourseForm, setShowCourseForm] = useState(false);
  const [showVideoForm, setShowVideoForm] = useState(false);
  
  // Profile form state
  const [profileData, setProfileData] = useState({
    name: '',
    age: '',
    profession: '',
    specialty: ''
  });
  
  // Course form state
  const [courseData, setCourseData] = useState({
    title: '',
    description: '',
    thumbnail: '',
    category: 'Blockchain',
    difficulty: 'Beginner' as Course['difficulty']
  });
  const [lessons, setLessons] = useState<Omit<Lesson, 'id'>[]>([
    { title: '', description: '', youtubeUrl: '', duration: '' }
  ]);

  // Video form state
  const [videoData, setVideoData] = useState({
    title: '',
    description: '',
    url: '',
    thumbnail: ''
  });

  useEffect(() => {
    // Check wallet connection
    const checkWalletConnection = () => {
      if (typeof window !== 'undefined' && window.ethereum) {
        window.ethereum.request({ method: 'eth_accounts' })
          .then((accounts: string[]) => {
            if (accounts.length > 0) {
              setIsConnected(true);
              setWalletAddress(accounts[0]);
              
              // Verificar se é admin
              setIsAdmin(AdminSystem.isAdmin(accounts[0]));
              
              // Load developer profile
              const savedProfile = localStorage.getItem(`developer-profile-${accounts[0]}`);
              if (savedProfile) {
                setDeveloperProfile(JSON.parse(savedProfile));
              }
            }
          })
          .catch((error: any) => {
            console.error('Error checking wallet connection:', error);
          });
      }
    };

    checkWalletConnection();

    // Listen for account changes
    if (typeof window !== 'undefined' && window.ethereum) {
      window.ethereum.on('accountsChanged', (accounts: string[]) => {
        if (accounts.length > 0) {
          setIsConnected(true);
          setWalletAddress(accounts[0]);
          
          // Verificar se é admin
          setIsAdmin(AdminSystem.isAdmin(accounts[0]));
          
          // Load profile for new account
          const savedProfile = localStorage.getItem(`developer-profile-${accounts[0]}`);
          if (savedProfile) {
            setDeveloperProfile(JSON.parse(savedProfile));
          } else {
            setDeveloperProfile(null);
          }
        } else {
          setIsConnected(false);
          setWalletAddress('');
          setDeveloperProfile(null);
        }
      });
    }

    // Load courses and videos
    const savedCourses = localStorage.getItem('developer-courses');
    if (savedCourses) {
      const communityCourses = JSON.parse(savedCourses);
      
      // Se for admin, incluir cursos admin na lista para gerenciamento
      if (AdminSystem.isAdmin(walletAddress)) {
        const adminCourses = AdminSystem.getAllAdminCourses();
        // Converter cursos admin para o formato de Course para exibição
        const formattedAdminCourses = adminCourses.map(adminCourse => ({
          id: adminCourse.id,
          title: adminCourse.title,
          description: adminCourse.description,
          thumbnail: adminCourse.thumbnail,
          category: adminCourse.category || 'Blockchain',
          difficulty: (adminCourse.difficulty || 'Beginner') as 'Beginner' | 'Intermediate' | 'Advanced',
          lessons: [{ 
            id: '1', 
            title: 'Aula Principal', 
            description: adminCourse.description,
            youtubeUrl: adminCourse.youtubeUrl 
          }],
          createdAt: adminCourse.createdAt,
          views: 0,
          likes: 0,
          creator: adminCourse.creator,
          creatorProfile: {
            walletAddress: adminCourse.creatorAddress,
            name: adminCourse.creator,
            age: 0,
            profession: 'Admin',
            specialty: 'CTDHUB',
            createdAt: adminCourse.createdAt
          }
        }));
        
        setCourses([...formattedAdminCourses, ...communityCourses]);
      } else {
        setCourses(communityCourses);
      }
    } else if (AdminSystem.isAdmin(walletAddress)) {
      // Se for admin e não há cursos da comunidade, carregar só os cursos admin
      const adminCourses = AdminSystem.getAllAdminCourses();
      const formattedAdminCourses = adminCourses.map(adminCourse => ({
        id: adminCourse.id,
        title: adminCourse.title,
        description: adminCourse.description,
        thumbnail: adminCourse.thumbnail,
        category: adminCourse.category || 'Blockchain',
        difficulty: (adminCourse.difficulty || 'Beginner') as 'Beginner' | 'Intermediate' | 'Advanced',
        lessons: [{ 
          id: '1', 
          title: 'Aula Principal', 
          description: adminCourse.description,
          youtubeUrl: adminCourse.youtubeUrl 
        }],
        createdAt: adminCourse.createdAt,
        views: 0,
        likes: 0,
        creator: adminCourse.creator,
        creatorProfile: {
          walletAddress: adminCourse.creatorAddress,
          name: adminCourse.creator,
          age: 0,
          profession: 'Admin',
          specialty: 'CTDHUB',
          createdAt: adminCourse.createdAt
        }
      }));
      
      setCourses(formattedAdminCourses);
    }
    
    const savedVideos = localStorage.getItem('developer-videos');
    if (savedVideos) {
      setVideos(JSON.parse(savedVideos));
    }
  }, []);

  // Profile functions
  const handleProfileSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isConnected || !walletAddress) return;

    const newProfile: DeveloperProfile = {
      walletAddress,
      name: profileData.name,
      age: parseInt(profileData.age),
      profession: profileData.profession,
      specialty: profileData.specialty,
      createdAt: new Date().toISOString()
    };

    // Save profile to localStorage
    localStorage.setItem(`developer-profile-${walletAddress}`, JSON.stringify(newProfile));
    setDeveloperProfile(newProfile);
    
    // Reset form
    setProfileData({ name: '', age: '', profession: '', specialty: '' });
  };

  const connectWallet = async () => {
    if (typeof window !== 'undefined' && window.ethereum) {
      try {
        await window.ethereum.request({ method: 'eth_requestAccounts' });
      } catch (error) {
        console.error('Error connecting wallet:', error);
      }
    }
  };

  // Course functions
  const addLesson = () => {
    setLessons([...lessons, { title: '', description: '', youtubeUrl: '', duration: '' }]);
  };

  const removeLesson = (index: number) => {
    if (lessons.length > 1) {
      setLessons(lessons.filter((_, i) => i !== index));
    }
  };

  const updateLesson = (index: number, field: keyof Omit<Lesson, 'id'>, value: string) => {
    const updatedLessons = lessons.map((lesson, i) => 
      i === index ? { ...lesson, [field]: value } : lesson
    );
    setLessons(updatedLessons);
  };

  const handleCourseSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!developerProfile) {
      alert('Please complete your profile first!');
      return;
    }
    
    // Auto-generate thumbnail from first YouTube video if not provided
    let finalThumbnail = courseData.thumbnail;
    if (!finalThumbnail && lessons[0]?.youtubeUrl) {
      const regex = /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/;
      const match = lessons[0].youtubeUrl.match(regex);
      if (match && match[1]) {
        finalThumbnail = `https://img.youtube.com/vi/${match[1]}/maxresdefault.jpg`;
      }
    }
    
    if (isAdmin) {
      // Se for admin, salvar como curso CTDHUB oficial
      const adminCourse = {
        id: Date.now().toString(),
        slug: courseData.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
        title: courseData.title,
        description: courseData.description,
        thumbnail: finalThumbnail || AdminSystem.getYouTubeThumbnail(lessons[0]?.youtubeUrl || ''),
        youtubeUrl: lessons[0]?.youtubeUrl || '',
        creator: ADMIN_CONFIG.ADMIN_NAME,
        creatorAddress: walletAddress,
        isAdminCourse: true,
        createdAt: new Date().toISOString(),
        category: courseData.category,
        difficulty: courseData.difficulty
      };
      
      AdminSystem.saveAdminCourse(adminCourse);
      alert('✅ Curso CTDHUB oficial criado com sucesso!');
    } else {
      // Usuário comum, salvar como curso da comunidade
      const newCourse: Course = {
        id: Date.now().toString(),
        ...courseData,
        thumbnail: finalThumbnail,
        lessons: lessons.map((lesson, index) => ({
          ...lesson,
          id: `${Date.now()}-${index}`
        })),
        createdAt: new Date().toISOString(),
        views: Math.floor(Math.random() * 1000),
        likes: Math.floor(Math.random() * 100),
        creator: developerProfile.name,
        creatorProfile: developerProfile
      };

      const updatedCourses = [...courses, newCourse];
      setCourses(updatedCourses);
      localStorage.setItem('developer-courses', JSON.stringify(updatedCourses));
    }

    // Reset form
    setCourseData({
      title: '',
      description: '',
      thumbnail: '',
      category: 'Blockchain',
      difficulty: 'Beginner'
    });
    setLessons([{ title: '', description: '', youtubeUrl: '', duration: '' }]);
    setShowCourseForm(false);
  };

  const deleteCourse = (id: string) => {
    if (confirm('Are you sure you want to delete this course?')) {
      // Verificar se é curso admin
      const adminCourses = AdminSystem.getAllAdminCourses();
      const isAdminCourse = adminCourses.some(c => c.id === id);
      
      if (isAdminCourse && isAdmin) {
        AdminSystem.deleteAdminCourse(id);
      } else {
        const updatedCourses = courses.filter(c => c.id !== id);
        setCourses(updatedCourses);
        localStorage.setItem('developer-courses', JSON.stringify(updatedCourses));
      }
    }
  };

  // Video functions
  const handleVideoSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const newVideo: Video = {
      id: Date.now().toString(),
      ...videoData,
      uploadDate: new Date().toISOString(),
      views: Math.floor(Math.random() * 1000),
      likes: Math.floor(Math.random() * 100)
    };

    const updatedVideos = [...videos, newVideo];
    setVideos(updatedVideos);
    localStorage.setItem('developer-videos', JSON.stringify(updatedVideos));

    setVideoData({ title: '', description: '', url: '', thumbnail: '' });
    setShowVideoForm(false);
  };

  const deleteVideo = (id: string) => {
    if (confirm('Are you sure you want to delete this video?')) {
      const updatedVideos = videos.filter(v => v.id !== id);
      setVideos(updatedVideos);
      localStorage.setItem('developer-videos', JSON.stringify(updatedVideos));
    }
  };

  return (
    <div className="min-h-screen bg-black text-white">
      <Header />
      
      <main className="max-w-7xl mx-auto px-6 lg:px-8 py-24">
        <div className="mb-20">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
              <span className="text-[#FFC700]">
                {isAdmin ? 'CTDHUB Admin' : 'Developer'}
              </span> Area
            </h1>
            
            {isAdmin && (
              <div className="bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border border-yellow-500/30 rounded-lg p-4 max-w-2xl mx-auto mb-6">
                <div className="flex items-center gap-2 justify-center">
                  <span className="text-2xl">👑</span>
                  <span className="text-yellow-400 font-bold">
                    {ADMIN_CONFIG.ADMIN_NAME} - Administrador CTDHUB
                  </span>
                </div>
                <p className="text-gray-300 text-sm mt-2 text-center">
                  Você pode criar cursos oficiais na aba "Cursos CTDHUB"
                </p>
              </div>
            )}
            {developerProfile ? (
              <div className="card max-w-2xl mx-auto p-6 mb-8">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-[#FFC700] rounded-full flex items-center justify-center">
                    <span className="text-2xl">👨‍💻</span>
                  </div>
                  <div className="text-left">
                    <h2 className="text-xl font-bold text-white">Welcome, {developerProfile.name}!</h2>
                    <p className="text-gray-400">
                      {developerProfile.profession} • {developerProfile.specialty} • {developerProfile.age} years old
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-xl text-gray-400 mb-8 max-w-4xl mx-auto leading-relaxed">
                Create and manage educational content for the CTDHUB Platform. Build comprehensive courses or individual videos for the community.
              </p>
            )}
            <WalletButton />
          </div>

        {/* Wallet Connection Check */}
        {!isConnected ? (
          <div className="text-center py-20">
            <div className="text-8xl mb-8">🔒</div>
            <h3 className="text-3xl font-bold mb-6 text-white">Connect Your Wallet</h3>
            <p className="text-xl text-gray-400 mb-8 max-w-2xl mx-auto leading-relaxed">
              To access the developer area and create content, you need to connect your Web3 wallet.
            </p>
            <button
              onClick={connectWallet}
              className="btn-primary text-lg"
            >
              🔗 Connect Wallet
            </button>
          </div>
        ) : !developerProfile ? (
          <div className="card p-12 text-center max-w-2xl mx-auto">
            <div className="text-6xl mb-6">👤</div>
            <h3 className="text-3xl font-bold mb-4 text-white">Complete Your Developer Profile</h3>
            <p className="text-xl text-gray-400 mb-8 leading-relaxed">
              To create courses and videos, we need some basic information about you.
            </p>

              <form onSubmit={handleProfileSubmit} className="max-w-2xl mx-auto space-y-6">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold mb-2 text-yellow-400">Full Name *</label>
                    <input
                      type="text"
                      value={profileData.name}
                      onChange={(e) => setProfileData(prev => ({ ...prev, name: e.target.value }))}
                      className="w-full bg-gray-800 text-white rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-yellow-500"
                      placeholder="Your full name..."
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-2 text-yellow-400">Age *</label>
                    <input
                      type="number"
                      min="18"
                      max="100"
                      value={profileData.age}
                      onChange={(e) => setProfileData(prev => ({ ...prev, age: e.target.value }))}
                      className="w-full bg-gray-800 text-white rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-yellow-500"
                      placeholder="Your age..."
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2 text-yellow-400">Profession *</label>
                  <input
                    type="text"
                    value={profileData.profession}
                    onChange={(e) => setProfileData(prev => ({ ...prev, profession: e.target.value }))}
                    className="w-full bg-gray-800 text-white rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-yellow-500"
                    placeholder="e.g., Developer, Analyst, Engineer..."
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2 text-yellow-400">Specialty *</label>
                  <input
                    type="text"
                    value={profileData.specialty}
                    onChange={(e) => setProfileData(prev => ({ ...prev, specialty: e.target.value }))}
                    className="w-full bg-gray-800 text-white rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-yellow-500"
                    placeholder="e.g., Blockchain, Smart Contracts, DeFi, Frontend..."
                    required
                  />
                </div>

                <div className="text-center pt-4">
                  <button
                    type="submit"
                    className="bg-yellow-500 text-black px-8 py-3 rounded-lg font-semibold hover:bg-yellow-600 transition-colors text-lg"
                  >
                    💾 Save Profile
                  </button>
                </div>
              </form>
            </div>
          ) : (
            <div>
              {/* Tab Navigation */}
              <div className="flex space-x-1 mb-8">
                <button
                  onClick={() => setActiveTab('courses')}
                  className={`px-6 py-3 rounded-lg font-semibold transition-colors ${
                    activeTab === 'courses' 
                      ? 'bg-yellow-500 text-black' 
                      : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                  }`}
                >
                  📚 Courses
                </button>
                <button
                  onClick={() => setActiveTab('videos')}
                  className={`px-6 py-3 rounded-lg font-semibold transition-colors ${
                    activeTab === 'videos' 
                      ? 'bg-yellow-500 text-black' 
                      : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                  }`}
                >
                  🎬 Individual Videos
                </button>
              </div>

              {/* Courses Tab */}
              {activeTab === 'courses' && (
                <div>
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold">Course Management</h2>
                    <button
                      onClick={() => setShowCourseForm(true)}
                      className="bg-yellow-500 text-black px-6 py-2 rounded-lg font-semibold hover:bg-yellow-600 transition-colors"
                    >
                      + Create New Course
                    </button>
                  </div>

                  {/* Course Creation Form */}
                  {showCourseForm && (
                    <div className="bg-gray-900 rounded-lg p-6 mb-6">
                      <div className="flex justify-between items-center mb-6">
                        <h3 className="text-2xl font-bold">Create New Course</h3>
                        <button onClick={() => setShowCourseForm(false)} className="text-gray-400 hover:text-white text-xl">✕</button>
                      </div>
                      
                      <form onSubmit={handleCourseSubmit} className="space-y-6">
                        {/* Course Details */}
                        <div>
                          <h4 className="text-lg font-semibold mb-4">Course Details</h4>
                          <p className="text-gray-400 text-sm mb-4">Basic information about your course</p>
                          
                          <div className="space-y-4">
                            <div>
                              <label className="block text-sm font-semibold mb-2 text-yellow-400">Course Title *</label>
                              <input
                                type="text"
                                value={courseData.title}
                                onChange={(e) => setCourseData(prev => ({ ...prev, title: e.target.value }))}
                                className="w-full bg-gray-800 text-white rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-yellow-500"
                                placeholder="Enter course title..."
                                required
                              />
                            </div>

                            <div>
                              <label className="block text-sm font-semibold mb-2 text-yellow-400">Course Description</label>
                              <textarea
                                value={courseData.description}
                                onChange={(e) => setCourseData(prev => ({ ...prev, description: e.target.value }))}
                                className="w-full bg-gray-800 text-white rounded-lg px-4 py-3 h-24 resize-none focus:outline-none focus:ring-2 focus:ring-yellow-500"
                                placeholder="Describe what students will learn in this course..."
                                rows={4}
                              />
                            </div>

                            <div className="grid md:grid-cols-3 gap-4">
                              <div>
                                <label className="block text-sm font-semibold mb-2 text-yellow-400">Category</label>
                                <select
                                  value={courseData.category}
                                  onChange={(e) => setCourseData(prev => ({ ...prev, category: e.target.value }))}
                                  className="w-full bg-gray-800 text-white rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-yellow-500"
                                >
                                  <option value="Blockchain">Blockchain</option>
                                  <option value="DeFi">DeFi</option>
                                  <option value="NFT">NFT</option>
                                  <option value="Smart Contracts">Smart Contracts</option>
                                  <option value="Web3">Web3</option>
                                  <option value="Programming">Programming</option>
                                </select>
                              </div>

                              <div>
                                <label className="block text-sm font-semibold mb-2 text-yellow-400">Difficulty</label>
                                <select
                                  value={courseData.difficulty}
                                  onChange={(e) => setCourseData(prev => ({ ...prev, difficulty: e.target.value as Course['difficulty'] }))}
                                  className="w-full bg-gray-800 text-white rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-yellow-500"
                                >
                                  <option value="Beginner">Beginner</option>
                                  <option value="Intermediate">Intermediate</option>
                                  <option value="Advanced">Advanced</option>
                                </select>
                              </div>

                              <div>
                                <label className="block text-sm font-semibold mb-2 text-yellow-400">Thumbnail URL</label>
                                <div className="flex gap-2">
                                  <input
                                    type="url"
                                    value={courseData.thumbnail}
                                    onChange={(e) => setCourseData(prev => ({ ...prev, thumbnail: e.target.value }))}
                                    className="flex-1 bg-gray-800 text-white rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-yellow-500"
                                    placeholder="https://... or leave empty for auto-generation"
                                  />
                                  <button
                                    type="button"
                                    onClick={() => {
                                      const firstVideoUrl = lessons[0]?.youtubeUrl;
                                      if (firstVideoUrl) {
                                        const regex = /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/;
                                        const match = firstVideoUrl.match(regex);
                                        if (match && match[1]) {
                                          setCourseData(prev => ({ 
                                            ...prev, 
                                            thumbnail: `https://img.youtube.com/vi/${match[1]}/maxresdefault.jpg` 
                                          }));
                                        }
                                      }
                                    }}
                                    className="px-4 py-3 bg-yellow-600 hover:bg-yellow-700 text-black font-semibold rounded-lg transition-colors"
                                  >
                                    Auto
                                  </button>
                                </div>
                                <p className="text-xs text-gray-500 mt-1">
                                  Leave empty and we'll auto-generate from first video, or click "Auto" to generate now
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Lessons Section */}
                        <div>
                          <div className="flex justify-between items-center mb-4">
                            <div>
                              <h4 className="text-lg font-semibold">Lessons</h4>
                              <p className="text-gray-400 text-sm">Add lessons with YouTube videos</p>
                            </div>
                            <button
                              type="button"
                              onClick={addLesson}
                              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors text-sm"
                            >
                              + Add Lesson
                            </button>
                          </div>

                          <div className="space-y-4">
                            {lessons.map((lesson, index) => (
                              <div key={index} className="bg-gray-800 rounded-lg p-4">
                                <div className="flex items-center justify-between mb-4">
                                  <div className="flex items-center gap-2">
                                    <span className="bg-yellow-500 text-black px-2 py-1 rounded text-sm font-bold">#{index + 1}</span>
                                    <span className="text-sm text-gray-400">Lesson</span>
                                  </div>
                                  <div className="flex gap-2">
                                    {lessons.length > 1 && (
                                      <button
                                        type="button"
                                        onClick={() => removeLesson(index)}
                                        className="bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700 transition-colors"
                                      >
                                        🗑️ Delete
                                      </button>
                                    )}
                                  </div>
                                </div>

                                <div className="grid md:grid-cols-2 gap-4">
                                  <div>
                                    <label className="block text-sm font-semibold mb-2 text-yellow-400">Title *</label>
                                    <input
                                      type="text"
                                      value={lesson.title}
                                      onChange={(e) => updateLesson(index, 'title', e.target.value)}
                                      className="w-full bg-gray-700 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-yellow-500"
                                      placeholder="Lesson title..."
                                      required
                                    />
                                  </div>

                                  <div>
                                    <label className="block text-sm font-semibold mb-2 text-yellow-400">YouTube URL *</label>
                                    <input
                                      type="url"
                                      value={lesson.youtubeUrl}
                                      onChange={(e) => updateLesson(index, 'youtubeUrl', e.target.value)}
                                      className="w-full bg-gray-700 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-yellow-500"
                                      placeholder="https://youtube.com/watch?v=..."
                                      required
                                    />
                                  </div>
                                </div>

                                <div className="mt-4">
                                  <label className="block text-sm font-semibold mb-2 text-yellow-400">Description</label>
                                  <textarea
                                    value={lesson.description}
                                    onChange={(e) => updateLesson(index, 'description', e.target.value)}
                                    className="w-full bg-gray-700 text-white rounded-lg px-4 py-2 h-20 resize-none focus:outline-none focus:ring-2 focus:ring-yellow-500"
                                    placeholder="What will students learn in this lesson..."
                                  />
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>

                        <div className="flex gap-4">
                          <button type="submit" className="bg-yellow-500 text-black px-8 py-3 rounded-lg font-semibold hover:bg-yellow-600 transition-colors">
                            Create Course
                          </button>
                          <button type="button" onClick={() => setShowCourseForm(false)} className="bg-gray-700 text-white px-8 py-3 rounded-lg hover:bg-gray-600 transition-colors">
                            Cancel
                          </button>
                        </div>
                      </form>
                    </div>
                  )}

                  {/* Courses Grid */}
                  <div className="grid md:grid-cols-2 gap-6">
                    {courses.map((course) => (
                      <div key={course.id} className="bg-gray-900 rounded-lg overflow-hidden">
                        <div className="aspect-video bg-gray-800 relative">
                          {course.thumbnail ? (
                            <img src={course.thumbnail} alt={course.title} className="w-full h-full object-cover" />
                          ) : (
                            <div className="flex items-center justify-center h-full text-gray-500 text-4xl">📚</div>
                          )}
                          <div className="absolute top-4 left-4">
                            <span className="bg-yellow-500 text-black px-2 py-1 rounded text-xs font-bold">
                              {course.difficulty}
                            </span>
                          </div>
                          <div className="absolute top-4 right-4">
                            <span className="bg-gray-900 bg-opacity-80 text-white px-2 py-1 rounded text-xs">
                              {course.lessons.length} lessons
                            </span>
                          </div>
                        </div>
                        
                        <div className="p-4">
                          <div className="flex justify-between items-start mb-2">
                            <h3 className="font-bold text-lg">{course.title}</h3>
                            <span className="text-xs bg-blue-600 text-white px-2 py-1 rounded">{course.category}</span>
                          </div>
                          <p className="text-gray-400 text-sm mb-3 line-clamp-2">{course.description}</p>
                          
                          <div className="flex justify-between items-center text-sm text-gray-500 mb-4">
                            <span>👁 {course.views} views</span>
                            <span>👍 {course.likes} likes</span>
                          </div>
                          
                          <div className="flex gap-2">
                            <button className="flex-1 bg-green-600 text-white px-3 py-2 rounded text-sm hover:bg-green-700 transition-colors">
                              📖 View Course
                            </button>
                            <button
                              onClick={() => deleteCourse(course.id)}
                              className="bg-red-600 text-white px-3 py-2 rounded text-sm hover:bg-red-700 transition-colors"
                            >
                              🗑️
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {courses.length === 0 && (
                    <div className="text-center py-16">
                      <div className="text-8xl mb-6">📚</div>
                      <h3 className="text-2xl font-bold mb-4">No Courses Yet</h3>
                      <p className="text-gray-400 mb-6 max-w-md mx-auto">
                        Create your first comprehensive course with multiple lessons and help students learn step by step.
                      </p>
                      <button
                        onClick={() => setShowCourseForm(true)}
                        className="bg-yellow-500 text-black px-8 py-3 rounded-lg font-semibold hover:bg-yellow-600 transition-colors text-lg"
                      >
                        + Create Your First Course
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* Videos Tab */}
              {activeTab === 'videos' && (
                <div>
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold">Video Management</h2>
                    <button
                      onClick={() => setShowVideoForm(true)}
                      className="bg-yellow-500 text-black px-6 py-2 rounded-lg font-semibold hover:bg-yellow-600 transition-colors"
                    >
                      + Add New Video
                    </button>
                  </div>

                  {showVideoForm && (
                    <div className="bg-gray-900 rounded-lg p-6 mb-6">
                      <div className="flex justify-between items-center mb-4">
                        <h3 className="text-xl font-bold">Add New Video</h3>
                        <button onClick={() => setShowVideoForm(false)} className="text-gray-400 hover:text-white text-xl">✕</button>
                      </div>
                      
                      <form onSubmit={handleVideoSubmit} className="space-y-4">
                        <div className="grid md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-semibold mb-2 text-yellow-400">Video Title</label>
                            <input
                              type="text"
                              value={videoData.title}
                              onChange={(e) => setVideoData(prev => ({ ...prev, title: e.target.value }))}
                              className="w-full bg-gray-800 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-yellow-500"
                              placeholder="Enter video title..."
                              required
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-semibold mb-2 text-yellow-400">Video URL</label>
                            <input
                              type="url"
                              value={videoData.url}
                              onChange={(e) => setVideoData(prev => ({ ...prev, url: e.target.value }))}
                              className="w-full bg-gray-800 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-yellow-500"
                              placeholder="https://youtube.com/watch?v=..."
                              required
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-semibold mb-2 text-yellow-400">Description</label>
                          <textarea
                            value={videoData.description}
                            onChange={(e) => setVideoData(prev => ({ ...prev, description: e.target.value }))}
                            className="w-full bg-gray-800 text-white rounded-lg px-4 py-2 h-24 resize-none focus:outline-none focus:ring-2 focus:ring-yellow-500"
                            placeholder="Describe your video content..."
                            required
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-semibold mb-2 text-yellow-400">Thumbnail URL (Optional)</label>
                          <input
                            type="url"
                            value={videoData.thumbnail}
                            onChange={(e) => setVideoData(prev => ({ ...prev, thumbnail: e.target.value }))}
                            className="w-full bg-gray-800 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-yellow-500"
                            placeholder="https://example.com/thumbnail.jpg"
                          />
                        </div>

                        <div className="flex gap-4">
                          <button type="submit" className="bg-yellow-500 text-black px-6 py-2 rounded-lg font-semibold hover:bg-yellow-600 transition-colors">
                            Add Video
                          </button>
                          <button type="button" onClick={() => setShowVideoForm(false)} className="bg-gray-700 text-white px-6 py-2 rounded-lg hover:bg-gray-600 transition-colors">
                            Cancel
                          </button>
                        </div>
                      </form>
                    </div>
                  )}

                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {videos.map((video) => (
                      <div key={video.id} className="bg-gray-900 rounded-lg overflow-hidden">
                        <div className="aspect-video bg-gray-800 relative">
                          {video.thumbnail ? (
                            <img src={video.thumbnail} alt={video.title} className="w-full h-full object-cover" />
                          ) : (
                            <div className="flex items-center justify-center h-full text-gray-500 text-4xl">📹</div>
                          )}
                        </div>
                        
                        <div className="p-4">
                          <h3 className="font-bold text-lg mb-2">{video.title}</h3>
                          <p className="text-gray-400 text-sm mb-3">{video.description}</p>
                          
                          <div className="flex justify-between items-center text-sm text-gray-500 mb-4">
                            <span>👁 {video.views} views</span>
                            <span>👍 {video.likes} likes</span>
                          </div>
                          
                          <div className="flex gap-2">
                            <a
                              href={video.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex-1 bg-green-600 text-white px-3 py-2 rounded text-sm hover:bg-green-700 transition-colors text-center"
                            >
                              🔗 Watch
                            </a>
                            <button
                              onClick={() => deleteVideo(video.id)}
                              className="bg-red-600 text-white px-3 py-2 rounded text-sm hover:bg-red-700 transition-colors"
                            >
                              🗑️
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {videos.length === 0 && (
                    <div className="text-center py-16">
                      <div className="text-8xl mb-6">📹</div>
                      <h3 className="text-2xl font-bold mb-4">No Videos Yet</h3>
                      <p className="text-gray-400 mb-6 max-w-md mx-auto">
                        Start creating individual video content for your community! Add your first video to get started.
                      </p>
                      <button
                        onClick={() => setShowVideoForm(true)}
                        className="bg-yellow-500 text-black px-8 py-3 rounded-lg font-semibold hover:bg-yellow-600 transition-colors text-lg"
                      >
                        + Add Your First Video
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </main>
      
      <Footer />
    </div>
  );
}

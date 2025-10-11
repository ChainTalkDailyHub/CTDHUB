# 🎨 Guia de Aplicação do Tema Educacional CTD Hub

## 📋 Resumo das Mudanças

Este guia detalha todas as modificações necessárias para aplicar o tema educacional colorido em 100% das páginas do CTD Hub.

---

## ✅ Arquivos Já Modificados

### 1. `styles/globals.css`
- ✅ Substituído pelo tema educacional completo
- ✅ Cores vibrantes (azul, amarelo, verde, roxo, laranja)
- ✅ Suporte a dark/light mode
- ✅ Animações suaves (float, fade, scale)
- ✅ Classes utilitárias prontas

### 2. `public/bnb-logo.png`
- ✅ Logo oficial da BNB Smart Chain adicionada

### 3. `public/binno-mascot.png`
- ✅ Mascote Binno adicionado

---

## 🔧 Modificações Necessárias

### PASSO 1: Adicionar Toggle Dark/Light Mode

#### Criar componente `components/ThemeToggle.tsx`:

```typescript
import { useState, useEffect } from 'react'
import { FiSun, FiMoon } from 'react-icons/fi'

export default function ThemeToggle() {
  const [isDark, setIsDark] = useState(false)

  useEffect(() => {
    // Carregar preferência salva
    const savedTheme = localStorage.getItem('theme')
    if (savedTheme === 'dark') {
      setIsDark(true)
      document.documentElement.classList.add('dark')
    }
  }, [])

  const toggleTheme = () => {
    setIsDark(!isDark)
    if (!isDark) {
      document.documentElement.classList.add('dark')
      localStorage.setItem('theme', 'dark')
    } else {
      document.documentElement.classList.remove('dark')
      localStorage.setItem('theme', 'light')
    }
  }

  return (
    <button
      onClick={toggleTheme}
      className="p-2 rounded-full border-2 border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-200"
      aria-label="Toggle theme"
    >
      {isDark ? (
        <FiSun className="w-5 h-5 text-yellow-400" />
      ) : (
        <FiMoon className="w-5 h-5 text-gray-700" />
      )}
    </button>
  )
}
```

---

### PASSO 2: Modificar Header Component

#### Arquivo: `components/Header.tsx`

**Adicionar:**
1. Import do ThemeToggle
2. Logo BNB
3. Classes do tema educacional

```typescript
import ThemeToggle from './ThemeToggle'
import Image from 'next/image'

// No JSX do Header, adicionar:
<nav className="sticky top-0 z-50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-700 transition-colors duration-300">
  <div className="container mx-auto px-6 py-4">
    <div className="flex items-center justify-between">
      {/* Logo */}
      <div className="flex items-center gap-3">
        <Image src="/logo-ctd.png" alt="CTD Hub" width={80} height={80} className="h-20 w-auto" />
      </div>
      
      {/* Nav Links */}
      <div className="hidden md:flex items-center gap-6">
        <a href="/" className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-yellow-400 transition-colors font-medium">
          Home
        </a>
        <a href="/courses" className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-yellow-400 transition-colors font-medium">
          Courses
        </a>
        <a href="/binno-ai" className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-yellow-400 transition-colors font-medium">
          Binno AI
        </a>
        
        {/* Theme Toggle */}
        <ThemeToggle />
        
        {/* Connect Wallet */}
        <button className="btn-primary">
          Connect Wallet
        </button>
      </div>
    </div>
  </div>
</nav>
```

---

### PASSO 3: Modificar Página Principal (index.tsx)

#### Arquivo: `pages/index.tsx`

**Substituir classes antigas por novas:**

```typescript
// Hero Section
<section className="relative py-24 lg:py-32 overflow-hidden bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 transition-colors duration-300">
  {/* Formas Flutuantes */}
  <div className="floating-shapes">
    <div className="floating-shape floating-shape-1"></div>
    <div className="floating-shape floating-shape-2"></div>
    <div className="floating-shape floating-shape-3"></div>
  </div>
  
  <div className="relative max-w-6xl mx-auto px-6 text-center z-10">
    <h1 className="text-5xl md:text-6xl font-extrabold mb-8 leading-tight text-gray-900 dark:text-white">
      Learn <span className="text-gradient-yellow-orange">Web3</span>.
      <br />
      Ship real things.
    </h1>
    <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-3xl mx-auto">
      Videos, quizzes, and an AI copilot to take you from "what is a wallet?" to shipping your first dApp.
    </p>
    
    {/* CTAs com gradientes coloridos */}
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
      <a href="/courses" className="btn-primary">
        <FiBook className="w-5 h-5" />
        Start Learning
      </a>
      <a href="/quiz" className="btn-secondary">
        <FiBrain className="w-5 h-5" />
        Take the Quiz
      </a>
      <a href="/binno-ai" className="btn-success">
        <FiBot className="w-5 h-5" />
        Try Binno AI
      </a>
      <a href="/dev" className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-bold py-3 px-6 rounded-lg shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-200 flex items-center justify-center gap-2">
        <FiCode className="w-5 h-5" />
        Creator Studio
      </a>
    </div>
  </div>
  
  {/* Mascote Binno */}
  <div className="absolute bottom-0 right-10 hidden lg:block">
    <Image 
      src="/binno-mascot.png" 
      alt="Binno" 
      width={300} 
      height={400}
      className="animate-float"
    />
    <div className="absolute -top-4 -right-4 bg-yellow-400 text-gray-900 px-4 py-2 rounded-full font-bold shadow-lg animate-rotate">
      👋 Hi! I'm Binno!
    </div>
  </div>
</section>

{/* BNB Smart Chain Badge */}
<section className="py-12 border-y border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 transition-colors duration-300">
  <div className="max-w-7xl mx-auto px-6 text-center">
    <div className="flex items-center justify-center gap-4 flex-wrap">
      <span className="text-gray-600 dark:text-gray-400 font-medium">Built on</span>
      <div className="bnb-badge">
        <Image src="/bnb-logo.png" alt="BNB" width={24} height={24} />
        <span>BNB Smart Chain</span>
      </div>
      <span className="text-gray-600 dark:text-gray-400 font-medium">· Part of the Web3 ecosystem</span>
    </div>
  </div>
</section>

{/* Three Steps Section */}
<section className="py-24 bg-gradient-to-br from-purple-50 to-blue-50 dark:from-gray-800 dark:to-gray-900 transition-colors duration-300">
  <div className="max-w-7xl mx-auto px-6">
    <h2 className="text-4xl md:text-5xl font-bold text-center mb-16 text-gray-900 dark:text-white">
      Start building in three simple steps
    </h2>
    
    <div className="grid md:grid-cols-3 gap-8 relative">
      {/* Linha de conexão */}
      <div className="hidden md:block absolute top-16 left-0 right-0 h-1 bg-gradient-to-r from-yellow-400 via-purple-500 to-green-500 opacity-30" style={{width: '66%', left: '17%'}}></div>
      
      {/* Step 1 */}
      <div className="card card-interactive text-center p-8 animate-fade-in-up">
        <div className="w-16 h-16 bg-gradient-to-br from-yellow-400 to-orange-400 rounded-full flex items-center justify-center mx-auto mb-6 text-2xl font-bold text-gray-900 shadow-xl">
          1
        </div>
        <h3 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">Pick your path</h3>
        <p className="text-gray-600 dark:text-gray-300">
          Choose a track that fits your level—from fundamentals to DeFi and smart contracts.
        </p>
      </div>
      
      {/* Step 2 */}
      <div className="card card-interactive text-center p-8 animate-fade-in-up" style={{animationDelay: '0.2s'}}>
        <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6 text-2xl font-bold text-white shadow-xl">
          2
        </div>
        <h3 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">Learn & practice</h3>
        <p className="text-gray-600 dark:text-gray-300">
          Watch short videos, follow along, and test yourself with quick quizzes.
        </p>
      </div>
      
      {/* Step 3 */}
      <div className="card card-interactive text-center p-8 animate-fade-in-up" style={{animationDelay: '0.4s'}}>
        <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6 text-2xl font-bold text-white shadow-xl">
          3
        </div>
        <h3 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">Ship it</h3>
        <p className="text-gray-600 dark:text-gray-300">
          Deploy contracts, publish your dApp, and share your work with the community.
        </p>
      </div>
    </div>
  </div>
</section>
```

---

### PASSO 4: Substituir "IA" por "Binno AI"

**Buscar e substituir em TODOS os arquivos:**

```bash
# No terminal:
cd "/home/ubuntu/CTDHUB-BACKUP 01 - Copia"

# Substituir "IA" por "Binno AI"
find pages -type f \( -name "*.tsx" -o -name "*.ts" -o -name "*.jsx" -o -name "*.js" \) -exec sed -i 's/\bIA\b/Binno AI/g' {} +

# Substituir "AI Chat" por "Binno AI" onde apropriado
find pages -type f \( -name "*.tsx" -o -name "*.ts" \) -exec sed -i 's/AI Chat/Binno AI/g' {} +

# Substituir "AI Assistant" por "Binno AI Assistant"
find pages -type f \( -name "*.tsx" -o -name "*.ts" \) -exec sed -i 's/AI Assistant/Binno AI Assistant/g' {} +
```

---

### PASSO 5: Aplicar em Páginas Específicas

#### `pages/courses/index.tsx`

```typescript
<div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 transition-colors duration-300">
  <Header />
  
  <main className="container mx-auto px-6 py-12">
    <h1 className="text-4xl md:text-5xl font-bold mb-6 text-gray-900 dark:text-white">
      Courses
    </h1>
    <p className="text-xl text-gray-600 dark:text-gray-300 mb-12">
      Discover educational content from our community
    </p>
    
    {/* Search e Filtros */}
    <div className="mb-8 flex flex-col md:flex-row gap-4">
      <input
        type="text"
        placeholder="Search courses..."
        className="flex-1 px-4 py-3 bg-white dark:bg-gray-800 border-2 border-purple-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all"
      />
      <select className="px-4 py-3 bg-white dark:bg-gray-800 border-2 border-purple-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:border-purple-500 transition-all">
        <option>All Authors</option>
      </select>
    </div>
    
    {/* Grid de Cursos */}
    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
      {courses.map((course) => (
        <div key={course.id} className="card card-interactive p-6 hover:border-yellow-400">
          <Image 
            src="/binno-mascot.png" 
            alt="Course" 
            width={200} 
            height={150}
            className="w-full h-48 object-cover rounded-lg mb-4"
          />
          <h3 className="text-xl font-bold mb-2 text-gray-900 dark:text-white">
            {course.title}
          </h3>
          <p className="text-gray-600 dark:text-gray-300 mb-4">
            {course.description}
          </p>
          <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
            <span>By {course.author}</span>
            <span>{course.date}</span>
          </div>
        </div>
      ))}
    </div>
  </main>
  
  <Footer />
</div>
```

#### `pages/binno-ai/index.tsx`

```typescript
<div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 transition-colors duration-300 binno-container">
  <Header />
  
  <main className="container mx-auto px-6 py-12">
    <div className="text-center mb-12">
      <h1 className="text-4xl md:text-5xl font-bold mb-4">
        <span className="text-gradient-yellow-orange">Binno AI</span> Assistant
      </h1>
      <p className="text-xl text-gray-600 dark:text-gray-300">
        Your blockchain and Web3 specialist assistant
      </p>
    </div>
    
    {/* Card Central com Binno */}
    <div className="max-w-4xl mx-auto card p-8 mb-8">
      <div className="text-center mb-8">
        <Image 
          src="/binno-mascot.png" 
          alt="Binno" 
          width={150} 
          height={200}
          className="mx-auto animate-float"
        />
        <h2 className="text-2xl font-bold mt-4 text-gray-900 dark:text-white">
          Hello! I'm <span className="text-gradient-yellow-orange">Binno AI</span>
        </h2>
        <p className="text-gray-600 dark:text-gray-300 mt-2">
          Your specialist assistant in blockchain, DeFi, Web3 and crypto development. Ask me anything!
        </p>
      </div>
      
      {/* Quick Prompts */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <button className="px-4 py-3 border-2 border-purple-500 text-purple-600 dark:text-purple-400 rounded-lg hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-all font-medium">
          How does DeFi work?
        </button>
        <button className="px-4 py-3 border-2 border-orange-500 text-orange-600 dark:text-orange-400 rounded-lg hover:bg-orange-50 dark:hover:bg-orange-900/20 transition-all font-medium">
          Explain smart contracts
        </button>
        <button className="px-4 py-3 border-2 border-green-500 text-green-600 dark:text-green-400 rounded-lg hover:bg-green-50 dark:hover:bg-green-900/20 transition-all font-medium">
          Yield farming strategies
        </button>
        <button className="px-4 py-3 border-2 border-red-500 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-all font-medium">
          Crypto security
        </button>
      </div>
      
      {/* Textarea */}
      <textarea
        className="binno-textarea w-full h-32 px-4 py-3 rounded-lg resize-none"
        placeholder='Ask Binno anything: "why does my tx keep reverting?"'
      ></textarea>
      
      {/* Buttons */}
      <div className="flex gap-4 mt-4">
        <button className="btn-primary flex-1">
          Send
        </button>
        <button className="btn-success">
          Clear
        </button>
      </div>
    </div>
  </main>
  
  <Footer />
</div>
```

---

### PASSO 6: Footer com BNB Branding

#### Arquivo: `components/Footer.tsx`

```typescript
<footer className="bg-gray-900 dark:bg-black text-white py-12 transition-colors duration-300">
  <div className="container mx-auto px-6">
    <div className="grid md:grid-cols-3 gap-8 mb-8">
      {/* Logo e BNB Badge */}
      <div>
        <Image src="/logo-ctd.png" alt="CTD Hub" width={120} height={40} className="mb-4" />
        <div className="bnb-badge inline-flex mb-4">
          <Image src="/bnb-logo.png" alt="BNB" width={20} height={20} />
          <span>Built on BNB Smart Chain</span>
        </div>
        <p className="text-gray-400 dark:text-gray-500">
          Learn Web3. Ship real things.
        </p>
      </div>
      
      {/* Quick Links */}
      <div>
        <h3 className="text-xl font-bold mb-4">Quick Links</h3>
        <ul className="space-y-2 text-gray-400 dark:text-gray-500">
          <li><a href="/" className="hover:text-yellow-400 transition-colors">Home</a></li>
          <li><a href="/courses" className="hover:text-yellow-400 transition-colors">Courses</a></li>
          <li><a href="/binno-ai" className="hover:text-yellow-400 transition-colors">Binno AI</a></li>
          <li><a href="/dev" className="hover:text-yellow-400 transition-colors">Creator Studio</a></li>
        </ul>
      </div>
      
      {/* Connect */}
      <div>
        <h3 className="text-xl font-bold mb-4">Connect</h3>
        <ul className="space-y-2 text-gray-400 dark:text-gray-500">
          <li><a href="#" className="hover:text-yellow-400 transition-colors">Twitter</a></li>
          <li><a href="#" className="hover:text-yellow-400 transition-colors">Discord</a></li>
          <li><a href="#" className="hover:text-yellow-400 transition-colors">GitHub</a></li>
        </ul>
      </div>
    </div>
    
    <div className="pt-8 border-t border-gray-800 dark:border-gray-900 text-center text-gray-400 dark:text-gray-500">
      <p>© 2025 CTD Hub. Built with ❤️ for the Web3 community.</p>
    </div>
  </div>
</footer>
```

---

## 🚀 Como Aplicar

### Opção 1: Manual
1. Copie cada arquivo modificado para seu projeto
2. Substitua os arquivos antigos
3. Execute `npm install` (se necessário)
4. Execute `npm run dev` para testar

### Opção 2: Via GitHub Copilot
1. Abra o VSCode no seu projeto
2. Use o Copilot Chat
3. Cole o conteúdo deste guia
4. Peça: "Aplicar essas mudanças no meu projeto"

---

## ✅ Checklist Final

- [ ] globals.css substituído
- [ ] ThemeToggle component criado
- [ ] Header modificado com toggle e BNB logo
- [ ] index.tsx atualizado com tema educacional
- [ ] courses/index.tsx atualizado
- [ ] binno-ai/index.tsx atualizado
- [ ] Footer atualizado com BNB branding
- [ ] Todas referências "IA" substituídas por "Binno AI"
- [ ] Testado em light e dark mode
- [ ] Testado em mobile e desktop

---

## 🎨 Cores do Tema

| Cor | Hex | Uso |
|-----|-----|-----|
| Azul | #4A90E2 | Links, badges, destaques |
| Amarelo | #FFD93D | CTAs primários, destaques |
| Verde | #6BCF7F | Sucesso, confirmações |
| Roxo | #9B59B6 | Secundário, hover states |
| Laranja | #FF9F43 | Alertas, CTAs secundários |
| BNB Gold | #F0B90B | Branding BNB Smart Chain |

---

## 📞 Suporte

Se tiver dúvidas ou problemas, consulte a documentação do Next.js e Tailwind CSS.

**Tema criado por: Manus AI**
**Data: 11 de Outubro de 2025**


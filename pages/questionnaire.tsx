import Head from 'next/head'

export default function Questionnaire() {
  return (
    <>
      <Head>
        <title>CTD Skill Compass - Under Construction</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </Head>

      <style jsx global>{`
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }

        body {
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          background: #ffffff;
          min-height: 100vh;
          overflow: hidden;
          position: relative;
        }

        .page-container {
          min-height: 100vh;
          display: flex;
          justify-content: center;
          align-items: center;
          position: relative;
        }

        /* Partículas flutuantes de fundo */
        .particle {
          position: absolute;
          background: rgba(255, 204, 51, 0.15);
          border-radius: 50%;
          animation: float 20s infinite;
        }

        @keyframes float {
          0%, 100% {
            transform: translateY(0) translateX(0) rotate(0deg);
            opacity: 0;
          }
          10% {
            opacity: 0.3;
          }
          90% {
            opacity: 0.3;
          }
          100% {
            transform: translateY(-100vh) translateX(50px) rotate(360deg);
            opacity: 0;
          }
        }

        .container {
          text-align: center;
          z-index: 10;
          padding: 2rem;
          max-width: 900px;
          margin: 0 auto;
        }

        .logo-container {
          margin-bottom: 2rem;
          animation: fadeInDown 1s ease-out;
          display: flex;
          justify-content: center;
          align-items: center;
        }

        .logo {
          max-width: 400px;
          width: 100%;
          height: auto;
          filter: drop-shadow(0 10px 30px rgba(255, 204, 51, 0.3));
          animation: pulse 3s ease-in-out infinite;
        }

        @keyframes pulse {
          0%, 100% {
            transform: scale(1);
          }
          50% {
            transform: scale(1.05);
          }
        }

        @keyframes fadeInDown {
          from {
            opacity: 0;
            transform: translateY(-50px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .title {
          font-size: 3rem;
          font-weight: bold;
          color: #FFCC33;
          margin-bottom: 1rem;
          text-shadow: 0 0 20px rgba(255, 204, 51, 0.5);
          animation: fadeInUp 1s ease-out 0.3s both;
        }

        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(50px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .subtitle {
          font-size: 1.5rem;
          color: #6b7280;
          margin-bottom: 2rem;
          animation: fadeInUp 1s ease-out 0.6s both;
        }

        .construction-text {
          font-size: 2.5rem;
          font-weight: bold;
          color: #1f2937;
          margin-bottom: 1.5rem;
          animation: fadeInUp 1s ease-out 0.9s both;
        }

        .loading-container {
          margin: 2rem auto;
          animation: fadeInUp 1s ease-out 1.2s both;
        }

        .loading-bar {
          width: 100%;
          max-width: 400px;
          height: 8px;
          background: #e5e7eb;
          border-radius: 10px;
          overflow: hidden;
          margin: 0 auto 1rem;
          box-shadow: 0 0 10px rgba(255, 204, 51, 0.3);
        }

        .loading-progress {
          height: 100%;
          background: linear-gradient(90deg, #FFCC33, #FFC700, #FFCC33);
          background-size: 200% 100%;
          border-radius: 10px;
          animation: loading 2s ease-in-out infinite, shimmer 1.5s linear infinite;
          width: 70%;
        }

        @keyframes loading {
          0%, 100% {
            width: 30%;
          }
          50% {
            width: 90%;
          }
        }

        @keyframes shimmer {
          0% {
            background-position: 200% 0;
          }
          100% {
            background-position: -200% 0;
          }
        }

        .loading-text {
          color: #6b7280;
          font-size: 1.1rem;
        }

        .loading-text::after {
          content: '...';
          animation: dots 1.5s steps(4, end) infinite;
        }

        @keyframes dots {
          0%, 20% {
            content: '';
          }
          40% {
            content: '.';
          }
          60% {
            content: '..';
          }
          80%, 100% {
            content: '...';
          }
        }

        .message {
          color: #6b7280;
          font-size: 1.2rem;
          margin-top: 2rem;
          animation: fadeInUp 1s ease-out 1.5s both;
        }

        /* Ícones de ferramentas flutuantes */
        .tools {
          position: absolute;
          width: 100%;
          height: 100%;
          top: 0;
          left: 0;
          pointer-events: none;
        }

        .tool-icon {
          position: absolute;
          font-size: 3rem;
          opacity: 0.15;
          animation: toolFloat 15s infinite;
        }

        @keyframes toolFloat {
          0%, 100% {
            transform: translateY(0) rotate(0deg);
          }
          25% {
            transform: translateY(-30px) rotate(90deg);
          }
          50% {
            transform: translateY(0) rotate(180deg);
          }
          75% {
            transform: translateY(-30px) rotate(270deg);
          }
        }

        .tool-icon:nth-child(1) {
          top: 10%;
          left: 10%;
          animation-delay: 0s;
        }

        .tool-icon:nth-child(2) {
          top: 20%;
          right: 15%;
          animation-delay: 2s;
        }

        .tool-icon:nth-child(3) {
          bottom: 15%;
          left: 15%;
          animation-delay: 4s;
        }

        .tool-icon:nth-child(4) {
          bottom: 20%;
          right: 10%;
          animation-delay: 6s;
        }

        /* Responsividade */
        @media (max-width: 768px) {
          .title {
            font-size: 2rem;
          }
          
          .subtitle {
            font-size: 1.2rem;
          }
          
          .construction-text {
            font-size: 1.5rem;
          }
          
          .logo {
            max-width: 280px;
          }
          
          .tool-icon {
            font-size: 2rem;
          }
        }
      `}</style>

      <div className="page-container">
        {/* Partículas de fundo */}
        <div className="particles" id="particles"></div>

        {/* Ícones de ferramentas flutuantes */}
        <div className="tools">
          <div className="tool-icon">🔧</div>
          <div className="tool-icon">⚙️</div>
          <div className="tool-icon">🛠️</div>
          <div className="tool-icon">⚡</div>
        </div>

        {/* Conteúdo principal */}
        <div className="container">
          <div className="logo-container">
            <img src="/CTDHUB.png" alt="CTD Hub Logo" className="logo" />
          </div>
          
          <h1 className="title">CTD Skill Compass</h1>
          <p className="subtitle">Your skills compass</p>
          
          <h2 className="construction-text">🚧 I'm building, come back soon! 🚧</h2>
          
          <div className="loading-container">
            <div className="loading-bar">
              <div className="loading-progress"></div>
            </div>
            <p className="loading-text">Loading</p>
          </div>
          
          <p className="message">
            We're working hard to bring you something amazing!<br />
            Soon you'll be able to explore and develop your skills.
          </p>
        </div>
      </div>

      <script dangerouslySetInnerHTML={{
        __html: `
          // Criar partículas flutuantes
          if (typeof window !== 'undefined') {
            window.addEventListener('DOMContentLoaded', () => {
              const particlesContainer = document.getElementById('particles');
              if (particlesContainer) {
                const particleCount = 30;

                for (let i = 0; i < particleCount; i++) {
                  const particle = document.createElement('div');
                  particle.className = 'particle';
                  
                  const size = Math.random() * 60 + 20;
                  particle.style.width = size + 'px';
                  particle.style.height = size + 'px';
                  particle.style.left = Math.random() * 100 + '%';
                  particle.style.bottom = '-' + size + 'px';
                  particle.style.animationDelay = Math.random() * 20 + 's';
                  particle.style.animationDuration = (Math.random() * 10 + 15) + 's';
                  
                  particlesContainer.appendChild(particle);
                }
              }
            });
          }
        `
      }} />
    </>
  )
}
